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