time("extract threads")
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

delform = document.forms[1]

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
if isThread 
	ids = for el in document.querySelectorAll 'form[name="delform"] > a[name]'
		el.attributes[0].value
else # first named anchor is 0 for board pages ;_;
	ids = for el in document.querySelectorAll('form[name="delform"] > a[name], form[name="delform"] > input[value="delete"]')
		id = el.getAttribute 'name'
		if id is "0" then continue else id
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
# parse all emails
# ########################################################
time "emails"

emails = (el for el in document.getElementsByClassName('linkmail'))
timeEnd "emails"

# ########################################################
# parse all tripcodes
# ########################################################
time "tripcodes"

tripcodes = (el for el in document.getElementsByClassName('postertrip'))
console.dir tripcodes
timeEnd "tripcodes"


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

_replies = Array::slice.call document.getElementsByClassName('reply')

# constructor for post, from jquery element list, 'op?' flag, and parent thread
class Post 
	constructor: (threadnum,op,thread) -> 
		@id = ids.shift()
		
		el = if op then delform else _replies.shift()
		
		if emails[0]?.parentNode.parentNode is el
			@email = emails.shift().href
		
		@op = op
		@sage = @email and /^mailto:sage$/i.test @email
		
		@url = 
			if op then thread.url else thread.url+'#'+@id
		@time = if op then optimes.shift() else replytimes.shift()
		@title = 
			(if op then optitles.shift() else replytitles.shift()) or undefined
		
		if imageEls[0]?.parentNode is el
			imageEls.shift()
			@image = images.shift()
		
		@poster = if op then opnames.shift() else replynames.shift()
		
		@tripcode = # poster trips with emails are wrapped in the anchor, annoying
			if (if @email then tripcodes[0]?.parentNode.parentNode else tripcodes[0]?.parentNode) is el
				console.log "tripcode for #{@id}"
				tripcodes.shift().textContent
		# $.filter('.postertrip').text() or $.filter('.linkmail').find('.postertrip').text() or undefined
		# @capcode = # replies have two commentpostername spans
		#	$.filter('.commentpostername').eq( if op then 0 else 1).text() or undefined
		
		@comment = comments.shift()

		# non-enumerable circular references for rendering
		Object.defineProperty this, 'thread', value: thread, enumerable: false


_threads = []
_thread = 1
for el in delform.children
	break if el.tagName is "CENTER" # the ad at the end of the threads
	if el.tagName is "HR"
		_threads.push _thread
		_thread++
		continue
	el._threadnum = _thread

# constructor for post, from jquery element list and whether this is a full thread
class Thread 
	constructor: (threadnum) ->
		@id = ids[0] # don't shift, because op will
		time "parse thread #{@id}"
		
		@url = board.threadurl+@id
		
		@op = 
			new Post threadnum, true, this
		thread = this
		time "parse replies"
		@replies = 
			for el in document.getElementsByClassName 'reply' when el.parentNode.parentNode.parentNode._threadnum is threadnum
				new Post threadnum, false, thread
		timeEnd "parse replies"
		###
		@locked = 
			$.exists('img[alt="closed"]')
		@sticky = 
			$.exists('img[alt="sticky"]')
		###
		###
		if @preview = preview 
			omittedposts = $.filter('.omittedposts').text()
			@omittedReplies =
				parseInt(omittedposts.match(/\d+(?= posts?)/), 10) or 0
			@omittedImageReplies =
				parseInt(omittedposts.match(/\d+(?= image (?:replies|reply))/), 10) or 0
		###
		timeEnd "parse thread #{@id}"
		
	# non-enumerable circular reference for rendering
	Object.defineProperty Thread.prototype, 'board', value: board, enumerable: false
	
	

# parse entire board
parse4chan = ->
	###
	current = 0
	pages = if ( $pages = $('table.pages') ).exists()
		$('table.pages').find('a,b').map (i) -> 
			current = i if $(this).is 'b'
			return current: current is i, num: i
		.get()
	previous = if pages and current > 0 then current -1 else undefined
	next = if pages and current < (pages.length-1) then current + 1 else undefined
	###
	threads = thread = undefined
	if isThread
		thread = new Thread 1
	else
		# insert a <br> at the beginning of the first thread, to make separating them easier
		oldThreads = $('form[name="delform"]').prepend('<hr>').find('hr').get().slice(0,-2);
		threads = 
			for t, idx in oldThreads
				new Thread idx+1

	nav: document.getElementById('navtop').innerHTML
	banner: document.getElementsByTagName('img')[0].getAttribute 'src'
	
	# deletePassword: $('input[type="password"]').get(0).value # so we don't have to recheck the cookie
	board: board
	
	thread: thread
	threads: threads
	
	# pages: pages
	# previous: previous
	# next: next



data = parse4chan()

timeEnd("extract threads"); 

console.log _log.join("\n")
console.dir(data)