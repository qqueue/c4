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

