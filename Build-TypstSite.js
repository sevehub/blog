#!/usr/bin/env node
/**
 * Build-TypstSite.js
 *
 * Converts a directory of Typst (.typ) files into a mobile-friendly static
 * HTML blog, timestamped by ISO 8601 week. Node.js port of Build-TypstSite.ps1,
 * built the same way generate.js worked for "the stack" -- no npm packages
 * needed, just `node Build-TypstSite.js ...`.
 *
 * For each .typ file, runs:
 *   typst compile --features html --format html <file> <tempOut>
 * then reads metadata straight out of the compiled HTML <head>:
 *   - <title>                -> page title / filename slug
 *   - <meta name="keywords"> -> shown as tags in the index
 *   - <meta name="date">     -> drives the ISO week/year in the filename
 *
 * IMPORTANT: Typst's HTML export does NOT emit <meta name="date"> from
 * `#set document(date: ...)` -- HTML export only supports title, description,
 * author, and keywords. To get a date into the output, add this to each .typ
 * file instead (adjust the format call to taste):
 *
 *   #html.elem("meta", attrs: (
 *     name: "date",
 *     content: date.display("[year]-[month padding:zero]-[day padding:zero]"),
 *   ))
 *
 * If no such tag is found, the script falls back to the .typ file's
 * last-modified time on disk and prints a warning -- the build won't fail,
 * but the post lands in whatever week the file was last touched.
 *
 * Every run clears previously generated `YYYYWww_*.html` post files from
 * OutputDir before rebuilding, then regenerates index.html as a week-grouped
 * timeline, newest week first. Files that don't match that naming pattern
 * (your own index.html tweaks, other assets) are left untouched.
 *
 * Requires the Typst CLI on PATH (winget install --id Typst.Typst).
 *
 * USAGE
 *   node Build-TypstSite.js --source .\notes --output .\site
 *   node Build-TypstSite.js --source .\notes --output .\site --watch
 *   node Build-TypstSite.js --source .\notes --output .\site --no-index
 *
 * FLAGS
 *   -s, --source     Directory containing .typ source files (recursive)
 *   -o, --output      Directory the generated HTML site is written to
 *   -w, --watch        Keep running and rebuild on file changes
 *       --no-index    Skip generating index.html
 *       --help          Show this help
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// --- CLI argument parsing --------------------------------------------------

function parseArgs(argv) {
  const args = { source: null, output: null, watch: false, index: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '-s':
      case '--source':
        args.source = argv[++i];
        break;
      case '-o':
      case '--output':
        args.output = argv[++i];
        break;
      case '-w':
      case '--watch':
        args.watch = true;
        break;
      case '--no-index':
        args.index = false;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
      default:
        console.warn(`Unknown argument: ${a}`);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

if (args.help || !args.source || !args.output) {
  console.log(`
Usage: node Build-TypstSite.js --source <dir> --output <dir> [--watch] [--no-index]

  -s, --source    Directory containing .typ source files (recursive)
  -o, --output    Directory the generated HTML site is written to
  -w, --watch     Keep running and rebuild on file changes
      --no-index  Skip generating index.html
`);
  process.exit(args.help ? 0 : 1);
}

// --- Sanity checks ----------------------------------------------------------

const typstCheck = spawnSync('typst', ['--version'], { encoding: 'utf8' });
if (typstCheck.error) {
  console.error('Typst CLI not found on PATH. Install it with: winget install --id Typst.Typst');
  process.exit(1);
}

if (!fs.existsSync(args.source)) {
  console.error(`Source directory '${args.source}' does not exist.`);
  process.exit(1);
}

const SourceDir = path.resolve(args.source);
const OutputDir = path.resolve(args.output);
fs.mkdirSync(OutputDir, { recursive: true });

// Filename pattern for generated posts: 2026W32_my-post-title.html
const PostNamePattern = /^\d{4}W\d{2}_.*\.html$/;

// --- Mobile-friendly head injected into every page ---------------------------

const MobileHead = `
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noai, noimageai">
<link rel="me" href="https://social.vivaldi.net/@sevepy">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Georgia&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="shortcut icon" href="https://tessarinseve.pythonanywhere.com/nws/theme/imgs/favicon.ico" type="image/x-icon">
<link rel="apple-touch-icon" href="https://tessarinseve.pythonanywhere.com/nws/theme/imgs/apple-touch-icon.png"/>
<link rel="apple-touch-icon" sizes="72x72" href="https://tessarinseve.pythonanywhere.com/nws/theme/imgs/apple-touch-icon-72x72.png"/>
<link rel="apple-touch-icon" sizes="114x114" href="https://tessarinseve.pythonanywhere.com/nws/theme/imgs/apple-touch-icon-114x114.png"/>
<link rel="stylesheet" href="https://tessarinseve.pythonanywhere.com/nws/theme/css/website.css">
<script src="https://tessarinseve.pythonanywhere.com/nws/theme/js/website.js"></script>
<link rel="stylesheet" href="https://tessarinseve.pythonanywhere.com/nws/theme/css/feedback.css">
<script src="https://tessarinseve.pythonanywhere.com/nws/theme/js/feedback.js" defer> </script>
`;

const ExtendJS = `
<script>
(function () {
  var nav = document.getElementById('sevetech-nav');
  var toggle = document.getElementById('theme-toggle');
  var html = document.documentElement;
  var lastY = window.scrollY;
  var threshold = 8; // px of scroll before we react, avoids jitter

  // ---- auto-hide on scroll direction ----
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (Math.abs(y - lastY) < threshold) return;

    if (y > lastY && y > 80) {
      nav.classList.add('nav-hidden');   // scrolling down -> hide
    } else {
      nav.classList.remove('nav-hidden'); // scrolling up -> show
    }
    lastY = y;
  }, { passive: true });

  // ---- theme toggle, persisted ----
  // Only sets data-theme when the user has explicitly chosen a theme.
  // Otherwise the attribute stays absent and prefers-color-scheme
  // (in website.css) is what drives light/dark.
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;


  //---- Remind me later logic
document.getElementById('read-later-btn').addEventListener('click', addReminder);
 function padTwoDigits(number) {
  return String(number).padStart(2, '0');
}

function formatAsUtcTimestamp(date) {
  const year = date.getUTCFullYear();
  const month = padTwoDigits(date.getUTCMonth() + 1);
  const day = padTwoDigits(date.getUTCDate());
  const hours = padTwoDigits(date.getUTCHours());
  const minutes = padTwoDigits(date.getUTCMinutes());
  return year + month + day + 'T' + hours + minutes + '00Z';
}

function addReminder() {
  const now = new Date();
  const start = new Date(now.getTime() + 24 * 60 * 60 * 1000); // tomorrow
  const end = new Date(start.getTime() + 30 * 60 * 1000);      // 30 minutes later
  const uid = now.getTime() + '-' + Math.random().toString(36).slice(2) + '@sevetech.dev';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SeveTech//Read Later//EN',
    'BEGIN:VEVENT',
    'UID:' + uid,
    'DTSTAMP:' + formatAsUtcTimestamp(now),
    'DTSTART:' + formatAsUtcTimestamp(start),
    'DTEND:' + formatAsUtcTimestamp(end),
    'SUMMARY:Read: ' + document.title,
    'DESCRIPTION:' + window.location.href,
    'END:VEVENT',
    'END:VCALENDAR'
  ];
const icsContent = lines.join(String.fromCharCode(13) + String.fromCharCode(10));
  const blob = new Blob([icsContent], { type: 'text/calendar' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'read-later.ics';
  link.click();
}
  
  function applyTheme(theme, persist) {
    html.setAttribute('data-theme', theme);
    toggle.innerHTML = theme === 'dark' ? '&#9789;' : '&#9788;'; // moon / sun
    if (persist) localStorage.setItem('sevetech-theme', theme);
  }

  var saved = localStorage.getItem('sevetech-theme');
  if (saved) {
    applyTheme(saved, false);
  } else {
    toggle.innerHTML = prefersDark ? '&#9789;' : '&#9788;';
  }

  toggle.addEventListener('click', function () {
    var current = html.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
    applyTheme(current === 'dark' ? 'light' : 'dark', true);
  });
})();
</script>
`;

const NavBar = `
<nav id="sevetech-nav">
  <div class="nav-left">
    <a href="https://paperstackpro.surge.sh/index.html">&larr; Index</a>
    <span class="divider">|</span>
    <a href="https://sites.google.com/view/paperstackpro/home/blog" class="nav-brand">&#127968; PaperStackPro</a>
  </div>
<button id="read-later-btn">Remind me to read this later</button>
  <button id="theme-toggle" aria-label="Toggle dark mode" title="Toggle theme">&#9788;</button>
</nav>
`;

const Footer = `
<footer id="sevetech-footer">
  &copy; 2026 SeveTech. All rights reserved. No part of this site's content may be reproduced, distributed, or used to train machine learning models without prior written permission.
</footer>
`;

// --- Metadata extraction ------------------------------------------------------

function getTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : null;
}

// Scans every <meta> tag and matches on the `name` attribute regardless of
// attribute order, since Typst's HTML export ordering isn't guaranteed.
function getMetaContent(html, name) {
  const tagMatches = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tagMatches) {
    const nameMatch = tag.match(new RegExp(`name\\s*=\\s*["']${name}["']`, 'i'));
    if (nameMatch) {
      const contentMatch = tag.match(/content\s*=\s*["']([^"']*)["']/i);
      if (contentMatch) return contentMatch[1];
    }
  }
  return null;
}

function slugify(text) {
  let slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || 'untitled';
}

function htmlEncode(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- ISO 8601 week helpers (Thursday rule) ------------------------------------

function getIsoWeekInfo(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  let day = d.getUTCDay(); // Sunday=0 ... Saturday=6
  if (day === 0) day = 7;  // ISO: Monday=1 ... Sunday=7
  d.setUTCDate(d.getUTCDate() + 4 - day); // move to Thursday of this ISO week
  const isoYear = d.getUTCFullYear();
  const jan1 = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(((d - jan1) / 86400000 + 1) / 7);
  return { year: isoYear, week };
}

function getIsoWeekMonday(isoYear, isoWeek) {
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  let jan4Day = jan4.getUTCDay();
  if (jan4Day === 0) jan4Day = 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() + 1 - jan4Day);
  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (isoWeek - 1) * 7);
  return monday;
}

function formatShortDate(d) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

// --- Chrome injection ----------------------------------------------------------

function addMobileHead(htmlPath) {
  let content = fs.readFileSync(htmlPath, 'utf8');
  if (content.match(/<head>/)) {
    content = content.replace('<head>', `<head>\n${MobileHead}`);
  } else {
    // Defensive fallback if Typst emits a bare fragment without <head>.
    content = `<!DOCTYPE html>\n<html><head>${MobileHead}</head><body>${NavBar}${content}${Footer}</body></html>`;
  }
  if (content.match(/<body>/)) {
    content = content.replace(
      '<body>',
      `<body>${NavBar}\n<button id='backToTop' aria-label='Back to top'>Top</button>\n<article><main>`
    );
    content = content.replace('</body>', `</article></main>${Footer}${ExtendJS}</body>`);
  }
  fs.writeFileSync(htmlPath, content, 'utf8');
}

// --- File discovery --------------------------------------------------------

function findTypFiles(dir) {

  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {

if (entry.name === 'Figures' || entry.name === 'libs') continue;
      results = results.concat(findTypFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.typ') && entry.name !== 'website.typ') {
      results.push(full);
    }
  }
  return results;
}

// --- Build one post ----------------------------------------------------------

let usedNames;
const failures = [];

function buildOne(typFilePath) {
  const typName = path.basename(typFilePath);
  const tempPath = path.join(OutputDir, `_tmp_${Date.now()}_${Math.random().toString(36).slice(2)}.html`);

  console.log(`Compiling ${typName}...`);
  const result = spawnSync('typst', ['compile', '--features', 'html', '--format', 'html', typFilePath, tempPath], {
    encoding: 'utf8',
  });

  if (result.error) {
    console.warn(`  Failed to run typst on ${typName}: ${result.error.message}`);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
failures.push(`${typName}\n${result.error.message}`);
    return null;
  }

  // typst writes warnings to stderr even on a successful compile (exit 0),
  // e.g. unresolved references, deprecated syntax, missing fonts. Surface
  // them regardless of exit status, or they get silently swallowed.
  if (result.stdout && result.stdout.trim()) {
    console.log(`  [typst stdout] ${typName}:\n${result.stdout.trim()}`);
  }
  if (result.stderr && result.stderr.trim()) {
    console.warn(`  [typst stderr] ${typName}:\n${result.stderr.trim()}`);
  }

  if (result.status !== 0) {
    console.warn(`  typst failed on ${typName} (exit code ${result.status})`);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
failures.push(`${typName} (exit ${result.status})\n${(result.stderr || '').trim()}`);
    return null;
  }

  const html = fs.readFileSync(tempPath, 'utf8');

  let title = getTitle(html);
  if (!title) title = path.basename(typFilePath, '.typ');

  const keywords = null; // keywords disabled for now
  const dateStr = getMetaContent(html, 'date');

  let postDate = null;
  if (dateStr) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) postDate = parsed;
  }
  if (!postDate) {
    console.warn(
      `  No parseable <meta name="date"> in ${typName} -- add ` +
        `'#html.elem("meta", attrs: (name: "date", content: date.display("[year]-[month padding:zero]-[day padding:zero]")))' ` +
        `to the .typ file. Falling back to the file's last-modified time.`
    );
    postDate = fs.statSync(typFilePath).mtime;
  }

  const iso = getIsoWeekInfo(postDate);
  const slug = slugify(title);

  const weekStr = String(iso.week).padStart(2, '0');
  const baseName = `${iso.year}W${weekStr}_${slug}`;
  let finalName = `${baseName}.html`;
  let suffix = 2;
  while (usedNames.has(finalName)) {
    finalName = `${baseName}-${suffix}.html`;
    suffix++;
  }
  usedNames.add(finalName);
  const finalPath = path.join(OutputDir, finalName);

  addMobileHead(tempPath);
  fs.renameSync(tempPath, finalPath);

  console.log(`  -> ${finalName}`);

  return { fileName: finalName, title, keywords, date: postDate, isoYear: iso.year, isoWeek: iso.week };
}

// --- Build the timeline index -------------------------------------------------

function buildIndex(posts) {
  if (!args.index || !posts.length) return;

  const groupsMap = new Map();
  for (const p of posts) {
    const key = `${p.isoYear}-${p.isoWeek}`;
    if (!groupsMap.has(key)) groupsMap.set(key, []);
    groupsMap.get(key).push(p);
  }

  const groupKeys = [...groupsMap.keys()].sort((a, b) => {
    const [ay, aw] = a.split('-').map(Number);
    const [by, bw] = b.split('-').map(Number);
    return (by * 100 + bw) - (ay * 100 + aw); // descending
  });

  const sections = groupKeys.map((key) => {
    const group = groupsMap.get(key);
    const sample = group[0];
    const monday = getIsoWeekMonday(sample.isoYear, sample.isoWeek);
    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);
    const weekLabel = `${sample.isoYear} &mdash; Week ${String(sample.isoWeek).padStart(2, '0')} (${formatShortDate(monday)} to ${formatShortDate(sunday)})`;

    const items = [...group]
      .sort((a, b) => b.date - a.date)
      .map((p) => {
        let tagsHtml = '';
        if (p.keywords) {
          const tags = p.keywords
            .split(/\s*,\s*/)
            .filter(Boolean)
            .map(htmlEncode);
          if (tags.length) tagsHtml = `<span class='post-tags'>${tags.join(' &middot; ')}</span>`;
        }
        return `<li><a href="${p.fileName}">${htmlEncode(p.title)}</a> ${tagsHtml}</li>`;
      })
      .join('\n');

    return `<section class="week-group">\n  <h2>${weekLabel}</h2>\n  <ul>\n${items}\n  </ul>\n</section>`;
  });

  const indexHtml = `<!DOCTYPE html>
<html>
<head>
${MobileHead}
<title>SeveTech Blog 2026</title>
</head>
<body>
${NavBar}
<h1>Blog Timeline</h1>
${sections.join('\n')}
<hr>
<div style="margin-top: 32px; text-align: center;">
  <button onclick="window.location.href='https://tessarinseve.pythonanywhere.com/nws/category/journal.html'" style="background: none; border: 1px solid var(--ink); color:var(--ink); padding: 12px 24px; font-size: 14px; font-weight: 500; cursor: pointer; letter-spacing: 0.5px; transition: all 0.2s ease;">
    Older Blogposts
  </button>
</div>
${Footer}
${ExtendJS}
</body>
</html>
`;

  fs.writeFileSync(path.join(OutputDir, 'index.html'), indexHtml, 'utf8');
  console.log(`Wrote index.html (${posts.length} posts across ${groupKeys.length} week(s))`);
}

// --- Build everything ----------------------------------------------------------

function buildAll() {
  // Clean rebuild of generated posts only -- leaves index.html (rewritten
  // below anyway) and any other files in OutputDir untouched.
  const existing = fs
    .readdirSync(OutputDir, { withFileTypes: true })
    .filter((e) => e.isFile() && PostNamePattern.test(e.name));
  if (existing.length) {
    console.log(`Clearing ${existing.length} previously generated post(s)...`);
    for (const e of existing) fs.unlinkSync(path.join(OutputDir, e.name));
  }

  const typFiles = findTypFiles(SourceDir);
  if (!typFiles.length) {
    console.warn(`No .typ files found under ${SourceDir}`);
    return;
  }

  usedNames = new Set();
  const posts = typFiles.map(buildOne).filter(Boolean);
  buildIndex(posts);
  console.log(`Done. ${posts.length}/${typFiles.length} files built to ${OutputDir}`);

  if (failures.length) {
    const report = failures.join('\n---\n');
    console.error(`\n${failures.length} failure(s):\n${report}`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '## Typst errors\n```\n' + report + '\n```\n');
    }
    process.exitCode = 1;
  }
}

// --- Run -------------------------------------------------------------------

buildAll();

if (args.watch) {
  console.log(`Watching ${SourceDir} for changes (Ctrl+C to stop)...`);
  let debounceTimer = null;
  const trigger = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(buildAll, 300); // debounce rapid saves
  };
  fs.watch(SourceDir, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.typ')) trigger();
  });
}
