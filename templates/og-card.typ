// OG card 1200x630 px: compile with --format png --ppi 72 --input title="..."
#let title = sys.inputs.at("title", default: "SeveTech")
#set page(width: 1200pt, height: 630pt, margin: 80pt, fill: rgb("#f4efe3"))
#set text(font: ("Georgia", "Libertinus Serif"), fill: rgb("#2b2620"))
#set par(leading: 0.55em)

#rect(width: 120pt, height: 8pt, fill: rgb("#EF9F27"), stroke: none)
#v(1fr)
#let size = if title.len() > 100 { 44pt } else if title.len() > 70 { 54pt } else { 66pt }
#text(size: size, weight: "bold")[#title]
#v(1fr)
#line(length: 100%, stroke: 1.5pt + rgb("#2b2620"))
#v(10pt)
#text(size: 28pt)[SeveTech #sym.dot.c PaperStackPro]
