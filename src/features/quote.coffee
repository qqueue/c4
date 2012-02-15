$('#threads')
	.on('click.html5chan.quote', '.permalink .id', ->
		selection = window.getSelection().toString().trim()
		selection = '>'+selection+'\n' if(selection) 
		$('#comment')[0].value += '>>'+$(this).html()+'\n'+selection
		return false
	)
