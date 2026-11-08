#!/usr/bin/env node
/**
 * Archives the old satoengineering.com (WordPress 3.3.2) before it is taken
 * down. See docs/old-site-archive.md.
 *
 *   node scripts/archive-old-site.mjs                    the whole archive
 *   node scripts/archive-old-site.mjs --endpoints-only   just endpoints/
 *   node scripts/archive-old-site.mjs --retry-wayback    re-ask the Wayback Machine
 *                                                        for what failed last time
 *
 * Writes everything under raw-assets/old-site-archive/ (gitignored):
 *
 *   mirror/www.satoengineering.com/  the site, laid out the way
 *       `wget --mirror --page-requisites --adjust-extension --convert-links
 *       --no-parent` lays it out: `/about-us/` → `about-us/index.html`, a
 *       query string kept in the filename after `@`. Links in HTML and CSS are
 *       rewritten to relative paths afterwards; the bytes as served are kept
 *       beside each rewritten file as `<name>.orig` (wget's -K).
 *   endpoints/   the RSS feed (every page of it), wp-sitemap.xml, the REST API
 *                and the Wayback Machine's URL index, saved whatever they
 *                returned, with endpoints.json recording each status.
 *   crawl/manifest.json   one record per URL: how it was found, every
 *                redirect hop, the live status, where the saved copy came
 *                from (`live` or `wayback:<timestamp>`) and the saved file.
 *   crawl/id-scan.json    what `/?p=N` returned for every N.
 *
 * Wget isn't installed on the machine this was written for, so this does the
 * same job in Node with nothing but fetch. The uploads directory is not
 * listable (403), so the uploads tree is rebuilt from five sources:
 *   1. every reference in every page, stylesheet and feed;
 *   2. every attachment WordPress will name: `/?p=N` redirects any public
 *      post, page or attachment to its permalink, so walking N = 1…MAX_ID
 *      finds attachment pages nothing links to;
 *   3. the Wayback Machine's index of the domain;
 *   4. the original of every resized copy (`name-400x300.jpg` → `name.jpg`)
 *      and of every rotated one (`name-e1345298741956.jpg` → `name.jpg`);
 *   5. WordPress's own derivative sizes, probed for every original.
 *
 * A URL that fails live (an error status, a network error or a redirect
 * loop) is fetched from its latest 200 snapshot on the Wayback Machine, and
 * the record says so. The ID scan and the derivative probes are guesses, so
 * a miss there is logged, not chased.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const OUT = join(ROOT, "raw-assets", "old-site-archive");
const MIRROR = join(OUT, "mirror");
const HOST = "www.satoengineering.com";
const ORIGIN = `https://${HOST}`;
const UA = "SatoArchive/1.0 (Sato Engineering's own site, archived before it is decommissioned)";
const CONCURRENCY = 4;
const MAX_ID_FLOOR = 1500; // highest ID seen on the site in Nov 2026 was 1357
const ID_MARGIN = 150;
const WAYBACK_GAP_MS = 1500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const now = () => new Date().toISOString();

/* ------------------------------------------------------------------ URLs */

const decodeEntities = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#038;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"');

/** On-site URL in one canonical form, or null for anything off-site or unusable. */
function canon(raw, base = ORIGIN + "/") {
  if (!raw) return null;
  const s = decodeEntities(raw.trim());
  if (!s || /^(#|mailto:|javascript:|tel:|data:|about:)/i.test(s) || /[<>]|\?php/.test(s)) return null;
  let u;
  try {
    u = new URL(s, base);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol) || !/(^|\.)satoengineering\.com$/i.test(u.hostname)) return null;
  u.protocol = "https:";
  u.hostname = HOST;
  u.port = "";
  u.hash = "";
  return u.href;
}

/** URLs never fetched: the admin, comment posting, Cloudflare's email shim. */
const SKIP = [
  /\/wp-admin\b/, /\/wp-login\.php/, /wp-comments-post\.php/, /[?&]replytocom=/, /\/trackback\/?$/,
  /\/cdn-cgi\/l\//, /[?&]share=/, /[?&]action=/,
];
const skipped = (url) => SKIP.some((re) => re.test(url));

const isUpload = (url) => /\/wp-content\/uploads\//.test(url);
const isImage = (url) => /\.(jpe?g|png|gif|webp|bmp|svg|ico|tiff?)(\?|$)/i.test(url);

/** wget's layout: directory URLs get index.html, query strings go after `@`. */
function localPath(url, contentType = "") {
  const u = new URL(url);
  let p = u.pathname
    .split("/")
    .map((seg) => {
      try {
        return decodeURIComponent(seg);
      } catch {
        return seg;
      }
    })
    .map((seg) => seg.replace(/[\\:*"<>|]/g, "_"))
    .join("/");
  const html = /html/i.test(contentType);
  const xml = /xml|rss|atom/i.test(contentType) && !html;
  if (p.endsWith("/")) p += html ? "index.html" : xml ? "index.xml" : "index";
  if (u.search) p += "@" + u.search.slice(1).replace(/[/\\:*"<>|]/g, "_");
  if (html && !/\.html?$/i.test(p)) p += ".html";
  if (/text\/css/i.test(contentType) && !/\.css$/i.test(p)) p += ".css";
  return posix.join(HOST, p.replace(/^\/+/, ""));
}

/* ---------------------------------------------------------------- fetch */

async function fetchOnce(url, extra = {}) {
  return fetch(url, {
    redirect: "manual",
    headers: { "user-agent": UA, accept: "*/*" },
    signal: AbortSignal.timeout(90_000),
    ...extra,
  });
}

/**
 * GET with every redirect hop recorded. On-site redirects are followed (up
 * to 10, and a URL seen twice is a loop); an off-site one is reported, not
 * followed. Network errors, 429 and 5xx are retried with backoff.
 */
async function get(url, { follow = true } = {}) {
  const chain = [];
  let cur = url;
  for (let hop = 0; hop <= 10; hop++) {
    let res, err;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        res = await fetchOnce(cur);
        if (res.status === 429 || res.status >= 500) {
          err = `HTTP ${res.status}`;
          await res.arrayBuffer().catch(() => {});
          res = null;
        } else break;
      } catch (e) {
        err = e.cause?.code || e.name || String(e);
      }
      if (attempt < 3) await sleep([2000, 5000, 12000][attempt]);
    }
    if (!res) return { url, chain, error: err };
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = new URL(res.headers.get("location") ?? "", cur).href;
      await res.arrayBuffer().catch(() => {});
      chain.push({ url: cur, status: res.status, location });
      if (!follow) return { url, chain, status: res.status, location };
      if (chain.some((c) => c.url === location)) return { url, chain, loop: true };
      if (!canon(location)) return { url, chain, offsite: location };
      cur = location;
      continue;
    }
    const body = Buffer.from(await res.arrayBuffer());
    return {
      url,
      chain,
      finalUrl: cur,
      status: res.status,
      body,
      contentType: res.headers.get("content-type") ?? "",
      lastModified: res.headers.get("last-modified") ?? null,
    };
  }
  return { url, chain, loop: true };
}

let lastWayback = 0;
async function waybackThrottle() {
  const wait = lastWayback + WAYBACK_GAP_MS - Date.now();
  lastWayback = Math.max(Date.now(), lastWayback + WAYBACK_GAP_MS);
  if (wait > 0) await sleep(wait);
}

/**
 * The latest snapshot of `url` the Wayback Machine holds with status 200, as
 * originally served. A capture that won't replay falls back to the one
 * before it, up to three.
 */
async function wayback(url) {
  const u = new URL(url);
  const key = `satoengineering.com${u.pathname}${u.search}`;
  const cdx = await waybackGet(
    `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(key)}&output=json&filter=statuscode:200&fl=timestamp,original,mimetype`,
  );
  if (!cdx.body || cdx.status !== 200) return { error: `cdx ${cdx.status ?? cdx.error}` };
  let rows;
  try {
    rows = JSON.parse(cdx.body.toString() || "[]").slice(1);
  } catch {
    return { error: "cdx unreadable" };
  }
  if (!rows.length) return { error: "no 200 snapshot" };
  const tried = [];
  for (const [timestamp, original, mimetype] of rows.reverse().slice(0, 3)) {
    // `id_` returns the bytes as archived, without the Wayback toolbar or rewritten links.
    const snap = await waybackGet(`https://web.archive.org/web/${timestamp}id_/${original}`);
    if (snap.body && snap.status === 200) return { timestamp, original, body: snap.body, contentType: snap.contentType || mimetype };
    tried.push(`${timestamp}: ${snap.status ?? snap.error}`);
  }
  return { error: `no capture would replay (${tried.join(", ")})` };
}

/** One Wayback request, spaced from the last, and retried when it is rate-limited. */
async function waybackGet(url) {
  let r;
  for (const backoff of [20_000, 60_000, 120_000, null]) {
    await waybackThrottle();
    r = await getOffsite(url);
    if (r.status !== 429 && !(r.status >= 500) && !r.error) return r;
    if (backoff) await sleep(backoff);
  }
  return r;
}

/** Wayback snapshots redirect within web.archive.org; follow those. */
async function getOffsite(url) {
  let cur = url;
  for (let hop = 0; hop < 8; hop++) {
    let res;
    try {
      res = await fetch(cur, { redirect: "manual", headers: { "user-agent": UA }, signal: AbortSignal.timeout(90_000) });
    } catch (e) {
      return { error: e.cause?.code || e.name };
    }
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      cur = new URL(res.headers.get("location"), cur).href;
      await res.arrayBuffer().catch(() => {});
      continue;
    }
    return { status: res.status, body: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get("content-type") ?? "" };
  }
  return { error: "too many redirects" };
}

/* ---------------------------------------------------------------- state */

/** url → record. A record is created when a URL is first queued. */
const records = new Map();
const queue = [];
const idScan = [];
const externalRefs = new Map(); // off-site URL → pages that reference it
const waybackHas = new Set(); // every URL in the Wayback Machine's index of the domain
const usedFiles = new Map(); // local file → url, to catch two URLs landing on one file

function enqueue(url, { from = null, via }) {
  if (!url || skipped(url)) return;
  const rec = records.get(url);
  if (rec) {
    if (from && rec.foundOn.length < 20 && !rec.foundOn.includes(from)) rec.foundOn.push(from);
    return;
  }
  records.set(url, { url, via, foundOn: from ? [from] : [], state: "queued" });
  queue.push({ url });
}

/* ------------------------------------------------------------- discovery */

const ON_SITE_ABS = /https?:\/\/(?:www\.)?satoengineering\.com(?::\d+)?[^\s"'<>()\\\]]*/gi;

function refsInHtml(html) {
  const refs = [];
  for (const m of html.matchAll(/\b(?:href|src|background|data-src|data-original|poster)\s*=\s*(["'])([\s\S]*?)\1/gi)) refs.push(m[2]);
  for (const m of html.matchAll(/\bsrcset\s*=\s*(["'])([\s\S]*?)\1/gi))
    for (const part of m[2].split(",")) refs.push(part.trim().split(/\s+/)[0]);
  // Flash movies name their file in <param name="movie" value="…">.
  for (const m of html.matchAll(/<param\b[^>]*\bvalue\s*=\s*(["'])([^"']+\.(?:swf|flv|jpe?g|png|gif))\1/gi)) refs.push(m[2]);
  for (const m of html.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) refs.push(m[2]);
  // Absolute on-site URLs anywhere else, e.g. a slider's image list in inline script.
  for (const m of html.matchAll(ON_SITE_ABS)) refs.push(trimProse(m[0]));
  return refs;
}

function refsInCss(css) {
  const refs = [];
  for (const m of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) refs.push(m[2]);
  for (const m of css.matchAll(/@import\s+(['"])([^'"]+)\1/gi)) refs.push(m[2]);
  return refs;
}

/** A URL lifted out of running text can carry the sentence's punctuation. */
const trimProse = (u) => u.replace(/[.,;:!?'"]+$/, "");
const refsInXml = (xml) => [...xml.matchAll(ON_SITE_ABS)].map((m) => trimProse(m[0].replace(/&amp;/g, "&")));

function externalOf(raw, base) {
  try {
    const u = new URL(decodeEntities(raw.trim()), base);
    if (/^https?:$/.test(u.protocol) && !/satoengineering\.com$/i.test(u.hostname)) return u.href;
  } catch {
    /* not a URL */
  }
  return null;
}

/** Queue what a saved file references, and the originals behind any resized upload. */
function discover(rec, text, kind) {
  const base = rec.sourceUrl ?? rec.url;
  const refs = kind === "html" ? refsInHtml(text) : kind === "css" ? refsInCss(text) : refsInXml(text);
  for (const raw of refs) {
    const url = canon(raw, base);
    if (url) enqueue(url, { from: rec.url, via: "link" });
    else if (kind === "html" && isImage(raw)) {
      const ext = externalOf(raw, base);
      if (ext) {
        const list = externalRefs.get(ext) ?? [];
        if (!list.includes(rec.url)) list.push(rec.url);
        externalRefs.set(ext, list);
      }
    }
  }
}

/** `name-400x300.jpg` and `name-e1345298741956.jpg` both come from `name.jpg`. */
function originalsOf(url) {
  if (!isUpload(url)) return [];
  const out = new Set();
  const unsized = url.replace(/-\d+x\d+(\.[a-z0-9]+)$/i, "$1");
  if (unsized !== url) out.add(unsized);
  for (const u of [url, unsized]) {
    const unedited = u.replace(/-e\d{10,}(\.[a-z0-9]+)$/i, "$1");
    if (unedited !== u) out.add(unedited);
  }
  return [...out];
}

/* ------------------------------------------------------------- handling */

async function store(rec, { body, contentType, source, lastModified, sourceUrl }) {
  let file = localPath(rec.url, contentType);
  const owner = usedFiles.get(file);
  if (owner && owner !== rec.url) file = file.replace(/(\.[a-z0-9]+)?$/i, `@dup${usedFiles.size}$1`);
  usedFiles.set(file, rec.url);
  const full = join(MIRROR, file);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, body);
  Object.assign(rec, { state: "done", file, bytes: body.length, contentType, source, lastModified: lastModified ?? null });
  if (sourceUrl) rec.sourceUrl = sourceUrl;

  const text = () => body.toString("utf8");
  if (/html/i.test(contentType)) discover(rec, text(), "html");
  else if (/text\/css/i.test(contentType) || /\.css(\?|$)/.test(rec.url)) discover(rec, text(), "css");
  else if (/xml|rss|atom/i.test(contentType)) discover(rec, text(), "xml");

  for (const orig of originalsOf(rec.url)) enqueue(orig, { from: rec.url, via: "original-of" });

  // The feed lists ten posts at a time; walk its pages until one is empty.
  const feedPage = rec.url.match(/^https:\/\/www\.satoengineering\.com\/feed\/(?:\?paged=(\d+))?$/);
  if (feedPage && /<item>/.test(text())) enqueue(`${ORIGIN}/feed/?paged=${(+feedPage[1] || 1) + 1}`, { from: rec.url, via: "feed-page" });
}

/** Chased to the Wayback Machine when the live site fails them. */
const CHASE = new Set(["seed", "link", "cdx", "original-of", "id", "redirect"]);

async function handle({ url }) {
  const rec = records.get(url);
  if (!rec || rec.state !== "queued") return; // already saved as another URL's redirect target
  rec.state = "fetching";
  rec.fetchedAt = now();
  const live = await get(url);
  rec.chain = live.chain;
  rec.liveStatus = live.loop ? "redirect-loop" : live.offsite ? "redirect-offsite" : live.error ? `error:${live.error}` : live.status;

  if (live.offsite) {
    Object.assign(rec, { state: "done", redirectTo: live.offsite, source: "live" });
    return;
  }
  if (live.status === 200) {
    const final = canon(live.finalUrl);
    if (final && final !== url) {
      // Save the content under the URL it lives at, and note the alias.
      rec.state = "done";
      rec.redirectTo = final;
      rec.source = "live";
      const target = records.get(final);
      if (target && target.state !== "queued") return;
      if (!target) records.set(final, { url: final, via: "redirect", foundOn: [url], state: "queued" });
      const t = records.get(final);
      t.fetchedAt = now();
      t.liveStatus = 200;
      t.chain = [];
      await store(t, { body: live.body, contentType: live.contentType, source: "live", lastModified: live.lastModified });
      return;
    }
    await store(rec, { body: live.body, contentType: live.contentType, source: "live", lastModified: live.lastModified });
    return;
  }

  // Failed live: 4xx, a loop, or an error that outlasted the retries.
  // WordPress's 404 page stays out of the mirror; the status is in the manifest.
  await fromWayback(rec);
}

/** Ask the Wayback Machine for a URL the live site failed, if its index of the domain holds it. */
async function fromWayback(rec) {
  rec.state = "failed";
  if (!CHASE.has(rec.via)) return;
  if (waybackHas.size && !waybackHas.has(rec.url)) {
    rec.waybackError = "not in the Wayback Machine's index";
    return;
  }
  const wb = await wayback(rec.url);
  if (!wb.body) {
    rec.waybackError = wb.error;
    return;
  }
  delete rec.waybackError;
  await store(rec, { body: wb.body, contentType: wb.contentType, source: `wayback:${wb.timestamp}`, sourceUrl: wb.original });
  rec.waybackUrl = `https://web.archive.org/web/${wb.timestamp}/${wb.original}`;
}

/** `/?p=N` for one N: a redirect names a post, page or attachment. */
async function scanId(id) {
  const r = await get(`${ORIGIN}/?p=${id}`, { follow: false });
  if (r.status === 301 || r.status === 302) {
    const target = canon(r.location);
    // A draft's permalink is `?p=N` itself, so it redirects to its own query (the loop).
    const self = target && new URL(target).searchParams.get("p") === String(id);
    idScan.push({ id, status: r.status, location: r.location, note: self ? "draft or private (redirects to itself)" : undefined });
    if (target && !self) enqueue(target, { from: `${ORIGIN}/?p=${id}`, via: "id" });
  } else {
    idScan.push({ id, status: r.status ?? `error:${r.error}` });
  }
}

/* ----------------------------------------------------------- endpoints */

async function captureEndpoints() {
  const dir = join(OUT, "endpoints");
  await mkdir(dir, { recursive: true });
  // Each endpoint counts only if it answers with the type it should: WordPress
  // 3.3 ignores an unknown `rest_route` and serves the home page with a 200.
  const XML = /xml|rss/i, JSON_ = /json/i, TEXT = /text\/plain/i;
  const list = [
    ["feed-rss2.xml", "/?feed=rss2", XML],
    ["wp-sitemap.xml", "/wp-sitemap.xml", XML],
    ["sitemap.xml", "/sitemap.xml", XML],
    ["robots.txt", "/robots.txt", TEXT],
    ["wp-json-pages.json", "/wp-json/wp/v2/pages?per_page=100", JSON_],
    ["wp-json-posts.json", "/wp-json/wp/v2/posts?per_page=100", JSON_],
    ["wp-json-media.json", "/wp-json/wp/v2/media?per_page=100", JSON_],
    ["rest-route-pages.json", "/?rest_route=/wp/v2/pages&per_page=100", JSON_],
    ["rest-route-posts.json", "/?rest_route=/wp/v2/posts&per_page=100", JSON_],
    ["rest-route-media.json", "/?rest_route=/wp/v2/media&per_page=100", JSON_],
  ];
  const results = [];
  for (const [name, path, type] of list) {
    const r = await get(ORIGIN + path);
    const ok = r.status === 200 && type.test(r.contentType ?? "");
    // A 404 here is WordPress's themed error page; save only the real thing.
    if (ok) await writeFile(join(dir, name), r.body);
    else await rm(join(dir, name), { force: true });
    results.push({
      endpoint: path,
      status: r.loop ? "redirect-loop" : r.status ?? `error:${r.error}`,
      finalUrl: r.finalUrl ?? null,
      redirects: r.chain.map((c) => `${c.status} → ${c.location}`),
      contentType: r.contentType ?? null,
      savedAs: ok ? `endpoints/${name}` : null,
      note: ok
        ? undefined
        : r.status === 200
          ? "Answered with the home page, not an API response: WordPress 3.3.2 ignores the unknown query variable"
          : "Not available: WordPress 3.3.2 predates the REST API (4.7) and wp-sitemap.xml (5.5)",
    });
    if (ok) {
      const url = canon(ORIGIN + path);
      if (/xml|rss/.test(r.contentType ?? "")) for (const ref of refsInXml(r.body.toString())) enqueue(canon(ref), { from: url, via: "seed" });
    }
  }
  // The Wayback Machine's index of every URL it holds for the domain.
  const cdx = await waybackGet(
    "https://web.archive.org/cdx/search/cdx?url=satoengineering.com&matchType=domain&output=json&fl=original,mimetype,statuscode,timestamp&collapse=urlkey",
  );
  if (cdx.status === 200) {
    await writeFile(join(dir, "wayback-cdx.json"), cdx.body);
    const rows = JSON.parse(cdx.body.toString()).slice(1);
    for (const [original, , status] of rows) {
      // Redirect records and `?p=` aliases resolve live through the ID scan.
      if (status === "200" || status === "404" || status === "-") enqueue(canon(original), { via: "cdx" });
      // The index keeps each URL's earliest capture, so any status counts here;
      // wayback() asks for the latest 200 itself.
      if (canon(original)) waybackHas.add(canon(original));
    }
    results.push({ endpoint: "Wayback CDX index (domain)", status: 200, savedAs: "endpoints/wayback-cdx.json", urls: rows.length });
  } else {
    results.push({ endpoint: "Wayback CDX index (domain)", status: cdx.status ?? cdx.error });
  }
  // satoeng.com is the company's earlier domain. The Wayback Machine holds its
  // pages but none of their images (they are the 2011 site's index_files/).
  const pred = await waybackGet(
    "https://web.archive.org/cdx/search/cdx?url=satoeng.com&matchType=domain&output=json&fl=original,mimetype,statuscode,timestamp&collapse=urlkey",
  );
  if (pred.status === 200) {
    await mkdir(join(dir, "satoeng.com"), { recursive: true });
    await writeFile(join(dir, "satoeng.com", "wayback-cdx.json"), pred.body);
    for (const [original, mimetype, status, timestamp] of JSON.parse(pred.body.toString()).slice(1)) {
      if (status !== "200") continue;
      const snap = await waybackGet(`https://web.archive.org/web/${timestamp}id_/${original}`);
      const u = new URL(original);
      const name = `${(u.pathname.replace(/^\/|\/$/g, "").replace(/\//g, "--") || "home")}-${timestamp}${/html/.test(mimetype) ? ".html" : ""}`;
      if (snap.status === 200) await writeFile(join(dir, "satoeng.com", name), snap.body);
      results.push({
        endpoint: `satoeng.com (earlier domain): ${original}`,
        status: snap.status ?? snap.error,
        savedAs: snap.status === 200 ? `endpoints/satoeng.com/${name}` : null,
        note: `Wayback Machine capture ${timestamp}`,
      });
    }
  }
  await writeFile(join(dir, "endpoints.json"), JSON.stringify(results, null, 2) + "\n");
  return results;
}

/* ------------------------------------------------- WordPress derivatives */

/**
 * WordPress 3.3 makes `name-150x150` (cropped), and fits `medium` in 300×300
 * and `large` in 1024×1024 when the original is bigger. Dimension rounding
 * changed between versions, so both floor and round are tried.
 */
async function probeDerivatives() {
  const originals = [...records.values()].filter(
    (r) => r.state === "done" && isUpload(r.url) && /\.(jpe?g|png|gif)$/i.test(r.url) && !/-\d+x\d+\.[a-z]+$/i.test(r.url),
  );
  let queued = 0;
  for (const r of originals) {
    let meta;
    try {
      meta = await sharp(join(MIRROR, r.file)).metadata();
    } catch {
      continue;
    }
    const { width: w, height: h } = meta;
    const names = new Set();
    if (w > 150 || h > 150) names.add("150x150");
    for (const box of [300, 1024]) {
      if (w <= box && h <= box) continue;
      const ratio = Math.min(box / w, box / h);
      for (const f of [Math.floor, Math.round]) {
        let nw = f(w * ratio), nh = f(h * ratio);
        if (nw === box - 1) nw = box;
        if (nh === box - 1) nh = box;
        names.add(`${nw}x${nh}`);
      }
    }
    for (const size of names) {
      const url = r.url.replace(/(\.[a-z0-9]+)$/i, `-${size}$1`);
      if (!records.has(url)) {
        enqueue(url, { from: r.url, via: "derivative-probe" });
        queued++;
      }
    }
  }
  return queued;
}

/* ---------------------------------------------------------- convert-links */

function relLink(fromFile, toFile) {
  let rel = posix.relative(posix.dirname(fromFile), toFile);
  if (!rel) rel = posix.basename(toFile);
  return rel.split("/").map((seg) => encodeURIComponent(seg).replace(/%40/g, "@")).join("/");
}

/** Rewrite on-site links to the saved copies, wget-style; anything not saved becomes absolute. */
async function convertLinks() {
  const fileOf = (url) => {
    for (let i = 0, u = url; u && i < 12; i++) {
      const r = records.get(u);
      if (!r) return null;
      if (r.file) return r.file;
      u = r.redirectTo && canon(r.redirectTo);
    }
    return null;
  };
  let converted = 0;
  for (const rec of records.values()) {
    if (rec.state !== "done" || !rec.file) continue;
    const isHtml = /html/i.test(rec.contentType);
    const isCss = /text\/css/i.test(rec.contentType) || /\.css(@|$)/.test(rec.file);
    if (!isHtml && !isCss) continue;
    const full = join(MIRROR, rec.file);
    // Always convert from the bytes as served, so a second run can't stack on the first.
    const original = await readFile(existsSync(full + ".orig") ? full + ".orig" : full, "utf8");
    const base = rec.sourceUrl ?? rec.url;
    const map = (raw) => {
      const url = canon(raw, base);
      if (!url) return raw;
      const target = fileOf(url);
      const hash = decodeEntities(raw).match(/#.*$/)?.[0] ?? "";
      return target ? relLink(rec.file, target) + hash : url + hash;
    };
    let out = original;
    if (isHtml) {
      out = out.replace(/\b(href|src|background|data-src|poster)(\s*=\s*)(["'])([\s\S]*?)\3/gi, (m, a, eq, q, v) => `${a}${eq}${q}${map(v)}${q}`);
      out = out.replace(/(<param\b[^>]*\bvalue\s*=\s*)(["'])([^"']+)\2/gi, (m, pre, q, v) => `${pre}${q}${map(v)}${q}`);
    }
    out = out.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (m, q, v) => `url(${q}${map(v)}${q})`);
    if (isCss) out = out.replace(/(@import\s+)(['"])([^'"]+)\2/gi, (m, pre, q, v) => `${pre}${q}${map(v)}${q}`);
    if (out !== original) {
      if (!existsSync(full + ".orig")) await writeFile(full + ".orig", original);
      await writeFile(full, out);
      rec.converted = true;
      converted++;
    }
  }
  return converted;
}

/* ------------------------------------------------------------------ run */

async function drain(label) {
  let done = 0;
  const tick = setInterval(() => {
    console.log(`  [${label}] ${done} fetched, ${queue.length} queued, ${records.size} known`);
  }, 30_000);
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (;;) {
        const item = queue.shift();
        if (!item) {
          if (!queue.length && inFlight === 0) return;
          await sleep(300);
          continue;
        }
        inFlight++;
        try {
          if (item.id !== undefined) await scanId(item.id);
          else await handle(item);
        } catch (e) {
          const rec = item.url && records.get(item.url);
          if (rec) Object.assign(rec, { state: "failed", error: String(e?.stack ?? e) });
        } finally {
          inFlight--;
          done++;
        }
      }
    }),
  );
  clearInterval(tick);
}
let inFlight = 0;

async function writeManifest(summary) {
  const all = [...records.values()];
  Object.assign(summary, {
    finished: now(),
    userAgent: UA,
    urls: all.length,
    saved: all.filter((r) => r.state === "done" && r.file).length,
    fromLive: all.filter((r) => r.file && r.source === "live").length,
    fromWayback: all.filter((r) => r.file && r.source?.startsWith("wayback")).length,
    redirects: all.filter((r) => r.redirectTo).length,
    failed: all.filter((r) => r.state === "failed" && r.via !== "derivative-probe").length,
    derivativeProbes: { tried: all.filter((r) => r.via === "derivative-probe").length, found: all.filter((r) => r.via === "derivative-probe" && r.file).length },
    idScan: {
      max: idScan.length ? Math.max(...idScan.map((x) => x.id)) : 0,
      resolved: idScan.filter((x) => x.location && !x.note).length,
      drafts: idScan.filter((x) => x.note).length,
    },
  });
  await writeFile(
    join(OUT, "crawl", "manifest.json"),
    JSON.stringify({ summary, records: all.sort((a, b) => a.url.localeCompare(b.url)), externalImages: Object.fromEntries(externalRefs) }, null, 2) + "\n",
  );
  await writeFile(join(OUT, "crawl", "id-scan.json"), JSON.stringify(idScan.sort((a, b) => a.id - b.id), null, 2) + "\n");
  console.log(JSON.stringify(summary, null, 2));
}

/**
 * `--retry-wayback`: load the last crawl and ask the Wayback Machine again
 * for every URL that failed live and didn't get a straight "no snapshot"
 * answer (a rate limit, a capture that wouldn't replay). Nothing live is
 * fetched again except what a recovered page newly links to.
 */
async function retryWayback() {
  const prev = JSON.parse(await readFile(join(OUT, "crawl", "manifest.json"), "utf8"));
  for (const r of prev.records) {
    records.set(r.url, r);
    if (r.file) usedFiles.set(r.file, r.url);
  }
  for (const [k, v] of Object.entries(prev.externalImages ?? {})) externalRefs.set(k, v);
  idScan.push(...JSON.parse(await readFile(join(OUT, "crawl", "id-scan.json"), "utf8")));
  const index = join(OUT, "endpoints", "wayback-cdx.json");
  for (const [original] of JSON.parse(await readFile(index, "utf8")).slice(1)) if (canon(original)) waybackHas.add(canon(original));
  const retry = [...records.values()].filter((r) => r.state === "failed" && r.waybackError && r.waybackError !== "no 200 snapshot");
  console.log(`Retrying ${retry.length} URLs on the Wayback Machine…`);
  for (const rec of retry) await fromWayback(rec);
  await drain("retry");
  console.log("Converting links…");
  const converted = await convertLinks();
  await writeManifest({ ...prev.summary, waybackRetried: now(), convertedFiles: converted });
}

async function main() {
  const started = now();
  await mkdir(join(OUT, "crawl"), { recursive: true });
  if (process.argv.includes("--retry-wayback")) return retryWayback();
  console.log("Endpoints and Wayback index…");
  const endpoints = await captureEndpoints();
  // `--endpoints-only` refreshes endpoints/ without crawling again.
  if (process.argv.includes("--endpoints-only")) return console.log(endpoints.map((e) => `${e.endpoint}: ${e.status}`).join("\n"));

  // Seeds: the home page, every page the earlier inventory captured, and the feed.
  enqueue(`${ORIGIN}/`, { via: "seed" });
  enqueue(`${ORIGIN}/feed/`, { via: "seed" });
  const inventory = join(ROOT, "docs", "old-site-inventory.json");
  if (existsSync(inventory)) for (const p of JSON.parse(await readFile(inventory, "utf8")).pages) enqueue(canon(p.url), { via: "seed" });

  console.log("Crawling links…");
  await drain("crawl");

  // The ID scan runs after the crawl so its ceiling can follow the highest ID seen.
  let maxSeen = 0;
  for (const rec of records.values()) {
    if (!rec.file || !/html|xml/.test(rec.contentType ?? "")) continue;
    const text = await readFile(join(MIRROR, rec.file), "utf8");
    for (const m of text.matchAll(/(?:wp-image-|[?&](?:p|page_id|attachment_id)=)(\d+)/g)) maxSeen = Math.max(maxSeen, +m[1]);
  }
  const maxId = Math.max(MAX_ID_FLOOR, maxSeen + ID_MARGIN);
  console.log(`Scanning /?p=1…${maxId} (highest ID referenced: ${maxSeen})…`);
  for (let id = 1; id <= maxId; id++) queue.push({ id });
  await drain("ids");

  console.log("Probing WordPress's derivative sizes…");
  const probes = await probeDerivatives();
  console.log(`  ${probes} candidate names`);
  await drain("derivatives");

  console.log("Converting links…");
  const converted = await convertLinks();
  await writeManifest({ started, convertedFiles: converted, endpoints: endpoints.map((e) => `${e.endpoint}: ${e.status}`) });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
