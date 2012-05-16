# html5chan: an (incomplete) userscript

Too hipster to use 4chanX? Have a craving for the *bleeding edge*? Try out my 4chan userscript, and submit some bug reports! 

html5chan is alpha software; features and bugs will be added, changed, or removed without any notice. It probably works on Firefox >=11.

# [Install html5chan alpha](http://queue-.github.com/html5chan/html5chan@httpsgithubcomqueue-html5chan.user.js)

Be sure to to disable any other userscripts, like 4ChanX, when testing.

# Building from source (for development)

html5chan depends on [node.js](http://nodejs.org/), [coco](https://github.com/satyr/coco), [stylus](http://learnboost.github.com/stylus/), [nib](http://visionmedia.github.com/nib/) and [underscore](http://documentcloud.github.com/underscore/) for building. Make sure you have coco installed both globally (to use `coke`) and locally through npm.

Run `coke build` to build the script, or run `coke watch` to rebuild the script when something changes.
