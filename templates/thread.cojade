~ post-template = require \./post

article(id="#{@id or 't' + @no}",
        data-no="#{@no}",
        class="thread#{if @sticky then ' sticky' else ''}#{if closed then ' closed' else ''}")
  = post-template @op, thread: locals, container: \div classes: \op
  .thread-info
    | #{(@omitted?replies or 0) + @replies.length} replies and #{(@omitted?imageReplies or 0) + @imageReplies.length} images.
    if board.is-board
      a.expand-link(href="#{@url}") Expand
  .replies
    for reply of @replies
      = post-template reply, thread: locals, container: \article classes: \reply
