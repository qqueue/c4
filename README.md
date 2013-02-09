# html5chan: A brave new 4chan

html5chan aims to be the most seamless interface possible for participating
on 4chan. Currently, it is implemented as a Greasemonkey userscript for Firefox
18+.

While html5chan is currently a userscript, technology is only an
implementation detail. The html5chan github wiki has [more on the philosophy of
html5chan][0], if you're curious.

[0]: https://github.com/qqueue/html5chan/wiki/Philosophy

html5chan is public domain software. Read [UNLICENSE] for more information.

[UNLICENSE]: https://github.com/qqueue/html5chan/blob/master/UNLICENSE.md

## Compilation and installing from source

html5chan depends on [node.js], [coco], [stylus], and [nib] for
building. To automatically install the dependencies, run:

    sudo npm install

Root permissions are required, since stylus and coco want to install their
repective command line tools to `/bin`; annoying, I know. You'll also want to run

    sudo npm install -g coco

To give you command-line access to `coke`, the build tool used by html5chan.

Once you've got the deps, run `coke build` to build the script. Then open the
script (or drag the file from your file manager) into Firefox with Greasemonkey
installed. You should be prompted with an installation dialog.

[node.js]: http://nodejs.org/
[coco]: https://github.com/satyr/coco
[stylus]: http://learnboost.github.com/stylus/
[nib]: http://visionmedia.github.com/nib/

## Development

Run `coke watch` to rebuild the script when something changes. Then, make
a symbolic link from the compiled script in the repo to the copy in
Greasmonkey's folder inside your Firefox profile:

    ln -sf $PWD/html5chan.user.js \
           ~/.mozilla/firefox/<profile dir>/gm_scripts/html5chan/html5chan.user.js

Then, you should get instant feedback (after refresh) when making changes,
which isn't the perfect developer feedback loop, but it's pretty close.

