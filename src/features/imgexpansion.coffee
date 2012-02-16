$('#threads')
	.on 'click.html5chan.imgexpand', 'a.file', (e) ->
		unless e.altKey or e.ctrlKey
			if $(this).hasClass 'expanded'
				$(this)
					.find('img.full').remove().end()
					.find('img.thumb').show().end()
					.removeClass 'expanded'
				if (top = $(this).offset().top) < window.scrollY
					window.scrollTo window.scrollX, top
			else
				$(this)
					.find('img.thumb').hide().end()
					.append($('<img>', src: this.href, class: 'full'))
					.addClass('expanded')
				$('#imgpreview').remove()
			return false