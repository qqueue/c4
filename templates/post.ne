:prelude
  classes = ->
    c = 'post '
    c += 'imagepost ' if it.image
    c += 'sage '      if it.sage
    c += 'tripcoded ' if it.tripcode
    if it.capcode
      c += if it.capcode is '## Admin'
        'admin '
      else 'mod '
    c += 'uid ' if it.uid
    c

~ enhancer = require \src/enhancer
~ {relative-date} = require \src/utils/relative-dates

#{@@container}(data-no="#{@no}",
               class="#{@@classes or ''} #{classes locals}",
               data-idx="#{@idx}",
               id="#{@@id or 'p' + @no}")
  h1.post-header
    a.subject(href="#{@url}")= @subject
    if @email
      a.name(href="#{'mailto:'+@email}")= @name
    else
      a.name= @name

    span.tripcode= @tripcode
    span.capcode= @capcode
    span.posteruid= "(ID: #that)" if @uid
    time(pubdate, datetime="#{@time.toISOString!}", title="#{@time}")
      = relative-date @time
    a.permalink(href="#{@url}") No.
      span.no= @no

  if @image
    .fileinfo
      span.filename= @image.filename
      span.dimensions= "#{@image.width}x#{@image.height}"
      span.size= @image.size
      a.saucelink(href="http://iqdb.org/?url=http:#{@image.url}",
        target="_blank") iqdb
      a.saucelink(href="http://google.com/searchbyimage?image_url=http:#{@image.url}",
        target="_blank") google
      a.saucelink(href="http://regex.info/exif.cgi/exif.cgi?imgurl=http:#{@image.url}",
        target="_blank") exif
      a.saucelink(href="http://archive.foolz.us/#{board.name}/search/image/#{encodeURIComponent @image.md5}",
        target="_blank") foolz
    a.file(target="_blank", href="#{@image.url}", data-width="#{@image.width}", data-height="#{@image.height}")
      img.thumb(src="#{if @image.spoiler then board.spoiler-url else @image.thumb.url}",
        width="#{unless @image.spoiler then @image.thumb.width else ''}",
        height="#{unless @image.spoiler then @image.thumb.height else ''}")
  else if @deletedImage
    img.deleted-image(alt="File deleted.", src="//s.4cdn.org/image/filedeleted.gif")

  div.comment= enhancer.enhance @comment
  .backlinks
    for b of @backlinks
      a.backlink.quotelink(href="#{'#'}p#{b}")= "#{@@thread.post[b]idx}"
