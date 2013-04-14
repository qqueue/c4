# c4: A brave new 4chan

c4, formerly `html5chan`, aims to be the most seamless interface possible for
participating on 4chan. Currently, it is implemented as a Greasemonkey
userscript for Firefox 18+.

While c4 is currently a userscript, technology is only an
implementation detail. The c4 github wiki has [more on the philosophy of
c4][0], if you're curious.

[0]: https://github.com/qqueue/c4/wiki/Philosophy

c4 is public domain software. Read [UNLICENSE] for more information.

[UNLICENSE]: https://github.com/qqueue/c4/blob/master/UNLICENSE.md

## Installation

c4 is written in [coco] and [stylus] \(+ [nib]\), and must be compiled
before it can be loaded by Greasemonkey. To compile c4, install
[node.js], then clone or download the [github repository] and run

    npm install
    npm run-script build

To build the script to `c4.user.js`.

Open the compiiled script (or drag the file from your file manager) into
Firefox with Greasemonkey installed. You should then be prompted with an
installation dialog.

[node.js]: http://nodejs.org/
[coco]: https://github.com/satyr/coco
[stylus]: http://learnboost.github.com/stylus/
[nib]: http://visionmedia.github.com/nib/
[github repository]: https://github.com/qqueue/c4

## Hacking

Development is coordinated through [c4's github repository][0].

[0]: https://github.com/qqueue/c4

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

