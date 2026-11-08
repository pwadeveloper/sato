#!/usr/bin/env node
/**
 * Turns the old-site archive into one organised folder of images, an index
 * and the text of every page. Run scripts/archive-old-site.mjs first; see
 * docs/old-site-archive.md.
 *
 *   node scripts/organise-old-site-archive.mjs
 *
 * Reads raw-assets/old-site-archive/crawl/manifest.json and the mirror, and
 * writes under raw-assets/old-site-archive/ (all of it regenerated each run):
 *
 *   images/<category>/[<project-slug>/]<nn>-<caption-in-kebab-case>.<ext>
 *       One file per picture, copied byte for byte (EXIF and all). A picture
 *       is one upload and every resized or rotated copy WordPress made of
 *       it; the largest copy is the one kept. `nn` follows the old site's
 *       page order, and the caption is the one the old site printed.
 *   index.csv   one row per image
 *   pages.csv   one row per page: title, URL, saved file, source
 *   pages/*.md  the text of every page
 *   INDEX.md    all of the above, the completeness check first
 *
 * The completeness check compares every picture with
 * docs/old-site-inventory.json (the 88 project-page images), the files in
 * raw-assets/old-site/ and everything in public/images/, by URL and by the
 * 64-bit DCT pHash of scripts/compare-photo-batch.mjs (upright, whole frame
 * and centre crop to the other file's ratio; ≤ 10 of 64 is the same
 * photograph; the crop is tried both ways). Nothing is published from here.
 *
 * An optional raw-assets/old-site-archive/review.json holds judgements made
 * by eye — { "<picture url>": { "rule": "helmet" | "former name" | …, "note": "…",
 * "samePhotographAs": "/images/…" } } — printed beside the pictures it names; a
 * samePhotographAs counts as a match with that published file.
 */
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const ARCHIVE = join(ROOT, "raw-assets", "old-site-archive");
const MIRROR = join(ARCHIVE, "mirror");
const HOST = "www.satoengineering.com";
const SITE = `https://${HOST}`;
const SAME = 10;
const NEAR = 16;

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const manifest = readJson(join(ARCHIVE, "crawl", "manifest.json"));
const records = manifest.records;
const byUrl = new Map(records.map((r) => [r.url, r]));
const idScan = readJson(join(ARCHIVE, "crawl", "id-scan.json"));
const inventory = readJson(join(ROOT, "docs", "old-site-inventory.json"));
const plan = readJson(join(ROOT, "scripts", "content-mirror-plan.json"));
const projects = readJson(join(ROOT, "content", "projects.json"));
const reviewPath = join(ARCHIVE, "review.json");
const review = existsSync(reviewPath) ? readJson(reviewPath) : {};

/* ---------------------------------------------------------------- helpers */

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", ndash: "–", mdash: "—", hellip: "…", copy: "©", reg: "®", times: "×" };
const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);
const clean = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/[\s ]+/g, " ").trim();
const attr = (tag, k) => {
  const m = tag.match(new RegExp(`\\b${k}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"));
  return m ? decode(m[2]) : "";
};

function canon(raw, base = SITE + "/") {
  if (!raw) return null;
  const s = decode(raw.trim());
  if (!s || /^(#|mailto:|javascript:|tel:|data:)/i.test(s) || /[<>]|\?php/.test(s)) return null;
  try {
    const u = new URL(s, base);
    if (!/^https?:$/.test(u.protocol) || !/(^|\.)satoengineering\.com$/i.test(u.hostname)) return null;
    u.protocol = "https:";
    u.hostname = HOST;
    u.port = "";
    u.hash = "";
    return u.href;
  } catch {
    return null;
  }
}

/** Follow recorded redirects to the record that holds the saved copy. */
function saved(url) {
  for (let i = 0, u = url; u && i < 12; i++) {
    const r = byUrl.get(u);
    if (!r) return null;
    if (r.file) return r;
    u = r.redirectTo ? canon(r.redirectTo) : null;
  }
  return null;
}

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg|ico|tiff?)$/i;
const isImageUrl = (u) => IMAGE_EXT.test(new URL(u).pathname);
const isUpload = (u) => u.includes("/wp-content/uploads/");
const path = (u) => new URL(u).pathname;
const short = (u) => (u ? u.replace(SITE, "") || "/" : "");

/** One key per picture: every resized, rotated or thumbnail copy shares its original's. */
function keyOf(url) {
  let u = url;
  if (isUpload(u)) u = u.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, "$1").replace(/-e\d{10,}(\.[a-z0-9]+)$/i, "$1");
  return u.replace(/\/thumbs\/thumbs_([^/]+)$/i, "/$1");
}

function kebab(s, max = 90) {
  let k = s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (k.length > max) k = k.slice(0, max).replace(/-[^-]*$/, "");
  return k || "untitled";
}

/** A title or alt that is only a camera or upload filename is not a caption. */
const meaningful = (s) =>
  !!s &&
  s.length >= 4 &&
  !/^(link to full-size image|published\b|return to\b|view details)/i.test(s.trim()) &&
  /[a-z]{3}/i.test(s) &&
  !/^(img|dsc|sam|clip|image|building|water|civil|doc|untitled|banner|p\d|ikeja|thumbs?)[-_ ]?[\w-]*$/i.test(s.trim()) &&
  !/^[\w-]+\.(jpe?g|png|gif)$/i.test(s.trim());

const csv = (rows) =>
  rows.map((r) => r.map((v) => (v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))).join(",")).join("\n") + "\n";
const md = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

/** The HTML as served: the crawler keeps it as `.orig` beside any file whose links it rewrote. */
const readServed = (rec) => {
  const f = join(MIRROR, rec.file);
  return readFileSync(existsSync(f + ".orig") ? f + ".orig" : f, "utf8");
};

/* ---------------------------------------------------------------- posts */

// Every post the feed lists (the crawler walked /feed/?paged=N): date and category.
const posts = new Map();
for (const r of records) {
  if (!r.file || !/^https:\/\/www\.satoengineering\.com\/feed\/(\?paged=\d+)?$/.test(r.url)) continue;
  for (const item of readFileSync(join(MIRROR, r.file), "utf8").matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const link = canon(item[1].match(/<link>([^<]+)<\/link>/)?.[1]);
    if (!link) continue;
    posts.set(link, {
      date: new Date(item[1].match(/<pubDate>([^<]+)<\/pubDate>/)?.[1] ?? 0),
      categories: [...item[1].matchAll(/<category><!\[CDATA\[([^\]]*)\]\]><\/category>/g)].map((m) => m[1].toLowerCase()),
    });
  }
}

// WordPress IDs, from the /?p=N scan.
const idOf = new Map();
for (const x of idScan) {
  if (!x.location || x.note) continue;
  const rec = saved(canon(x.location));
  if (rec && !idOf.has(rec.url)) idOf.set(rec.url, x.id);
}

/* ---------------------------------------------------------------- pages */

const NAV = [
  "/", "/about-us/", "/welcome-to-sato-engineering/", "/core-services/", "/projects/",
  "/building-and-construction/", "/water-supply-and-water-resources/", "/civil-eng-road-projects/",
  "/civil-engineering/", "/electrical-engineering/", "/mechanical-engineering/",
  "/ongoing-projects/", "/work-in-progress/", "/project-1/", "/project-2/", "/project-3/", "/project-4/",
  "/news-events/", "/news-events/page/2/", "/our-team/", "/clients/", "/awards/", "/equipments/",
  "/future-plans/", "/safety-policies/", "/contact-us/",
];

const CAT = {
  building: "building-and-construction",
  water: "water-resources-development-and-management",
  civil: "civil-engineering-and-roadworks",
  em: "electrical-and-mechanical-engineering",
  ongoing: "ongoing-and-news",
  company: "company-and-office",
  none: "uncategorised",
};
const PROJECT_CATS = new Set([CAT.building, CAT.water, CAT.civil, CAT.em]);
/** New-site project category → archive folder. */
const FACET_TO_CAT = {
  "building-construction": CAT.building,
  "water-resources-development-management": CAT.water,
  "civil-engineering-road": CAT.civil,
  "electrical-mechanical": CAT.em,
};
const PAGE_CAT = {
  "/building-and-construction/": CAT.building,
  "/water-supply-and-water-resources/": CAT.water,
  "/civil-eng-road-projects/": CAT.civil,
  "/civil-engineering/": CAT.civil,
  "/electrical-engineering/": CAT.em,
  "/mechanical-engineering/": CAT.em,
};
const ONGOING = /^\/(ongoing-projects|work-in-progress|project-\d|news-events)(\/|$)/;
const COMPANY = /^\/(about-us|welcome-to-sato-engineering|core-services|our-team|clients|awards|equipments|future-plans|safety-policies|contact-us)\/$/;
/** For a photograph with no project and no telling page: words in its caption or filename. */
const CATEGORY_HINTS = [
  [/road|asphalt|culvert|pavement|kerb|grader|sandfill|laterite|wearing course/i, "civil"],
  [/water|filter|pipe|borehole|dam|river|stream|meter|pump|intake|tank|dredg|flood|erosion/i, "water"],
  [/school|class|office|building|mkt|market|shop|hotel|suite|flat|stadium|chalet|hall|block|estate|residen/i, "building"],
  [/electric|transformer|panel|generator/i, "em"],
];

/** The page's own column: banner slider to footer on the WordPress theme, the body elsewhere. */
function region(html) {
  // Attachment pages use their own template: the article, without the comment form.
  if (html.includes('class="entry-attachment"')) {
    const a = html.indexOf('<header class="entry-header">');
    let b = html.indexOf('<div id="comments"', a);
    if (b < 0) b = html.indexOf("</article>", a);
    if (a >= 0) return html.slice(a, b > a ? b : undefined);
  }
  let start = html.indexOf('<div class="banner_cont">');
  if (start < 0) start = html.indexOf('<div class="content_area">');
  if (start >= 0) {
    let end = html.indexOf('<div class="bg_footer', start);
    if (end < 0) end = html.length;
    return html.slice(start, end).replace(/<div class="menu_cont">[\s\S]*?<\/nav>/, "");
  }
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return body ? body[1] : html;
}

const pages = [];
for (const rec of records) {
  if (!rec.file || !/html/i.test(rec.contentType ?? "")) continue;
  const html = readServed(rec);
  const p = path(rec.url);
  const wordpress = /wp-content|wp-includes/.test(html);
  const attachment = /class="entry-attachment"/.test(html);
  const heading = clean(
    html.match(/<div class="text24b"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? html.match(/<h1 class="entry-title">([\s\S]*?)<\/h1>/)?.[1] ?? "",
  );
  const post = posts.get(rec.url);
  const page = {
    url: rec.url,
    file: rec.file,
    source: rec.source,
    liveStatus: rec.liveStatus,
    waybackUrl: rec.waybackUrl ?? null,
    title: clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
    heading,
    id: idOf.get(rec.url) ?? null,
    post,
    legacy: !wordpress,
    attachment,
    // An attachment page names its parent: "Return to <page>".
    parent: attachment ? canon(html.match(/<a\b[^>]*rel="gallery"[^>]*>/)?.[0]?.match(/href="([^"]+)"/)?.[1]) : null,
    foundOn: rec.foundOn ?? [],
    aliases: records.filter((r) => r.redirectTo && saved(canon(r.redirectTo))?.url === rec.url).map((r) => short(r.url)),
    html,
  };
  page.kind =
    page.legacy ? "legacy (pre-2012 static site)"
    : attachment ? "attachment page"
    : p === "/" ? "home"
    : PAGE_CAT[p] ? "category"
    : ONGOING.test(p) ? "ongoing / news"
    : COMPANY.test(p) ? "company"
    : post ? "post"
    : "page";
  page.order =
    NAV.includes(p) ? NAV.indexOf(p)
    : post ? 1000 + post.date.getTime() / 1e11
    : page.legacy ? 40000
    : page.id ? 20000 + page.id
    : 30000;
  pages.push(page);
}
pages.sort((a, b) => a.order - b.order || a.url.localeCompare(b.url));
const pageByUrl = new Map(pages.map((p) => [p.url, p]));

/** Category for a picture whose only clue is the page it sits on. */
function pageCategory(page, depth = 0) {
  const p = path(page.url);
  if (PAGE_CAT[p]) return PAGE_CAT[p];
  if (page.legacy) return CAT.none;
  if (page.parent && depth < 4) {
    const up = pageByUrl.get(page.parent);
    if (up) return pageCategory(up, depth + 1);
  }
  if (p === "/projects/") return CAT.none;
  if (p === "/" || ONGOING.test(p) || page.kind === "post") {
    const c = page.post?.categories ?? [];
    if (c.includes("building")) return CAT.building;
    if (c.some((x) => /water/.test(x))) return CAT.water;
    if (c.some((x) => /civil|road/.test(x))) return CAT.civil;
    return CAT.ongoing;
  }
  if (COMPANY.test(p)) return CAT.company;
  // Attachment pages and one-photo posts: the parent page, the feed's category, or the slug.
  const parent = p.split("/").filter(Boolean);
  if (parent.length > 1) {
    const up = pageByUrl.get(`${SITE}/${parent.slice(0, -1).join("/")}/`);
    if (up && depth < 4) return pageCategory(up, depth + 1);
  }
  const c = page.post?.categories ?? [];
  if (c.includes("building") || /^\/building/.test(p)) return CAT.building;
  if (c.some((x) => /water/.test(x)) || /^\/water/.test(p)) return CAT.water;
  if (c.some((x) => /civil|road/.test(x)) || /^\/civil/.test(p)) return CAT.civil;
  if (page.foundOn.some((u) => /\/awards\/$/.test(u)) || /award|best-|most-|excellent-|unparralled|contributing-immensely|west-africas/.test(p)) return CAT.company;
  return CAT.none;
}

/* ------------------------------------------------------------ placements */

/** The column as ordered tokens, as scripts/build-old-site-inventory.mjs reads it. */
function tokens(html) {
  const s = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  const out = [];
  const re = /<img\b[^>]*>|<a\b[^>]*>|<\/?(?:p|br|div|tr|td|h\d|li|span|strong|dt|dd)\b[^>]*>|([^<]+)|<[^>]+>/gi;
  let buf = "";
  const flush = () => {
    const t = clean(buf);
    if (t) out.push({ t: "text", v: t });
    buf = "";
  };
  for (const m of s.matchAll(re)) {
    const tag = m[0];
    if (/^<img\b/i.test(tag)) {
      flush();
      out.push({ t: "img", src: attr(tag, "src"), alt: attr(tag, "alt"), title: attr(tag, "title") });
    } else if (/^<a\b/i.test(tag)) {
      flush();
      if (attr(tag, "href")) out.push({ t: "a", href: attr(tag, "href"), title: attr(tag, "title") });
    } else if (m[1] !== undefined) buf += m[1];
    else if (/^<\/?(p|br|div|tr|td|h\d|li|dt|dd)\b/i.test(tag)) flush();
  }
  flush();
  return out;
}

// Captions as docs/old-site-inventory.json recorded them, by page and picture.
const inventoryCaption = new Map();
for (const im of inventory.images) {
  const k = `${canon(im.page)}|${keyOf(canon(im.fullUrl))}`;
  if (!inventoryCaption.has(k)) inventoryCaption.set(k, []);
  inventoryCaption.get(k).push(im);
}
const FILLER = /We focus on three key areas at Sato engineering|Maecenas lectus nunc|Lorem ipsum/i;
const SKIP_IMG = /\/wp-content\/(themes|plugins)\/|\/wp-includes\//;

const placements = [];
for (const page of pages) {
  const base = byUrl.get(page.url)?.sourceUrl ?? page.url;
  if (page.attachment) {
    // One picture: the original is the "Link to full-size image" in the meta line;
    // the caption is the attachment's caption or description, else its title.
    const h = page.html;
    const fullHref = h.match(/<a\b[^>]*href="([^"]+)"[^>]*title="Link to full-size image"/)?.[1];
    const img = h.match(/<div class="entry-attachment">[\s\S]*?(<img\b[^>]*>)/)?.[1] ?? "";
    const src = canon(attr(img, "src"), base) ?? canon(fullHref, base);
    if (!src) continue;
    const full = canon(fullHref, base) ?? src;
    const caption = [
      [clean(h.match(/<div class="entry-caption">([\s\S]*?)<\/div>/)?.[1] ?? ""), "attachment caption"],
      [clean(h.match(/<div class="entry-description">([\s\S]*?)<\/div>/)?.[1] ?? ""), "attachment description"],
      [page.heading, "attachment title"],
      [attr(img, "alt"), "alt text"],
    ].find(([t]) => meaningful(t));
    placements.push({ page: page.url, pageOrder: page.order, position: 1, src, full, alt: attr(img, "alt") || null, title: attr(img, "title") || null, caption: caption?.[0] ?? null, captionFrom: caption?.[1] ?? null });
    continue;
  }
  const tk = tokens(region(page.html));
  let position = 0;
  const single = tk.filter((x) => x.t === "img").length === 1 && !["home", "category"].includes(page.kind);
  for (let i = 0; i < tk.length; i++) {
    const x = tk[i];
    let src, full, alt = "", title = "", linkTitle = "";
    if (x.t === "img") {
      src = canon(x.src, base);
      if (!src || !isImageUrl(src) || (!page.legacy && SKIP_IMG.test(src))) continue;
      const prev = tk[i - 1];
      const href = prev?.t === "a" ? canon(prev.href, base) : null;
      full = href && isImageUrl(href) ? href : src;
      ({ alt, title } = x);
      linkTitle = prev?.t === "a" ? prev.title : "";
    } else if (x.t === "a" && tk[i + 1]?.t !== "img") {
      // A link straight to an image, with no thumbnail shown.
      const href = canon(x.href, base);
      if (!href || !isImageUrl(href) || SKIP_IMG.test(href)) continue;
      src = full = href;
      linkTitle = x.title;
    } else continue;
    position++;

    let caption = null, captionFrom = null;
    const inv = inventoryCaption.get(`${page.url}|${keyOf(full)}`);
    if (inv) {
      const hit = inv.find((im) => im.position === position) ?? inv[0];
      if (hit.caption) [caption, captionFrom] = [hit.caption, "old-site-inventory.json"];
    }
    if (!caption && page.kind === "home") {
      for (let j = i - 1; j >= 0 && j > i - 5; j--) {
        if (tk[j].t === "img") break;
        if (tk[j].t === "text" && tk[j].v !== "View Details") {
          [caption, captionFrom] = [tk[j].v, "text above"];
          break;
        }
      }
    }
    if (!caption && single && meaningful(page.heading)) [caption, captionFrom] = [page.heading, "page heading"];
    if (!caption && x.t === "img") {
      let j = i + 1;
      if (tk[j]?.t === "a" && !isImageUrl(canon(tk[j].href, base) ?? "https://x/x")) j++;
      const parts = [];
      for (; j < tk.length && tk[j].t === "text"; j++) parts.push(tk[j].v);
      const after = parts.join(" ").replace(/\s*\.\.more$/, "").trim();
      if (after && !FILLER.test(after) && after.length <= 400 && !single) [caption, captionFrom] = [after, "text beside"];
    }
    if (!caption && meaningful(linkTitle)) [caption, captionFrom] = [linkTitle, "link title"];
    if (!caption && meaningful(title)) [caption, captionFrom] = [title, "image title"];
    if (!caption && meaningful(alt)) [caption, captionFrom] = [alt, "alt text"];

    placements.push({ page: page.url, pageOrder: page.order, position, src, full, alt: alt || null, title: title || null, caption, captionFrom });
  }
}

/* --------------------------------------------------------------- pictures */

const imageRecords = records.filter(
  (r) => r.file && (/^image\//i.test(r.contentType ?? "") || IMAGE_EXT.test(path(r.url))) && !/html/i.test(r.contentType ?? ""),
);
const pictures = new Map();
for (const r of imageRecords) {
  const key = keyOf(r.url);
  if (!pictures.has(key)) pictures.set(key, { key, files: [], placements: [] });
  pictures.get(key).files.push(r);
}
for (const pl of placements) {
  const pic = pictures.get(keyOf(pl.full)) ?? pictures.get(keyOf(pl.src));
  if (pic && !pic.placements.some((x) => x.page === pl.page && x.position === pl.position)) pic.placements.push(pl);
}

for (const pic of pictures.values()) {
  for (const f of pic.files) {
    try {
      const m = await sharp(join(MIRROR, f.file)).metadata();
      [f.width, f.height] = (m.orientation ?? 1) >= 5 ? [m.height, m.width] : [m.width, m.height];
    } catch {
      f.width = f.height = null;
    }
  }
  const linked = new Set(pic.placements.map((p) => p.full));
  // The largest copy; on a tie, the one the old site linked to, then the original's own name.
  pic.best = [...pic.files].sort(
    (a, b) =>
      (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0) ||
      linked.has(b.url) - linked.has(a.url) ||
      (b.url === pic.key) - (a.url === pic.key) ||
      a.url.localeCompare(b.url),
  )[0];
  pic.placements.sort((a, b) => a.pageOrder - b.pageOrder || a.position - b.position);
  pic.primary = pic.placements[0] ?? null;
  pic.caption = pic.primary?.caption ?? pic.placements.find((p) => p.caption)?.caption ?? null;
  pic.captionFrom = pic.primary?.caption ? pic.primary.captionFrom : pic.placements.find((p) => p.caption)?.captionFrom ?? null;
  pic.alt = pic.primary?.alt ?? null;

  // What sort of image it is.
  const k = path(pic.key);
  const big = (pic.best.width ?? 0) >= 250 && (pic.best.height ?? 0) >= 180;
  pic.role =
    /\/wp-content\/gallery\//.test(k) ? "equipment"
    : /logo/i.test(k) ? "logo"
    : /banner/i.test(k) && (isUpload(pic.key) || big) ? "banner"
    : isUpload(pic.key) ? "photo"
    : big && !/\.(ico|svg)$/i.test(k) && !/\/(wp-content\/(themes|plugins)|wp-includes)\//.test(k) ? "photo"
    : big && /\/themes\//.test(k) && /pic|building/i.test(k) ? "banner"
    : "site graphic";
  // The 2011 static site: nothing live, and either shown only on its pages or outside wp-content.
  pic.legacy =
    !pic.files.some((f) => f.source === "live") &&
    (pic.placements.length ? pic.placements.every((p) => pageByUrl.get(p.page)?.legacy) : !/\/wp-content\//.test(pic.key));
  if (!pic.primary) {
    // Referenced only from a stylesheet, a feed, or the page template.
    const from = pic.files.flatMap((f) => f.foundOn ?? []).find(Boolean);
    pic.foundOn = from ?? null;
  }
}

/* ----------------------------------------------------------- perceptual hash */

const COS = Array.from({ length: 32 }, (_, k) => Array.from({ length: 32 }, (_, n) => Math.cos(((2 * n + 1) * k * Math.PI) / 64)));
function hashOf(px) {
  const rows = Array.from({ length: 32 }, (_, y) =>
    Array.from({ length: 8 }, (_, u) => {
      let s = 0;
      for (let x = 0; x < 32; x++) s += px[y * 32 + x] * COS[u][x];
      return s;
    }),
  );
  const c = [];
  for (let v = 0; v < 8; v++)
    for (let u = 0; u < 8; u++) {
      let s = 0;
      for (let y = 0; y < 32; y++) s += rows[y][u] * COS[v][y];
      c.push(s);
    }
  const med = [...c.slice(1)].sort((a, b) => a - b)[31];
  return c.map((x) => (x > med ? 1 : 0));
}
const grey = (img) => img.flatten({ background: "#fff" }).greyscale().resize(32, 32, { fit: "fill" }).raw().toBuffer();
const dist = (a, b) => a.reduce((d, bit, i) => d + (bit !== b[i] ? 1 : 0), 0);

/** Upright, downscaled once; whole-frame hash, and crops on demand. */
async function hashable(file) {
  try {
    const { data, info } = await sharp(file, { animated: false })
      .rotate()
      .resize(640, 640, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer({ resolveWithObject: true });
    return { data, w: info.width, h: info.height, ratio: info.width / info.height, whole: hashOf(await grey(sharp(data))), crops: new Map() };
  } catch {
    return null;
  }
}
async function cropHash(h, ratio) {
  const r = Math.round(ratio * 100) / 100;
  if (h.crops.has(r)) return h.crops.get(r);
  let w = h.w, ht = Math.round(h.w / r);
  if (ht > h.h) [ht, w] = [h.h, Math.round(h.h * r)];
  const hash = hashOf(await grey(sharp(h.data).extract({ left: Math.floor((h.w - w) / 2), top: Math.floor((h.h - ht) / 2), width: Math.max(1, w), height: Math.max(1, ht) })));
  h.crops.set(r, hash);
  return hash;
}
/**
 * compare-photo-batch.mjs's distance — whole frame, or this frame cropped to the other's
 * ratio — and the same the other way round, because an old-site banner is often a wide
 * strip cut from a photograph the new site shows whole.
 */
async function distance(h, target) {
  return Math.min(
    dist(h.whole, target.whole),
    dist(await cropHash(h, target.ratio), target.whole),
    dist(h.whole, await cropHash(target, h.ratio)),
  );
}

const walk = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((name) => {
        const full = join(dir, name);
        return statSync(full).isDirectory() ? walk(full) : [full];
      })
    : [];

// Where each public image is used: every "/images/…" string in content/, with the slug it sits under.
// Content no page renders doesn't count: equipment.json (the page was removed), pages/hse.json
// (unregistered) and site.json's heroImages (see docs/content-audit.md).
const UNRENDERED_FILES = new Set(["equipment", "pages/hse"]);
const UNRENDERED_KEYS = { site: new Set(["heroImages"]) };
const usage = new Map();
function collectUsage(node, label, slug, fileLabel) {
  if (typeof node === "string") {
    if (node.startsWith("/images/")) {
      const list = usage.get(node) ?? [];
      list.push({ where: `${fileLabel}${slug ? `:${slug}` : ""}`, file: fileLabel, slug });
      usage.set(node, list);
    }
    return;
  }
  if (Array.isArray(node)) return node.forEach((n) => collectUsage(n, label, slug, fileLabel));
  if (node && typeof node === "object") {
    const s = typeof node.slug === "string" ? node.slug : slug;
    for (const [k, v] of Object.entries(node)) if (!UNRENDERED_KEYS[fileLabel]?.has(k)) collectUsage(v, label, s, fileLabel);
  }
}
for (const f of walk(join(ROOT, "content")).filter((f) => f.endsWith(".json"))) {
  const fileLabel = relative(join(ROOT, "content"), f).replace(/\.json$/, "");
  if (!UNRENDERED_FILES.has(fileLabel)) collectUsage(readJson(f), null, null, fileLabel);
}

console.log("Hashing…");
const publicTargets = [];
for (const f of walk(join(ROOT, "public", "images"))) {
  if (!/\.(webp|jpe?g|png)$/i.test(f) || /-800\./.test(f)) continue;
  const h = await hashable(f);
  if (!h) continue;
  const rel = "/" + relative(join(ROOT, "public"), f).split("\\").join("/");
  publicTargets.push({ file: rel, ...h, used: usage.get(rel) ?? [] });
}
const oldSiteManifest = existsSync(join(ROOT, "raw-assets", "manifest.json")) ? readJson(join(ROOT, "raw-assets", "manifest.json")).images : [];
const oldSiteByKey = new Map(oldSiteManifest.map((m) => [keyOf(canon(m.url)), m.localPath]));
const oldSiteTargets = [];
for (const f of walk(join(ROOT, "raw-assets", "old-site"))) {
  const h = await hashable(f);
  if (h) oldSiteTargets.push({ file: relative(ROOT, f), ...h });
}

for (const pic of pictures.values()) {
  pic.hash = pic.role === "site graphic" ? null : await hashable(join(MIRROR, pic.best.file));
}
const comparable = [...pictures.values()].filter((p) => p.hash);

async function nearest(pic, targets) {
  let best = null;
  for (const t of targets) {
    const d = await distance(pic.hash, t);
    if (!best || d < best.d) best = { t, d };
  }
  return best;
}

// Inventory pictures, keyed as they are in the archive.
const inventoryKeys = new Set(inventory.images.flatMap((im) => [keyOf(canon(im.fullUrl)), keyOf(canon(im.thumbnailUrl))]));
const inventoryPics = comparable.filter((p) => inventoryKeys.has(p.key));

const projectBySlug = new Map(projects.map((p) => [p.slug, p]));
const planByKey = new Map(plan.old.map((o) => [keyOf(canon(o.url)), o]));

for (const pic of comparable) {
  // Same photograph under another filename on the old site.
  pic.sameAs = comparable.filter((o) => o !== pic && dist(o.hash.whole, pic.hash.whole) <= SAME).map((o) => o.key);

  pic.inInventory = inventoryKeys.has(pic.key)
    ? "yes (same URL)"
    : (() => {
        const hit = inventoryPics.find((o) => dist(o.hash.whole, pic.hash.whole) <= SAME);
        return hit ? `yes (same photograph as ${short(hit.key)})` : "no";
      })();

  const o = oldSiteByKey.get(pic.key);
  if (o) pic.inOldSite = `yes (${o})`;
  else {
    const n = await nearest(pic, oldSiteTargets);
    pic.inOldSite = n && n.d <= SAME ? `yes (${n.t.file}, pHash ${n.d})` : "no";
  }

  const n = await nearest(pic, publicTargets);
  pic.nearestPublic = n ? { file: n.t.file, d: n.d, used: n.t.used } : null;
  const matches = [];
  for (const t of publicTargets) {
    const d = await distance(pic.hash, t);
    if (d <= SAME) matches.push({ file: t.file, d, used: t.used });
  }
  pic.publicMatches = matches.sort((a, b) => a.d - b.d);
  // A match made by eye, recorded in review.json, counts as one.
  const byEye = review[pic.key]?.samePhotographAs;
  const t = byEye && publicTargets.find((x) => x.file === byEye);
  if (t) {
    pic.publicMatches.unshift({ file: t.file, d: 0, used: t.used, byEye: true });
    pic.nearestPublic = { file: `${t.file} (by eye)`, d: 0, used: t.used };
  }
}

// An upload the old site never captioned takes the caption of a repeat that has one.
for (const pic of comparable) {
  if (pic.caption) continue;
  const sib = pic.sameAs
    .map((k) => pictures.get(k))
    .filter((o) => o?.caption)
    .sort((a, b) => (a.primary?.pageOrder ?? 9e9) - (b.primary?.pageOrder ?? 9e9))[0];
  if (sib) [pic.caption, pic.captionFrom] = [sib.caption, `same photograph as ${short(sib.key)}`];
}

/* -------------------------------------------------- category, project, why */

const KEYWORDS = [
  [/colplant|plant science/i, "funaab-colplant-building-phase-ii"],
  [/academic building complex/i, "funaab-academic-building-complex-block-b"],
  [/administrative block.*(federal university of agriculture|funaab)/i, "funaab-administrative-block"],
  [/convention cent/i, "mcpherson-convention-centre-conversion"],
  [/mcpherson.*(administrative|laborator)|(administrative|laborator).*mcpherson/i, "mcpherson-administrative-block-and-laboratory"],
  [/seriki|sotayo/i, "mcpherson-seriki-sotayo-roads"],
  [/creative arts/i, "unilag-creative-arts-building"],
  [/mariere/i, "unilag-mariere-retaining-wall"],
  [/horizon/i, "horizon-suites-hotel-complex"],
  [/alabi|olorunda/i, "alabi-olorunda-primary-health-centre"],
  [/obstetric|mowe/i, "obstetrics-care-facility-mowe"],
  [/lock.?up shops|owode/i, "owode-yewa-lock-up-shops"],
  [/school of nursing|ilaro/i, "ilaro-school-of-nursing"],
  [/muda lawal/i, "muda-lawal-stadium"],
  [/affordable housing|choice investors/i, "ogun-state-affordable-housing"],
  [/chalet/i, "jabu-guest-chalets"],
  [/multipurpose hall|abika/i, "abika-multipurpose-hall"],
  [/akinyegun/i, "akinyegun-residential-flats"],
  [/fiditi/i, "fiditi-earth-dam"],
  [/ogere/i, "ogere-water-supply-scheme-rehabilitation"],
  [/sagamu.*road|road.*sagamu/i, "sagamu-intake-roadworks"],
  [/sagamu/i, "sagamu-intake-structure"],
  [/awba/i, "lower-awba-stream-channelization"],
  [/ajagunmolu/i, "ajagunmolu-flood-erosion-control"],
  [/ogungbade/i, "ogungbade-river-dredging"],
  [/ijaiye|ijaye/i, "ijaiye-river-dredging"],
  [/solar powered borehole/i, "solar-powered-boreholes"],
  [/osiele|federal college of education/i, "fce-osiele-campus-roads-and-walkways"],
  [/ijohun|igbokofi/i, "ijohun-igbokofi-road"],
  [/amuwo|lagos state public works/i, "lagos-state-road-rehabilitation"],
  [/life university/i, "asphaltic-concrete-road-and-drainage-ajebo"],
  [/undp|rural road/i, "undp-rural-roads"],
].filter(([, slug]) => projectBySlug.has(slug));

const projectCategory = (slug) => {
  const cats = projectBySlug.get(slug)?.categories ?? [];
  return FACET_TO_CAT[cats.find((c) => FACET_TO_CAT[c])] ?? CAT.none;
};
const planCategory = (target) =>
  /build/.test(target) ? CAT.building : /road|civil/.test(target) ? CAT.civil : /water/.test(target) ? CAT.water : /electr|mechan/.test(target) ? CAT.em : null;

for (const pic of pictures.values()) {
  const page = pic.primary ? pageByUrl.get(pic.primary.page) : null;
  const planned = planByKey.get(pic.key);
  const usedOn = (pic.publicMatches ?? []).flatMap((m) => m.used);
  pic.published = usedOn.length > 0;
  pic.publishedWhere = [...new Set(usedOn.map((u) => u.where))];

  const pagePath = page ? path(page.parent ?? page.url) : "";
  if (pic.role === "photo" && (path(page?.url ?? SITE).startsWith("/equipments/") || pagePath === "/equipments/")) pic.role = "equipment";
  // A company page (awards, team, clients) names organisations, not projects: "Rotaract Club of Osiele".
  const companyPage = page && pageCategory(page) === CAT.company;

  let project = null, projectFrom = null;
  if (pic.role === "photo") {
    const onProject = usedOn.find((u) => u.file === "projects" && projectBySlug.has(u.slug));
    if (onProject) [project, projectFrom] = [onProject.slug, "published on it"];
    else if (planned?.action === "project" && projectBySlug.has(planned.target)) [project, projectFrom] = [planned.target, "content-mirror-plan.json"];
    else if (!companyPage) {
      // The caption where the picture first appears; another page's title for it can disagree.
      const text = `${pic.caption ?? ""} ${page && !page.attachment ? page.heading : ""}`;
      const stem = path(pic.key).split("/").pop().replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
      const hit = KEYWORDS.find(([re]) => re.test(text));
      // A filename names the project only when the old site gave no caption of its own:
      // the "Residential development in Abuja" post's picture is called Horizon_suites.jpg.
      const ownCaption = pic.placements.some((p) => p.caption && kebab(p.caption) !== kebab(stem));
      const byName = ownCaption ? null : KEYWORDS.find(([re]) => re.test(stem));
      if (hit) [project, projectFrom] = [hit[1], "named in the caption"];
      else if (byName) [project, projectFrom] = [byName[1], "named in the filename"];
    }
  }
  pic.project = project;
  pic.projectFrom = projectFrom;

  const usedCategory = usedOn.map((u) => (u.file === "pages/projects" ? FACET_TO_CAT[u.slug] : null)).find(Boolean);
  pic.category =
    pic.role === "site graphic" ? CAT.none
    : ["banner", "logo", "equipment"].includes(pic.role) ? CAT.company
    : project ? projectCategory(project)
    : usedCategory ?? (planned?.action === "category" ? planCategory(planned.target) : null) ?? (page ? pageCategory(page) : CAT.none);
  if (pic.role === "photo" && !project && pic.category === CAT.none) {
    const words = `${pic.caption ?? ""} ${pic.placements.map((p) => p.caption ?? "").join(" ")} ${path(pic.key).split("/").pop().replace(/[_-]+/g, " ")}`;
    const hint = CATEGORY_HINTS.find(([re]) => re.test(words));
    if (hint) pic.category = CAT[hint[1]];
  }
  pic.subfolder =
    project ? project
    : pic.role === "site graphic" ? "site-graphics"
    : pic.role === "banner" ? "site-banners"
    : pic.role === "equipment" ? "equipment"
    : pic.legacy ? "legacy-2011-site"
    : page && pic.category === CAT.company && [page.url, page.parent ?? ""].some((u) => /\/awards\/$/.test(u) || /award|best-|most-|excellent-|unparralled|contributing-immensely|west-africas/.test(u)) ? "awards"
    : null;

  // A judgement holds for every upload of the same photograph.
  const note = review[pic.key] ?? review[pic.best.url] ?? (pic.sameAs ?? []).map((k) => review[k]).find(Boolean);
  pic.review = note ?? null;
  if (pic.published) pic.whyNot = "";
  else if (note?.note) pic.whyNot = note.note;
  else if (planned && planned.action !== "project" && planned.action !== "category")
    pic.whyNot = [planned.action, planned.target && planned.target !== planned.action ? planned.target : null, planned.why ?? planned.note ?? planned.conflict].filter(Boolean).join(" — ");
  else if (pic.role === "site graphic") pic.whyNot = "Site graphic from the old template, not a photograph";
  else if (pic.role === "banner") pic.whyNot = "The old site's header banner; the new site has its own headers";
  else if (pic.role === "logo") pic.whyNot = "The old logo; the new site uses the current mark";
  else if (pic.role === "equipment") pic.whyNot = "No equipment page on the new site (removed on the client's instruction)";
  else if (pic.legacy) pic.whyNot = "From the pre-2012 static site, kept only by the Wayback Machine; never reviewed";
  else if (pic.nearestPublic && pic.nearestPublic.d <= SAME) pic.whyNot = "A copy is in public/images, but no page uses it";
  else if (!pic.placements.some((p) => ["category", "ongoing / news", "home", "post"].includes(pageByUrl.get(p.page)?.kind)))
    pic.whyNot = "Only on an attachment page or a one-photo post of the old site; never reviewed for the new site";
  else pic.whyNot = "Not reviewed for the new site";

  pic.projectPhoto =
    pic.role === "photo" &&
    pic.review?.rule !== "stock image" &&
    (!!project || PROJECT_CATS.has(pic.category) || pic.category === CAT.ongoing || pagePath === "/projects/")
      ? "yes"
      : "no";
  pic.missing =
    pic.role !== "site graphic" && pic.inInventory === "no" && pic.inOldSite === "no" && !(pic.nearestPublic && pic.nearestPublic.d <= SAME);
}

/* ----------------------------------------------------------- write images */

await rm(join(ARCHIVE, "images"), { recursive: true, force: true });
const folders = new Map();
for (const pic of pictures.values()) {
  const folder = [pic.category, pic.subfolder].filter(Boolean).join("/");
  if (!folders.has(folder)) folders.set(folder, []);
  folders.get(folder).push(pic);
}
for (const [folder, list] of folders) {
  list.sort(
    (a, b) =>
      (a.primary?.pageOrder ?? 9e9) - (b.primary?.pageOrder ?? 9e9) ||
      (a.primary?.position ?? 0) - (b.primary?.position ?? 0) ||
      a.key.localeCompare(b.key),
  );
  const width = String(list.length).length > 2 ? 3 : 2;
  const used = new Set();
  await mkdir(join(ARCHIVE, "images", folder), { recursive: true });
  for (const [i, pic] of list.entries()) {
    const ext = extname(path(pic.best.url)).toLowerCase() || ".bin";
    const stem = path(pic.key).split("/").pop().replace(/\.[^.]+$/, "");
    const words = kebab(pic.caption ?? stem);
    let name = `${String(i + 1).padStart(width, "0")}-${words}${ext}`;
    while (used.has(name)) name = name.replace(ext, `-2${ext}`);
    used.add(name);
    pic.newPath = `images/${folder}/${name}`;
    await copyFile(join(MIRROR, pic.best.file), join(ARCHIVE, pic.newPath));
  }
}

/* ------------------------------------------------------------ page texts */

const cfDecode = (hex) => {
  const key = parseInt(hex.slice(0, 2), 16);
  let out = "";
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  return out;
};
function toMarkdown(html, base) {
  const abs = (u) => {
    try {
      return new URL(decode(u), base).href;
    } catch {
      return u;
    }
  };
  let s = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  s = s.replace(/<(a|span)\b[^>]*data-cfemail="([0-9a-f]+)"[^>]*>[\s\S]*?<\/\1>/gi, (_, __, hex) => cfDecode(hex));
  s = s.replace(/<img\b[^>]*>/gi, (tag) => `\n\n![${attr(tag, "alt") || attr(tag, "title")}](${abs(attr(tag, "src"))})\n\n`);
  s = s.replace(/<a\b[^>]*href\s*=\s*(["'])([\s\S]*?)\1[^>]*>([\s\S]*?)<\/a>/gi, (_, __, href, inner) => {
    if (inner.includes("![")) return `${inner}\n[${IMAGE_EXT.test(abs(href).split("?")[0]) ? "(full size)" : "(links to)"}](${abs(href)})\n`;
    const t = clean(inner);
    return t ? `[${t}](${abs(href)})` : "";
  });
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => `\n\n${"#".repeat(+n + 1)} ${clean(t)}\n\n`);
  s = s.replace(/<div class="text24b"[^>]*>([\s\S]*?)<\/div>/gi, (_, t) => `\n\n## ${clean(t)}\n\n`);
  s = s.replace(/<br\s*\/?>/gi, "\n").replace(/<li\b[^>]*>/gi, "\n- ").replace(/<\/t[dh]>/gi, " | ").replace(/<tr\b[^>]*>/gi, "\n| ");
  s = s.replace(/<\/(p|div|ul|ol|table|tr|section|article)>/gi, "\n\n").replace(/<[^>]+>/g, "");
  return decode(s)
    .split("\n")
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

await rm(join(ARCHIVE, "pages"), { recursive: true, force: true });
await mkdir(join(ARCHIVE, "pages"), { recursive: true });
const usedPageNames = new Set();
for (const page of pages) {
  const u = new URL(page.url);
  let name = (u.pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "--") || "home") + (u.search ? "@" + u.search.slice(1) : "");
  name = name.replace(/[^\w.@=-]+/g, "-").slice(0, 140);
  while (usedPageNames.has(name)) name += "-2";
  usedPageNames.add(name);
  page.textFile = `pages/${name}.md`;
  const sourceLine = page.source === "live" ? `live site, HTTP 200` : `Wayback Machine snapshot ${page.source.split(":")[1]} (${page.waybackUrl}); the live site answered ${page.liveStatus}`;
  const head = [
    `# ${page.heading || page.title || short(page.url)}`,
    "",
    `- URL: ${page.url}`,
    `- Page title: ${page.title}`,
    `- Kind: ${page.kind}${page.id ? ` (WordPress ID ${page.id})` : ""}${page.post ? `, posted ${page.post.date.toISOString().slice(0, 10)}` : ""}`,
    `- Source: ${sourceLine}`,
    `- Saved as: mirror/${page.file}`,
    page.aliases.length ? `- Also reached at: ${page.aliases.join(", ")}` : null,
    "",
    "---",
    "",
  ].filter((l) => l !== null);
  await writeFile(join(ARCHIVE, page.textFile), head.join("\n") + toMarkdown(region(page.html), byUrl.get(page.url)?.sourceUrl ?? page.url) + "\n");
}

/* ----------------------------------------------------------------- index */

const list = [...pictures.values()].sort((a, b) => a.newPath.localeCompare(b.newPath));
const pageLabel = (pic) => (pic.primary ? short(pic.primary.page) : pic.foundOn ? `(referenced from ${short(pic.foundOn)})` : "(not on any page)");
const alsoOn = (pic) => [...new Set(pic.placements.slice(1).map((p) => `${short(p.page)} #${p.position}`))];

await writeFile(
  join(ARCHIVE, "index.csv"),
  csv([
    ["new_path", "original_url", "copied_from_url", "other_copies", "page", "position", "also_on", "caption", "caption_from", "alt", "role", "category", "project", "project_from", "project_photo", "width", "height", "bytes", "source", "in_inventory", "in_raw_assets_old_site", "nearest_public_image", "published", "published_where", "why_not", "same_photograph_as", "rule_check"],
    ...list.map((p) => [
      p.newPath,
      p.key,
      p.best.url,
      p.files.filter((f) => f !== p.best).map((f) => f.url).join(" "),
      pageLabel(p),
      p.primary?.position ?? "",
      alsoOn(p).join("; "),
      p.caption,
      p.captionFrom,
      p.alt,
      p.role,
      p.category,
      p.project,
      p.projectFrom,
      p.projectPhoto,
      p.best.width,
      p.best.height,
      p.best.bytes,
      p.best.source,
      p.inInventory ?? "—",
      p.inOldSite ?? "—",
      p.nearestPublic ? `${p.nearestPublic.file} (${p.nearestPublic.d})` : "",
      p.published ? "yes" : "no",
      p.publishedWhere.join("; "),
      p.whyNot,
      (p.sameAs ?? []).map(short).join(" "),
      p.review ? `${p.review.rule}${p.review.note ? `: ${p.review.note}` : ""}` : "",
    ]),
  ]),
);

await writeFile(
  join(ARCHIVE, "pages.csv"),
  csv([
    ["title", "url", "saved_file", "text_file", "kind", "wordpress_id", "source", "live_status", "wayback_snapshot", "also_reached_at"],
    ...pages.map((p) => [p.title, p.url, `mirror/${p.file}`, p.textFile, p.kind, p.id, p.source, p.liveStatus, p.waybackUrl, p.aliases.join(" ")]),
  ]),
);

// Sizes and counts.
const sizeOf = (dir) => walk(dir).reduce((n, f) => n + statSync(f).size, 0);
const countOf = (dir) => walk(dir).length;
const mb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;
const mirrorFiles = walk(MIRROR);
const stats = {
  total: sizeOf(ARCHIVE),
  totalFiles: countOf(ARCHIVE),
  mirror: { bytes: sizeOf(MIRROR), files: mirrorFiles.length, orig: mirrorFiles.filter((f) => f.endsWith(".orig")).length },
  images: { bytes: sizeOf(join(ARCHIVE, "images")), files: countOf(join(ARCHIVE, "images")) },
  pages: pages.length,
  imageFilesInMirror: imageRecords.length,
  uploadsFiles: imageRecords.filter((r) => isUpload(r.url)).length,
  pictures: pictures.size,
  byRole: Object.fromEntries([...new Set(list.map((p) => p.role))].map((r) => [r, list.filter((p) => p.role === r).length])),
  fromWayback: records.filter((r) => r.file && r.source?.startsWith("wayback")).length,
  failed: records.filter((r) => r.state === "failed" && r.via !== "derivative-probe"),
};
// One row per photograph: repeat uploads of the same picture are named in its row.
const missing = [];
for (const p of list.filter((x) => x.missing)) {
  const first = missing.find((m) => m.sameAs?.includes(p.key));
  if (first) (first.repeats ??= []).push(p);
  else missing.push(p);
}

const L = [];
L.push(
  "# Old satoengineering.com — archive index",
  "",
  `Generated ${new Date().toISOString().slice(0, 10)} by \`scripts/organise-old-site-archive.mjs\` from the crawl made by \`scripts/archive-old-site.mjs\` (${manifest.summary.started.slice(0, 10)}). How it was made: \`docs/old-site-archive.md\` in the repository.`,
  "",
  "## Summary",
  "",
  `| | |`,
  `|---|---:|`,
  `| Whole archive | ${mb(stats.total)}, ${stats.totalFiles} files |`,
  `| \`mirror/\` (the site as served, links converted) | ${mb(stats.mirror.bytes)}, ${stats.mirror.files} files (${stats.mirror.orig} of them \`.orig\` copies of rewritten HTML/CSS) |`,
  `| \`images/\` (one file per picture) | ${mb(stats.images.bytes)}, ${stats.images.files} files |`,
  `| Pages saved (\`pages/*.md\`) | ${stats.pages} |`,
  `| Image files in the mirror | ${stats.imageFilesInMirror} (${stats.uploadsFiles} under wp-content/uploads/) |`,
  `| Distinct pictures | ${stats.pictures} — ${Object.entries(stats.byRole).map(([r, n]) => `${n} ${r}`).join(", ")} |`,
  `| Files that came from the Wayback Machine | ${stats.fromWayback} |`,
  `| URLs that failed live and on the Wayback Machine | ${stats.failed.length} |`,
  "",
  "## Completeness check",
  "",
  `Every picture (site graphics aside) was compared with \`docs/old-site-inventory.json\` (${inventory.images.length} project-page images), \`raw-assets/old-site/\` (${oldSiteTargets.length} files) and \`public/images/\` (${publicTargets.length} files, \`-800\` copies aside) by URL and by pHash (≤ ${SAME} of 64 is the same photograph). **${list.filter((p) => p.missing).length} files, ${missing.length} distinct pictures, are in none of them.** None has been published; the helmet rule, the children exclusion and one photo, one place still apply to any of them.`,
  "",
  "| File | Old-site page | Caption | Project photo | Rule check | Nearest published (pHash) |",
  "|---|---|---|---|---|---|",
  ...missing.map(
    (p) =>
      `| [${p.newPath.split("/").pop()}](${encodeURI(p.newPath)})${p.repeats ? ` (also uploaded as ${p.repeats.map((r) => `[${r.newPath.split("/").pop()}](${encodeURI(r.newPath)})`).join(", ")})` : ""} | ${md(pageLabel(p))}${p.primary ? ` #${p.primary.position}` : ""} | ${md(p.caption ?? "—")} | ${p.projectPhoto}${p.project ? ` (${p.project})` : ""} | ${md(p.review ? `${p.review.rule}${p.review.note ? ` — ${p.review.note}` : ""}` : "not yet checked")} | ${p.nearestPublic ? `${md(p.nearestPublic.file)} (${p.nearestPublic.d}${p.nearestPublic.d <= NEAR ? ", worth a look by eye" : ""})` : "—"} |`,
  ),
  "",
  "## Folder layout",
  "",
  "```",
  "mirror/www.satoengineering.com/   the site, browsable offline (open index.html)",
  "endpoints/                        feed, sitemap and REST probes, Wayback index",
  "crawl/manifest.json               every URL: how it was found, redirects, status, source",
  "crawl/id-scan.json                /?p=N for every N",
  "images/<category>/<project>/      one file per picture, named <nn>-<caption>",
  "pages/*.md                        the text of every page",
  "index.csv, pages.csv              the two tables below",
  "```",
  "",
  "| Folder | Files |",
  "|---|---:|",
  ...[...folders.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([f, l]) => `| images/${f}/ | ${l.length} |`),
  "",
  "## Endpoints",
  "",
  "| Endpoint | Result |",
  "|---|---|",
  ...readJson(join(ARCHIVE, "endpoints", "endpoints.json")).map((e) => `| ${md(e.endpoint)} | ${md(String(e.status))}${e.savedAs ? ` — \`${e.savedAs}\`` : ""}${e.note ? ` — ${md(e.note)}` : ""}${e.urls ? ` — ${e.urls} URLs` : ""} |`),
  "",
  "## Images",
  "",
  "Published means a copy (pHash ≤ 10) is in `public/images/` and a page of the new site uses it.",
  "",
  "| New path | Original URL | Page | # | Caption | Alt | Project | Published | Why not |",
  "|---|---|---|---:|---|---|---|---|---|",
  ...list.map(
    (p) =>
      `| [${md(p.newPath.replace(/^images\//, ""))}](${encodeURI(p.newPath)}) | ${md(short(p.key))}${p.best.url !== p.key ? ` (copied from ${md(short(p.best.url))})` : ""} | ${md(pageLabel(p))} | ${p.primary?.position ?? ""} | ${md(p.caption ?? "")} | ${md(p.alt ?? "")} | ${md(p.project ?? "")} | ${p.published ? `yes — ${md(p.publishedWhere.join(", "))}` : "no"} | ${md(p.whyNot)} |`,
  ),
  "",
  "## Pages",
  "",
  "| Title | URL | Saved file | Source | Text |",
  "|---|---|---|---|---|",
  ...pages.map(
    (p) =>
      `| ${md(p.heading || p.title)} | ${md(short(p.url))}${p.aliases.length ? ` (also ${md(p.aliases.slice(0, 3).join(", "))}${p.aliases.length > 3 ? "…" : ""})` : ""} | \`mirror/${md(p.file)}\` | ${p.source === "live" ? "live" : `Wayback ${p.source.split(":")[1]} (live: ${p.liveStatus})`} | [${p.textFile.replace("pages/", "")}](${encodeURI(p.textFile)}) |`,
  ),
  "",
  "## Failed URLs",
  "",
  "Neither the live site nor the Wayback Machine had these (the ID scan and the derivative-size probes are guesses and are not listed).",
  "",
  // Grouped by folder: the 2011 site's pages each had a *_files/ folder of furniture.
  ...Object.entries(
    stats.failed.reduce((g, r) => {
      const dir = short(r.url).replace(/[^/]*$/, "");
      (g[dir] ??= []).push(r);
      return g;
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([dir, rs]) =>
      rs.length > 3
        ? [`- ${dir} — ${rs.length} files (${rs.slice(0, 4).map((r) => short(r.url).slice(dir.length)).join(", ")}…) — live ${[...new Set(rs.map((r) => r.liveStatus))].join("/")}, Wayback: ${[...new Set(rs.map((r) => r.waybackError ?? "not asked"))].join("; ")}`]
        : rs.map((r) => `- ${short(r.url)} — live ${r.liveStatus}${r.waybackError ? `, Wayback: ${r.waybackError}` : ""}${r.foundOn?.length ? ` (linked from ${short(r.foundOn[0])})` : ""}`),
    ),
  "",
);
await writeFile(join(ARCHIVE, "INDEX.md"), L.join("\n"));

console.log(
  JSON.stringify(
    {
      total: mb(stats.total),
      totalFiles: stats.totalFiles,
      mirror: `${mb(stats.mirror.bytes)}, ${stats.mirror.files} files`,
      images: `${mb(stats.images.bytes)}, ${stats.images.files} files`,
      pages: stats.pages,
      pictures: stats.pictures,
      byRole: stats.byRole,
      fromWayback: stats.fromWayback,
      failed: stats.failed.length,
      missing: missing.map((p) => `${p.newPath}${p.repeats ? ` (+${p.repeats.length} repeat)` : ""} | ${p.role} | ${short(p.primary?.page ?? p.foundOn ?? "")} | ${p.caption ?? "—"} | ${p.best.width}x${p.best.height} | nearest ${p.nearestPublic?.file} (${p.nearestPublic?.d})`),
      folders: Object.fromEntries([...folders.entries()].map(([f, l]) => [f, l.length])),
    },
    null,
    2,
  ),
);
