# disable 4chan styles
$('link[rel*="stylesheet"], style').remove()
# disable 4chan's onload functions
# we can do this because onload has to wait
# for all the images, which obstensibly takes longer
# than it doest to load this script
window.onload = window.onunload = undefined


Date::prettyPrint = ( time, options ) ->
	pad = (number) ->
		str = number.toString()
		return if str.length < 2 then "0"+str else str; # pad to 2 digits
	
	return @getFullYear()+"-"+pad(@getMonth()+1)+"-"+pad(@getDate())+" "+pad(@getHours())+":"+pad(@getMinutes())

Post.render = Handlebars.template.post
Post.prototype.render = -> Post.render(this)
Handlebars.registerPartial('post',Post.render)

Thread.render = Handlebars.template.thread
Thread.prototype.render = -> Thread.render(this)
Handlebars.registerPartial('thread',Thread.render)

template = Handlebars.template.page
time "render"
document.body.removeAttribute 'vlink'
document.body.removeAttribute 'text'
document.body.removeAttribute 'link'
document.body.removeAttribute 'bgcolor'
document.body.id = board.name
document.body.className += if board.nsfw then ' nsfw' else ' sfw'
document.body.className += if data.thread then ' threadpage' else ' boardpage'
document.body.innerHTML = template(data)

style = document.createElement 'style'
style.textContent = '{{{css}}}'
document.head.appendChild style

# create or restore delete password 
do ->
	password = localStorage.getItem("html5chan-password") or Math.random().toString().substr(-8)
	document.getElementById('delpassword').value = password
	if field = document.getElementById 'password'
		field.value = password
		save = -> localStorage.setItem "html5chan-password", @value
		field.addEventListener 'input', save # allows saving of custom passwords
		document.getElementById('postform').addEventListener 'submit', save # also save to localStorage on submit

# create recaptcha with script already included on page (using 4chan's public key)
do ->
	script = document.createElement("script")
	script.textContent = """
		if( document.getElementById('captcha') ) {
			Recaptcha.create('6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc', 'captcha', {
					theme: 'clean',
					tabindex: 10,
				});
		}
	"""
	document.head.appendChild(script)

# rescroll to target element if this page hasn't been scrolled before
# this retains the browser's natural scroll position memory
# while still scrolling to the new hash target's position 
# the first time the page loads (or if window hasn't been scrolled
unless sessionStorage.getItem "html5chan" + document.URL 
	window.location.hash = window.location.hash
	do ->
		registerPage = -> # stupid coffeescript not having named function expressions
			sessionStorage.setItem "html5chan"+document.URL, true
			window.removeEventListener 'scroll', registerPage

		window.addEventListener 'scroll', registerPage
	
timeEnd "render"
