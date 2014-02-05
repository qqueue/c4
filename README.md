# c4: a man, a plan, 4chan, Panama!

c4 is a Greasemonkey userscript for Firefox 26+ that transforms [4chan][] pages
in your web browser into a user interface that is a whole lot more usable.

Currently, development focus is on reader usability. Reading threads and
viewing images is far improved from the vanilla 4chan experience.

However, c4 currently doesn't offer much else, so if you're looking for a
similar but much more feature-complete and mature project, try [4chan
X][mayhem].

[gm]: https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/
[mayhem]: https://github.com/MayhemYDG/4chan-x
[4chan]: https://www.4chan.org

## What *will* c4 do?

Future development focus will be on board-level usability improvements.
The official 4chan catalog pages are step up from refreshing page 0,
but I still think there's a lot more that can be done. If you're
interested and/or have ideas about this, feel free to discuss them
on the [github issues tracker][tracker].

## Installation

While keeping in mind that c4 is still **alpha** software, you
can try out a recent compiled version at:

https://github.com/qqueue/c4/releases

Click on the green `c4.user.js` on the latest release to prompt for
installation.

You'll need [Firefox 26+][ff] and [Greasemonkey][gm] installed. Chrome(ium)
might work, but my current compatibility target is just Firefox, to keep
development overhead low.

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
