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
	