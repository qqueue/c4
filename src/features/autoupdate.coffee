###
if( data.thread )
	# let's try some ajax
	refresh = ->
		$.get(document.URL)
			.success( (html,status,xhr) ->
				div = document.createElement 'div'
				div.innerHTML = html
				{thread: {replies}} = parse4chan div.querySelector 'form[name="delform"]'	
				for i in [0...data.thread.replies.length] # remove probably old posts
					replies.shift()
				console.dir replies
				$("#thread-#{data.thread.id}").append(
					(reply.render() for reply in replies).join('')
				)
				setTimeout(refresh, 30000)
			)
			.error( (data,status) ->
				alert(status)
			)
	setTimeout refresh, 30000

###