
$.fn.extend
	immediateText: -> 
		@parent().clone().children().remove().end().text()
	
	exists: (selector) -> 
		( if selector then @find selector else this ).length > 0
	
	changeTo: (replacement, options) -> 
		@replaceWith ->
			$(replacement,options).html($(this).html())

	constrainY: ({left, top, height}, margin = 0) ->
		height ?= @height() 
		bottom = top + height
		screentop = $(window).scrollTop()
		screenbottom = screentop + $(window).height()
		
		if bottom > screenbottom
			top = screenbottom - margin - height
			
		if top < screentop
			top = screentop + margin
			
		@css
			left: left
			top: top
			position: "absolute"
			
	beforeAndScroll: (content) ->
		before = @offset()
		@before content
		after = @offset()
		window.scrollBy after.left - before.left, after.top - before.top 
		return this
		
	removeAndScroll: (relativeTo) ->
		before = relativeTo.offset()
		@remove()
		after = relativeTo.offset()
		# unless the scrollbar is already at the bottom (which autocorrects position)
		unless window.scrollY is window.scrollMaxY
			window.scrollBy after.left - before.left, after.top - before.top
		return this

_log = []
log = (message) -> _log.push message
_times = {}
time = (name) ->
	_times[name] = Date.now()
timeEnd = (name) ->
	log "#{name}: #{Date.now() - _times[name]}ms"
		
# Assuming DST in may
DSTOffset = (new Date().getTimezoneOffset() - new Date((new Date()).setMonth(6)).getTimezoneOffset())/60