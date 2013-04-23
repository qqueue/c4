~ catalog-thread = require \./catalog-thread
~ header = require \./header

= header!
#catalog-controls
  label
    input#absdate.order(type="radio", name="order", value="absdate")
    | Last Reply
  label
    input#alt.order(type="radio", name="order", value="alt")
    | Bump Order
  label
    input#r.order(type="radio", name="order", value="r")
    | Reply Count
  label
    input#date.order(type="radio", name="order", value="date")
    | Creation Date
#catalog
  for @order[@@order]
    = catalog-thread @threads[&], no: &
