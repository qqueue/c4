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
    li: a(href="#{board.url}") 0
    - for (var i = 1; i <= 10; ++i)
      li: a(href=i)== i
    if board.page < 10
      li: a(href="#{board.page + 1}") next
    li: a(href="catalog") Catalog

span#updater
  span#update-status
  button#update-now Update now
