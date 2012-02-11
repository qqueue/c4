# disable 4chan styles
$('link[rel*="stylesheet"], style').remove()
# disable 4chan's onload functions
# we can do this because onload has to wait
# for all the images, which obstensibly takes longer
# than it doest to load this script
window.onload = window.onunload = undefined


Handlebars.registerHelper 'datetime', ( time, options ) ->
	pad = (number) ->
		str = number.toString()
		return if str.length < 2 then "0"+str else str; # pad to 2 digits
	
	date = new Date(time)
	return date.getFullYear()+"-"+pad(date.getMonth()+1)+"-"+pad(date.getDate())+" "+pad(date.getHours())+":"+pad(date.getMinutes())

Handlebars.registerHelper 'ISOString', (time) ->
	return new Date(time).toISOString()

time "compile handlebars"
Post.render = Handlebars.compile('{{{Post}}}')
Post.prototype.render = -> Post.render(this)
Handlebars.registerPartial('post',Post.render)

Thread.render = Handlebars.compile('{{{Thread}}}')
Thread.prototype.render = -> Thread.render(this)
Handlebars.registerPartial('thread',Thread.render)

template = Handlebars.compile('{{{template}}}')
timeEnd "compile handlebars"
time "render"
$('body')
	.removeAttr('vlink text link bgcolor')
	.attr({id: data.board.name})
	.addClass( if data.board.nsfw then 'nsfw' else 'sfw')
	.addClass( if data.thread then 'threadpage' else 'boardpage')
	.html(template(data))

$('<style>').html('{{{css}}}').appendTo('head')

# create recaptcha with script already included on page (using 4chan's public key)
script = document.createElement("script")
script.textContent = "("+( ->
	Recaptcha.create("6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc", "captcha", {
		theme: "clean"
		tabindex: 10
	})
).toString()+")()"
document.body.appendChild(script)

# rescroll to target element if this page hasn't been loaded before
# this retains the browser's natural scroll position memory
# while still scrolling to the new hash target's position 
# the first time the page loads
if ( !sessionStorage.getItem("html5chan-"+document.URL) )
	window.location.hash = window.location.hash
	sessionStorage.setItem("html5chan-"+document.URL, true)

timeEnd "render"
console.log _log.join("\n")
console.dir(data)
