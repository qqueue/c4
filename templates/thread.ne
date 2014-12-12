:prelude
  thread-url = (thread) ->
    "//boards.4chan.org/#{board.name}/thread/#{thread.op.no}"
~ post-template = require \./post

article(id="#{@id or 't' + @op.no}",
        data-no="#{@op.no}",
        class="thread#{if @op.sticky then ' sticky' else ''}#{if @op.closed then ' closed' else ''}")
  = post-template @op, thread: locals, container: \div classes: \op
  .thread-info
    | #{(@op.omitted_posts or 0) + @replies.length} replies and #{(@op.omitted_images or 0) + @imageReplies.length} images.
    if board.is-board
      a.expand-link(href="#{thread-url locals}") Expand
  .replies
    for reply of @replies
      = post-template reply, thread: locals, container: \article classes: \reply
