#!/usr/bin/env node
/**
 * Perceptual-hash matching for the content audit
 * (docs/decisions/mirror-old-site-content.md).
 *
 *   node scripts/match-site-images.mjs
 *
 * Hashes three sets and writes raw-assets/audit/image-matches.json:
 *
 *   old    every photograph on the old site (docs/old-site-inventory.json),
 *          from its full-size file in raw-assets/old-site/
 *   batch  the October 2026 client batch (raw-assets/client-photos/_work/all/)
 *   new    every image the new site references from /content
 *
 * and reports, for each new-site image, which old-site photo it is (if any)
 * and where else on the new site the same photograph appears; for each
 * old-site photo, the closest batch file (a higher-resolution original, when
 * there is one).
 *
 * The hash is a 64-bit DCT pHash of the whole frame, so a crop of a photo can
 * land further away than the same frame resized. Header crops are therefore
 * traced by provenance (scripts/client-photo-manifest.json) as well.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SAME = 10; // bits of 64: the same photograph
const NEAR = 16; // worth a look by eye

const COS = Array.from({ length: 32 }, (_, k) => Array.from({ length: 32 }, (_, n) => Math.cos(((2 * n + 1) * k * Math.PI) / 64)));
async function phash(file) {
  const px = await sharp(file, { animated: false }).flatten({ background: "#fff" }).greyscale().resize(32, 32, { fit: "fill" }).raw().toBuffer();
  const rows = Array.from({ length: 32 }, (_, y) => Array.from({ length: 8 }, (_, u) => { let s = 0; for (let x = 0; x < 32; x++) s += px[y * 32 + x] * COS[u][x]; return s; }));
  const c = [];
  for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) { let s = 0; for (let y = 0; y < 32; y++) s += rows[y][u] * COS[v][y]; c.push(s); }
  const med = [...c.slice(1)].sort((a, b) => a - b)[31];
  return c.map((x) => (x > med ? "1" : "0")).join("");
}
const dist = (a, b) => { let d = 0; for (let i = 0; i < 64; i++) if (a[i] !== b[i]) d++; return d; };
const dims = async (f) => { const m = await sharp(f).metadata(); return { width: m.width, height: m.height }; };

/**
 * A file sharp can't open, converted to PNG by macOS `sips`. The old site has
 * one: 2012/08/iamge1.jpg is a Windows BMP with a .jpg name.
 */
function readable(file) {
  try { execFileSync("node", ["-e", `require("sharp")(${JSON.stringify(file)}).metadata().then(m=>{if(!m.format)process.exit(1)}).catch(()=>process.exit(1))`], { cwd: ROOT, stdio: "ignore" }); return file; }
  catch {
    const dir = join(ROOT, "raw-assets", "audit", "converted");
    mkdirSync(dir, { recursive: true });
    const out = join(dir, `${basename(file)}.png`);
    if (!existsSync(out)) execFileSync("sips", ["-s", "format", "png", file, "--out", out], { stdio: "ignore" });
    return out;
  }
}

/* ---------- old site ---------- */
const inv = JSON.parse(readFileSync(join(ROOT, "docs", "old-site-inventory.json"), "utf8"));
const old = [];
for (const url of [...new Set(inv.images.map((i) => i.fullUrl))]) {
  const file = join(ROOT, "raw-assets", "old-site", url.replace(/^.*\/wp-content\/uploads\//, ""));
  if (!existsSync(file)) { old.push({ url, missing: true }); continue; }
  const src = readable(file);
  old.push({ url, file: file.replace(ROOT + "/", ""), readFrom: src === file ? undefined : src.replace(ROOT + "/", ""), hash: await phash(src), ...(await dims(src)) });
}

/* ---------- October batch ---------- */
const batchManifest = JSON.parse(readFileSync(join(ROOT, "raw-assets", "client-photos", "_work", "all-manifest.json"), "utf8")).photos;
const batch = [];
for (const p of batchManifest) {
  const file = join(ROOT, "raw-assets", "client-photos", p.workFile);
  if (!existsSync(file)) continue;
  batch.push({ id: p.id, file: p.workFile, original: p.originalPath, caption: p.captionGuess, width: p.width, height: p.height, hash: await phash(file) });
}

/* ---------- new site ---------- */
const refs = new Map(); // src -> [where]
function walk(node, where) {
  if (Array.isArray(node)) return node.forEach((n, i) => walk(n, `${where}[${i}]`));
  if (node && typeof node === "object") {
    if (typeof node.src === "string" && node.src.startsWith("/images/") && !node.src.endsWith(".png")) {
      if (!refs.has(node.src)) refs.set(node.src, []);
      refs.get(node.src).push(where);
    }
    for (const [k, v] of Object.entries(node)) if (v && typeof v === "object") walk(v, `${where}.${k}`);
  }
}
const contentFiles = ["projects.json", "services.json", "site.json", "equipment.json", ...readdirSync(join(ROOT, "content", "pages")).map((f) => `pages/${f}`)];
for (const f of contentFiles) {
  const data = JSON.parse(readFileSync(join(ROOT, "content", f), "utf8"));
  if (f === "projects.json") data.forEach((p) => walk(p, `projects:${p.slug}`));
  else if (f === "services.json") data.forEach((s) => walk(s, `services:${s.slug}`));
  else walk(data, f.replace(".json", ""));
}
const approved = JSON.parse(readFileSync(join(ROOT, "scripts", "client-photo-manifest.json"), "utf8")).approved ?? [];
const imageMap = JSON.parse(readFileSync(join(ROOT, "scripts", "image-map.json"), "utf8")).images;
const neu = [];
for (const [src, where] of refs) {
  const file = join(ROOT, "public", src);
  if (!existsSync(file)) { neu.push({ src, where, missing: true }); continue; }
  const a = approved.find((x) => x.src === src);
  const m = imageMap.find((x) => `/images/${x.out}.webp` === src);
  neu.push({
    src, where, hash: await phash(file), ...(await dims(file)),
    provenance: a ? { batch: a.workingId, original: a.originalFilename, crop: a.crop, header: a.header } : m ? { oldSite: m.source } : { other: true },
  });
}

/* ---------- matching ---------- */
const nearest = (h, pool, key) => pool.filter((x) => x.hash).map((x) => ({ [key]: x[key === "id" ? "id" : "url"] ?? x.src, d: dist(h, x.hash) })).sort((a, b) => a.d - b.d);
for (const o of old.filter((o) => o.hash)) {
  const n = nearest(o.hash, batch, "id").slice(0, 3);
  o.batchMatches = n.filter((x) => x.d <= NEAR);
}
for (const n of neu.filter((n) => n.hash)) {
  n.oldMatches = old.filter((o) => o.hash).map((o) => ({ url: o.url, d: dist(n.hash, o.hash) })).filter((x) => x.d <= NEAR).sort((a, b) => a.d - b.d);
  n.batchMatches = batch.map((b) => ({ id: b.id, d: dist(n.hash, b.hash) })).filter((x) => x.d <= NEAR).sort((a, b) => a.d - b.d).slice(0, 3);
  n.sameAs = neu.filter((m) => m !== n && m.hash && dist(n.hash, m.hash) <= SAME).map((m) => m.src);
}

mkdirSync(join(ROOT, "raw-assets", "audit"), { recursive: true });
writeFileSync(join(ROOT, "raw-assets", "audit", "image-matches.json"), JSON.stringify({ thresholds: { same: SAME, near: NEAR }, old, batch: batch.map(({ hash, ...b }) => ({ ...b, hash })), new: neu }, null, 2));
console.log(`${old.length} old-site photos · ${batch.length} batch photos · ${neu.length} new-site images`);
console.log(`old photos with a batch original: ${old.filter((o) => o.batchMatches?.some((m) => m.d <= SAME)).length}`);
console.log(`new-site images sharing a photograph with another new-site image: ${neu.filter((n) => n.sameAs?.length).length}`);
