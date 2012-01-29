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
	//disable 4chan styles and css scripts
	$('link[rel*="stylesheet"]').remove();
	window.onload = window.onunload = undefined;
	
	function extractImageInfo(imageLink, filesize) {
		if( imageLink.length == 0 ) return undefined;
		
		var thumb = imageLink.children('img'),
			dimensions = filesize.text().match(/(\d+)x(\d+)/);
		return { 
			url: imageLink.attr('href'),
			width: parseInt(dimensions[1]),
			height: parseInt(dimensions[2]),
			size: thumb.attr('alt').match(/[\d\.]+ [KM]B/)[0],
			filename: filesize.find('span[title]').attr('title'),
			md5: thumb.attr('md5'),
			spoiler: /^Spoiler Image/.test(thumb.attr('alt')),
			thumb: {
				url: thumb.attr('src'),
				width: parseInt(thumb.attr('width')),
				height: parseInt(thumb.attr('height')),}}};
	
	function cleanCommentText (html) {
		return html
			.replace(/<span class="abbr">[^<]+<\/span>/,"[comment truncated]") //abbr message
			.replace(/<br>/g,"\n") //non-html linebreaks
			.replace(/<a[^>]+>&gt;&gt;(\d+)<\/a>/g,"\u2603$1") // \u2603 replace live links with special representation (snowman)
			.replace(/<span class="spoiler"[^>]+>/g,'[spoiler]').replace(/<\/span>/g,"[/spoiler]") //spoilers
			.replace(/<[^>]+>/g,"") //strip the rest of the html
			.replace(/&gt;&gt;\d+/g,"$& (404)") //mark dead links as such (those that didn't have an anchor tag wrapper)
			.replace(/\u2603(\d+)/g,"&gt;&gt;$1"); } //remark live links
	
	//instead of relying on js's Date.parse function, which doesn't parse 12 as 2012
	//this function pulls out numbers with regex
	function parse4ChanDate(dateString) {	
		//perfect place for destructuring assignment
		var date = dateString.match(/(\d{2})\/(\d{2})\/(\d{2})\(\w+\)(\d{2}):(\d{2})/).slice(1).map(function(val) { return parseInt(val,10); });
		//and corrects for >year 2000 and 4chan's time zone (EST)
		return new Date(Date.UTC(date[2]+2000,
		                         date[0]-1, date[1],
		                         (date[3]+(((new Date()).getTimezoneOffset() == (new Date((new Date()).setMonth(6))).getTimezoneOffset()) ? 4 : 5))%24, //DST detection
		                         date[4]));}
	
	//takes the comment's elements, and a flag for OP's slightly different format
	function parseComment(comment,op) {
		//cached jquery
		var poster = comment.filter(op ? '.postername' : '.commentpostername' ),
		    email = poster.find('a.linkmail').attr('href'),
		    sage = email ? /^mailto:sage$/i.test(email) : false;
		return {
			op: op, //useful flag for rendering
			id: comment.filter('input').attr('name'),
			url: comment.find('a.quotejs').eq(0).attr('href'),
			time: parse4ChanDate(op ? comment.filter('.posttime').text() : comment.parent().clone().children().remove().end().text()), //op has wrapper, but replies don't, so we need just the text
			title: comment.filter(op ? '.filetitle' : '.replytitle' ).text() || undefined,
			image: extractImageInfo(comment.filter('a[target="_blank"]'),comment.filter('.filesize')),
			deletedImage: comment.filter('img[alt="File deleted."]').length > 0,
			poster: poster.eq(0).text(),
			email: typeof email == "undefined" ? email : email.substring(7), //if email is defined, strip mailto:
			sage: sage,
			tripcode: comment.filter('.postertrip').text() || comment.filter('.linkmail').find('.postertrip').text() ||undefined, //poster trips with emails are wrapped in the anchor for some reason
			capcode: (op ? comment.filter('.commentpostername').text() : comment.filter('.commentpostername').eq(1).text()) || undefined, //replies have two commentpostername spans
			comment: cleanCommentText(comment.filter('blockquote').html()) }}
	
	//takes the comments elements
	function parseThread(thread) {
		var omittedReplies = parseInt(thread.filter('.omittedposts').text().match(/\d+(?= posts)/), 10) || 0,
		    omittedImageReplies = parseInt(thread.filter('.omittedposts').text().match(/\d+(?= image replies)/), 10) || 0,
		    replies = thread.find('td.reply').map(function() { return parseComment($(this).children(),false);}).get();
		return {
			id: thread.filter('input').attr('name'),
			numReplies: omittedReplies + replies.length,
			imageReplies: omittedImageReplies + replies.filter(function(reply){ return reply.image; }).length,
			omittedReplies: omittedReplies,
			omittedImageReplies: omittedImageReplies,
			sticky: (thread.find('img[alt="sticky"]').length > 0),
			op: parseComment(thread,true),
			replies: replies };}
	
	//extract thread info
	function parse4chan() {
		//detect whether this is board view or post view based on the existence of the [Return] link
		var isThread = $('a[accesskey]').length > 0;
		return {
			nav: $('#navtop').html(),
			banner: $('div.logo img').attr('src'),
			deletePassword: $('input[type="password"]').get(0).value, //so we don't have to recheck the cookie
			board: {
				name: document.title.match(/\/(\w+)\//)[1], //easiest way to get it 
				title: $('div.logo b').text(),
				subtitle: $('div.logo font[size="1"]').html()
			},
			thread: isThread ? parseThread( $('form[name="delform"]').children() ) : undefined,
			threads: !isThread ? $('form[name="delform"] > br[clear="left"]').map(function () { //reliable way to separate threads into separate collections of elements
				return parseThread( $($(this).prevUntil("hr").get().reverse()) ); //reversed to maintain post order
			}).get() : undefined,
			pages: $('table.pages td').eq(1).html() || undefined
		};}
	
	console.time("extract threads");
	var data = parse4chan();
	console.timeEnd("extract threads"); 
	/////////////////////////////////////////////////////////
	//Render
	/////////////////////////////////////////////////////////
	console.time('handlebars');
	Handlebars.registerHelper('datetime', function( time, options ) {
		var date = new Date(time);
		return date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes();
	});
	Handlebars.registerHelper('4chancomment', function( comment, options ) {
		return new Handlebars.SafeString(
			comment
				.replace(/^&gt;(?!&gt;).+/gm,"<b class='greentext'>$&</b>")
				.replace(/&gt;&gt;(\d+)/g,"<a href='"+this.url.split('#')[0]+"#$1'>$&</a>") //split('#') to generate the correct relative paths by removing fragment
				.replace(/\[spoiler\]/g,"<s class=spoiler>")
				.replace(/\[\/spoiler\]/g,"</s>")
				.replace(/\n/g,"<br>")
			);
	});
	Handlebars.registerPartial('post', '<header> <h1> <input type="checkbox" value="delete" name="{{id}}" form="delform"> <button type="submit" form="reportform" name="no" value="{{id}}">[!]</button> <span class="title">{{title}}</span> <a class="poster" {{#if email}}href="mailto:{{email}}"{{/if}}>{{poster}}</a> <span class="tripcode">{{tripcode}}</span> <span class="capcode">{{capcode}}</span> <time pubdate datetime="{{time}}">{{datetime time}}</time> <a href="{{url}}" class="permalink">No.{{id}}</a> </h1> {{#if image}}<div class="fileinfo"> <span class="dimensions">{{image.width}}x{{image.height}}</span> <span class="size">{{image.size}}</span> <span class="filename">{{image.filename}}</span> </div>{{/if}} </header> {{#if image}}  {{#with image.thumb}} <a class="file" target="_blank" href="{{../image.url}}"><img class="thumb" src="{{url}}" width="{{width}}" height="{{height}}"/></a> {{/with}}  {{/if}} <p class="comment"> {{4chancomment comment}} </p>');
	Handlebars.registerPartial('thread','<article class="thread" id="{{op.id}}"> <div class="op post"> {{#with op}} {{> post}} {{/with}} </div> {{#if omittedReplies}}{{#if replies}}<footer>{{numReplies}} replies and {{imageReplies}} image replies. Latest {{replies.length}} shown.</footer>{{/if}}{{/if}} <div class="replies"> {{#each replies}} <article class="post reply" id="{{id}}"> {{> post}} </article> {{/each}} </div> </article>');
	var template = Handlebars.compile('<header> <nav>{{{nav}}}</nav> <img src="{{banner}}" alt="4chan::" id="banner"/> <hgroup> <h1><a href="http://boards.4chan.org/{{board.name}}/">{{board.title}}</a></h1> <h2>{{{board.subtitle}}}</h2> </hgroup> </header> <div id="threads"> {{#each threads}}{{>thread}}{{/each}} {{#if thread}}{{#with thread}}{{>thread}}{{/with}}{{/if}}{{! for single thread views }} </div> <form id="postform" enctype="multipart/form-data" method="POST" action="http://sys.4chan.org/{{board.name}}/post" target="_blank"> <input type="hidden" value="3145728" name="MAX_FILE_SIZE"> <input type="hidden" value="regist" name="mode"> {{#if thread}}<input type="hidden" value="{{thread.id}}" name="resto">{{/if}} <div><label for="name">Name: </label><input type="text" name="name" id="name" /></div> <div><label for="email">Email: </label><input type="text" id="email" name="email" /></div> <div><label for="subject">Subject: </label><input type="text" id="subject" name="sub" /></div> <div><label for="comment">Comment: </label><textarea name="com" id="comment" rows="4"></textarea></div> <div><label>Verification: </label><div id="verification"></div></div> <div> <label for="image">Image: </label><input type="file" id="image" name="upfile"/> <label><input type="checkbox" value="on" name="spoiler"/> Spoiler Image?</label> </div> <div title="for file deletion"> <label for="password">Password: </label> <input id="password" type="password" maxlength="8" name="pwd" value="{{deletePassword}}"> </div> <div><button type="submit" value="Submit">Submit</button></div> <ul id="rules"> <li>Supported file types are: GIF, JPG, PNG </li> <li>Maximum file size allowed is 3072 KB. </li> <li>Images greater than 250x250 pixels will be thumbnailed. </li> <li>Read the <a href="http://www.4chan.org/rules#lit">rules</a> and <a href="http://www.4chan.org/faq">FAQ</a> before posting.</li> <li><img width="17" height="11" src="http://static.4chan.org/image/jpn-flag.jpg"><a href="http://www.4chan.org/japanese">このサイトについて</a> - <a href="http://www.nifty.com/globalgate/">翻訳</a></li> </ul> </form> <form id="delform" method="POST" action="http://sys.4chan.org/{{board.name}}/imgboard.php" target="_blank"> <input name="mode" value="usrdel" type="hidden"> <label>Password <input name="pwd" size="8" maxlength="8" value="{{deletePassword}}" type="password"></label> <button type="submit" value="Delete">Delete Post</button> <label><input name="onlyimgdel" value="on" type="checkbox">[File Only]</label> </form> <form action="http://sys.4chan.org/{{board.name}}/imgboard.php"" id="reportform" method="GET" target="_blank"> <input type="hidden" name="mode" value="report"/> <!-- all the report buttons are part of this form --> </form> {{#if pages}} <nav id="pages"> {{{pages}}} </nav> {{/if}}');
	$('<body>').html(template(data)).replaceAll('body');
	console.timeEnd('handlebars');
	$('<style>').html('html { background: #EEF2FF; min-height:100%; font-family: sans-serif; font-size: 10pt; }   .post h1 { display: inline; margin: 0; padding: 0; font-size: 100%; font-weight: normal;}  .thread { padding-bottom: 5px; border-bottom: 1px solid #B7C5D9; overflow: auto; } .thread > footer { clear: left; text-align: right; } .post { margin-top: 3px; }  .replies {  }  .post .title { color: #0f0c5d; font-weight: 800; }  .reply { background: #D6DAF0; padding: 2px; margin-left: 1.5em; border-color: #B7C5D9; border-style: solid; border-width: 0 1px 1px 0; clear: both; }   .reply:before { content: ">>"; display: block; height: 0; margin-left: -1.5em; font-size: 10pt; color: #B7C5D9; }  .reply:after { content: ""; display: block; height: 0; clear: both; visibility: hidden; }  .comment { padding: 0 1em ; margin: 1em 40px; }  .poster { color:#117743; font-weight: 800; }  .tripcode { color: #228854; } .greentext { font-weight: normal; color: #789922; }  .spoiler { text-decoration: none; color: black; background: black; } .spoiler .greentext, .spoiler a { color: black; }  .spoiler:hover { color: white; }  .file { display: block; float: left; margin: 3px 20px; position: relative; }  .id { text-decoration: none; color: inherit; }  .id:hover { color: red; } .capcode { color: red; font-weight: 800; }  .post button[form="reportform"] { float: right; border: none; padding: 0; margin: 0; cursor: pointer; background: transparent; }').appendTo('head');
	
});