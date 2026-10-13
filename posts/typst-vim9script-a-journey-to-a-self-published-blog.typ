#import "/libs/website.typ": article, link-embed-mastodon
#show: article.with(
  title: "Typst-Vim9Script: A Journey to a new Self-Published Blog",
  subtitle: "Building a Vim Plugin to generate a static html web blog with Typst",
  author: "SEVETECH",
  date: datetime(year: 2026, month: 8, day: 12),
  keywords: "",
)


= Introduction
I am a big proponent of self-publishing blogs. There's something profoundly liberating about owning your entire creative output: not just the words, but the whole digital stack behind them. You are free to experiment with new features, and carrying an idea from its rawest form to a finished, published version.

Until 2025 I used a Python Pelican / Markdown stack with Bootstrap 4. The mechanics were, in hindsight, fairly elaborate: source files were written in MediaWiki markup inside Vim using the wiki.vim plugin, Pandoc converted that markup into an intermediate set of HTML pages, and Pelican then assembled those pages into the final static site—handling everything from responsive templating to sitemap, robots.txt generation, keyword extraction, and a static jQuery search index.
(A fuller breakdown lives at #link("https://tessarinseve.pythonanywhere.com/nws/Static_Website_Mechanics.wiki.html")[Static Website Mechanics].)

The real point of that setup was always Vim: using the editor to its full power for fast editing and navigation, with everything else built around it. Wiki.vim made Vim feel less like a text editor and more like a personal knowledge management app. Linking one page to another was as simple as typing [[page name]] and pressing Enter to jump straight there. Everything was plain text, the whole blog stayed easy to search, and source controlled. No database, no lock-in. It made writing feel less like using a tool and more like just thinking out loud.

#image("./Figures/journeycover.png")

This worked well in terms of integration with Vim, but compiling started to slow down around ~200 entries, and keeping up two dependency chains:one Python, one JavaScript, it proved time expensive.

= From Legacy Vim to Vim9Script

Looking at my Vim setup in 2025, most of the plugins I relied on were still written in legacy VimScript, and it wasn't clear how many would keep being maintained. I didn't have the time or the appetite to keep patching legacy plugins indefinitely. So I made a call: rewrite my whole configuration to the Vim9Script standard, and build only what I actually needed myself.

Prior to the blog rewrite, I first had to fully rewrite my vimrc, dropping legacy VimScript patterns for Vim9's cleaner, more maintainable syntax, and build my own minimal plugin manager entirely in Vim9Script, running natively in PowerShell on Windows. No external build tools, no dependency chains—just Vim9Script orchestrating git operations directly.
  #link-embed-mastodon("https://social.vivaldi.net/@sevepy/117076764083878988")

= A New Plugin, Knowledge Graph to Publish

With the plugin manager in place, the next step was replacing MediaWiki with Typst. I wrote a #link("https://github.com/sevehub/vim9-typst-blog.vim")[Vim9Script plugin (work is still in progress) ] that takes notes from *my knowledge graph* DRAFT directory to published entries without leaving the editor: it scaffolds a new note .typ file, handles front-matter-style metadata, and on save hands the file off to be compiled.

The compile step is where Typst shines. Typst's HTML export option turns a .typ source file directly into a static HTML page—genuinely fast, even as the blog grows.

A small Node.js script, Build-TypstSite.js, wraps the Typst command line and transforms the compiled files into a mobile-friendly static HTML blog, organized by ISO week number for effortless chronological sorting. It builds #link("https://paperstackpro.surge.sh/index.html")[the week-grouped timeline index] by reading metadata straight out of each compiled HTML page's head tag, since Typst's HTML export already embeds that metadata at compile time.

= PKM Integration

I want my blog to be a curated export from my personal knowledge management system, not a separate writing destination. This approach keeps my thinking and my public output aligned while maintaining flexibility about what I share.

Drafting happens where I already work i.e inside my PKM (Obsidian or similar tools like Logseq), alongside meeting notes, book highlights, and half-formed ideas that may never see daylight. The directory I've designated for draft publishable content should be just another folder in my knowledge graph.

Moreover, in this knowledge graph subdirectory I want to define notes using the same convention that the #link("https://sites.google.com/view/paperstackpro/home#h.dty4hr66up7v")[Index Card Notebook] has. Eight nodes from N1 to N8 represent different categories, each with a progressive number like N2-8. It keeps the digital and paper systems reading as one unified structure.

A post only becomes public when I explicitly decide it's ready. At that moment, it gets promoted into a .typ file and fed into the publishing pipeline. Nothing is written for the blog first; the blog simply reflects the subset of my graph I've chosen to share.


This workflow, compile then push, sure requires an initial setup and assumes you're comfortable with static site generators and the command-line. The upside is that once it's running, even a knowledge graph with several hundred posts compiles in seconds rather than minutes. The slowness is in creating the system, not in using it daily.


= Publishing

Publishing itself ended up being the easiest part. I started using #link("https://surge.sh/")[Surge] just to preview builds during development; a quick surge command and the site was live at a throwaway URL, no config, no dashboard, no waiting on a deploy. It was meant to be temporary, a convenience for the dev phase. But it stayed fast, stayed simple, and never once got in the way, so at some point I stopped looking for a "real" production host and Surge is still what serves the site today.

= Conclusion

The net result: my old blog stack is gone, replaced by a single .typ file compiled directly to HTML. Vim9Script handles editing, drafting, and plugin management natively while a node script handles the rest: wrapping the Typst compiler, reading metadata straight out of the compiled HTML, and assembling the ISO-week timeline. Two toolchains and their dependency chains have collapsed into one compiler and one small script, and the build stays fast well past the ~200-entry mark that used to slow things down.

