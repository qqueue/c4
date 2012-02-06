// ==UserScript==
// @name        html5chan
// @namespace   https://github.com/queue-/html5chan
// @description html5... on my 4chan?
// 
// @include     http://boards.4chan.org/*
// @exclude     http://boards.4chan.org/f/*
//
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.js
// @require http://cloud.github.com/downloads/wycats/handlebars.js/handlebars-1.0.0.beta.6.js
// ==/UserScript==

"use strict";

//////////////////////////////////////
// Initialization
//////////////////////////////////////

//extend jQuery with some nice functions
$.fn.extend({
	immediateText: function () { return this.parent().clone().children().remove().end().text(); },
	exists: function (selector) { return (selector ? this.find(selector) : this ).length > 0;},
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
		.find('font.unkfunc').changeTo('<b>', {class: "greentext"}).end()
		.find('span.spoiler').changeTo('<s>',{class:"spoiler"}).end()
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


//constructor for post, from jquery element list, 'op?' flag, and parent thread
function Post($,op,thread) {
	var poster = $.filter(op ? '.postername' : '.commentpostername' ),
		email = poster.find('a.linkmail').attr('href');

	//non-enumerable circular reference to thread, for rendering
	Object.defineProperty(this, 'thread', { value: thread, enumerable: false });
	
	this.id =
		$.filter('input').attr('name');
	this.op = 
		op;
	this.sage = 
		email ? /^mailto:sage$/i.test(email) : false;
	
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
function Thread($,preview,board) {
	//non-enumerable circular reference to thread, for rendering
	Object.defineProperty(this, 'board', { value: board, enumerable: false });
	
	var thread = this;
	this.replies = 
		$.find('td.reply').map(function() { return new Post(jQuery(this).children(),false, thread); }).get();
	this.op = 
		new Post($,true, this);
	this.id = 
		this.op.id;
	
	this.locked = 
		$.exists('img[alt="closed"]');
	this.sticky = 
		$.exists('img[alt="sticky"]');
	
	this.url = 
		"res/"+this.id;
	
	this.preview = 
		preview;
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
	
	var board = {
		name: document.title.match(/\/(\w+)\//)[1], //easiest way to get it 
		title: $('div.logo b').text(),
		subtitle: $('div.logo font[size="1"]').html(),
		nsfw: $('link[rel=stylesheet]')[0].href == 'http://static.4chan.org/css/yotsuba.9.css', //the yellow theme
	}
	var current = 0, previous, next;
	var pages = $('table.pages').find('a,b').map(function(idx) {
		if( $(this).is('b')) current = idx;
		return { current: $(this).is('b'), num: idx };
	}).get();
	previous = current > 0 ? current -1 : undefined;
	next = current < (pages.length-1) ? current + 1 : undefined;
	
	return {
		nav: $('#navtop').html(),
		banner: $('div.logo img').attr('src'),
		deletePassword: $('input[type="password"]').get(0).value, //so we don't have to recheck the cookie
		board: board,
		thread: isThread ? new Thread( $('form[name="delform"]').children(),false,board ) : undefined,
		threads: !isThread ? $('form[name="delform"] > br[clear="left"]').map(function () { //reliable way to separate threads into separate collections of elements
			return new Thread( $($(this).prevUntil("hr").get().reverse()), true, board); //reversed to maintain post order
		}).get() : undefined,
		pages: pages.length > 0 ? pages : undefined,
		previous: previous,
		next: next
	};}

console.time("extract threads");
window.data = parse4chan();
console.dir(data);
console.timeEnd("extract threads"); 

/////////////////////////////////////////////////////////
//Render data back to html
/////////////////////////////////////////////////////////


//disable 4chan styles
$('link[rel*="stylesheet"], style').remove();
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

Post.render = Handlebars.compile('{{{Post}}}');
Post.prototype.render = function () { return Post.render(this); }
Handlebars.registerPartial('post',Post.render);
Thread.render = Handlebars.compile('{{{Thread}}}');
Thread.prototype.render = function () { return Thread.render(this); }
Handlebars.registerPartial('thread',Thread.render);

var template = Handlebars.compile('{{{template}}}');
$('body')
	.removeAttr('vlink text link bgcolor')
	.attr({id: data.board.name})
	.addClass(data.board.nsfw ? 'nsfw' : 'sfw')
	.addClass(data.thread ? 'threadpage' : 'boardpage')
	.html(template(data));

console.timeEnd('handlebars');
$('<style>').html('{{{css}}}').appendTo('head');

//create recaptcha with script already included on page (using 4chan's public key)
var script = document.createElement("script");
script.textContent = "("+(function() {
	Recaptcha.create("6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc", "captcha", {
		theme: "clean",
		tabindex: 10
	});
}).toString()+")()";
document.body.appendChild(script);

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

//recreate 4chan's quoting js
$('#threads')
	.on('click.html5chan.quote', '.permalink .id', function() {
		var selection = window.getSelection().toString().trim();
		if(selection) selection = '>'+selection+'\n';
		$('#comment')[0].value += '>>'+$(this).html()+'\n'+selection;
		return false;
	});
	
//hide posts
$('#threads')
	.on('click.html5chan.hide', '.reply button.hide', function() {
		var post = $(this).data('post');
		$(post).toggleClass('hidden');
		$('a.quotelink[href='+post+']').toggleClass('hiddenlink');
		//persist with session storage
		sessionStorage.setItem('hide-'+post, sessionStorage.getItem('hide-'+post) ? '' : 'hidden');
	});
//hide all previously hidden posts
$('.post').each(function () {
	var id = '#'+this.id;
	if( sessionStorage.getItem('hide-'+id) ) {
		$('a.quotelink[href='+id+']').toggleClass('hiddenlink');
		$(this).toggleClass('hidden');
	}
});
	
//image hover previews
$('#threads')
	.on('mouseenter.html5chan.imgpreview', 'a.file', function (e) {
		$('<img>',{
			id: 'imgpreview',
			src: this.href,
			alt: "Loading..."}
		).load(function() {
			$(this).attr({alt: this.href});
		}).error(function() {
			$(this).attr({alt: "Unable to load image."});
		})
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
	.on('mouseenter.html5chan.postpreview', 'a.quotelink:not(.inlinedlink, .hiddenlink)', function (e) {
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
	.on('click.html5chan.inlinereplies', 'a.quotelink:not(.hiddenlink)', function(e) {
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
							return '<article class="post reply" id="'+post.id+'">' + post.render() + '</article>';
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
