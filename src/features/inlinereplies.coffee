
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
	