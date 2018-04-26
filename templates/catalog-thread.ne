a.catalog-link(href="//boards.4chan.org/#{board.name}/thread/#{@@no}",
               id="c#{@@no}")
  figure.catalog-thread
    if @imgurl
      img.catalog-thumb(src="//i.4cdn.org/#{board.name}/#{@imgurl}s.jpg", width="#{@tn_w}", height="#{@tn_h}")
    else
      img.catalog-thumb.deleted-image(src="//s.4cdn.org/image/filedeleted.gif")
    figcaption.catalog-caption
      .reply-count= "R: #{@r}, I: #{@i}"
      p.teaser
        if @sub
          span.subject= @sub
        = @teaser
