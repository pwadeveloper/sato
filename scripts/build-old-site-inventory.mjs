#!/usr/bin/env node
/**
 * Builds docs/old-site-inventory.json from the live old site's pages, saved
 * as HTML in raw-assets/old-site-html/ (see docs/decisions/mirror-old-site-content.md).
 *
 *   node scripts/build-old-site-inventory.mjs
 *
 * For every project-related page it records, in page order:
 *   - each image: position, the full-size URL its thumbnail links to, the
 *     caption printed under it (exactly as written), its alt and title, and
 *     the page heading it sits under
 *   - the project table at the top of each category page
 *   - every narrative paragraph
 *
 * The old site is a WordPress 3.3 theme with one content column
 * (`div.content_area`). On the three category pages each photograph is
 *   <a href="full.jpg"><img src="full-400x300.jpg"></a>
 *   <a href="attachment-page/">…</a> CAPTION
 * so the caption is the text after the attachment link. On the "Ongoing
 * projects" pages the caption is the paragraph after the image; in the home
 * page's ongoing-projects slider it is the paragraph before it.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const HTML = join(ROOT, "raw-assets", "old-site-html");
const SITE = "https://www.satoengineering.com";

const decode = (s) =>
  s.replace(/&#8217;|&rsquo;/g, "’").replace(/&#8216;/g, "‘").replace(/&#8220;/g, "“").replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–").replace(/&#8230;/g, "…").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#039;|&#39;/g, "'");
const attr = (tag, k) => decode(tag.match(new RegExp(`\\b${k}="([^"]*)"`))?.[1] ?? "");
const clean = (s) => decode(s).replace(/[ \t ]+/g, " ").trim();

/** The content column as an ordered list of tokens: text, img, link. */
function tokens(html) {
  const start = html.indexOf('<div class="content_area">');
  let end = html.indexOf('<div class="footer', start);
  if (end < 0) end = html.length;
  const s = html.slice(start, end).replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const out = [];
  const re = /<img\b[^>]*>|<a\b[^>]*href="([^"]+)"[^>]*>|<\/?(?:p|br|div|tr|td|h\d|li|span|strong)\b[^>]*>|([^<]+)|<[^>]+>/g;
  let buf = "";
  const flush = () => { const t = clean(buf); if (t) out.push({ t: "text", v: t }); buf = ""; };
  for (const m of s.matchAll(re)) {
    if (m[0].startsWith("<img")) { flush(); out.push({ t: "img", src: attr(m[0], "src"), alt: attr(m[0], "alt"), title: attr(m[0], "title"), width: +attr(m[0], "width") || null, height: +attr(m[0], "height") || null }); }
    else if (m[1]) { flush(); out.push({ t: "a", href: decode(m[1]) }); }
    else if (m[2] !== undefined) buf += m[2];
    else if (/^<\/?(p|br|div|tr|td|h\d|li)\b/.test(m[0])) flush();
  }
  flush();
  return out;
}

const isUpload = (u) => /\/wp-content\/uploads\//.test(u);
const isTheme = (u) => /\/wp-content\/themes\//.test(u);
/** WordPress names resized copies `name-400x300.jpg`; strip that for the original. */
const unsized = (u) => u.replace(/-\d+x\d+(\.[a-z]+)$/i, "$1");

const PAGES = [
  { file: "__.html", path: "/", kind: "home" },
  { file: "_projects__.html", path: "/projects/", kind: "projects" },
  { file: "_building-and-construction__.html", path: "/building-and-construction/", kind: "category" },
  { file: "_water-supply-and-water-resources__.html", path: "/water-supply-and-water-resources/", kind: "category" },
  { file: "_civil-eng-road-projects__.html", path: "/civil-eng-road-projects/", kind: "category" },
  { file: "_ongoing-projects__.html", path: "/ongoing-projects/", kind: "ongoing" },
  { file: "_work-in-progress__.html", path: "/work-in-progress/", kind: "ongoing" },
  { file: "_project-1__.html", path: "/project-1/", kind: "ongoing" },
  { file: "_project-2__.html", path: "/project-2/", kind: "ongoing" },
  { file: "_project-3__.html", path: "/project-3/", kind: "ongoing" },
  { file: "_project-4__.html", path: "/project-4/", kind: "ongoing" },
  { file: "_news-events__.html", path: "/news-events/", kind: "news" },
  { file: "_news-events_page_2_.html", path: "/news-events/page/2/", kind: "news" },
];
for (const f of readdirSync(HTML).filter((f) => f.startsWith("post_")).sort()) {
  const html = readFileSync(join(HTML, f), "utf8");
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1] ?? "";
  PAGES.push({ file: f, path: canon.replace(SITE, ""), kind: "post" });
}

const FOOTER = /^(Safety Policies|Future Plans|Contact Us|Copyright ©|--- (BEGIN|END) UNTRUSTED)/;
const FILLER = /We focus on three key areas at Sato engineering/;

const pages = [], images = [], tables = [], narratives = [];
for (const p of PAGES) {
  const html = readFileSync(join(HTML, p.file), "utf8");
  const title = clean(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "");
  const tk = tokens(html).filter((x) => !(x.t === "text" && FOOTER.test(x.v)));
  pages.push({ url: SITE + p.path, kind: p.kind, title, source: "live site, fetched 2026-10-19 with the gstack browse tool", savedAs: `raw-assets/old-site-html/${p.file}` });

  // The page's own heading is its first text token.
  const heading = tk.find((x) => x.t === "text")?.v ?? "";
  let section = heading;
  let position = 0;

  // Project table on the category pages: five cells per row after the header row.
  if (p.kind === "category") {
    const tableStart = html.indexOf("<table");
    const tableEnd = html.indexOf("</table>", tableStart);
    const rows = [...html.slice(tableStart, tableEnd).matchAll(/<tr[\s\S]*?<\/tr>/g)].map((r) =>
      [...r[0].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((c) => clean(c[1].replace(/<[^>]+>/g, " "))));
    const [, ...body] = rows;
    tables.push({
      page: SITE + p.path, heading,
      rows: body.filter((r) => r.some(Boolean)).map(([name, location, client, contractStart, completion]) => ({ name, location, client, contractStart, completion })),
    });
  }

  for (let i = 0; i < tk.length; i++) {
    const x = tk[i];
    if (x.t === "text") {
      if (/^Project \d$/.test(x.v) || /^(Building & Construction|Water Supply & Water Resources Projects|Civil Engineering Road Projects|Ongoing Projects|ONGOING PROJECTS|NEWS)$/.test(x.v)) section = x.v;
      continue;
    }
    if (x.t !== "img" || isTheme(x.src) || !isUpload(x.src)) continue;
    position++;
    const prev = tk[i - 1];
    const fullUrl = prev?.t === "a" && isUpload(prev.href) ? prev.href : unsized(x.src);
    let attachmentPage = null, caption = null;
    if (p.kind === "home") {
      // Slider: "caption … View Details" precede the image.
      for (let j = i - 1; j >= 0 && j > i - 5; j--) if (tk[j].t === "text" && tk[j].v !== "View Details") { caption = tk[j].v; break; }
    } else {
      let j = i + 1;
      if (tk[j]?.t === "a" && !isUpload(tk[j].href)) { attachmentPage = tk[j].href; j++; }
      const parts = [];
      for (; j < tk.length && tk[j].t === "text"; j++) parts.push(tk[j].v);
      caption = parts.join(" ").replace(/\s*\.\.more$/, "") || null;
      if (caption && FILLER.test(caption)) caption = null;
    }
    images.push({
      page: SITE + p.path, pageKind: p.kind, position, section,
      thumbnailUrl: x.src, fullUrl, attachmentPage,
      caption, alt: x.alt || null, title: x.title || null,
      displayed: { width: x.width, height: x.height },
    });
  }

  // Narrative paragraphs: long text that is not a caption, a table cell or filler.
  const captions = new Set(images.filter((im) => im.page === SITE + p.path).map((im) => im.caption));
  if (["projects", "ongoing", "post"].includes(p.kind)) {
    for (const x of tk) {
      // Posts keep every line (the Ogere post's scope is a list of short
      // bullets); elsewhere only paragraphs long enough to be prose count.
      if (x.t !== "text" || x.v.length < (p.kind === "post" ? 20 : 60) || FILLER.test(x.v)) continue;
      if ([...captions].some((c) => c && (c === x.v || c.startsWith(x.v)))) continue;
      if (p.kind === "post" && x.v === title.replace(/ \| Sato Engineering$/, "")) continue;
      narratives.push({ page: SITE + p.path, pageKind: p.kind, text: x.v });
    }
  }
}

writeFileSync(join(ROOT, "docs", "old-site-inventory.json"), JSON.stringify({
  note: "Generated by scripts/build-old-site-inventory.mjs from the live old site. Captions are exactly as printed under each photograph; `project` mappings are added by scripts/old-site-project-map.json.",
  source: SITE,
  capturedAt: "2026-10-19",
  pages, tables, images, narratives,
}, null, 2) + "\n");
console.log(`${pages.length} pages · ${tables.reduce((n, t) => n + t.rows.length, 0)} table rows · ${images.length} images · ${narratives.length} narrative paragraphs`);
