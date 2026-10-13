# Seve PaperStackPro Blog

Typst posts compiled to static HTML and published on GitHub Pages.


## Layout

```
blog/
├── Build-TypstSite.js         # builds posts/ into dist/ (Node built-ins only, Typst CLI required)
├── templates/
│   └── og-card.typ            # 1200x630 Open Graph card, title taken from each post
├── static/
│   └── favicon.ico            # copied to the site root on every build
├── posts/
│   ├── libs/
│   │   └── website.typ        # shared template, imported by each post
│   ├── Figures/               # images used by posts
│   └── *.typ                  # one file per post
├── .github/workflows/
│   └── pages.yml              # builds and deploys on push to main
└── dist/                      # generated output, not committed
```

`dist/` also receives `og/` (cards), `sitemap.xml` and `robots.txt`. Posts import the template with `#import "libs/website.typ": article` and reference images as `Figures/name.png` (case-sensitive on the runne


## Write a post
1. Drafting and the markdown-to-Typst conversion happen locally, outside this repository. Commit the finished `.typ` file to `posts/` on `main`, using `article(...)` from `website.typ`. The `date` argument sets the ISO week in the filename. The workflow deploys in about one to two minutes.
2. Move to `posts/` as `.typ` using `article(...)` from `website.typ`. The `date` argument sets the ISO week in the filename.
3. Commit to `main`. The workflow deploys in about one to two minutes.

## Build locally

    node Build-TypstSite.js --source posts --output dist
    node Build-TypstSite.js --source posts --output dist --watch

## Notes

- A post without the `date` meta falls back to file mtime, which is the build time on CI.
- Pin the Typst version in `pages.yml` to match the local one.


Typst blog compiled to static HTML with an ISO-week timeline, deployed to GitHub Pages by Actions.
