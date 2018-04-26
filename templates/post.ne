~ {classes, humanized, thumb-url, image-url, permalink} = require(\src/parser).template-fns
~ enhancer = require \src/enhancer
~ {relative-date} = require \src/utils/relative-dates

#{@@container}(data-no="#{@no}",
               class="#{@@classes or ''} #{classes locals}",
               data-idx="#{@idx}",
               id="#{@@id or 'p' + @no}")
  h1.post-header
    a.subject(href="#{permalink(locals)}")= @sub
    span.name= @name

    span.tripcode= @trip
    span.capcode= @capcode
    span.posteruid= "(ID: #that)" if @id
    time(pubdate, datetime="#{new Date @time * 1000 .toISOString!}")
      = relative-date new Date @time * 1000
    a.permalink(href="#{permalink locals}") No.
      span.no= @no

  if @filename
    .fileinfo
      span.filename= "#{@filename}#{@ext}"
      if @w and @h
        span.dimensions= "#{@w}x#{@h}"
      span.size= humanized @fsize
      a.saucelink(href="http://iqdb.org/?url=http:#{image-url(locals)}",
        target="_blank") iqdb
      a.saucelink(href="https://www.google.com/searchbyimage?image_url=http:#{image-url(locals)}",
        target="_blank") google
      a.saucelink(href="http://regex.info/exif.cgi/exif.cgi?imgurl=http:#{image-url(locals)}",
        target="_blank") exif
      a.saucelink(href="http://archive.foolz.us/#{board.name}/search/image/#{encodeURIComponent @md5}",
        target="_blank") foolz
    a.file(target="_blank", href="#{image-url(locals)}", data-width="#{@w}", data-height="#{@h}")
      img.thumb(src="#{if @spoiler then board.spoiler-url else thumb-url(locals)}",
        width="#{if @spoiler then 100 else @tn_w}",
        height="#{if @spoiler then 100 else @tn_h}")
  else if @filedeleted
    img.deleted-image(alt="File deleted.", src="//s.4cdn.org/image/filedeleted.gif")

  div.comment= enhancer.enhance @com
  .backlinks
    for b of @backlinks
      a.backlink.quotelink(href="#{'#'}p#{b}")= "#{@@thread.post[b]idx}"
