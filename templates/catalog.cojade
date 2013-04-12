~ catalog-thread = require \./catalog-thread
~ header = require \./header

= header!
#catalog-controls
  label
    input.order(type="radio", name="order", value="absdate")
    | Last Reply
  label
    input.order(type="radio", name="order", value="alt")
    | Bump Order
  label
    input.order(type="radio", name="order", value="r")
    | Reply Count
  label
    input.order(type="radio", name="order", value="date")
    | Creation Date
#catalog
  for @order[@@order]
    = catalog-thread @threads[&], no: &
