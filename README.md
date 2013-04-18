# c4: A brave new 4chan

c4 (formerly html5chan) is a Greasemonkey userscript for Firefox 20+ that
aims to be the most seamless 4chan interface possible.

**c4 is currently in heavy development, so features and bugs will appear
and disappear without notice. Watch the [Github repository][repo] and
the [TODO list][] for updates.**

[TODO list]: https://github.com/qqueue/c4/wiki/TODO

## What does c4 do?

c4 breaks down technological barriers to participating
in the [4chan online community][4chan]. The c4 github wiki has
[more on the philosophy of c4][1], if you're curious.

Practically, c4 transforms 4chan pages in your web browser
into a user interface that is a whole lot more usable,
using [Greasemonkey][gm], javascript, and other web technologies.

A similar, much more mature project is [4chan X][mayhem]. If you want
a better 4chan user interface _today_, I recommend it.

[gm]: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
[mayhem]: https://github.com/MayhemYDG/4chan-x
[4chan]: https://www.4chan.org
[1]: https://github.com/qqueue/c4/wiki/Philosophy

## Will c4 be any good?

Yes.

## Installation

While keeping in mind that c4 is still **alpha** software, you
can try out the latest compiled version at:

http://qqueue.github.io/c4/c4.user.js

You'll need [Firefox 20+][ff] and [Greasemonkey][gm] installed.
Please don't use Scriptish, it's deprecated. Chrome/Chromium users
hang tight, support is coming soon.

Please [report issues][tracker] if/when you come across them.

[ff]: http://www.mozilla.org/en-US/firefox/fx/#desktop
[tracker]: https://github.com/qqueue/c4/issues

## Hacking

Development is coordinated through [c4's github repository][repo].

c4 is written in [coco], [nephrite], and [stylus] \(+ [nib]\).
To compile c4, install [node.js], then clone or download the
[repository][repo] and run:

    npm install
    npm run-script build

to build the script to `c4.user.js`.

[node.js]: http://nodejs.org/
[coco]: https://github.com/satyr/coco
[nephrite]: https://github.com/nami-doc/nephrite
[stylus]: http://learnboost.github.com/stylus/
[nib]: http://visionmedia.github.com/nib/
[repo]: https://github.com/qqueue/c4

c4 is written in CommonJS module format, which is compiled into a single
userscript file with [commonjs-everywhere] \(+[esprima] +[escodegen]\). The
build process is coordinated through the `coke` buildtool that comes with coco.
Check out the `Cokefile` for details.

[commonjs-everywhere]: https://github.com/michaelficarra/commonjs-everywhere
[esprima]: https://github.com/constellation/esprima
[escodegen]: https://github.com/Constellation/escodegen

### Live Coding

Run `npm run-script watch` to rebuild the script when something changes. Then,
make a symbolic link from the compiled script in the repo to the copy in
Greasmonkey's folder inside your Firefox profile:

    ln -sf $PWD/c4.user.js \
           ~/.mozilla/firefox/<profile dir>/gm_scripts/c4/c4.user.js

Then, you should get instant feedback (after refresh) when making changes,
which isn't the perfect developer feedback loop, but it's pretty close.

## License

c4 is public domain software. Read [UNLICENSE] for more information.

[UNLICENSE]: https://github.com/qqueue/c4/blob/master/UNLICENSE.md
