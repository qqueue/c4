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
	