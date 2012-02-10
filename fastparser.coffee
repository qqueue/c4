# general page info
board =
	name: document.title.match(/\/(\w+)\//)[1] # easiest way to get it 
	title: $('div.logo b').text()
	subtitle: $('div.logo font[size="1"]').html()
	nsfw: document.styleSheets[0].ownerNode.href is 'http://static.4chan.org/css/yotsuba.9.css' # the yellow theme
	
board.url = "http://boards.4chan.org/#{board.name}/"
board.threadurl = "#{board.url}res/"

# general thread info
isThread = document.location.pathname.match /res\/(\d+)/
threadID = if isThread then isThread[1]
opHash = if threadID then '#'+threadID

time "preprocess"
# ########################################################
# find OP links
# ########################################################

time "find OP links"
for link in document.getElementsByClassName 'quotelink'
	if opHash == link.hash
		link.className += ' oplink'
timeEnd "find OP links"
		
# ########################################################
# parse all times
# ########################################################
time "times"

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

optimes = for el in document.getElementsByClassName 'posttime'
	parse4ChanDate el.textContent
replytimes = for el in document.getElementsByClassName 'reply'
	parse4ChanDate el.textContent
timeEnd "times"

# ########################################################
# parse all comments
# ########################################################
time "comments"

parseComment = (comment) ->
	comment
		.replace(/onmouseover="this\.style\.color='#FFF';" onmouseout="this\.style\.color=this\.style\.backgroundColor='#000'" style="color:#000;background:#000"/g, "") # annoying spoiler tags
		.replace(/onclick="replyhl\('\d+'\);"/g, "") # do not want
		.replace(/http:\/\/boards.4chan.org/g, "") # strips http://boards.4chan.org/ from cross-board links so they don't get linkified
		.replace(/https?:\/\/[\w\.\-_\/=&;?#%]+/g,'<a href="$&" target="_blank">$&</a>') # linkify other links
	
comments = for el in document.getElementsByTagName 'blockquote'
	parseComment el.innerHTML
timeEnd "comments"

# ########################################################
# parse post ids
# ########################################################
time "post ids"
ids = for el in document.querySelectorAll 'form[name="delform"] > a[name]'
	el.attributes[0].value
timeEnd "post ids"
# ########################################################
# parse all names
# ########################################################
time "names"

replynames = (el.textContent for el in document.getElementsByClassName('commentpostername'))
opnames = (el.textContent for el in document.getElementsByClassName('postername'))
timeEnd "names"

# ########################################################
# parse all titles
# ########################################################
time "titles"

replytitles = (el.textContent for el in document.getElementsByClassName('replytitle'))
optitles = (el.textContent for el in document.getElementsByClassName('filetitle'))
timeEnd "titles"


# ########################################################
# parse all images
# ########################################################
time "images"
parseImage = (image, fileinfo) ->
	thumb = image.childNodes[0]
	dimensions = fileinfo.match /(\d+)x(\d+)/
	filename = fileinfo.match /title="([^"]+)"/
	
	thumb:
		url: thumb.getAttribute 'src'
		width: parseInt thumb.getAttribute('width'), 10
		height: parseInt thumb.getAttribute('height'), 10
	
	url: image.getAttribute 'href'
	
	width: parseInt dimensions[1], 10
	height: parseInt dimensions[2], 10
	
	size: fileinfo.match(/[\d\.]+ [KM]?B/)[0]
	filename: if filename then filename[1]
	md5: thumb.getAttribute 'md5'
	
	spoiler: /^Spoiler Image/.test fileinfo

imageEls = (el.parentNode for el in document.querySelectorAll('img[md5]'))
fileinfos = (el.innerHTML for el in document.getElementsByClassName('filesize'))
images = (for i in [0...imageEls.length]
	parseImage(imageEls[i],fileinfos[i])
)
timeEnd "images"

# ########################################################
timeEnd "preprocess"

# constructor for post, from jquery element list, 'op?' flag, and parent thread
class Post 
	constructor: ($,op,thread) -> 
		@id = ids.shift()
		time "parse post #{if op then 'op' else ''} id: #{@id}"
		poster = $.filter if op then '.postername' else '.commentpostername'
		email = poster.find('a.linkmail').attr 'href'
		
		
		@op = op
		@sage = email and /^mailto:sage$/i.test email
		
		@url = 
			if op then thread.url else thread.url+'#'+@id
		@time = if op then optimes.shift() else replytimes.shift()
		@title = 
			(if op then optitles.shift() else replytitles.shift()) or undefined
		
		imagelink = $.filter 'a[target="_blank"]'
		if imagelink.exists()
			@image = images.shift()
		else
			@imageDeleted = $.exists 'img[alt="File deleted."]'
		
		@poster = if op then opnames.shift() else replynames.shift()
		@email = email and email.substring(7); # strip mailto:
		@tripcode = # poster trips with emails are wrapped in the anchor
			$.filter('.postertrip').text() or $.filter('.linkmail').find('.postertrip').text() or undefined
		@capcode = # replies have two commentpostername spans
			$.filter('.commentpostername').eq( if op then 0 else 1).text() or undefined

		@comment = comments.shift()

		# non-enumerable circular references for rendering
		Object.defineProperty this, 'thread', value: thread, enumerable: false
		timeEnd "parse post #{if op then 'op' else ''} id: #{@id}"

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