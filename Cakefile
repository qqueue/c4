fs = require 'fs'
coffee = require 'coffee-script'
handlebars = require 'handlebars'

read = (file) -> 
	fs.readFileSync file, "utf8"
read_and_escape = (file) ->
	read(file).replace /\s+/g, " "

task 'build', 'build userscript', (options) ->
	includes = {
		css: read_and_escape "hakase.css"
		template: read_and_escape "template.handlebars.html"
		Thread: read_and_escape "thread.handlebars.html"
		Post: read_and_escape "post.handlebars.html"
	}
	html5chan = read "html5chan.js"
	fs.writeFile "html5chan@httpsgithubcomqueue-html5chan.user.js", handlebars.compile(html5chan)(includes)
	
