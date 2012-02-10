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
		.replace(/<font class="unkfunc">(<a[^q]+quotelink"[^>]*>&gt;&gt;\d+<\/a>[^<]*)<\/font>/g, "$1") # unwrap single quote links
		.replace(/<font class="unkfunc">/g, '<b class="greentext">') # unkfunc?
		.replace(/<\/font>/g, '</b>') # we can blindly select for this because only greentext is in here
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
# parse all names and capcodes (which share elements)
# ########################################################
time "names"
replynames = (el for el in document.getElementsByClassName('commentpostername'))
opnames = (el for el in document.getElementsByClassName('postername'))
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
# get list of reply elements for post to check
# ########################################################

_replies = Array::slice.call document.getElementsByClassName('reply')

# ########################################################
# label all elements by thread (faster than appending nodes)
# ########################################################
time "label elements"
_threads = []
_thread = 1
for el in delform.children
	break if el.tagName is "CENTER" # the ad at the end of the threads
	if el.tagName is "HR"
		_threads.push _thread
		_thread++
		continue
	el._threadnum = _thread
timeEnd "label elements"
# ########################################################
# pull out some more elements to check against
# ########################################################

# stickies are at the top
_stickies = document.querySelectorAll('img[alt="sticky"]').length
# we could probably assume locked threads are too, but we'll be safe
_closedThreads = Array::slice.call document.querySelectorAll('img[alt="closed"]')

_omittedposts = Array::slice.call document.getElementsByClassName('omittedposts')

# ########################################################
timeEnd "preprocess"



# constructor for post, from jquery element list, 'op?' flag, and parent thread
class Post 
	constructor: (threadnum,op,thread) -> 
		@id = ids.shift()
		
		el = _replies.shift() unless op
		
		if (op and emails[0]?.parentNode._threadnum is threadnum) or (not op and emails[0]?.parentNode.parentNode is el)
			@email = emails.shift().href
		
		@op = op
		@sage = @email and /^mailto:sage$/i.test @email
		
		@url = 
			if op then thread.url else thread.url+'#'+@id
		@time = if op then optimes.shift() else replytimes.shift()
		@title = 
			(if op then optitles.shift() else replytitles.shift()) or undefined
		
		if (op and imageEls[0]?._threadnum is threadnum) or (not op and imageEls[0]?.parentNode is el)
			imageEls.shift()
			@image = images.shift()
		
		@poster = (if op then opnames.shift() else replynames.shift()).textContent
		
		# poster trips with emails are wrapped in the anchor, annoying
		if (if @email then tripcodes[0]?.parentNode.parentNode else tripcodes[0]?.parentNode) is el
				@tripcode = tripcodes.shift().textContent
		
		# if the next replyname (.commentpostername) has ## in it, then it must be this post's capcode
		if /##/.test replynames[0]?.textContent
			@capcode = replynames.shift().textContent
		
		@comment = comments.shift()

		# non-enumerable circular references for rendering
		Object.defineProperty this, 'thread', value: thread, enumerable: false



# constructor for post, from jquery element list and whether this is a full thread
class Thread 
	constructor: (threadnum) ->
		@id = ids[0] # don't shift, because op will
		time "parse thread #{@id}"
		
		@url = board.threadurl+@id
		
		@op = 
			new Post threadnum, true, this
		thread = this
		@replies = 
			for el in document.getElementsByClassName 'reply' when el.parentNode.parentNode.parentNode._threadnum is threadnum
				new Post threadnum, false, thread
		
		if _closedThreads[0]?.parentNode._threadnum is threadnum
			_closedThreads.shift()
			@locked = true
		
		if _stickies > 0
			_stickies--
			@sticky = true
			
		if _omittedposts[0]?._threadnum is threadnum
			omitted = _omittedposts.shift().textContent
			@omittedReplies =
				parseInt(omitted.match(/\d+(?= posts?)/), 10) or 0
			@omittedImageReplies =
				parseInt(omitted.match(/\d+(?= image (?:replies|reply))/), 10) or 0
		timeEnd "parse thread #{@id}"
		
	# non-enumerable circular reference for rendering
	Object.defineProperty Thread.prototype, 'board', value: board, enumerable: false
	

# parse entire board
parse4chan = ->
	time "pages"
	unless isThread
		current = parseInt(document.location.pathname.split('/')?[2], 10) or 0
		pages = for i in [0..15] # let's assume they all have 15 pages
			{ num: i, current: current is i }
		next = if current < 15 then current + 1
		previous = if current > 0 then current - 1
		
	timeEnd "pages"
	threads = thread = undefined
	if isThread
		thread = new Thread 1
	else
		# insert a <br> at the beginning of the first thread, to make separating them easier
		threads = for i in _threads
				new Thread i

	nav: document.getElementById('navtop').innerHTML
	banner: document.getElementsByTagName('img')[0].getAttribute 'src'
	
	# deletePassword: $('input[type="password"]').get(0).value # so we don't have to recheck the cookie
	board: board
	
	thread: thread
	threads: threads
	
	pages: pages
	previous: previous
	next: next



data = parse4chan()

timeEnd("extract threads"); 

console.log _log.join("\n")
console.dir(data)