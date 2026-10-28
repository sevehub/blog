#import "/libs/website.typ": article
#show: article.with(
  title: "QR Code - Everything You Need",
  subtitle: "From scanning and saving links to generating, editing, and printing labels, the INK notebook’s lightweight tools cover the whole QR code workflow with just a web browser and a portable printer",
  author: "SEVETECH",
  date: datetime(year: 2026, month: 10, day: 28),
  keywords: "",
)

= QR Code - Everything You Need

QR codes are attractive as a connection between physical and digital
storage, since a printed label can point to practically any URL. The
command line generator #emph[qrencode], a sophisticated tool for
creating such codes, has been covered in a
#link("https://tessarinseve.pythonanywhere.com/nws/2024-09-05.wiki.html")[previous post].
However, command line tools require a local installation and a working
shell, which limits their use. This post is dedicated to
several alternatives in which the entire process, from URL to printable
code, requires only a mobile phone web-browser. 

= The notebook with a digital toolbox

The #link("https://a.co/d/0iz97Ylo")[INK notebook] , designed as an
enhanced version of *Field Notes* paper notebooks, is well suited to fast
notes and to everything that is quicker on paper than on a screen. It is
paired with a digital toolbox available through a QR code printed inside the
notebook, for the tasks that are better handled in digital form.

The first tool (No.~02) described here is the #strong[Bookmark Manager].
It is a single-file application that stores URLs in the browser without
reaching an external server, so no login or account is required and all
data remains on the local device.

#box(image("Figures/Pasted image 20261028080525.png"))

A limitation of this design is that browser storage is tied to a single
browser profile. Bookmarks saved on one device are not available on
another unless they are exported or copied manually, and clearing
browser data removes the stored list (there is a different app, No 08, if you
need to store and share URLs using the cloud).

The Bookmark Manager also includes a QR scanner, which extracts the URL
from an image of a code either taken directly with the phone camera or
loaded from an existing image file. A scanned code can therefore be
added to the list without the address being typed manually.

= QR code generation
<qr-code-generation>
To generate a QR code using just your browser, start by scanning the QR
code provided below via the Bookmark Manager and saving the resulting
URL. Locate the URL in your list and select the #emph[Open with
JupyterLite] button to launch a Jupyter notebook containing a
pre-configured Python script.

#box(image("Figures/Pasted image 20261024125923.png"))

In the script, replace the example text or URL with the content to be
encoded, then run the cells in order with Shift+Enter, or with Run \>
Run All Cells in the menu. A higher error correction level (Q or H)
makes the code denser but keeps it readable when it is partly smudged or
covered

The QR code is shown directly below the first cell and is also available
from the file browser as an image file. Right-click the file and choose
Download to save it locally.

Another possibility is to create a QR code directly from any saved
bookmark in the Bookmark Manager, using the #emph[QR PNG] or #emph[QR
SVG] button shown next to each saved URL. This is faster and immediate:
a single click downloads the file, named after the site, with no
notebook to open and nothing to edit.

The trade-off is fewer options that can be tweaked, since the error
correction level, the black-on-white colors, and the margin are frozen,
and the resulting PNG is generated at a fixed size, which is enough for printing.

The buttons also work for app links such as obsidian:/\/ or claude:/\/. For custom sizes, colors, or a higher error correction level, the JupyterLite notebook with #emph[segno] module remains the better choice.

= Label Designer
<label-designer>
The INK notebook also includes a free, browser-based label designer
(No.~10). You can add text and images, create your design at your
printer’s true resolution, and download it as a PNG for use in the
printer app. For example, if you want to share where to find affordable
office items, such as desk accessories, you can create a label with a
short recommendation and a QR code linking directly to the product.

#box(image("Figures/label_48x50mm (1).png"))

A small thermal printer is a useful addition to your toolbox because it
can print QR codes on adhesive labels that you can attach to notebook
pages, books, or shelves. In seconds, a link, a note, or an Obsidian
card is just one scan away.

A dedicated handheld scanner is a possible later addition. Both are
available at low prices, and a selection of budget-friendly options can
be found by scanning the above QR code. Thermal prints fade with heat
and light over time, and small codes may be hard to read, so labels
should be printed at a reasonable size with high contrast, and important
codes are better reprinted from time to time.

= Pele-Mermaid Diagrams
<pele-mermaid-diagrams>
The INK notebook includes a browser-based diagram builder that
complements the Ascii-to-Svg tool (No.09). Instead of arranging
characters by hand, you describe a diagram using Mermaid’s text-based
syntax. #link("https://pele.run")[Pele] is a Mermaid-compatible
rendering engine that supports many of Mermaid’s diagram types while
applying its own layout and visual style.

To create a diagram, open the Ascii-to-Svg tool and edit the Mermaid
code in the code box. The preview shows the result, so you can adjust
the wording, direction, and connections until the diagram communicates
clearly. This makes the tool useful when a label needs more than a short
note or a QR code. You could create a small flowchart that explains how
to find an office item, compare options, or follow instructions on your website. The image below shows the editable Mermaid
code box (left) and the diagram preview (right). In the preview, inset B
shows the flowchart placed on a printable thermal label, alongside a QR
code.

#box(image("Figures/Pasted image 20261028100240.png"))

The text in the code box describes the diagram’s structure: each
bracketed phrase is a node, and the vertical lines show how the steps
connect. You can change TD (top to bottom) to LR (left to right), or add
more nodes and branches to explain a more elaborate process.
