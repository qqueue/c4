# rainbow tripcodes
# because I can
do ->
	time "rainbow tripcodes"
	# from original yotsuba blue
	saturation = 46
	lightness = 89 
	color = (tripcode) -> # generate colored hash
		hue = parseInt((c.charCodeAt(0) for c in tripcode).join(''),10) % 360
		"hsl(#{hue}, #{saturation}%, #{lightness}%)"
	console.dir Post.tripcodes
	$('<style>', id: 'rainbowtripcodes').text(
		(for tripcode of Post.tripcodes
			".tripcoded.#{tripcode.replace(/[!+\/\.]/g,'\\$&')} { background-color: #{color(tripcode)}; }"
		).join("\n")
	).appendTo 'head'
	timeEnd "rainbow tripcodes"