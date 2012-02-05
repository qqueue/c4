﻿// ==UserScript==
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
"use strict"; //will it work?
//////////////////////////////////////
// Initialization
//////////////////////////////////////

//extend jQuery with some nice functions
$.fn.extend({
	immediateText: function () { return this.parent().clone().children().remove().end().text(); },
	exists: function (selector) { return (selector ? this.filter(selector) : this ).length > 0;},
	changeTo: function (replacement, options) {
		return this.replaceWith(function () {
			return $(replacement,options).html($(this).html());
		});
	},
	constrainY: function(offset, margin) {
		var height = this.height(),
			screentop = $(window).scrollTop(),
			screenbottom = screentop + $(window).height();
		if( (offset.top + height) > screenbottom ) {
			offset.top = screenbottom - height - margin;
		}
		if( top < screentop ) {
			offset.top = screentop + margin;
		}
		return this.css({
			left: offset.left,
			top: offset.top,
			position: "absolute"
		});
	},
	visibleY: function(margin) {
		margin = margin || 0;
		var offset = this.offset(),
			top = offset.top,
			bottom = offset.top + this.height(),
			screentop = $(window).scrollTop(),
			screenbottom = screentop + $(window).height();
		return top > screentop && bottom < screenbottom;
	},
	beforeAndScroll: function (content) {
		var before = this.offset();
		this.before(content);
		var after = this.offset();
		window.scrollBy(after.left-before.left, after.top-before.top);
		return this;
	},
	removeAndScroll: function (relativeTo) {
		var before = relativeTo.offset();
		this.remove();
		var after = relativeTo.offset();
		//unless the scrollbar is already at the bottom (which autocorrects position)
		if( ($(document).height() - ($(window).scrollTop() + $(window).height())) > 10 ) { 
			window.scrollBy(after.left-before.left, after.top-before.top);
		}
		return this;
	}
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
		.find('font.unkfunc').changeTo('<b>', {"class": "greentext"}).end()
		.find('span.spoiler').changeTo('<s>',{"class":"spoiler"}).end()
		.find('a.quotelink').each(function () {
			if( /^(\d+)#\1/.test($(this).attr('href')) ) { //if the path and hash match exactly
				$(this).addClass('oplink');
			}
		})
		.end()
		.html()
			.replace(/http:\/\/boards.4chan.org/g, "") //strips the url from cross-board links so they don't get linkified
			.replace(/https?:\/\/[\w\.\-_\/=&;?#%]+/g,'<a href="$&" target="_blank">$&</a>'); } //linkify other links

//instead of relying on js's Date.parse function, which doesn't parse 12 as 2012 among other things
//this function pulls out numbers with regex
function parse4ChanDate(dateString) {
	//perfect place for destructuring assignment 
	var matches = dateString.match(/(\d{2})\/(\d{2})\/(\d{2})\(\w+\)(\d{2}):(\d{2})/);
	if( !matches ) return undefined;
	var date = matches.slice(1).map(function(val) { return parseInt(val,10); });
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
			parseInt(omittedposts.match(/\d+(?= posts?)/), 10) || 0;
		this.omittedImageReplies =
			parseInt(omittedposts.match(/\d+(?= image (?:replies|reply))/), 10) || 0;
	}
}

//parse entire board
function parse4chan() {
	//detect whether this is board view or post view based on the existence of the [Return] link
	var isThread = $('a[accesskey]').exists();
	return {
		nsfw: $('link[rel=stylesheet]')[0].href == 'http://static.4chan.org/css/yotsuba.9.css', //the yellow theme
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
Handlebars.registerHelper('ISOString', function(time) {
	return new Date(time).toISOString();
});

Post.render = Handlebars.compile('<header> <h1> <input type="checkbox" value="delete" name="{{id}}" form="delform"> <button type="submit" form="reportform" name="no" value="{{id}}">[!]</button> <span class="title">{{title}}</span> <a class="poster" {{#if email}}href="mailto:{{email}}"{{/if}}>{{poster}}</a> <span class="tripcode">{{tripcode}}</span> <span class="capcode">{{capcode}}</span> <time pubdate datetime="{{ISOString time}}">{{datetime time}}</time> {{#if op}}{{#if preview}}[<a href="{{replyurl}}" class="replylink">Reply</a>]{{/if}}{{/if}} <a href="{{url}}" class="permalink" {{#if op}}target="_blank"{{/if}}> No.{{id}} {{#if sticky}}<img alt="sticky" src="http://static.4chan.org/image/sticky.gif">{{/if}} {{#if locked}}<img alt="closed" src="http://static.4chan.org/image/closed.gif">{{/if}} </a> </h1> {{#if image}}<div class="fileinfo"> <span class="dimensions">{{image.width}}x{{image.height}}</span> <span class="size">{{image.size}}</span> <span class="filename">{{image.filename}}</span> <a class="saucelink" href="http://iqdb.org/?url={{image.url}}" target="_blank">iqdb</a> <a class="saucelink" href="http://google.com/searchbyimage?image_url={{image.url}}" target="_blank">google</a> </div>{{/if}} </header> {{#if image}}  {{#with image.thumb}} <a class="file" target="_blank" href="{{../image.url}}"><img class="thumb" src="{{url}}" width="{{width}}" height="{{height}}"/></a> {{/with}}  {{/if}} <div class="comment"> {{{comment}}} </div>  <footer class="backlinks"> </footer>');
Handlebars.registerPartial('post',Post.render);
Thread.render = Handlebars.compile('<article class="thread" id="thread{{op.id}}" tabindex="1"> <div class="op post" id="{{op.id}}"> {{#with op}} {{> post}} {{/with}} </div> {{#if omittedReplies}}<div class="omitted-replies">{{omittedReplies}} replies {{#if omittedImageReplies}}and {{omittedImageReplies}} image replies{{/if}} omitted. Latest {{replies.length}} shown.</div>{{/if}} <div class="replies"> {{#each replies}} <article class="post reply" id="{{id}}"> {{> post}} </article> {{/each}} </div> </article>');
Handlebars.registerPartial('thread',Thread.render);

var template = Handlebars.compile('<header> <nav>{{{nav}}}</nav> <img src="{{banner}}" alt="4chan::" id="banner"/> <hgroup> <h1><a href="http://boards.4chan.org/{{board.name}}/">{{board.title}}</a></h1> <h2>{{{board.subtitle}}}</h2> </hgroup> </header> <div id="threads"> {{#each threads}}{{>thread}}{{/each}} {{#if thread}}{{#with thread}}{{>thread}}{{/with}}{{/if}}{{! for single thread views }} </div> {{#if pages}} <nav id="pages"> {{{pages}}} </nav> {{/if}} {{#if thread.locked}} <p>Thread closed.<br>You may not reply at this time.</p> {{else}} <form id="postform" enctype="multipart/form-data" method="POST" action="http://sys.4chan.org/{{board.name}}/post" target="_blank"> <input type="hidden" value="3145728" name="MAX_FILE_SIZE"> <input type="hidden" value="regist" name="mode"> {{#if thread}}<input type="hidden" value="{{thread.id}}" name="resto">{{/if}} <div><label for="name">Name: </label><input type="text" name="name" id="name" /></div> <div><label for="email">Email: </label><input type="text" id="email" name="email" /></div> <div><label for="subject">Subject: </label><input type="text" id="subject" name="sub" /></div> <div><label for="comment">Comment: </label><textarea name="com" id="comment" rows="4"></textarea></div> <div><label>Verification: </label><div id="verification"></div></div> <div> <label for="image">Image: </label><input type="file" id="image" name="upfile"/> <label><input type="checkbox" value="on" name="spoiler"/> Spoiler Image?</label> </div> <div title="for file deletion"> <label for="password">Password: </label> <input id="password" type="password" maxlength="8" name="pwd" value="{{deletePassword}}"> </div> <div><button type="submit" value="Submit">Submit</button></div> <ul id="rules"> <li>Supported file types are: GIF, JPG, PNG </li> <li>Maximum file size allowed is 3072 KB. </li> <li>Images greater than 250x250 pixels will be thumbnailed. </li> <li>Read the <a href="http://www.4chan.org/rules#lit">rules</a> and <a href="http://www.4chan.org/faq">FAQ</a> before posting.</li> <li><img width="17" height="11" src="http://static.4chan.org/image/jpn-flag.jpg"><a href="http://www.4chan.org/japanese">このサイトについて</a> - <a href="http://www.nifty.com/globalgate/">翻訳</a></li> </ul> </form> {{/if}} <form id="delform" method="POST" action="http://sys.4chan.org/{{board.name}}/imgboard.php" target="_blank"> <input name="mode" value="usrdel" type="hidden"> <label>Password <input name="pwd" size="8" maxlength="8" value="{{deletePassword}}" type="password"></label> <button type="submit" value="Delete">Delete Post</button> <label><input name="onlyimgdel" value="on" type="checkbox">[File Only]</label> </form> <form action="http://sys.4chan.org/{{board.name}}/imgboard.php" id="reportform" method="GET" target="_blank"> <input type="hidden" name="mode" value="report"/> <!-- all the report buttons are part of this form --> </form>');
$('body')
	.removeAttr('vlink text link bgcolor')
	.attr({id: data.board.name})
	.addClass(data.nsfw ? 'nsfw' : 'sfw')
	.addClass(data.thread ? 'thread' : 'board')
	.html(template(data));

console.timeEnd('handlebars');
$('<style>').html('html { min-height:100%; font-family: sans-serif; font-size: 10pt; }  .sfw { background: #EEF2FF; }  .nsfw { background: #FFFFEE; color: #800000; }  .thread { padding-bottom: 5px; border-bottom: 1px solid #B7C5D9; }  .sfw .thread { border-color: #b7c5d9; }  .nsfw .thread { border-color: gray; }  .omitted-replies { clear: left; text-align: right; }  .post { margin-top: 3px; }  .sfw .post:target { background-color: #D6BAD0; } .nsfw .post:target { background-color: #F0C0B0; } .reply { padding: 2px; margin-left: 1.5em; border-style: solid; border-width: 0 1px 1px 0; clear: both; }  .sfw .reply { background: #D6DAF0; border-color: #B7C5D9; }  .nsfw .reply { background-color:#F0E0D6; border-color: #D9BFB7; }  .reply:before { content: ">>"; display: block; height: 0; margin-left: -1.5em; font-size: 10pt; } .sfw .reply:before { color: #B7C5D9; } .nsfw .reply:before { color: #D9BFB7; }  .sfw .op { background-color: #EEF2FF; } .nsfw .op { background-color: #FFFFEE; }  .post h1 { display: inline; margin: 0; padding: 0; font-size: 100%; font-weight: normal;}  .op>header>h1 { font-size: 130%; }  .post .title { color: #0f0c5d; font-weight: 800; }  .poster { color:#117743; font-weight: 800; }  .tripcode { color: #228854; }  .file { display: block; float: left; margin: 3px 20px; position: relative; }  .id { text-decoration: none; color: inherit; }  .id:hover { color: red; } .capcode { color: red; font-weight: 800; }  .post button[form="reportform"] { float: right; border: none; padding: 0; margin: 0; cursor: pointer; background: transparent; }   .oplink:after { content: " (OP)"; }  .sfw a.quotelink { color: #d00; }  .nsfw a.quotelink { color: #000080; }  a.inlinedlink, strong.recursivelink { font-weight: bold; color: black; }  a.permalink { text-decoration: none; color: inherit; float: right; }  a.saucelink { color: inherit; text-decoration: none; }  a.permalink:hover, a.saucelink:hover { text-decoration: underline; }  .comment { padding: 0 1em ; margin: 1em 40px; }   .greentext { font-weight: normal; color: #789922; }  .spoiler { text-decoration: none; color: black; background: black; } .spoiler .greentext, .spoiler a { color: black; }  .spoiler:hover { color: white; }  .spoiler:hover .greentext, .spoiler:hover a { color:white; }  .post footer { clear:both; }  .backlink { margin-right: 1em; }  #postpreview  { outline: 3px dashed blue; margin: 0; } #postpreview:before, .reply.inline:before { display: none; }  .post.inline { margin-left: -1px; background-color: rgba(255,255,255,.1); border: 1px solid #aaa; border-left-width: 0; padding-left: 0; }  .post.inline .comment { padding-left: 0; margin-left: 0; }  .backlink+.post.inline > .comment { margin: 1em 40px; padding: 0 1em; }  .inline .backlinks > .recursivelink { opacity: 0; }  .hovered { outline: 3px dashed blue; }  ').appendTo('head');
//create recaptcha with script already included on page (using 4chan's public key)
if( !(data.thread && data.thread.locked) ) Recaptcha.create("6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc", "verification", {theme: "clean"});
//rescroll to target element if this page hasn't been loaded before
//this retains the browser's natural scroll position memory
//while still scrolling to the new hash target's position 
//the first time the page loads
if ( !sessionStorage.getItem("html5chan-"+document.URL) ) {
	window.location.hash = window.location.hash;
	sessionStorage.setItem("html5chan-"+document.URL, true);
}

///////////////////////////////////
// Features
//////////////////////////////////

//image hover previews
$('#threads')
	.on('mouseenter.html5chan.imgpreview', 'a.file', function (e) {
		$('<img>',{
			id: 'imgpreview',
			src: this.href,
			alt: this.href+" (Failed to load)"}
		)
		.constrainY({
			left: e.pageX+10,
			top: e.pageY+10
		}, 10).css({
			maxHeight: $(window).height() - 20,
			maxWidth: $(window).width() - e.pageX - 20
		})
		.appendTo('body');
	})
	.on('mousemove.html5chan.imgpreview', 'a.file', function(e) {
		$('#imgpreview').constrainY({
			left: e.pageX+10,
			top: e.pageY+10
		}, 10).css({
			maxWidth: $(document).width() - e.pageX - 20
		}); })
	.on('mouseleave.html5chan.imgpreview', 'a.file', function(e) {
		$('#imgpreview').remove(); });

//backlinks
function backlink() {
	$('.post').not('.inline').each(function() {
		var quoter = this;
		$(quoter).find('.comment > a.quotelink').each(function() {
			if( /^#\d+/.test(this.hash) ) { //relative postlink
				var quoted = $(this.hash);
				var backlinks = quoted.data('backlinks');
				if( !backlinks ) {
					backlinks = {};
					quoted.data('backlinks', backlinks);
				}
				if( !backlinks[quoter.id] ) {
					backlinks[quoter.id] = true;
					quoted.find('.backlinks')
						.append(
							$('<a>',{'class': 'backlink quotelink', href: '#'+quoter.id}).html('&gt;&gt;'+quoter.id)
						)
						.append(' '); //necessary for the line to wrap properly; stupid i know
				}
			}
		});
	});
}
backlink();

//post hover previews
$('#threads')
	.on('mouseenter.html5chan.postpreview', 'a.quotelink', function (e) {
		var $this = $(this);
		if( $this.is('.inlinedlink') ) return; //don't need to preview if it's right there.
		var post = $(this.hash),
			hostid = $this.closest('.post').attr('id').split('-').pop();
		if( post.exists() ) {
			post
				.clone()
					.find('.inline').remove().end() //strip inline replies
					.find('.inlinedlink').removeClass('inlinedlink').end() //these don't apply anymore, as inline replies are gone
					.removeClass('hovered') //if it exists
					.find('a.quotelink[href$=#'+hostid+']') //replace matching reply link
						.replaceWith(function() {
							return $('<strong>',{'class': 'recursivelink'})
								.html($(this).html())
								.addClass(this.className);
						}).end()
					.attr('id', 'postpreview')
					.appendTo('body');
			$this.trigger('mousemove.html5chan.postpreview');
		}
	})
	.on('mousemove.html5chan.postpreview', 'a.quotelink', function(e) {
		var preview = $('#postpreview'),
			height = preview.height(),
			width = preview.width(),
			left = e.pageX + 10;
		if( (left + width ) > $(window).width() ) {
			left = Math.max( 10, e.pageX - 10 - width );
		}
		preview
			.css({
				position: "absolute",
				left: left,
				top: e.pageY+($(this).is('.backlink') ? 10 : -20 - height) 
			});
	})
	.on('mouseleave.html5chan.postpreview', 'a.quotelink', function(e) {
		$('#postpreview').remove(); });
	
//highlight hovered reply
$('#threads')
	.on('mouseenter.html5chan.posthighlight mouseleave.html5chan.posthighlight', 'a.quotelink', function (e) {
		var $this = $(this);
		$( $this.is('.inlinedlink') ? //outline what is inlined
			'#'+$this.closest('.post').attr('id')+'-'+this.hash.slice(1) : undefined
		).add(this.hash).toggleClass('hovered');
	});
	

function onBottom() {
	return ($(document).height() - ($(window).scrollTop() + $(window).height())) < 10; //within 10px of bottom
}
//inline replies
$('#threads')
	.on('click.html5chan.inlinereplies', 'a.quotelink', function(e) {
		var post = $(this.hash);
		if( post.exists() ) {
			var $this = $(this),
				host = $this.closest('.post').attr('id'),
				hostid = host.split('-').pop(), //grab last (if nested inline post)
				inlined_id = host+'-'+this.hash.slice(1),//id is unique to hosting post and inlined post
				inlined = $('#'+inlined_id);
			if( inlined.exists() ) {
				inlined.removeAndScroll($this);
				$this.removeClass('inlinedlink');
			} else {
				inlined = post.clone()
					.find('.inline').remove().end() //remove any previews the inlined post already has
					.find('.inlinedlink').removeClass('inlinedlink').end() //these don't apply anymore, as inline replies are gone
					.find('a.quotelink[href$=#'+hostid+']') //replace matching reply link
						.replaceWith(function() {
							return $('<strong>',{'class': 'recursivelink'})
								.html($(this).html())
								.addClass(this.className);
						}).end()
					.attr('id',inlined_id)
					.addClass('inline');
				if( $this.is('.backlink')) {
					$this.after(inlined);
				} 
				else {
					$this.beforeAndScroll(inlined);
				}
				$this.addClass('inlinedlink');
				$this.trigger('mouseleave.html5chan.postpreview'); //since we're previewing it now
			}
			return false;
		}
	});

//bypass inline replies on dblclick
$('#threads').on('dblclick', 'a.quotelink', function () {
	if( this.hash ) window.location.hash = this.hash; //actually follow link
});

if( data.thread ) {
	//let's try some ajax
	setTimeout(function refresh() {
		$.get(document.URL)
			.success( function (html,status) {
				console.log(status);
				//parse posts newer than last post
				var last_post = data.thread.replies[data.thread.replies.length-1];
				var posts = $('a[name='+last_post.id+'] ~ a[name]',html).eq(0).nextAll().find('td.reply').map( function() {
					return new Post($(this).children(),false);
				}).get();
				console.dir(posts);
				
				if( posts && posts.length > 0 ) {
					data.thread.replies = data.thread.replies.concat(posts);
					$('.thread').append(
						posts.map(function(post) {
							return '<article class="post reply" id="'+post.id+'">' + Post.render(post) + '</article>';
						}).join(""));
					backlink();
				}
				
				setTimeout(refresh, 30000);
			})
			.error( function (data,status) {
				alert(status);
			});
	}, 30000);
}

});