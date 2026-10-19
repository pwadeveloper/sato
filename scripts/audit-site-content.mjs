#!/usr/bin/env node
/**
 * The content audit for docs/decisions/mirror-old-site-content.md.
 *
 *   node scripts/audit-site-content.mjs              # write docs/content-audit.md
 *   node scripts/audit-site-content.mjs --baseline   # also record today's counts as "before"
 *
 * Compares what the new site publishes (content/*.json) with the old site
 * (docs/old-site-inventory.json) under the decisions in
 * scripts/content-mirror-plan.json, and writes:
 *
 *   docs/content-audit.md    one section per old-site category page, then the
 *                            rest of the new site; summary counts at the top
 *   docs/caption-changes.md  every old caption, title and narrative next to
 *                            the cleaned version the site uses
 *
 * A photograph's identity is found two ways, and the two are merged:
 *   1. provenance — scripts/image-map.json (old-site files) and the manifest's
 *      `approved` list (client-batch files, header crops included)
 *   2. a 64-bit DCT perceptual hash of every published file (distance <= 8)
 * so a 1920px original from the client's batch and the old site's 600px copy
 * count as the same photograph, and so does a header cropped from either.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const OLD_BASE = "https://www.satoengineering.com/wp-content/uploads/";
const short = (u) => u.replace(OLD_BASE, "");

const inv = read("docs/old-site-inventory.json");
const plan = read("scripts/content-mirror-plan.json");
const imageMap = read("scripts/image-map.json").images;
const approved = read("scripts/client-photo-manifest.json").approved ?? [];
const projects = read("content/projects.json");

/* ---------- identity ---------- */

// Batch working IDs that are the full-size original of an old-site photo.
const batchToOld = new Map(plan.old.filter((o) => o.batch).map((o) => [o.batch, o.url]));
// Old-site URLs that are a second copy of another old-site photo.
const alias = new Map(plan.old.filter((o) => ["duplicate", "teaser"].includes(o.action)).map((o) => [o.url, OLD_BASE + o.target]));
const canon = (url) => alias.get(url) ?? url;

function identity(src) {
  const a = approved.find((x) => x.src === src);
  if (a) {
    if (a.oldSite) return canon(a.oldSite);
    return batchToOld.has(a.workingId) ? canon(batchToOld.get(a.workingId)) : a.workingId;
  }
  const m = imageMap.find((x) => `/images/${x.out}.webp` === src);
  if (m) {
    if (/^\d{4}\/\d{2}\//.test(m.source)) return canon(OLD_BASE + m.source);
    if (m.source.startsWith("hero/")) return `AI-generated: ${m.source}`;
    if (m.source.startsWith("oil-gas/")) return `oil & gas artwork: ${m.source}`;
    return m.source;
  }
  return `unknown: ${src}`;
}

/* ---------- where the new site shows each image ---------- */

const places = []; // { src, place, role, caption, alt }
function add(src, place, role, img) { if (src?.startsWith("/images/")) places.push({ src, place, role, caption: img.caption ?? null, alt: img.alt ?? "" }); }
for (const p of projects) p.images.forEach((img) => add(img.src, `project:${p.slug}`, "project", img));
for (const s of read("content/services.json")) {
  if (s.image) add(s.image.src, `service-header:${s.slug}`, "header", s.image);
  (s.images ?? []).forEach((img) => add(img.src, `service-gallery:${s.slug}`, "gallery", img));
  const walk = (n) => { if (Array.isArray(n)) n.forEach(walk); else if (n && typeof n === "object") { if (n.image?.src) add(n.image.src, `service-section:${s.slug}`, "section", n.image); Object.values(n).forEach(walk); } };
  walk(s.sections);
}
for (const f of readdirSync(join(ROOT, "content", "pages"))) {
  const page = read(`content/pages/${f}`);
  const slug = f.replace(".json", "");
  for (const [k, img] of Object.entries(page.images ?? {})) add(img.src, k === "header" || k === "hero" ? `page-header:${slug}` : `page-band:${slug}.${k}`, k === "header" || k === "hero" ? "header" : "tile", img);
  for (const [k, set] of Object.entries(page.imageSets ?? {})) set.forEach((img) => add(img.src, `page-photos:${slug}.${k}`, "gallery", img));
  const walk = (n) => { if (Array.isArray(n)) n.forEach(walk); else if (n && typeof n === "object") { if (n.image?.src && n !== page.images) add(n.image.src, `page-section:${slug}`, "section", n.image); Object.values(n).forEach(walk); } };
  walk(page.serviceSections);
  if (slug === "projects") {
    for (const f2 of page.sections.find((s) => s.id === "all-projects").facets) {
      if (f2.image) add(f2.image.src, `tile:${f2.value}`, "tile", f2.image);
      (f2.placeholderImages ?? []).forEach((img) => add(img.src, `stand-in:${f2.value}`, "stand-in", img));
      (f2.photos ?? []).forEach((img) => add(img.src, `category-photos:${f2.value}`, "category", img));
      for (const sub of f2.subcategories ?? []) {
        (sub.placeholderImages ?? []).forEach((img) => add(img.src, `stand-in:${f2.value}/${sub.id}`, "stand-in", img));
        (sub.photos ?? []).forEach((img) => add(img.src, `category-photos:${f2.value}/${sub.id}`, "category", img));
      }
    }
  }
}

/* ---------- perceptual hash: merge identities that are the same frame ---------- */

const COS = Array.from({ length: 32 }, (_, k) => Array.from({ length: 32 }, (_, n) => Math.cos(((2 * n + 1) * k * Math.PI) / 64)));
async function phash(file) {
  const px = await sharp(file).flatten({ background: "#fff" }).greyscale().resize(32, 32, { fit: "fill" }).raw().toBuffer();
  const rows = Array.from({ length: 32 }, (_, y) => Array.from({ length: 8 }, (_, u) => { let s = 0; for (let x = 0; x < 32; x++) s += px[y * 32 + x] * COS[u][x]; return s; }));
  const c = [];
  for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) { let s = 0; for (let y = 0; y < 32; y++) s += rows[y][u] * COS[v][y]; c.push(s); }
  const med = [...c.slice(1)].sort((a, b) => a - b)[31];
  return c.map((x) => (x > med ? 1 : 0));
}
const srcs = [...new Set(places.map((p) => p.src))];
const hashes = new Map();
for (const s of srcs) if (existsSync(join(ROOT, "public", s))) hashes.set(s, await phash(join(ROOT, "public", s)));
const idOf = new Map(srcs.map((s) => [s, identity(s)]));
const parent = new Map();
const find = (x) => { while (parent.has(x) && parent.get(x) !== x) x = parent.get(x); return x; };
for (let i = 0; i < srcs.length; i++) for (let j = i + 1; j < srcs.length; j++) {
  const a = hashes.get(srcs[i]), b = hashes.get(srcs[j]);
  if (!a || !b) continue;
  let d = 0; for (let k = 0; k < 64; k++) if (a[k] !== b[k]) d++;
  if (d <= 8) { const x = find(idOf.get(srcs[i])), y = find(idOf.get(srcs[j])); if (x !== y) parent.set(y, x); }
}
const photo = (src) => find(idOf.get(src));

/* ---------- problems ---------- */

const PROBLEM = ["Duplicate", "Wrong project", "Missing photo", "Missing or changed caption", "Missing narrative", "New-site extra", "Projects"];
const issues = []; // { type, section, old, oldWhere, now, problem, fix }
const oldByUrl = new Map(plan.old.map((o) => [o.url, o]));
const invByUrl = new Map();
for (const i of inv.images) { if (!invByUrl.has(i.fullUrl)) invByUrl.set(i.fullUrl, []); invByUrl.get(i.fullUrl).push(i); }
const placesOf = (key) => places.filter((p) => photo(p.src) === key);
const fmtPlaces = (ps) => ps.length ? [...new Set(ps.map((p) => p.place))].join("<br>") : "—";
const sectionOf = (url) => {
  const pages = (invByUrl.get(url) ?? []).map((i) => i.page.replace("https://www.satoengineering.com", ""));
  if (pages.some((p) => p === "/building-and-construction/")) return "Buildings";
  if (pages.some((p) => p === "/water-supply-and-water-resources/")) return "Water Resources";
  if (pages.some((p) => p === "/civil-eng-road-projects/")) return "Roads & Pavements";
  return "Ongoing projects, project pages and home page";
};
const oldWhere = (url) => (invByUrl.get(url) ?? []).map((i) => `${i.page.replace("https://www.satoengineering.com", "")} #${i.position}`).join("<br>");
const oldCell = (o) => `[${short(o.url)}](${o.url})<br>“${o.original ?? o.caption ?? "no caption"}”`;
const fixFor = (o) => ({
  project: `On **${o.target}**${o.batch ? ` (full-size original ${o.batch})` : ""}, caption beneath`,
  category: `In the **${o.target}** photographs on the category page${o.batch ? ` (full-size original ${o.batch})` : ""}`,
  excluded: `Not published — ${o.target}: ${o.why}`,
  held: `Held — ${o.why}`,
  duplicate: `Same photograph as ${o.target}; placed once`,
  teaser: `Category teaser on /projects/, a repeat of ${o.target}; not mirrored`,
}[o.action]);

// Photographs the old site shows.
for (const o of plan.old) {
  const key = canon(o.url);
  const section = sectionOf(o.url);
  if (["duplicate", "teaser"].includes(o.action)) continue;
  const ps = placesOf(key);
  const want = o.action === "project" ? `project:${o.target}` : o.action === "category" ? `category-photos:${o.target}` : null;
  const content = ps.filter((p) => ["project", "category", "gallery", "stand-in", "section"].includes(p.role));
  if (want && !ps.some((p) => p.place === want)) {
    issues.push({ type: "Missing photo", section, old: oldCell(o), oldWhere: oldWhere(o.url), now: fmtPlaces(ps), problem: ps.length ? "Not where the old site puts it" : "Not on the new site", fix: fixFor(o) });
  }
  if (!want && o.action !== "excluded" && o.action !== "held") continue;
  if (!want && ps.length === 0) {
    issues.push({ type: "Missing photo", section, old: oldCell(o), oldWhere: oldWhere(o.url), now: "—", problem: "Not on the new site", fix: fixFor(o) });
  }
  if (!want && ps.length) {
    issues.push({ type: "Wrong project", section, old: oldCell(o), oldWhere: oldWhere(o.url), now: fmtPlaces(ps), problem: o.action === "held" ? "Published, but held for the client" : "Published, but excluded under a standing rule", fix: fixFor(o) });
  }
  for (const p of content) {
    if (want && p.place !== want && p.role === "project") issues.push({ type: "Wrong project", section, old: oldCell(o), oldWhere: oldWhere(o.url), now: p.place, problem: `The old site places it on ${o.target}`, fix: fixFor(o) });
  }
  const at = ps.find((p) => p.place === want);
  if (at && (at.caption ?? null) !== (o.caption ?? null)) {
    issues.push({ type: "Missing or changed caption", section, old: oldCell(o), oldWhere: oldWhere(o.url), now: `${at.place}<br>${at.caption ? `“${at.caption}”` : "no caption"}`, problem: at.caption ? "Caption differs" : "No caption under the photograph", fix: `Caption: “${o.caption}”` });
  }
}

// Every photograph shown in more than one place.
const ROLE_OK = new Set(["header", "tile"]);
for (const key of new Set(places.map((p) => photo(p.src)))) {
  const ps = placesOf(key);
  const distinct = [...new Set(ps.map((p) => p.place))];
  if (distinct.length < 2) continue;
  const projectPlaces = distinct.filter((d) => d.startsWith("project:"));
  const roles = ps.filter((p) => ROLE_OK.has(p.role));
  const others = distinct.filter((d) => !d.startsWith("project:") && !ps.find((p) => p.place === d && ROLE_OK.has(p.role)));
  // Oil & Gas is outside this round: its artwork stays exactly where it is.
  const oilGas = key.startsWith("oil & gas");
  const allowed = oilGas || (projectPlaces.length === 1 && others.length === 0 && new Set(roles.map((r) => r.place)).size <= 1);
  const o = oldByUrl.get(key);
  issues.push({
    type: allowed ? "Duplicate (allowed)" : "Duplicate",
    section: o ? sectionOf(key) : "Elsewhere on the new site",
    old: o ? oldCell(o) : `${key}`,
    oldWhere: o ? oldWhere(key) : "—",
    now: fmtPlaces(ps),
    problem: oilGas ? "Oil & Gas artwork, unchanged by rule (allowed)" : allowed ? "A project's photograph also used as one tile or header (allowed)" : `Shown in ${distinct.length} places`,
    fix: o ? `One place: ${fixFor(o)}` : "One place only",
  });
}

// New-site photographs the old site doesn't have.
for (const key of new Set(places.map((p) => photo(p.src)))) {
  if (oldByUrl.has(key)) continue;
  const b = plan.batch.find((x) => x.id === key);
  const ps = placesOf(key);
  const source = b ? "Client batch, October 2026 (prompt 16)" : key.startsWith("AI-generated") ? "AI-generated image" : key.startsWith("oil & gas") ? "Oil & Gas artwork (unchanged by rule)" : key;
  const fix = b
    ? { kept: "Kept (High confidence, on a project the old site has) — for the client to confirm", service: "Kept off projects, in a service role (High in prompt 16)", held: `Held — ${b.why}` }[b.action]
    : key.startsWith("AI-generated") ? "Kept: the AI images on Home, About and Leadership are not project photographs"
    : key.startsWith("oil & gas") ? "Kept: Oil & Gas is unchanged" : "Check";
  issues.push({ type: b?.action === "kept" ? "New-site extra (kept, High confidence)" : "New-site extra", section: "Elsewhere on the new site", old: `${key}${b?.caption ? `<br>“${b.caption}”` : ""}`, oldWhere: source, now: fmtPlaces(ps), problem: "Not on the old site", fix });
}

// Narratives and project details.
for (const [slug, t] of Object.entries(plan.projects)) {
  const p = projects.find((x) => x.slug === slug);
  if (!p) continue;
  if (t.summary && p.summary !== t.summary) issues.push({ type: "Missing narrative", section: "Project text", old: `“${t.summaryOriginal ?? t.summary}”`, oldWhere: (t.sources ?? []).join("<br>"), now: `${slug}<br>“${p.summary}”`, problem: "Old-site narrative not on the new site", fix: "Use the old narrative, cleaned" });
  if (t.scope && JSON.stringify(p.scope) !== JSON.stringify(t.scope)) issues.push({ type: "Missing narrative", section: "Project text", old: t.scope.join("<br>"), oldWhere: (t.sources ?? []).join("<br>"), now: `${slug} scope<br>${p.scope.join("<br>") || "—"}`, problem: "Old-site scope list not on the new site", fix: "Use the old scope list" });
  for (const k of ["title", "client", "location"]) if (t[k] && p[k] !== t[k]) issues.push({ type: "Projects", section: "Project text", old: t[`${k}Original`] ?? t[k], oldWhere: "Old-site project table", now: `${slug} ${k}<br>“${p[k] || "—"}”`, problem: `${k[0].toUpperCase() + k.slice(1)} differs from the old site`, fix: `${k}: “${t[k]}”` });
}
const PROJECT_DIFFS = [
  ["New site only", "Reefer Pavement Works — APM Terminals Apapa", "From the client's information form; not on the old site", "Keep (client's own information)"],
  ["New site only", "Supply, Delivery and Installation of Immersion and Ultrasonic Bulk Meters — USAID E-WASH", "From the client's information form", "Keep"],
  ["New site only", "Administrative Block, Federal University of Agriculture, Abeokuta", "Old site has its photographs but no table row", "Keep"],
  ["New site only", "Asphaltic Concrete Road & Drainage System — Life University, Ajebo", "Old site has its photographs but no table row", "Keep"],
  ["New site only", "Conversion of Convention Centre to Staff Quarters — McPherson University", "Old site: Ongoing Projects and a news post, no table row", "Keep"],
  ["New site only", "Affordable Housing, Ogun State — Choice Investors", "Old site: a news post only", "Keep"],
  ["Merged on the new site", "Construction of Laboratory Building + Construction of Administrative Block (McPherson)", "Two table rows, one project", "Keep merged; for the client to confirm"],
  ["Merged on the new site", "Supply of Prepayment Meters + Supply of Electromagnetic Bulk Meters", "Two table rows, one project", "Keep merged; for the client to confirm"],
  ["Merged on the new site", "Procurement of Domestic Meters + Procurement of Bulk Meters", "Two table rows, one project", "Keep merged; for the client to confirm"],
  ["Merged on the new site", "Construction of 32nos + 3nos of Solar Powered Boreholes", "Two table rows (different clients), one project", "Keep merged; for the client to confirm"],
  ["Old site only", "Housing estate in Abeokuta (30 duplexes, 60 bungalows, 90 studios …)", "News post, May 2010: “awarded a contract to design and develop”", "Not added — for the client"],
  ["Old site only", "Mini water supply scheme (borehole), Oladerin Village, Kobape", "News post, November 2010 (corporate social responsibility)", "Not added — for the client"],
  ["Old site only", "Mr. Lekan Omololu’s residential development, Abeokuta", "One captioned photograph, no table row", "Photograph shown under Buildings; project for the client"],
  ["Old site only", "Sato office in Abeokuta", "Two captioned photographs on the Buildings page", "Photographs shown under Buildings"],
];
for (const [kind, name, where, fix] of PROJECT_DIFFS) issues.push({ type: "Projects", section: "Projects on one site only", old: name, oldWhere: where, now: kind, problem: kind, fix });

/* ---------- write ---------- */

const counts = Object.fromEntries([...PROBLEM, "Duplicate (allowed)", "New-site extra (kept, High confidence)"].map((t) => [t, issues.filter((i) => i.type === t).length]));
const BASE = join(ROOT, "scripts", "content-audit-baseline.json");
if (process.argv.includes("--baseline")) writeFileSync(BASE, JSON.stringify({ recordedAt: new Date().toISOString().slice(0, 10), counts }, null, 2) + "\n");
const before = existsSync(BASE) ? JSON.parse(readFileSync(BASE, "utf8")) : null;

const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const SECTIONS = ["Buildings", "Roads & Pavements", "Water Resources", "Ongoing projects, project pages and home page", "Elsewhere on the new site", "Project text", "Projects on one site only"];
const lines = [
  "# Content audit: old site against new site",
  "",
  "Generated by `node scripts/audit-site-content.mjs` from `docs/old-site-inventory.json` (the live old site, captured 2026-10-19), `content/*.json` and the decisions in `scripts/content-mirror-plan.json`. The brief is `docs/decisions/mirror-old-site-content.md`.",
  "",
  "A photograph is matched by provenance and by perceptual hash, so the old site's 600px copy and the full-size original from the client's batch count as the same photograph, and so does a header cropped from either. The old site's own repeats count as one photograph: one picture appears as both `IMG_20190430_1230211.jpg` and `IMG_20190430_123021.jpg`, and another as both `34.jpg` and `23.jpg`.",
  "",
  "## Summary",
  "",
  before ? `| Problem | Before (${before.recordedAt}) | Now |` : "| Problem | Count |",
  before ? "|---|---:|---:|" : "|---|---:|",
  ...Object.entries(counts).map(([k, v]) => (before ? `| ${k} | ${before.counts[k] ?? 0} | ${v} |` : `| ${k} | ${v} |`)),
  "",
  "**Counted as allowed:** a project's photograph also used as one category tile or one page header. **Missing photo** includes old-site photographs that stay off the site under a standing rule (no helmets, a legible former company name) or wait on the client; the Fix column says which.",
  "",
];
for (const sec of SECTIONS) {
  const rows = issues.filter((i) => i.section === sec);
  if (!rows.length) continue;
  lines.push(`## ${sec}`, "", "| Old site: image + caption | Old site: page / project | New site: where it appears now | Problem | Fix |", "|---|---|---|---|---|");
  for (const r of rows) lines.push(`| ${esc(r.old)} | ${esc(r.oldWhere)} | ${esc(r.now)} | **${r.type}** — ${esc(r.problem)} | ${esc(r.fix)} |`);
  lines.push("");
}
lines.push("## Not on the published pages", "", "`site.json` → `heroImages` and `equipment.json` reference images, but no page renders them, so they are not counted.", "");
writeFileSync(join(ROOT, "docs", "content-audit.md"), lines.join("\n"));

/* ---------- caption changes ---------- */
const cc = [
  "# Caption, title and narrative changes",
  "",
  "Every old-site caption, project title and narrative the new site uses, next to the version it shows. The only changes allowed are: ALL CAPS to sentence case (proper nouns and acronyms kept), clear typos, and taking out the country and the former company name (“by Sato Engineering Nigeria Limited” → “by Sato”). If any change below alters the meaning, say which and it goes back.",
  "",
  "## Photograph captions",
  "",
  "| Old site, exactly as written | New site | What changed |",
  "|---|---|---|",
];
const why = (a, b) => {
  const w = [];
  if (a === a.toUpperCase() && /[A-Z]/.test(a)) w.push("sentence case");
  if (/NIGERIA/i.test(a)) w.push("country and former name removed");
  if (/SUB-BASESE|PROGRS|Stalked|CCONSTRUCTION|McPhersonUniversity|Plan Science| Of /.test(a)) w.push("typo fixed");
  return w.join("; ") || (a === b ? "unchanged" : "spacing");
};
const seen = new Set();
for (const o of plan.old.filter((x) => (x.action === "project" || x.action === "category") && x.caption)) {
  const a = o.original ?? o.caption;
  if (seen.has(a + o.caption)) continue;
  seen.add(a + o.caption);
  cc.push(`| ${esc(a)} | ${esc(o.caption)} | ${why(a, o.caption)} |`);
}
cc.push("", "## Captions for photographs the old site doesn't have", "", "Kept new photographs (High confidence) take their caption from the client's own Word document, or from his filename where the document has none.", "", "| Photograph | Caption | Source |", "|---|---|---|");
for (const b of plan.batch.filter((x) => x.action === "kept" && x.caption)) cc.push(`| ${b.id} | ${esc(b.caption)} | ${esc(b.source)} |`);
cc.push("", "## Project titles", "", "| Old site | New site |", "|---|---|");
for (const t of Object.values(plan.projects)) if (t.title) cc.push(`| ${esc(t.titleOriginal ?? t.title)} | ${esc(t.title)} |`);
cc.push("", "Two old titles repeat (“Dredging of River” and “Construction of Several classrooms” each appear twice); “Dredging of River, Omi Ogungbade” keeps the location the table gives so the two dredging projects can be told apart, as “Dredging of River, Ijaiye” already did.", "", "## Narratives", "");
for (const [slug, t] of Object.entries(plan.projects)) if (t.summary) cc.push(`### ${slug}`, "", `**Old:** ${t.summaryOriginal}`, "", `**New:** ${t.summary}`, "", ...(t.omitted ? [`**Not mirrored:** ${t.omitted}`, ""] : []));
writeFileSync(join(ROOT, "docs", "caption-changes.md"), cc.join("\n") + "\n");

console.log(Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(" · "));
