# 0.3.1: Inter Mutanda Constantia

- Adapt to new HTML/URL changes
- Lazy-load captcha on posting, like vanilla 4chan.
- Handle unclutter's weird behavior with tooltip-style image hover.
  - If you don't use unclutter to hide your mouse pointer, this
    doesn't affect you.

# 0.3: A Bene Placito

- Fix pages not updating after refresh sometimes
- Fix thumbnails on /3/
- Handle WebM hover/expansion if that ever becomes a thing.
- Correctly classify mistyped captcha errors, and stop
  removal of post text for other failures (duplicate file, etc)

# 0.2: Ex Post Facto

- Reworked post date display to be very close to twitter e.g. '1h', '23m'
  instead of the verbose '23 minutes ago'. As a bonus, there's now room for a
  StackOverflow-style absolute date, making c4 much more screencappable.
- Fixed some long-standing javascript errors in the console.
- Reverted removal of posting functionality, and fixed the resto post
  parameter.

# 0.1: Reductio Ad Absurdum

- Fixed breaking changes to 4chan's HTML.
- Removed lesser-tested features to focus development effort of reader-facing
  UI.
