fs = require 'fs'
coffee = require 'coffee-script'
handlebars = require 'handlebars'

read = (file) -> 
	fs.readFileSync file, "utf8"
read_and_escape = (file) ->
	read(file).replace /\s+/g, " "


outfile = "html5chan@httpsgithubcomqueue-html5chan.user.js"

task 'build', 'build userscript', (options) ->
	includes = 
		css: read_and_escape "hakase.css"
		template: read_and_escape "template.handlebars.html"
		Thread: read_and_escape "thread.handlebars.html"
		Post: read_and_escape "post.handlebars.html"
	try	
		html5chan = coffee.compile read("html5chan.coffee"), bare: true
		fs.writeFileSync outfile, handlebars.compile(html5chan)(includes)
		console.log "compiled script to #{outfile}"
	catch error
		console.error "Error compiling script"
		console.error error
	
task 'watch', 'watch for changes and rebuild automatically', (options) ->
	fs.watch ".", interval: 1000, (event, filename) ->
		unless filename
			console.log "filename not given... exiting"
			return
		if event is "change" and filename isnt outfile
			console.log "event: #{event}"
			console.log "change detected in #{filename}. rebuilding..."
			invoke "build"