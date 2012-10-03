# html5chan: Perpetually Alpha for the Perpetually Alpha

`html5chan` is an excessively modern 4chan userscript, built from the ground up
to make your 4chan browsing experience as hipster as possible. It's got some
features you'll love, some you'll never need, and plenty of missing features
you'd actually want.

`html5chan` is developed primarily on Firefox with Greasemonkey 1+, but it
likely works on Chrome too. I don't really care about Opera, but hey, it's just
javascript, right? Try it out and see.

# Development Stages

* (Current) on the whimsy of queue's personal use and tastes
* (2013??) Magical, revolutionary reading experience
* (20XX) Amazing posting experience
* (NaN) stable releases

# Building From Source

I'm too pure to put the compiled .js into the repository, so you'll have to man
up and compile the bitch if you really want to use it. It keeps out the
riff-raff.

html5chan depends on [node.js](http://nodejs.org/),
[coco](https://github.com/satyr/coco),
[stylus](http://learnboost.github.com/stylus/), and
[nib](http://visionmedia.github.com/nib/) and for building. Make sure you have
coco installed both globally (to use `coke`) and locally through npm.

Run `coke build` to build the script, or run `coke watch` to rebuild the script
when something changes.

I usually make a symbolic link from the copy in the repo to the copy in
Greasmonkey's folder inside my Firefox profile, so I get instant feedback
(after an F5) for changes. It's pretty chill.
