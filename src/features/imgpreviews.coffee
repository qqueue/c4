# image hover previews
$('#threads')
	.on('mouseenter.html5chan.imgpreview', 'a.file:not(.expanded)', (e) ->
		$('<img>', id: 'imgpreview', src: this.href, alt: "Loading...")
			.load(->
				$(this)
					.removeAttr('alt')
					.css(opacity: '1')
			)
			.error(-> $(this).attr alt: "Unable to load image.")
			.constrainY(left: e.pageX+10, top: e.pageY+10, 10)
			.css(
				maxWidth: $(document).width() - e.pageX - 20
				opacity: '.7'
			)
			.appendTo 'body'
	)
	.on('mousemove.html5chan.imgpreview', 'a.file:not(.expanded)', (e) ->
		$('#imgpreview')
			.constrainY(left: e.pageX+10, top: e.pageY+10, 10)
			.css(maxWidth: $(document).width() - e.pageX - 20)
	)
	.on('mouseleave.html5chan.imgpreview', 'a.file:not(.expanded)', (e) ->
		$('#imgpreview').remove();
	)