fs = require 'fs'
coffee = require 'coffee-script'
handlebars = require 'handlebars'
_ = require 'underscore'

read = (file) -> 
	fs.readFileSync file, "utf8"
read_and_escape = (file) ->
	read(file).replace /\s+/g, " "


outfile = "html5chan@httpsgithubcomqueue-html5chan.user.js"
parts =  ['utils', 'parser', 'renderer']
metadata = 'metadata.txt'
templates = ['page', 'thread', 'post']

task 'build', 'build userscript', (options) ->
	includes = 
		css: read_and_escape "hakase.css"
	try
		main = (read "src/#{file}.coffee" for file in parts).join("\n")
		features = (read("src/features/#{name}") for name in fs.readdirSync('src/features')).join("\n")
		code = coffee.compile [read('src/intro.coffee'), main, features, read('src/outro.coffee')].join("\n"), bare: true
		compiledTemplates = (for name in templates
			"Handlebars.template.#{name} = Handlebars.template(#{handlebars.precompile read("templates/"+name+".handlebars.html"), knownHelpersOnly: true})"
		).join("\n") + "\n"
		html5chan = 
			read(metadata) + compiledTemplates + code
		fs.writeFileSync outfile, handlebars.compile(html5chan)(includes)
		console.log "compiled script to #{outfile}"
	catch error
		# find out in which file the error occured
		for name in fs.readdirSync('src/features')
			try
				coffee.compile read("src/features/#{name}"), bare: true
			catch e
				console.error "Error compiling #{name}: "
				console.error e
		for name in parts
			try
				coffee.compile read("src/#{name}.coffee"), bare: true
			catch e
				console.error "Error compiling #{name}: "
				console.error e
		for name in ['intro', 'outro']
			try
				coffee.compile read("src/#{name}.coffee"), bare: true
			catch e
				console.error "Error compiling #{name}: "
				console.error e
		
				
task 'watch', 'watch for changes and rebuild automatically', (options) ->
	invoke "build"
	rebuild = _.debounce((event, filename) ->
		unless filename
			console.log "filename not given... exiting"
			return
		if event is "change" and filename isnt outfile
			console.log "change detected in #{filename}. rebuilding..."
			invoke "build"
	, 1000)
	fs.watch ".", interval: 1000, rebuild
	fs.watch "src/", interval: 1000, rebuild
	fs.watch "src/features", interval: 1000, rebuild
	fs.watch "templates/", interval: 1000, rebuild