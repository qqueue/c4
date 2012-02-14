# ########################################################
# general page info
# ########################################################
logoEl = document.getElementsByClassName('logo')[0]
centerEls = document.getElementsByTagName 'center'
board =
	name: document.title.match(/\/(\w+)\//)[1] # easiest way to get it 
	title: logoEl.children[2].children[0].children[0].textContent
	subtitle: logoEl.children[4].innerHTML
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

# in the context of given document
parse4chan = (document) ->
	
	delform = document.forms[1] # our wonderful parent element
	
	# ########################################################
	# these elements are mercifully the same in thread and board mode
	# ########################################################

	fileinfos = document.getElementsByClassName 'filesize'
	imageEls = Array::slice.call document.querySelectorAll('img[md5]')
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
	
	emails = Array::slice.call document.getElementsByClassName('linkmail')
	tripcodes = Array::slice.call document.getElementsByClassName('postertrip')
	deletedImages = Array::slice.call document.querySelectorAll('img[alt="File deleted."]')
	
	replyEls = document.getElementsByClassName('reply')
	
	replyPosters = (el.textContent for el in document.getElementsByClassName('commentpostername'))
	replyTimes = (parse4ChanDate el.textContent for el in document.getElementsByClassName 'reply')
	replyTitles = (el.textContent for el in document.getElementsByClassName('replytitle'))
	
	# stickies are at the top, so we just need the number of them
	stickies = document.querySelectorAll('img[alt="sticky"]').length
	# we could probably assume locked threads are too, but we'll be safe
	closedThreads = Array::slice.call document.querySelectorAll('img[alt="closed"]')
	
	# ########################################################
	# parse all comments
	# ########################################################
	parseComment = (comment) ->
		comment
			.replace(/onmouseover="this\.style\.color='#FFF';" onmouseout="this\.style\.color=this\.style\.backgroundColor='#000'" style="color:#000;background:#000"/g, "") # annoying spoiler tags
			.replace(/onclick="replyhl\('\d+'\);"/g, "") # do not want
			.replace(/<font class="unkfunc">(<a[^q]+quotelink[^>]+>&gt;&gt;\d+<\/a>[^<]*)<\/font>/g, "$1") # unwrap single quote links
			.replace(/<font class="unkfunc">/g, '<b class="greentext">') # unkfunc?
			.replace(/<\/font>/g, '</b>') # we can blindly select for this because only greentext is in here
			.replace(/http:\/\/boards.4chan.org/g, "") # strips http://boards.4chan.org/ from cross-board links so they don't get linkified
			.replace(/https?:\/\/[\w\.\-_\/=&;?#%]+/g,'<a href="$&" target="_blank">$&</a>') # linkify other links
	
	
	# ########################################################
	# parses a single reply, same in board and thread pages
	# ########################################################
	parseReply = (el) ->
		post = new Post(
			ids.shift(),
			false,
			thread,
			replyTimes.shift(),
			replyTitles.shift(),
			replyPosters.shift(),
			comments.shift(),
			emails.shift().href if emails[0]?.parentNode.parentNode is el
		)
		# add to post
		if imageEls[0]?.parentNode.parentNode is el
			imageEls.shift()
			post.image = images.shift()
		else
			if deletedImages[0]?.parentNode is el
				deletedImages.shift()
				post.deletedImage = true 
		# tripcode gets wrapped in the email anchor if present
		post.tripcode = tripcodes.shift().textContent if tripcodes[0] and (if post.email? then tripcodes[0].parentNode else tripcodes[0]).parentNode is el
		# capcodes are hidden within replyPosters
		post.capcode = replyPosters.shift().textContent if /##/.test replyPosters[0]?.textContent
		
		post # return post to replies
	
	
	# ########################################################
	if isThread = document.location.pathname.match /res\/(\d+)/
	# ########################################################
		threadId = isThread[1]
		threadPath = "/#{board.name}/res/"+threadId
		opHash = '#'+threadId

		# classify op and crossthread links
		for link in document.getElementsByClassName 'quotelink'
			if opHash is link.hash
				link.className += ' oplink'
			else 
				if threadPath isnt link.pathname
					link.className += ' crossthread'
		
		# this needs to happen after the op and crossthread link identification
		comments = (parseComment el.innerHTML for el in document.getElementsByTagName 'blockquote')

		ids = (el.name for el in delform.querySelectorAll 'form > a[name]' when el.hasAttribute 'name' )

		thread = new Thread ids[0], false
		thread.op = new Post(
			ids.shift(),
			true,
			thread,
			parse4ChanDate(document.getElementsByClassName('posttime')[0].textContent),
			document.getElementsByClassName('filetitle')[0].textContent,
			document.getElementsByClassName('postername')[0].textContent,
			comments.shift(),
			emails.shift().href if emails[0]?.parentNode is delform
		)
		# add to op
		if imageEls[0]?.parentNode.parentNode  is delform
			imageEls.shift()
			thread.op.image = images.shift()
		else
			if deletedImages[0]?.parentNode is delform
				deletedImages.shift()
				thread.op.deletedImage = true 
		# tripcode gets wrapped in the email anchor if present
		thread.op.tripcode = tripcodes.shift().textContent if tripcodes[0] and (if thread.op.email? then tripcodes[0].parentNode else tripcodes[0]).parentNode is delform
		# capcodes are hidden within replyPosters
		thread.op.capcode = replyPosters.shift().textContent if /##/.test replyPosters[0]?.textContent
		
		thread.replies = (parseReply el for el in replyEls)
			
	# ########################################################
	else # board page
	# ########################################################
		# So, general strategy here
		#
		# 1. in one pass, label all direct child elements of
		# delform (the overall thread container) with a number of
		# the thread they're in. (label being adding the attribute
		# _threadnum to all of them. oh javascript you so easy)
		#
		# 2. for the elements that exist in every post,
		# we pull parse them in one loop using the ultra-fast
		# getElementsByClassName selector
		#
		# 3. for the elements that don't, we'll pull out just the
		# elements themselves into a shift()able array
		# inside the post parser, the post will check the first
		# element of the respective array, and if it's parent was
		# either labeled to the thread (for op)
		# or is the current reply element (for replies)
		# then it's popped (shifted) from the beginning of the list
		# so the next post processed will look at the next element
		numThreads = 0
		for el in delform.children
			break if el.tagName is "CENTER" # the ad at the end of the threads
			if el.tagName is "HR"
				numThreads++
				continue
			el.threadNum = numThreads # oh so horrible
		
		# this is the same as in thread mode, but without op and crossboard labeling
		comments = (parseComment el.innerHTML for el in document.getElementsByTagName 'blockquote')
		
		# first named anchor is 0 for board pages ;_;
		ids = for el in document.querySelectorAll('form[name="delform"] > a[name], form[name="delform"] > input[value="delete"]') # selects in document order which is useful
			id = el.getAttribute 'name'
			if id is "0" then continue else id # skip those pesky 0 names

		opTimes = (parse4ChanDate el.textContent for el in document.getElementsByClassName 'posttime')
		opPosters = (el.textContent for el in document.getElementsByClassName('postername'))
		opTitles = (el.textContent for el in document.getElementsByClassName('filetitle'))

		omittedposts = Array::slice.call document.getElementsByClassName('omittedposts')

		threads = for i in [0...numThreads]
			thread = new Thread ids[0], true
			thread.op = new Post(
				ids.shift(),
				true,
				thread,
				opTimes.shift(),
				opTitles.shift(),
				opPosters.shift(),
				comments.shift(),
				emails.shift().href if emails[0]?.parentNode.threadNum is i
			)
			# add to op
			if imageEls[0]?.parentNode.threadNum is i
				imageEls.shift()
				thread.op.image = images.shift()
			else
				if deletedImages[0]?.threadNum is i
					deletedImages.shift()
					thread.op.deletedImage = true 
			# tripcode gets wrapped in the email anchor if present
			thread.op.tripcode = tripcodes.shift().textContent if tripcodes[0] and (if thread.op.email? then tripcodes[0].parentNode else tripcodes[0]).threadNum is i
			# capcodes are hidden within replyPosters
			thread.op.capcode = replyPosters.shift().textContent if /##/.test replyPosters[0]?.textContent
			
			thread.replies = (parseReply el for el in replyEls when el.parentNode.parentNode.parentNode.threadNum is i) # walk to table from td
			if closedThreads[0]?.parentNode.threadNum is i
				closedThreads.shift()
				thread.locked = true
			if stickies > 0
				stickies--
				thread.sticky = true
			if omittedposts[0]?.threadNum is i
				omitted = omittedposts.shift().textContent
				thread.omittedReplies = parseInt(omitted.match(/\d+(?= posts?)/), 10) or 0
				thread.omittedImageReplies = parseInt(omitted.match(/\d+(?= image (?:replies|reply))/), 10) or 0
		  
			thread # return thread to threads
			
		# redo the board pages all nice
		current = parseInt(document.location.pathname.split('/')?[2], 10) or 0
		pages = for i in [0..15] # let's assume they all have 15 pages
			{ num: i, current: current is i }
		next = if current < 15 then current + 1
		previous = if current > 0 then current - 1
			
	# return 
	board: board
	
	thread: thread if isThread
	threads: threads
	
	pages: pages
	previous: previous
	next: next

time "parse"
data = parse4chan document
timeEnd "parse"