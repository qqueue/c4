# general page info
board =
	name: document.title.match(/\/(\w+)\//)[1] # easiest way to get it 
	title: $('div.logo b').text()
	subtitle: $('div.logo font[size="1"]').html()
	nsfw: document.styleSheets[0].ownerNode.href is 'http://static.4chan.org/css/yotsuba.9.css' # the yellow theme
	
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
	

# globally perform some substitutions instead of in loop
time "preprocess"
###
$('font > .quotelink')
	.removeAttr('onclick')
	.unwrap()
$('font.unkfunc').changeTo('<b>', class: "greentext")
$('span.spoiler').changeTo('<s>', class:"spoiler").end()
###
for link in $('a.quotelink')
	l = $(link)
	if /^(\d+)#\1/.test l.attr('href') # if the path and hash match exactly
		l.addClass 'oplink'



timeEnd "preprocess"
		
# instead of relying on js's Date.parse function, which doesn't parse 12 as 2012 among other things
# this function pulls out numbers with regex
parse4ChanDate = (date) ->
	unless match = date.match /(\d{2})\/(\d{2})\/(\d{2})\(\w+\)(\d{2}):(\d{2})/
		throw "Couldn't parse date: #{date}" 
	new Date Date.UTC(
		parseInt(match[3],10) + 2000
		parseInt(match[1],10) - 1,
		parseInt(match[2],10),
		(parseInt(match[4],10) + 4 + DSTOffset)%24, # 4chan is EST
		parseInt(match[5],10)
	)
# ########################################################
# parse all times
# ########################################################

time "times"
optimes = for el in document.getElementsByClassName 'posttime'
	parse4ChanDate el.textContent
replytimes = for el in document.getElementsByClassName 'reply'
	parse4ChanDate el.textContent
timeEnd "times"

# ########################################################

parseComment = (comment) ->
	comment
		.replace(/onmouseover="this\.style\.color='#FFF';" onmouseout="this\.style\.color=this\.style\.backgroundColor='#000'" style="color:#000;background:#000"/g, "") # annoying spoiler tags
		.replace(/onclick="replyhl\('\d+'\);"/g, "") # do not want
		.replace(/http:\/\/boards.4chan.org/g, "") # strips http://boards.4chan.org/ from cross-board links so they don't get linkified
		.replace(/https?:\/\/[\w\.\-_\/=&;?#%]+/g,'<a href="$&" target="_blank">$&</a>') # linkify other links
	
# ########################################################
# parse all comments
# ########################################################

time "comments"
comments = for el in document.getElementsByTagName 'blockquote'
	parseComment el.innerHTML
timeEnd "comments"

# ########################################################
	
# constructor for post, from jquery element list, 'op?' flag, and parent thread
class Post 
	constructor: ($,op,thread) -> 
		time "parse post op: #{op}"
		poster = $.filter if op then '.postername' else '.commentpostername'
		email = poster.find('a.linkmail').attr 'href'
		
		@id = $.filter('input').attr 'name'
		@op = op
		@sage = email and /^mailto:sage$/i.test email
		
		@url = 
			if op then thread.url else thread.url+'#'+@id
		@time = if op then optimes.shift() else replytimes.shift()
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

		@comment = comments.shift()

		# non-enumerable circular references for rendering
		Object.defineProperty this, 'thread', value: thread, enumerable: false
		timeEnd "parse post op: #{op}"

# constructor for post, from jquery element list and whether this is a full thread
class Thread 
	constructor: ($,preview) ->
		time "parse thread"
		@id = $.filter('input').attr 'name'
		@url = board.threadurl+@id
		
		@op = 
			new Post $, true, this
		thread = this
		time "parse replies"
		@replies = 
			for post in $.find('td.reply') 
				new Post jQuery(post).children(), false, thread
		timeEnd "parse replies"
		@locked = 
			$.exists('img[alt="closed"]')
		@sticky = 
			$.exists('img[alt="sticky"]')
		
		
		if @preview = preview 
			omittedposts = $.filter('.omittedposts').text()
			@omittedReplies =
				parseInt(omittedposts.match(/\d+(?= posts?)/), 10) or 0
			@omittedImageReplies =
				parseInt(omittedposts.match(/\d+(?= image (?:replies|reply))/), 10) or 0
		
		timeEnd "parse thread"
		
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
		# insert a <br> at the beginning of the first thread, to make separating them easier
		oldThreads = $('form[name="delform"]').prepend('<hr>').find('hr').get().slice(0,-2);
		threads = 
			for t in oldThreads
				new Thread $(t).nextUntil('hr'), true

	nav: $('#navtop').html()
	banner: $('div.logo img').attr('src')
	
	deletePassword: $('input[type="password"]').get(0).value # so we don't have to recheck the cookie
	board: board
	
	thread: thread
	threads: threads
	
	pages: pages
	previous: previous
	next: next

time("extract threads")

data = parse4chan()

timeEnd("extract threads"); 

console.log _log.join("\n")
console.dir(data)