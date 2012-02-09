`
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
`

"use strict"

$.fn.extend
	immediateText: -> 
		@parent().clone().children().remove().end().text()
	
	exists: (selector) -> 
		( if selector then @find selector else this ).length > 0
	
	changeTo: (replacement, options) -> 
		@replaceWith ->
			$(replacement,options).html($(this).html())

	constrainY: ({left, top}, margin = 0) ->
		height = @height()
		bottom = top + height
		screentop = $(window).scrollTop()
		screenbottom = screentop + $(window).height()
		
		if bottom > screenbottom
			top = screenbottom - margin - height
			
		if top < screentop
			top = screentop + margin
			
		return @css
			left: left
			top: top
			position: "absolute"
			
	beforeAndScroll: (content) ->
		before = @offset()
		@before content
		after = @offset()
		window.scrollBy after.left - before.left, after.top - before.top 
		return this
		
	removeAndScroll: (relativeTo) ->
		before = relativeTo.offset()
		@remove()
		after = relativeTo.offset()
		# unless the scrollbar is already at the bottom (which autocorrects position)
		unless window.scrollY is window.scrollMaxY
			window.scrollBy after.left - before.left, after.top - before.top
		return this

# Assuming DST in may
DSTOffset = (new Date().getTimezoneOffset() - new Date((new Date()).setMonth(6)).getTimezoneOffset())/60
	
# frickin octal
to10 = (str) -> parseInt(str, 10)

# # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# parse 4chan's shitty markup into data
# # # # # # # # # # # # # # # # # # # # # # # # # # # # 

# general page info
board =
	name: document.title.match(/\/(\w+)\//)[1] # easiest way to get it 
	title: $('div.logo b').text()
	subtitle: $('div.logo font[size="1"]').html()
	nsfw: $('link[rel=stylesheet]')[0].href is 'http://static.4chan.org/css/yotsuba.9.css' # the yellow theme
	
board.url = "http://boards.4chan.org/#{board.name}/"
board.threadurl = "#{board.url}res/"

parseImage = (imageLink, filesize) ->
	thumb = imageLink.children 'img'
	dimensions = filesize.text().match /(\d+)x(\d+)/
	
	thumb:
		url: thumb.attr 'src'
		width: parseInt thumb.attr('width'), 10
		height: parseInt thumb.attr('height'), 10
	
	url: imageLink.attr 'href'
	
	width: parseInt dimensions[1], 10
	height: parseInt dimensions[2], 10
	
	size: thumb.attr('alt').match(/[\d\.]+ [KM]?B/)[0]
	filename: filesize.find('span[title]').attr 'title'
	md5: thumb.attr 'md5'
	
	spoiler: /^Spoiler Image/.test thumb.attr('alt')
	

parseComment = (comment) ->
	comment.clone() # don't operate on actual dom elements for speed
		.find('font > .quotelink')
			.removeAttr('onclick')
			.unwrap()
		.end()
		.find('font.unkfunc').changeTo('<b>', class: "greentext").end()
		.find('span.spoiler').changeTo('<s>', class:"spoiler").end()
		.find('a.quotelink').each ->
			if( /^(\d+)#\1/.test($(this).attr('href')) ) # if the path and hash match exactly
				$(this).addClass('oplink')
		.end()
		.html()
			.replace(/http:\/\/boards.4chan.org/g, "") # strips http://boards.4chan.org/ from cross-board links so they don't get linkified
			.replace(/https?:\/\/[\w\.\-_\/=&;?#%]+/g,'<a href="$&" target="_blank">$&</a>') # linkify other links

# instead of relying on js's Date.parse function, which doesn't parse 12 as 2012 among other things
# this function pulls out numbers with regex
parse4ChanDate = (date) ->
	unless match = date.match /(\d{2})\/(\d{2})\/(\d{2})\(\w+\)(\d{2}):(\d{2})/
		throw "Couldn't parse date: #{date}" 
	[ month, day, year, hour, minute ] = match.slice(1).map to10
	new Date Date.UTC(
		year + 2000
		month - 1,
		day,
		(hour + 4 + DSTOffset)%24, # 4chan is EST
		minute
	)

# constructor for post, from jquery element list, 'op?' flag, and parent thread
class Post 
	constructor: ($,op,thread) -> 
		poster = $.filter if op then '.postername' else '.commentpostername'
		email = poster.find('a.linkmail').attr 'href'
		
		@id = $.filter('input').attr 'name'
		@op = op
		@sage = email and /^mailto:sage$/i.test email
		
		@url = 
			if op then thread.url else thread.url+'#'+@id
		@time = # only the op has a nice wrapper around the date ;_
			parse4ChanDate( if op then $.filter('.posttime').text() else $.immediateText())
		@title = 
			$.filter( if op then '.filetitle' else '.replytitle' ).text() or undefined
		
		imagelink = $.filter 'a[target="_blank"]'
		if imagelink.exists()
			@image = parseImage imagelink, $.filter('.filesize')
		else
			@imageDeleted = $.exists 'img[alt="File deleted."]'
		
		@poster = poster.eq(0).text()
		@email = email and email.substring(7); # strip mailto:
		@tripcode = # poster trips with emails are wrapped in the anchor
			$.filter('.postertrip').text() or $.filter('.linkmail').find('.postertrip').text() or undefined
		@capcode = # replies have two commentpostername spans
			$.filter('.commentpostername').eq( if op then 0 else 1).text() or undefined
			
		@comment = parseComment $.filter('blockquote')
		
		# non-enumerable circular references for rendering
		Object.defineProperty this, 'thread', value: thread, enumerable: false

# constructor for post, from jquery element list and whether this is a full thread
class Thread 
	constructor: ($,preview) ->
		@id = $.filter('input').attr 'name'
		@url = board.threadurl+@id
		
		@op = 
			new Post $, true, this
		@replies = 
			$.find('td.reply').map (i,post) => 
				new Post jQuery(post).children(), false, this
			.get()
		
		
		@locked = 
			$.exists('img[alt="closed"]')
		@sticky = 
			$.exists('img[alt="sticky"]')
		
		
		if @preview = preview 
			omittedposts = $.filter('.omittedposts').text()
			@omittedReplies =
				to10 omittedposts.match(/\d+(?= posts?)/) or 0
			@omittedImageReplies =
				to10 omittedposts.match(/\d+(?= image (?:replies|reply))/) or 0
				
	# non-enumerable circular reference for rendering
	Object.defineProperty Thread.prototype, 'board', value: board, enumerable: false

# parse entire board
parse4chan = ->
	# detect whether this is board view or post view based on the existence of the [Return] link
	isThread = $('a[accesskey]').exists()

	current = 0
	pages = if ( $pages = $('table.pages') ).exists()
		$('table.pages').find('a,b').map (i) -> 
			current = i if $(this).is 'b'
			return current: current is i, num: i
		.get()
	previous = if pages and current > 0 then current -1 else undefined
	next = if pages and current < (pages.length-1) then current + 1 else undefined
	
	threads = thread = undefined
	if isThread
		thread = new Thread $('form[name="delform"]').children(), false
	else
		# reliable way to separate threads into separate collections of elements
		threads = $('form[name="delform"] > br[clear="left"]').map ->
			new Thread $($(this).prevUntil("hr").get().reverse()), true
		.get()

	nav: $('#navtop').html()
	banner: $('div.logo img').attr('src')
	
	deletePassword: $('input[type="password"]').get(0).value # so we don't have to recheck the cookie
	board: board
	
	thread: thread
	threads: threads
	
	pages: pages
	previous: previous
	next: next

console.time("extract threads")
data = parse4chan()
console.dir(data)
console.timeEnd("extract threads"); 

# # # # # # # # # # # # # # # # # # # # # # # # # # # # 
# Render data back to html
# # # # # # # # # # # # # # # # # # # # # # # # # # # # 


# disable 4chan styles
$('link[rel*="stylesheet"], style').remove()
# disable 4chan's onload functions
# we can do this because onload has to wait
# for all the images, which obstensibly takes longer
# than it doest to load this script
window.onload = window.onunload = undefined

console.time('handlebars')
Handlebars.registerHelper 'datetime', ( time, options ) ->
	pad = (number) ->
		str = number.toString()
		return if str.length < 2 then "0"+str else str; # pad to 2 digits
	
	date = new Date(time)
	return date.getFullYear()+"-"+pad(date.getMonth()+1)+"-"+pad(date.getDate())+" "+pad(date.getHours())+":"+pad(date.getMinutes())

Handlebars.registerHelper 'ISOString', (time) ->
	return new Date(time).toISOString()


Post.render = Handlebars.compile('{{{Post}}}')
Post.prototype.render = -> Post.render(this)
Handlebars.registerPartial('post',Post.render)

Thread.render = Handlebars.compile('{{{Thread}}}')
Thread.prototype.render = -> Thread.render(this)
Handlebars.registerPartial('thread',Thread.render)

template = Handlebars.compile('{{{template}}}')
$('body')
	.removeAttr('vlink text link bgcolor')
	.attr({id: data.board.name})
	.addClass( if data.board.nsfw then 'nsfw' else 'sfw')
	.addClass( if data.thread then 'threadpage' else 'boardpage')
	.html(template(data))

console.timeEnd('handlebars')
$('<style>').html('{{{css}}}').appendTo('head')

# create recaptcha with script already included on page (using 4chan's public key)
script = document.createElement("script")
script.textContent = "("+( ->
	Recaptcha.create("6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc", "captcha", {
		theme: "clean"
		tabindex: 10
	})
).toString()+")()"
document.body.appendChild(script)

# rescroll to target element if this page hasn't been loaded before
# this retains the browser's natural scroll position memory
# while still scrolling to the new hash target's position 
# the first time the page loads
if ( !sessionStorage.getItem("html5chan-"+document.URL) )
	window.location.hash = window.location.hash
	sessionStorage.setItem("html5chan-"+document.URL, true)



# Features

# recreate 4chan's quoting js
$('#threads')
	.on('click.html5chan.quote', '.permalink .id', ->
		selection = window.getSelection().toString().trim()
		selection = '>'+selection+'\n' if(selection) 
		$('#comment')[0].value += '>>'+$(this).html()+'\n'+selection
		return false
	)
	
# hide posts
$('#threads')
	.on('click.html5chan.hide', '.reply button.hide', ->
		post = $(this).data('post')
		$(post).toggleClass('hidden')
		$('a.quotelink[href='+post+']').toggleClass('hiddenlink')
		# persist with session storage
		sessionStorage.setItem('hide-'+post, if sessionStorage.getItem('hide-'+post) then '' else 'hidden')
	)
# hide all previously hidden posts
$('.post').each(-> 
	id = '#'+this.id
	if( sessionStorage.getItem('hide-'+id) )
		$('a.quotelink[href='+id+']').toggleClass('hiddenlink')
		$(this).toggleClass('hidden')
	
)
	
# image hover previews
$('#threads')
	.on('mouseenter.html5chan.imgpreview', 'a.file', (e) ->
		$('<img>',{
			id: 'imgpreview'
			src: this.href
			alt: "Loading..."}
		).load(->
			$(this).attr({alt: this.href})
		).error(->
			$(this).attr({alt: "Unable to load image."})
		)
		.constrainY({
			left: e.pageX+10
			top: e.pageY+10
		}, 10).css({
			maxHeight: $(window).height() - 20
			maxWidth: $(window).width() - e.pageX - 20
		})
		.appendTo('body')
	)
	.on('mousemove.html5chan.imgpreview', 'a.file', (e) ->
		$('#imgpreview').constrainY({
			left: e.pageX+10
			top: e.pageY+10
		}, 10).css({
			maxWidth: $(document).width() - e.pageX - 20
		});
	)
	.on('mouseleave.html5chan.imgpreview', 'a.file', (e) ->
		$('#imgpreview').remove();
	)

# backlinks
backlink = ->
	$('.post').not('.inline').each ->
		quoter = this
		$(quoter).find('.comment > a.quotelink').each ->
			if( /^#\d+/.test(this.hash) ) # relative postlink
				quoted = $(this.hash)
				backlinks = quoted.data('backlinks')
				if( !backlinks )
					backlinks = {}
					quoted.data('backlinks', backlinks)
				
				unless backlinks[quoter.id]
					backlinks[quoter.id] = true
					quoted.find('.backlinks')
						.append(
							$('<a>',{'class': 'backlink quotelink', href: '#'+quoter.id}).html('&gt;&gt;'+quoter.id)
						)
						.append(' ') # necessary for the line to wrap properly; stupid i know

backlink()

# post hover previews
$('#threads')
	.on('mouseenter.html5chan.postpreview', 'a.quotelink:not(.inlinedlink, .hiddenlink)',(e) ->
		$this = $(this)
		return if( $this.is('.inlinedlink') ) # don't need to preview if it's right there.
		post = $(this.hash)
		hostid = $this.closest('.post').attr('id').split('-').pop()
		if( post.exists() )
			post
				.clone()
					.find('.inline').remove().end() # strip inline replies
					.find('.inlinedlink').removeClass('inlinedlink').end() # these don't apply anymore, as inline replies are gone
					.removeClass('hovered') # if it exists
					.find('a.quotelink[href$=#'+hostid+']') # replace matching reply link
						.replaceWith( ->
							return $('<strong>',{'class': 'recursivelink'})
								.html($(this).html())
								.addClass(this.className)
						).end()
					.attr('id', 'postpreview')
					.appendTo('body')
			$this.trigger('mousemove.html5chan.postpreview')
		
	)
	.on('mousemove.html5chan.postpreview', 'a.quotelink', (e) ->
		preview = $('#postpreview')
		height = preview.height()
		width = preview.width()
		left = e.pageX + 10
		if( (left + width ) > $(window).width() ) 
			left = Math.max( 10, e.pageX - 10 - width )
		preview
			.css({
				position: "absolute"
				left: left
				top: e.pageY+( if $(this).is('.backlink') then 10 else -20 - height) 
			})
	)
	.on('mouseleave.html5chan.postpreview', 'a.quotelink', (e) ->
		$('#postpreview').remove();
	)
	
# highlight hovered reply
$('#threads')
	.on('mouseenter.html5chan.posthighlight mouseleave.html5chan.posthighlight', 'a.quotelink', (e) ->
		$this = $(this)
		$( if $this.is('.inlinedlink') then '#'+$this.closest('.post').attr('id')+'-'+this.hash.slice(1) else undefined
		).add(this.hash).toggleClass('hovered')
	)
	

onBottom = ->
	($(document).height() - ($(window).scrollTop() + $(window).height())) < 10; # within 10px of bottom

# inline replies
$('#threads')
	.on('click.html5chan.inlinereplies', 'a.quotelink:not(.hiddenlink)', (e) ->
		post = $(this.hash)
		if( post.exists() ) 
			$this = $(this)
			host = $this.closest('.post').attr('id')
			hostid = host.split('-').pop() # grab last (if nested inline post)
			inlined_id = host+'-'+this.hash.slice(1) # id is unique to hosting post and inlined post
			inlined = $('#'+inlined_id)
			if( inlined.exists() ) 
				inlined.removeAndScroll($this)
				$this.removeClass('inlinedlink')
			else
				inlined = post.clone()
					.find('.inline').remove().end() # remove any previews the inlined post already has
					.find('.inlinedlink').removeClass('inlinedlink').end() # these don't apply anymore, as inline replies are gone
					.find('a.quotelink[href$=#'+hostid+']') # replace matching reply link
						.replaceWith( ->
							return $('<strong>',{'class': 'recursivelink'})
								.html($(this).html())
								.addClass(this.className)
						).end()
					.attr('id',inlined_id)
					.addClass('inline')
				if( $this.is('.backlink'))
					$this.after(inlined)
				else
					$this.beforeAndScroll(inlined)
				$this.addClass('inlinedlink')
				$this.trigger('mouseleave.html5chan.postpreview'); # since we're previewing it now
			
			return false
	)

# bypass inline replies on dblclick
$('#threads').on 'dblclick', 'a.quotelink', ->
	window.location.hash = this.hash if( this.hash ) # actually follow link

if( data.thread )
	# let's try some ajax
	refresh = ->
		$.get(document.URL)
			.success( (html,status) ->
				console.log(status)
				# parse posts newer than last post
				last_post = data.thread.replies[data.thread.replies.length-1]
				posts = $('a[name='+last_post.id+'] ~ a[name]',html).eq(0).nextAll().find('td.reply').map( ->
					return new Post($(this).children(),false, data.thread)
				).get()
				console.dir(posts)
				
				if( posts && posts.length > 0 )
					data.thread.replies = data.thread.replies.concat(posts)
					$('.thread').append(
						posts.map((post) ->
							return '<article class="post reply" id="'+post.id+'">' + post.render() + '</article>'
						).join(""))
					backlink()
				
				
				setTimeout(refresh, 30000)
			)
			.error( (data,status) ->
				alert(status)
			)
	setTimeout refresh, 30000

