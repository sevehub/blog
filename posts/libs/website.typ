// SeveTech blog post template
// Usage: import this file, then call article(...) wrapping your content
// first keyword == iso week
#let link-embed-mastodon(url) = {
  context if target() == "html" {
    html.elem(
      "iframe",
      attrs: (
        src: url + "/embed",
        class: "mastodon-embed centered-iframe",
        style: "max-width: 100%; border: 0; background: transparent",
        width: "400",
        height: "300",
        allowfullscreen: "true",
      ),
    )
  } else {
    // fallback for PDF or other non-HTML targets
    link(url)[#url]
  }
}

#let article(
  title: "",
  subtitle: "",
  author: "SEVETECH",
  date: datetime(year: 2026, month: 1, day: 1),
  keywords: "2026-W01",
  body,
) = {
  set document(title: title, author: author, date: date, keywords: keywords)
  set text(
    font: "Georgia",
    size: 11pt,
    lang: "en",
  )
  set heading(numbering: none)

  set par(justify: true, leading: 0.65em)


  context if (target() == "html") {
    context {
      let images = query(image)
      let og-image = if images.len() > 0 {
        // first image's source path
        images.first().source
      } else {
        "https://tessarinseve.pythonanywhere.com/staticweb/default-og.png"
      }
      html.elem(
        "meta",
        attrs: (
          name: "date",
          content: date.display("[year]-[month padding:zero]-[day padding:zero]"),
        ),
      )
      html.elem("meta", attrs: (property: "og:title", content: title))
      html.elem("meta", attrs: (property: "og:description", content: subtitle))
      html.elem("meta", attrs: (property: "og:image", content: og-image))
      html.elem("meta", attrs: (property: "og:type", content: "article"))
    }
    show heading: it => {
      let cls = if it.level == 1 { "sevetech-header" } else {
        "sevetech-header--sub"
      }
      html.elem("h" + str(it.level), attrs: (class: cls), it.body)
    }
  } else {
    set page(
      fill: rgb("#faf6ee"),
      paper: "us-letter",
      margin: (top: 1in, bottom: 1in, left: 1in, right: 1in),
    )
    show heading.where(level: 1): it => {
      set text(font: "Georgia", size: 20pt, weight: "bold")
      v(0.6em)
      it.body
      v(0.2em)
      line(length: 100%, stroke: 0.5pt + rgb("#2b2620"))
      v(0.8em)
    }

    show heading.where(level: 2): it => {
      set text(font: "Georgia", size: 13pt, weight: "medium")
      v(1em)
      it.body
      v(0.4em)
    }
  }
  show raw.where(block: true): it => {
    set text(font: "Georgia", size: 8.8pt)
    block(
      fill: rgb("#f0ead9"),
      inset: 10pt,
      radius: 2pt,
      width: 100%,
      it,
    )
  }

  show raw.where(block: false): it => {
    set text(font: "Georgia", size: 9.5pt)
    box(fill: rgb("#f0ead9"), outset: (y: 2pt), inset: (x: 2pt), it)
  }

  html.h1(class: "sevetech-header")[
    #title \(#date.display("[month repr:short] [day], [year]")\)
  ]
  html.h3(class: "sevetech-header--sub")[
    #subtitle
  ]


  // Ensure headings generate stable anchors in HTML
  set heading(numbering: "1.")

  // Hyperlinked Table of Contents
  html.div(class: "collapsed", id: "toc")[

    #outline(
      indent: 1em, // indent subsections
      title: text(size: 1.3em, weight: "bold")[Notes & Sections],
    )
  ]

  body
}
