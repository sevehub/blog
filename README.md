# Seve PaperStackPro Blog

Typst posts compiled to static HTML and published on GitHub Pages.

## Layout

- `posts/` : `.typ` posts and `website.typ` (shared template, imported by each post)
- `Build-TypstSite.js` : builds `posts/` into an ISO-week timeline site (Node built-ins only, Typst CLI required)
- `.github/workflows/pages.yml` : builds and deploys on push to `main`

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
