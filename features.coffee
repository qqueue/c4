

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
	$('.post').not('.inline').each( ->
		quoter = this
		$(quoter).find('.comment a.quotelink').not('.inline a.quotelink').each ->
			if( (quoted = $(this.hash)).exists() ) # relative postlink
				quoted = $(this.hash)
				backlinks = quoted.data('backlinks') or quoted.data('backlinks',{}).data('backlinks')
				unless backlinks[quoter.id]
					backlinks[quoter.id] = true
	# render all the backlinks (faster this way)
	).each ->
		backlinks = $(this).data('backlinks');
		html = ""
		for post of backlinks
			html += "<a href=\"##{post}\" class=\"backlink quotelink\">&gt;&gt;#{post}</a> ";
		$(this).children('.backlinks').html(html);

setTimeout backlink, 0 # deferred, so the page at least appears to load faster


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
###
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
###

console.log _log.join("\n")
console.dir(data)
