# rainbow tripcodes
# because I can
do ->
	time "rainbow tripcodes"
	# from original yotsuba blue
	saturation = 36
	lightness = 89 
	color = (tripcode) -> # generate colored hash
		hue = (((c.charCodeAt(0) for c in tripcode).reduce((x,y) -> x + y)) * 3413 ) % 360
		hue += 180 if Math.abs(hue - 231) < 15 # avoid close colors to standard blue
		"hsl(#{hue}, #{saturation}%, #{lightness}%)"
	$('<style>', id: 'rainbowtripcodes').text(
		(for tripcode of Post.tripcodes
			".tripcoded.#{tripcode.replace(/[!+\/\.]/g,'\\$&')}:not(.op) { background-color: #{color(tripcode)}; }"
		).join("\n")
	).appendTo 'head'
	timeEnd "rainbow tripcodes"