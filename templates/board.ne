~ thread-template = require \./thread
~ header = require \./header

= header!

#threads
  for @threads
    = thread-template &

if board.isBoard
  ul#pages
    if board.page
      li: a(href="#{board.page - 1}") previous
    li: a(href="#{board.url}") 1
    - for (var i = 2; i <= 10; ++i)
      li: a(href=i)== i
    if board.page < 10
      li: a(href="#{board.page + 1}") next
    li: a(href="catalog") Catalog

unless board.thread?closed
  #postform-wrapper
    form#postform(enctype="multipart/form-data", method="POST", action="https://sys.4chan.org/#{board.name}/post")
      input(type="hidden", value="3145728", name="MAX_FILE_SIZE")
      if board.thread-no
        input(type="hidden", value="#{that}", name="resto")
      input(type="hidden", value="regist", name="mode")
      input(id="password", type="hidden", name="pwd", value="#{board.password}")
      #fields
        input(type="text", name="name", id="name", tabindex="10", placeholder="name\\\\#tripcode")
        input(type="text", id="options", name="email", tabindex="10", placeholder="options")
        input(type="text", id="subject", name="sub", tabindex="10", placeholder="subject")
        #comment-field
          textarea#comment(name="com", rows="4", tabindex="10", placeholder="comment")
        #captcha(style="display:none")
          a#recaptcha_image(href="javascript:Recaptcha.reload()", title="Click for new captcha")
          input#recaptcha_response_field(type="text", name="recaptcha_response_field", tabindex="10", placeholder="captcha")
        #file-field
          input#file(type="file", name="upfile", tabindex="10")
          label#spoiler-field
            input(type="checkbox", value="on", name="spoiler", tabindex="10")
            | Spoiler?
        #buttons
          button#post(type="submit", tabindex="10", value="Submit")
            | Post #{if board.isThread then 'Reply' else 'New Thread'}
          if board.is-thread
            button#sage(type="submit", name="email", value="sage", tabindex="10", id="sage") Sage Reply
          span#post-status
          progress#progress(max="100", value=0, hidden="")

#updater
  button#update-now Update now
  span#update-status
