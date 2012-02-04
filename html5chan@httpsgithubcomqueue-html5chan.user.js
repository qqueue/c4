// ==UserScript==
// @name        html5chan
// @namespace   https://github.com/queue-/html5chan
// @description html5... on my 4chan?
// 
// @include     http://boards.4chan.org/*
// @exclude     http://boards.4chan.org/f/*
//
// ==/UserScript==

//script injection @require replacement
//inserts the scripts as arguments, in order, into the <head>
//scripts can be either a string, interpreted as a src attribute
//or a function, which is inserted as a string
var inject = function () {
	if( arguments.length == 0 ) return;
	var script = document.createElement("script");
	var name;
	if( typeof arguments[0] == "string" ) {
		script.setAttribute("src", arguments[0]);
		name = arguments[0];
	} else if( typeof arguments[0] == "function" ) {
		script.setAttribute("src", "data:text/javascript;base64," + btoa("(" + arguments[0].toString() + ")();"));
		name = "function()";
	} else {
		throw new Error("argument not injectible as script!");
	}
	var rest = Array.prototype.slice.call(arguments,1);
	//time the script load
	console.time("inject script: "+name);
	script.addEventListener('load', function () {
		console.timeEnd("inject script: "+name);
		//inject the rest of the scripts
		inject.apply(null, rest);
	},false);
	document.head.appendChild(script);
}

inject( "http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.js",
		"http://cloud.github.com/downloads/wycats/handlebars.js/handlebars-1.0.0.beta.6.js",
		function () {
//////////////////////////////////////
// Initialization
//////////////////////////////////////

//extend jQuery with some nice functions
$.fn.extend({
	immediateText: function () { return this.parent().clone().children().remove().end().text(); },
	exists: function (selector) { return (selector ? this.filter(selector) : this ).length > 0;}
});

///////////////////////////////////////////
// parse 4chan's shitty markup into data
///////////////////////////////////////////

function Image(imageLink, filesize) {
	var thumb = imageLink.children('img'),
		dimensions = filesize.text().match(/(\d+)x(\d+)/);
	
	this.url = imageLink.attr('href');
	
	this.width = parseInt(dimensions[1]);
	this.height = parseInt(dimensions[2]);
	
	this.size =
		thumb.attr('alt').match(/[\d\.]+ [KM]?B/)[0];
	this.filename = 
		filesize.find('span[title]').attr('title');
	this.md5 =
		thumb.attr('md5');
	this.spoiler = 
		/^Spoiler Image/.test(thumb.attr('alt'));
	this.thumb = {
		url: thumb.attr('src'),
		width: parseInt(thumb.attr('width')),
		height: parseInt(thumb.attr('height'))
	}
}

function parseComment (comment) {
	return comment.clone() //don't operate on actual dom elements for speed
		.find('font > .quotelink')
			.removeAttr('onclick')
			.unwrap()
		.end()
		.find('font.unkfunc')
			.replaceWith(function () {
				return $('<b>', {"class": "greentext"}).html($(this).html());
			})
		.end()
		.find('span.spoiler')
			.replaceWith(function () {
				return $('<s>',{"class":"spoiler"}).html($(this).html());
			})
		.end()
		.html()
			.replace(/http:\/\/boards.4chan.org/g, "") //strips the url from cross-board links so they don't get linkified
			.replace(/http:\/\/[\w\.\-_\/=&;?#%]+/g,'<a href="$&" target="_blank">$&</a>'); } //linkify other links

//instead of relying on js's Date.parse function, which doesn't parse 12 as 2012 among other things
//this function pulls out numbers with regex
function parse4ChanDate(dateString) {	
	//perfect place for destructuring assignment 
	var date = dateString.match(/(\d{2})\/(\d{2})\/(\d{2})\(\w+\)(\d{2}):(\d{2})/).slice(1).map(function(val) { return parseInt(val,10); });
	//and corrects for >year 2000 and 4chan's time zone (EST)
	return new Date(Date.UTC(
		date[2]+2000,
		date[0]-1, date[1],
		(date[3]+(((new Date()).getTimezoneOffset() == (new Date((new Date()).setMonth(6))).getTimezoneOffset()) ? 4 : 5))%24, //DST detection
		date[4]));}


//constructor for post, from jquery element list and 'op?' flag
function Post($,op) {
	var poster = $.filter(op ? '.postername' : '.commentpostername' ),
		email = poster.find('a.linkmail').attr('href');

	this.op = 
		op;
	this.sage = 
		email ? /^mailto:sage$/i.test(email) : false;
	this.id =
		$.filter('input').attr('name');
	this.url = //op has wrapper, but replies don't, so we need just the text
		$.find('a.quotejs').eq(0).attr('href');
	this.time = //only the op has a nice wrapper around the date ;_;
		parse4ChanDate(op ? $.filter('.posttime').text() : $.immediateText());
	this.title = 
		$.filter(op ? '.filetitle' : '.replytitle' ).text()
		|| undefined;
	
	var imagelink = $.filter('a[target="_blank"]');
	if( imagelink.exists() ) {
		this.image = new Image(imagelink, $.filter('.filesize'));
	} else {
		this.imageDeleted = $.exists('img[alt="File deleted."]');
	}
	
	this.poster = 
		poster.eq(0).text();
	this.email =
		email && email.substring(7); //if email is defined, strip mailto:
	this.tripcode = //poster trips with emails are wrapped in the anchor
		$.filter('.postertrip').text()
		|| $.filter('.linkmail').find('.postertrip').text()
		|| undefined;
	this.capcode = //replies have two commentpostername spans
		($.filter('.commentpostername').eq(op ? 0 : 1).text())
		|| undefined;
	this.comment = parseComment( $.filter('blockquote') );
}

//constructor for post, from jquery element list and whether this is a full thread
function Thread($,preview) {
	this.replies = 
		$.find('td.reply').map(function() { return new Post(jQuery(this).children(),false); }).get();
	this.op = 
		new Post($,true);
	
	this.locked = $.exists('img[alt="closed"]'); this.op.locked = this.locked;
	this.sticky = $.exists('img[alt="sticky"]'); this.op.sticky = this.sticky;
	
	this.op.replyurl = this.op.url.split('#')[0]; //url for reply link
	
	this.preview = preview; this.op.preview = preview;
	if( preview ) {
		var omittedposts = $.filter('.omittedposts').text();
		this.omittedReplies =
			parseInt(omittedposts.match(/\d+(?= posts)/), 10) || 0;
		this.omittedImageReplies =
			parseInt(omittedposts.match(/\d+(?= image replies)/), 10) || 0;
	}
}

//parse entire board
function parse4chan() {
	//detect whether this is board view or post view based on the existence of the [Return] link
	var isThread = $('a[accesskey]').exists();
	return {
		nav: $('#navtop').html(),
		banner: $('div.logo img').attr('src'),
		deletePassword: $('input[type="password"]').get(0).value, //so we don't have to recheck the cookie
		board: {
			name: document.title.match(/\/(\w+)\//)[1], //easiest way to get it 
			title: $('div.logo b').text(),
			subtitle: $('div.logo font[size="1"]').html()
		},
		thread: isThread ? new Thread( $('form[name="delform"]').children(),false ) : undefined,
		threads: !isThread ? $('form[name="delform"] > br[clear="left"]').map(function () { //reliable way to separate threads into separate collections of elements
			return new Thread( $($(this).prevUntil("hr").get().reverse()), true ); //reversed to maintain post order
		}).get() : undefined,
		pages: $('table.pages td').eq(1).html() || undefined
	};}

console.time("extract threads");
var data = parse4chan();
console.dir(data);
console.timeEnd("extract threads"); 

/////////////////////////////////////////////////////////
//Render data back to html
/////////////////////////////////////////////////////////
{

//disable 4chan styles
$('link[rel*="stylesheet"]').remove();
//disable 4chan's onload functions
//we can do this because onload has to wait
//for all the images, which obstensibly takes longer
//than it doest to load this script
window.onload = window.onunload = undefined;

console.time('handlebars');
Handlebars.registerHelper('datetime', function( time, options ) {
	function pad(number) { var str = number.toString(); return str.length < 2 ? "0"+str : str; } //pad to 2 digits
	var date = new Date(time);
	return date.getFullYear()+"-"+pad(date.getMonth()+1)+"-"+pad(date.getDate())+" "+pad(date.getHours())+":"+pad(date.getMinutes());
});

Handlebars.registerPartial('post', '<header> <h1> <input type="checkbox" value="delete" name="{{id}}" form="delform"> <button type="submit" form="reportform" name="no" value="{{id}}">[!]</button> <span class="title">{{title}}</span> <a class="poster" {{#if email}}href="mailto:{{email}}"{{/if}}>{{poster}}</a> <span class="tripcode">{{tripcode}}</span> <span class="capcode">{{capcode}}</span> <time pubdate datetime="{{time}}">{{datetime time}}</time> {{#if op}}{{#if preview}}[<a href="{{replyurl}}" class="replylink">Reply</a>]{{/if}}{{/if}} <a href="{{url}}" class="permalink" {{#if op}}target="_blank"{{/if}}> No.{{id}} {{#if sticky}}<img alt="sticky" src="http://static.4chan.org/image/sticky.gif">{{/if}} {{#if locked}}<img alt="closed" src="http://static.4chan.org/image/closed.gif">{{/if}} </a> </h1> {{#if image}}<div class="fileinfo"> <span class="dimensions">{{image.width}}x{{image.height}}</span> <span class="size">{{image.size}}</span> <span class="filename">{{image.filename}}</span> <a class="saucelink" href="http://iqdb.org/?url={{image.url}}" target="_blank">iqdb</a> <a class="saucelink" href="http://google.com/searchbyimage?image_url={{image.url}}" target="_blank">google</a> </div>{{/if}} </header> {{#if image}}  {{#with image.thumb}} <a class="file" target="_blank" href="{{../image.url}}"><img class="thumb" src="{{url}}" width="{{width}}" height="{{height}}"/></a> {{/with}}  {{/if}} <div class="comment"> {{{comment}}} </div>  <footer> <ul class="backlinks"></ul> </footer>');
Handlebars.registerPartial('thread','<article class="thread" id="thread{{op.id}}" tabindex="1"> <div class="op post" id="{{op.id}}"> {{#with op}} {{> post}} {{/with}} </div> {{#if omittedReplies}}<div class="omitted-replies">{{omittedReplies}} replies {{#if omittedImageReplies}}and {{omittedImageReplies}} image replies{{/if}} omitted. Latest {{replies.length}} shown.</div>{{/if}} <div class="replies"> {{#each replies}} <article class="post reply" id="{{id}}"> {{> post}} </article> {{/each}} </div> </article>');
var template = Handlebars.compile('<header> <nav>{{{nav}}}</nav> <img src="{{banner}}" alt="4chan::" id="banner"/> <hgroup> <h1><a href="http://boards.4chan.org/{{board.name}}/">{{board.title}}</a></h1> <h2>{{{board.subtitle}}}</h2> </hgroup> </header> <div id="threads"> {{#each threads}}{{>thread}}{{/each}} {{#if thread}}{{#with thread}}{{>thread}}{{/with}}{{/if}}{{! for single thread views }} </div> {{#if pages}} <nav id="pages"> {{{pages}}} </nav> {{/if}} {{#if thread.locked}} <p>Thread closed.<br>You may not reply at this time.</p> {{else}} <form id="postform" enctype="multipart/form-data" method="POST" action="http://sys.4chan.org/{{board.name}}/post" target="_blank"> <input type="hidden" value="3145728" name="MAX_FILE_SIZE"> <input type="hidden" value="regist" name="mode"> {{#if thread}}<input type="hidden" value="{{thread.id}}" name="resto">{{/if}} <div><label for="name">Name: </label><input type="text" name="name" id="name" /></div> <div><label for="email">Email: </label><input type="text" id="email" name="email" /></div> <div><label for="subject">Subject: </label><input type="text" id="subject" name="sub" /></div> <div><label for="comment">Comment: </label><textarea name="com" id="comment" rows="4"></textarea></div> <div><label>Verification: </label><div id="verification"></div></div> <div> <label for="image">Image: </label><input type="file" id="image" name="upfile"/> <label><input type="checkbox" value="on" name="spoiler"/> Spoiler Image?</label> </div> <div title="for file deletion"> <label for="password">Password: </label> <input id="password" type="password" maxlength="8" name="pwd" value="{{deletePassword}}"> </div> <div><button type="submit" value="Submit">Submit</button></div> <ul id="rules"> <li>Supported file types are: GIF, JPG, PNG </li> <li>Maximum file size allowed is 3072 KB. </li> <li>Images greater than 250x250 pixels will be thumbnailed. </li> <li>Read the <a href="http://www.4chan.org/rules#lit">rules</a> and <a href="http://www.4chan.org/faq">FAQ</a> before posting.</li> <li><img width="17" height="11" src="http://static.4chan.org/image/jpn-flag.jpg"><a href="http://www.4chan.org/japanese">このサイトについて</a> - <a href="http://www.nifty.com/globalgate/">翻訳</a></li> </ul> </form> {{/if}} <form id="delform" method="POST" action="http://sys.4chan.org/{{board.name}}/imgboard.php" target="_blank"> <input name="mode" value="usrdel" type="hidden"> <label>Password <input name="pwd" size="8" maxlength="8" value="{{deletePassword}}" type="password"></label> <button type="submit" value="Delete">Delete Post</button> <label><input name="onlyimgdel" value="on" type="checkbox">[File Only]</label> </form> <form action="http://sys.4chan.org/{{board.name}}/imgboard.php"" id="reportform" method="GET" target="_blank"> <input type="hidden" name="mode" value="report"/> <!-- all the report buttons are part of this form --> </form>');
$('body').replaceWith($('<body>',{id: data.board.name}).html(template(data)));
console.timeEnd('handlebars');
$('<style>').html('html { background: #EEF2FF; min-height:100%; font-family: sans-serif; font-size: 10pt; }   .post h1 { display: inline; margin: 0; padding: 0; font-size: 100%; font-weight: normal;} .op h1 { font-size: 130%; } .thread { padding-bottom: 5px; border-bottom: 1px solid #B7C5D9; overflow: auto; } .omitted-replies { clear: left; text-align: right; } .post { margin-top: 3px; }  .post:target, .thread:target .op { background-color: #D6BAD0; }  .op { background-color: #EEF2FF; }  a.quotelink, a.backlink { color: #d00; }  a.permalink { text-decoration: none; color: inherit; float: right; }  a.saucelink { color: inherit; text-decoration: none; }  a.permalink:hover, a.saucelink:hover { text-decoration: underline; }  .post .title { color: #0f0c5d; font-weight: 800; }  .post footer { clear:both; } ul.backlinks { margin: 0; padding: 0; } .backlinks li { display: inline; margin-right: 1em; }  .reply { background: #D6DAF0; padding: 2px; margin-left: 1.5em; border-color: #B7C5D9; border-style: solid; border-width: 0 1px 1px 0; clear: both; }   .reply:before { content: ">>"; display: block; height: 0; margin-left: -1.5em; font-size: 10pt; color: #B7C5D9; }  .post:after { content: ""; display: block; height: 0; clear: both; visibility: hidden; }  .comment { padding: 0 1em ; margin: 1em 40px; }  .poster { color:#117743; font-weight: 800; }  .tripcode { color: #228854; } .greentext { font-weight: normal; color: #789922; }  .spoiler { text-decoration: none; color: black; background: black; } .spoiler .greentext, .spoiler a { color: black; }  .spoiler:hover { color: white; }  .spoiler:hover .greentext, .spoiler:hover a { color:white; }  .file { display: block; float: left; margin: 3px 20px; position: relative; }  .id { text-decoration: none; color: inherit; }  .id:hover { color: red; } .capcode { color: red; font-weight: 800; }  .post button[form="reportform"] { float: right; border: none; padding: 0; margin: 0; cursor: pointer; background: transparent; }').appendTo('head');
//create recaptcha with script already included on page (using 4chan's public key)
if( !(data.thread && data.thread.locked) ) Recaptcha.create("6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc", "verification", {theme: "clean"});
//rescroll to target element if this page hasn't been loaded before
//this retains the browser's natural scroll position memory
//while still scrolling to the new hash target's position 
//the first time the page loads
if ( !sessionStorage.getItem("html5chan-"+window.location.pathname) ) {
	window.location.hash = window.location.hash;
	sessionStorage.setItem("html5chan-"+window.location.pathname, true);
}
}
///////////////////////////////////
// Features
//////////////////////////////////

//image hover previews
$('<img>',{id: 'preview'}).css({
	position: "absolute",
	maxWidth: "100%",
	maxHeight: "100%",
}).hide().appendTo('body');
$('#threads')
	.on('mouseenter.html5chan.imagepreview', 'a.file', function (e) {
		$('#preview').attr('src',this.href).css({
			left: e.pageX+10,
			top: e.pageY+10
		})
		.load(function() { $(this).show(); });} )
	.on('mousemove.html5chan.imagepreview', 'a.file', function(e) {
		$('#preview').css({
			left: e.pageX+10,
			top: e.pageY+10 }); })
	.on('mouseleave.html5chan.imagepreview', 'a.file', function(e) {
		$('#preview').hide(); })
	//click for image replacement
	.on('click.html5chan', 'a.file', function() {
		$(this).find('img').hide().after( 
			$('<img>',{src: this.href} ).click(function () {
				$(this).siblings().show().end().remove();
				return false;
			})
		);
		return false;
	});
	
//post hover previews
$('#threads')
	.on('mouseenter.html5chan.postpreview', 'a.quotelink', function (e) {
		var post = $(this.hash);
		if( post.exists() ) {
			post
				.clone()
					.find('.inline').remove().end() //strip inline replies
					.find('a.quotelink[href='+this.hash+']') //replace matching reply link
						.replaceWith(function() {
							alert('running?');
							return $('<strong>',{'class': 'hoveredlink'}).html($(this).html());
						}).end()
					.attr('id', 'postpreview')
					.css({
						position: "absolute",
						left: e.pageX+10,
						top: e.pageY-post.height()
					}).appendTo('body');
			post.addClass('hovered'); }})
	.on('mousemove.html5chan.postpreview', 'a.quotelink', function(e) {
		$('#postpreview').css({
			left: e.pageX+10,
			top: e.pageY+-$('#postpreview').height() }); })
	.on('mouseleave.html5chan.postpreview', 'a.quotelink', function(e) {
		$('#postpreview').remove();
		$(this.hash).removeClass('hovered');});
	
//backlinks
$('.post').each(function() {
	var quoter = this;
	$(quoter).find('a.quotelink').each(function() {
		if( /^#\d+/.test(this.hash) ) { //relative postlink
			var quoted = $(this.hash);
			var backlinks = quoted.data('backlinks');
			if( !backlinks ) {
				backlinks = {};
				quoted.data('backlinks', backlinks);
			}
			if( !backlinks[quoter.id] ) {
				backlinks[quoter.id] = true;
				quoted.find('.backlinks').append(
					$('<li>').append($('<a>',{'class': 'backlink quotelink', href: '#'+quoter.id}).html('&gt;&gt;'+quoter.id)));
			}
		}
	});
});

//inline replies
$('#threads')
	.on('click.html5chan.inlinereplies', 'a.quotelink', function() {
		var target = $(this.hash);
		if( target.exists() ) {
			var $this = $(this),
				host = $this.closest('.post').attr('id'),
				inlined_id = host+this.hash.slice(1),//id is unique to hosting post and inlined post
				inlined = $('#'+inlined_id);
			if( inlined.exists() ) {
				inlined.remove();
				$this.removeClass('inlined');
			} else {
				inlined = target.clone()
					.find('.inline').remove().end() //remove any previews the inlined post already has
					.find('a.quotelink[href=#'+host+']') //replace matching reply link
						.replaceWith(function() {
							return $('<strong>',{'class': 'hoveredlink'}).html($(this).html());
						}).end()
					.attr('id',inlined_id)
					.addClass('inline')
					.removeClass('hovered');
				if( $this.is('.backlink')) {$this.after(inlined); } else {$this.before(inlined); }
				$this.addClass('inlined');
			}
			return false;
		}
	});
	
});