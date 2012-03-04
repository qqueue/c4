"use strict"
log = do ->
	beginning = Date.now()
	messages = "[t-0]: html5chan"
	log = (message) -> messages += "\n[t+#{Date.now() - beginning}] #{message}"
	log.all = -> messages
	return log

{time, timeEnd} = do ->
	times = {}
	time: (name) ->
		times[name] = Date.now()
		log "#{name} [start]"
	timeEnd: (name) ->
		log "#{name} [end: #{Date.now() - times[name]}ms]"
