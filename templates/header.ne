nav#toplinks.boardlinks= board.nav
header#header
  a#banner(href="//boards.4chan.org/#{board.name}/")
    img(src="#{board.banner}", alt="4chan::")
  hgroup
    h1#board-name: a(href="//boards.4chan.org/#{board.name}/")= board.title
    h2#board-subtitle= board.subtitle

if board.message
  #message-container
    button#hide-message(type="button") Hide News
    #message= that
