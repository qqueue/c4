a.catalog-link(href="//boards.4chan.org/#{board.name}/res/#{@@no}")
  figure.catalog-thread
    if @imgurl
      img.catalog-thumb(src="//thumbs.4chan.org/#{board.name}/thumb/#{@imgurl}s.jpg")
    else
      img.catalog-thumb.deleted-image(src="//static.4chan.org/image/filedeleted.gif")
    figcaption.catalog-caption
      .reply-count= "R: #{@r}, I: #{@i}"
      p.teaser= @teaser
