# ########################################################
# general page info
# ########################################################
logoEl = document.getElementsByClassName('logo')[0]
centerEls = document.getElementsByTagName 'center'
board =
	name: document.title.match(/\/(\w+)\//)[1] # easiest way to get it 
	title: logoEl.children[2].children[0].children[0].textContent
	subtitle: logoEl.children[4]?.innerHTML
	nsfw: document.styleSheets[0].ownerNode.href is 'http://static.4chan.org/css/yotsuba.9.css' # the yellow theme
	nav: document.getElementById('navtop').innerHTML # I could hard code it, but then I'd miss updates
	banner: document.getElementsByTagName('img')[0].src
board.motd = centerEls[2].innerHTML if centerEls.length > 4 # the captcha, 2 ads, and footer tag are also in center tags
board.url = "http://boards.4chan.org/#{board.name}/"
board.threadurl = "#{board.url}res/"

# ########################################################
# our cool data structures
# ########################################################
class Post 
	constructor: (@id,@op,@thread,@time,@title,@poster,@comment,email) -> 
		@email = email?.substring(7) # strip mailto:
		@url = if op then thread.url else thread.url+'#'+@id
		@sage = /^sage$/i.test @email
		
		# backlinker
		if quotelinks = @comment.match /&gt;&gt;\d+/
			for link in quotelinks
				(Post.backlinks[link.substring(8)] ?= {})[@id] = true
	
	backlinks: ->
		html = ""
		if backlinks = Post.backlinks[@id]
			for post of backlinks
				html += "<a href=\"##{post}\" class=\"backlink quotelink\">&lt;&lt;#{post}</a> ";
		return html
	
	Post.backlinks = {} # using object as a hashset 
	
class Thread 
	constructor: (@id, @preview) ->
		@url = board.threadurl+@id
	# for rendering
	Thread::board = board

# ########################################################
# our wonderful date processor
# ########################################################
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
# comment cleaner
# ########################################################
cleanComment = (comment) ->
		comment
			.replace(/onmouseover="this\.style\.color='#FFF';" onmouseout="this\.style\.color=this\.style\.backgroundColor='#000'" style="color:#000;background:#000"/g, "") # annoying spoiler tags
			.replace(/onclick="replyhl\('\d+'\);"/g, "") # do not want
			.replace(/<font class="unkfunc">(<a[^q]+quotelink[^>]+>&gt;&gt;\d+<\/a>[^<]*)<\/font>/g, "$1") # unwrap single quote links
			.replace(/<font class="unkfunc">/g, '<b class="greentext">') # unkfunc?
			.replace(/<\/font>/g, '</b>') # we can blindly select for this because only greentext is in here
			.replace(/http:\/\/boards.4chan.org/g, "") # strips http://boards.4chan.org/ from cross-board links so they don't get linkified
			.replace(/"http:\/\/dis.4chan.org/g, "\"dis.4chan.org") # protect textboard links from linkification
			.replace(/https?:\/\/[\w\.\-_\/=&;?#%():~]+/g,'<a href="$&" target="_blank">$&</a>') # linkify other links
			.replace(/"dis.4chan.org/g, "\"http://dis.4chan.org") # add http: back to textboard links

# in the context of given element
parse4chan = (context) ->
	parsePost = (thread, op, data, testAttr, testObj) ->
		post = new Post(
			ids.shift(),
			op,
			thread,
			data.times.shift(),
			data.titles.shift(),
			data.posters.shift(),
			comments.shift(),
			emails.shift().href if emails[0]?.parentNode[testAttr] is testObj
		)
		# add to post
		if imageEls[0]?.parentNode[testAttr] is testObj
			imageEls.shift()
			post.image = images.shift()
		else
			if deletedImages[0]?[testAttr] is testObj
				deletedImages.shift()
				post.deletedImage = true 
		# tripcode gets wrapped in the email anchor if present
		if tripcodes[0] and (if post.email? then tripcodes[0].parentNode else tripcodes[0])[testAttr] is testObj
			post.tripcode = tripcodes.shift().textContent
			emails.shift() if emails[0]?[testAttr] is testObj # clear extra linkmail element
		# capcodes are hidden within reply posters, even for ops
		post.capcode = _reply.posters.shift() if /##/.test _reply.posters[0]
		
		return post 

	# ########################################################
	time "preprocess"
	# ########################################################
	if isThread = document.location.pathname.match /res\/(\d+)/ # also match for thread id
		threadId = isThread[1]
		threadPath = "/#{board.name}/res/"+threadId
		opHash = '#'+threadId
		
		# classify op and crossthread links
		time "classify links"
		for link in context.getElementsByClassName 'quotelink'
			unless />>>/.test link.textContent # skip crossboard links
				if opHash is link.hash
					link.className += ' oplink'
				else 
					if threadPath isnt link.pathname
						link.className += ' crossthread'
		timeEnd "classify links"
	else # board page
		omittedposts = Array::slice.call context.getElementsByClassName('omittedposts')
		
		# redo the board pages all nice
		current = parseInt(document.location.pathname.split('/')?[2], 10) or 0
		pages = for i in [0..15] # let's assume they all have 15 pages
			{ num: i, current: current is i }
		next = if current < 15 then current + 1
		previous = if current > 0 then current - 1
	
	time "label elements"
	numThreads = 0
	for el in context.children # our wonderful parent element
		break if el.tagName is "CENTER" # the ad at the end of the threads
		if el.tagName is "HR"
			numThreads++
			continue
		el.threadNum = numThreads # oh so horrible
	timeEnd "label elements"
	
	fileinfos = context.getElementsByClassName 'filesize'
	imageEls = Array::slice.call context.querySelectorAll('img[md5]')
	images = for thumb,i in imageEls
		dimensions = fileinfos[i].innerHTML.match /(\d+)x(\d+)/
		
		thumb:
			url: thumb.src
			width: thumb.width
			height: thumb.height
		
		url: thumb.parentNode.href
		
		width: parseInt dimensions[1], 10
		height: parseInt dimensions[2], 10
		
		size: thumb.alt.match(/[\d\.]+ [KM]?B/)[0]
		filename: fileinfos[i].innerHTML.match(/title="([^"]+)"/)?[1]
		md5: thumb.getAttribute 'md5'
		
		spoiler: /^Spoiler Image/.test thumb.alt
	
	ids = (el.name for el in context.querySelectorAll('input[value="delete"]'))
	emails = Array::slice.call context.getElementsByClassName('linkmail')
	tripcodes = Array::slice.call context.getElementsByClassName('postertrip')
	deletedImages = Array::slice.call context.querySelectorAll('img[alt="File deleted."]')
	time "clean comments"
	comments = (cleanComment el.innerHTML for el in context.getElementsByTagName 'blockquote')
	timeEnd "clean comments"
	_op = 
		times: (parse4ChanDate el.textContent for el in context.getElementsByClassName 'posttime')
		posters: (el.textContent for el in context.getElementsByClassName('postername'))
		titles: (el.textContent for el in context.getElementsByClassName('filetitle'))
	
	replyEls = context.getElementsByClassName('reply')
	
	_reply = 
		posters: (el.textContent for el in context.getElementsByClassName('commentpostername'))
		times: (parse4ChanDate el.textContent for el in replyEls) # no wrapper ;_;
		titles: (el.textContent for el in context.getElementsByClassName('replytitle'))
	# stickies are at the top, so we just need the number of them
	stickies = context.querySelectorAll('img[alt="sticky"]').length
	# we could probably assume locked threads are too, but we'll be safe
	closedThreads = Array::slice.call context.querySelectorAll('img[alt="closed"]')
	timeEnd "preprocess"
	
	# ########################################################
	time "create objects"
	# ########################################################
	threads = for i in [0...numThreads]
		thread = new Thread ids[0], !isThread
		thread.op = parsePost thread, true, _op, "threadNum", i
		thread.replies = (parsePost(thread,false,_reply,"parentNode", el) for el in replyEls when el.parentNode.parentNode.parentNode.threadNum is i) # walk to table from td
		if closedThreads[0]?.parentNode.threadNum is i
			closedThreads.shift()
			thread.locked = true
		if stickies > 0
			stickies--
			thread.sticky = true
		if !isThread and omittedposts[0]?.threadNum is i
			omitted = omittedposts.shift().textContent
			thread.omitted = {}
			thread.omitted.replies = parseInt(omitted.match(/\d+(?= posts?)/), 10) or 0
			thread.omitted.imageReplies = parseInt(omitted.match(/\d+(?= image (?:replies|reply))/), 10) or 0
			thread.omitted.shown = thread.replies.length # weird wording, i know, but for rendering
		
		thread # return thread to threads
	timeEnd "create objects"	
	# ########################################################
	# return 
	# ########################################################
	board: board
	
	isThread: !!isThread
	isBoard: !isThread
	threadId: threadId
	locked: if isThread then threads[0].locked
	
	thread: threads[0] if isThread
	threads: threads
	
	pages: pages
	previous: previous
	next: next

time "parse"
data = parse4chan document.querySelector('form[name="delform"]')
timeEnd "parse"