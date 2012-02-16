# image hover previews
$('#threads')
	.on('mouseenter.html5chan.imgpreview', 'a.file:not(.expanded)', (e) ->
		$('<img>',{
			id: 'imgpreview'
			src: this.href
			alt: "Loading..."}
		).load(->
			$(this).attr(alt: this.href)
		).error(->
			$(this).attr alt: "Unable to load image."
		)
		.constrainY({
			left: e.pageX+10
			top: e.pageY+10
			height: $(this).data('height')*Math.min(($(window).width() - e.pageX - 20)/$(this).data('width'),1)
		}, 10).css({
			maxHeight: $(window).height() - 20
			maxWidth: $(window).width() - e.pageX - 20
		})
		.appendTo('body')
	)
	.on('mousemove.html5chan.imgpreview', 'a.file:not(.expanded)', (e) ->
		$('#imgpreview').constrainY({
			left: e.pageX+10
			top: e.pageY+10
			height: $(this).data('height')*Math.min(($(window).width() - e.pageX - 20)/$(this).data('width'),1)
		}, 10).css({
			maxWidth: $(document).width() - e.pageX - 20
		});
	)
	.on('mouseleave.html5chan.imgpreview', 'a.file:not(.expanded)', (e) ->
		$('#imgpreview').remove();
	)