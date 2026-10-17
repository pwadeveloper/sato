#!/usr/bin/env node
/**
 * Step 1 and 2 of docs/decisions/client-photos.md.
 *
 * Reads everything the client sent from raw-assets/client-photos/_inbox/
 * (never writing there) and builds a working set under _work/:
 *
 *   _work/docx/<document>/        every image from word/media, as sent
 *                                 (EMF/WMF photographs also as .png)
 *   _work/docx-index.json         where each image sits in its document and
 *                                 the text around it
 *   _work/all/                    one upright copy of every photograph
 *   _work/all-manifest.json       source, original path, dimensions, size,
 *                                 EXIF date — the original path lives here,
 *                                 not in the working filename
 *
 *   node scripts/extract-client-photos.mjs
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const BASE = join(ROOT, "raw-assets", "client-photos");
const INBOX = join(BASE, "_inbox");
const WORK = join(BASE, "_work");

const PHOTO_EXT = new Set([".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".tif", ".tiff", ".gif", ".bmp"]);
const VECTOR_EXT = new Set([".emf", ".wmf"]);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name.startsWith(".")) return [];
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const slug = (s) =>
  s.toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---------- EXIF: the handful of tags this pipeline needs ---------- */

function readExif(buf) {
  const out = {};
  if (!buf) return out;
  let o = buf.indexOf("Exif\0\0") === 0 ? 6 : 0;
  const le = buf.toString("ascii", o, o + 2) === "II";
  const u16 = (p) => (le ? buf.readUInt16LE(p) : buf.readUInt16BE(p));
  const u32 = (p) => (le ? buf.readUInt32LE(p) : buf.readUInt32BE(p));
  const str = (p, n) => buf.toString("ascii", p, p + n).replace(/\0.*$/, "").trim();
  const ifd = (off, names) => {
    const res = {};
    if (o + off + 2 > buf.length) return res;
    const n = u16(o + off);
    for (let i = 0; i < n; i++) {
      const e = o + off + 2 + i * 12;
      if (e + 12 > buf.length) break;
      const tag = u16(e), type = u16(e + 2), count = u32(e + 4);
      const name = names[tag];
      if (!name) continue;
      if (type === 2) res[name] = str(count > 4 ? o + u32(e + 8) : e + 8, count);
      else if (type === 3) res[name] = u16(e + 8);
      else if (type === 4) res[name] = u32(e + 8);
    }
    return res;
  };
  try {
    const ifd0 = ifd(u32(o + 4), { 0x010f: "make", 0x0110: "model", 0x0112: "orientation", 0x0132: "dateTime", 0x8769: "exifIfd", 0x8825: "gpsIfd", 0x0131: "software" });
    Object.assign(out, ifd0);
    if (ifd0.exifIfd) Object.assign(out, ifd(ifd0.exifIfd, { 0x9003: "dateTaken", 0x9004: "dateDigitized" }));
    out.hasGPS = Boolean(ifd0.gpsIfd);
    delete out.exifIfd;
    delete out.gpsIfd;
  } catch {
    /* a malformed block is reported as no EXIF */
  }
  return out;
}

/* ---------- EMF: pull the photograph out of its StretchDIBits record ---------- */

function emfBitmap(path) {
  const d = readFileSync(path);
  let best = null;
  for (let i = 0; i + 8 <= d.length; ) {
    const type = d.readUInt32LE(i), size = d.readUInt32LE(i + 4);
    if (size < 8) break;
    // EMR_BITBLT 76, EMR_STRETCHBLT 77, EMR_SETDIBITSTODEVICE 80, EMR_STRETCHDIBITS 81
    const at = { 76: 84, 77: 92, 80: 48, 81: 48 }[type];
    if (at !== undefined) {
      const [offBmi, cbBmi, offBits, cbBits] = [0, 4, 8, 12].map((k) => d.readUInt32LE(i + at + k));
      if (cbBmi >= 40 && cbBits > 0) {
        const h = i + offBmi;
        const w = d.readInt32LE(h + 4), ht = d.readInt32LE(h + 8), bpp = d.readUInt16LE(h + 14), comp = d.readUInt32LE(h + 16);
        if ((bpp === 16 || bpp === 24 || bpp === 32) && (comp === 0 || comp === 3) && (!best || w * Math.abs(ht) > best.w * Math.abs(best.h)))
          best = { w, h: ht, bpp, comp, bits: d.subarray(i + offBits, i + offBits + cbBits), masks: comp === 3 ? [0, 4, 8].map((k) => d.readUInt32LE(h + 40 + k)) : null };
      }
    }
    i += size;
  }
  if (!best) return null;
  const { w, bpp, bits } = best;
  const H = Math.abs(best.h), bottomUp = best.h > 0;
  const stride = Math.ceil((w * bpp) / 32) * 4;
  const rgb = Buffer.alloc(w * H * 3);
  const [rm, gm, bm] = best.masks ?? (bpp === 16 ? [0x7c00, 0x03e0, 0x001f] : [0xff0000, 0xff00, 0xff]);
  const ch = (v, m) => { const sh = Math.log2(m & -m), max = m >>> sh; return Math.round((((v & m) >>> sh) * 255) / max); };
  for (let y = 0; y < H; y++) {
    const row = (bottomUp ? H - 1 - y : y) * stride;
    for (let x = 0; x < w; x++) {
      const t = (y * w + x) * 3;
      if (bpp === 16) {
        const v = bits.readUInt16LE(row + x * 2);
        rgb[t] = ch(v, rm); rgb[t + 1] = ch(v, gm); rgb[t + 2] = ch(v, bm);
      } else {
        const p = row + x * (bpp / 8);
        rgb[t] = bits[p + 2]; rgb[t + 1] = bits[p + 1]; rgb[t + 2] = bits[p];
      }
    }
  }
  return { raw: rgb, width: w, height: H, bpp };
}

/* ---------- docx: document order and surrounding text ---------- */

function docxOrder(dir) {
  const xml = readFileSync(join(dir, "word", "document.xml"), "utf8");
  const relsXml = readFileSync(join(dir, "word", "_rels", "document.xml.rels"), "utf8");
  const rels = {};
  for (const m of relsXml.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = m[0].match(/Id="([^"]+)"/)?.[1], target = m[0].match(/Target="([^"]+)"/)?.[1];
    if (id && target) rels[id] = target;
  }
  const body = xml.slice(xml.indexOf("<w:body>"));
  // One flat stream: text runs, paragraph ends and image references, in order.
  const tokens = [];
  let text = "";
  const re = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>|<w:tab\/>|<\/w:p>|r:(?:embed|id|link)="([^"]+)"/g;
  const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  for (const m of body.matchAll(re)) {
    if (m[1] !== undefined) text += decode(m[1]);
    else if (m[0] === "<w:tab/>") text += " ";
    else if (m[0] === "</w:p>") {
      const t = text.replace(/\s+/g, " ").trim();
      if (t) tokens.push({ kind: "text", text: t });
      text = "";
    } else if (m[2] && rels[m[2]]?.startsWith("media/")) {
      const media = basename(rels[m[2]]);
      const last = tokens[tokens.length - 1];
      if (!(last?.kind === "image" && last.media === media)) tokens.push({ kind: "image", media });
    }
  }
  return tokens;
}

/* ---------- run ---------- */

if (!existsSync(INBOX)) {
  console.error(`No inbox at ${relative(ROOT, INBOX)}`);
  process.exit(1);
}
rmSync(join(WORK, "all"), { recursive: true, force: true });
mkdirSync(join(WORK, "all"), { recursive: true });

const inboxFiles = walk(INBOX);
const docxIndex = [];
const sources = []; // { source, document?, originalPath, file, context? }

for (const f of inboxFiles.filter((f) => extname(f).toLowerCase() === ".docx")) {
  const doc = basename(f, extname(f));
  const raw = join(WORK, "docx-raw", doc);
  const media = join(WORK, "docx", doc);
  rmSync(raw, { recursive: true, force: true });
  rmSync(media, { recursive: true, force: true });
  mkdirSync(raw, { recursive: true });
  mkdirSync(media, { recursive: true });
  execFileSync("unzip", ["-q", "-o", f, "-d", raw]);
  const mediaDir = join(raw, "word", "media");
  const names = existsSync(mediaDir) ? readdirSync(mediaDir) : [];
  for (const n of names) copyFileSync(join(mediaDir, n), join(media, n));

  // EMF/WMF → PNG where the file is a wrapped bitmap; pure vector art is recorded as such.
  const converted = {};
  for (const n of names.filter((n) => VECTOR_EXT.has(extname(n).toLowerCase()))) {
    const bmp = extname(n).toLowerCase() === ".emf" ? emfBitmap(join(media, n)) : null;
    if (bmp) {
      const png = n.replace(/\.[^.]+$/, ".png");
      await sharp(bmp.raw, { raw: { width: bmp.width, height: bmp.height, channels: 3 } }).png({ compressionLevel: 6 }).toFile(join(media, png));
      converted[n] = { png, note: `bitmap ${bmp.width}x${bmp.height} at ${bmp.bpp}-bit extracted from EMF` };
    } else converted[n] = { png: null, note: "vector-only metafile (shapes, no photograph); not converted" };
  }

  const tokens = docxOrder(raw);
  const textIdx = tokens.map((t, i) => (t.kind === "text" ? i : -1)).filter((i) => i >= 0);
  const seen = new Map();
  let position = 0;
  tokens.forEach((t, i) => {
    if (t.kind !== "image") return;
    position++;
    const before = textIdx.filter((j) => j < i).slice(-2).map((j) => tokens[j].text);
    const after = textIdx.filter((j) => j > i).slice(0, 2).map((j) => tokens[j].text);
    // Captions in this document sit directly above a run of photographs, one
    // caption per photograph or one for the whole run.
    let s = i; while (s > 0 && tokens[s - 1].kind === "image") s--;
    let e = i; while (e + 1 < tokens.length && tokens[e + 1].kind === "image") e++;
    const run = tokens.slice(s, e + 1).map((x) => x.media);
    const caps = []; for (let j = s - 1; j >= 0 && tokens[j].kind === "text"; j--) caps.unshift(tokens[j].text);
    const k = run.indexOf(t.media);
    // Take the captions nearest the run: a block of captions can also hold the
    // trailing caption of the previous run. Only a guess — the before/after
    // text is what the review reads.
    const near = caps.slice(-run.length);
    const captionGuess = near.length === run.length ? near[k] : near.length ? near[near.length - 1] : null;
    const occurrence = (seen.get(t.media) ?? 0) + 1;
    seen.set(t.media, occurrence);
    docxIndex.push({
      document: `${doc}.docx`,
      media: t.media,
      file: relative(BASE, join(media, converted[t.media]?.png ?? t.media)),
      position,
      occurrence,
      textBefore: before,
      textAfter: after,
      captionGuess,
      runOf: run.length,
      conversion: converted[t.media]?.note,
    });
  });
  // Images in word/media that the body never places (headers, OLE previews).
  for (const n of names) if (!seen.has(n)) docxIndex.push({ document: `${doc}.docx`, media: n, file: relative(BASE, join(media, converted[n]?.png ?? n)), position: null, note: "not placed in the document body", conversion: converted[n]?.note });

  for (const n of names) {
    const ext = extname(n).toLowerCase();
    if (VECTOR_EXT.has(ext) && !converted[n]?.png) continue;
    if (!VECTOR_EXT.has(ext) && !PHOTO_EXT.has(ext)) continue;
    const file = VECTOR_EXT.has(ext) ? join(media, converted[n].png) : join(media, n);
    sources.push({ source: "docx", document: `${doc}.docx`, media: n, originalPath: `${basename(f)} › word/media/${n}`, file, convertedFrom: VECTOR_EXT.has(ext) ? ext.slice(1) : undefined });
  }
}

for (const f of inboxFiles.filter((f) => PHOTO_EXT.has(extname(f).toLowerCase()))) {
  sources.push({ source: "folder", originalPath: relative(INBOX, f), file: f });
}

writeFileSync(join(WORK, "docx-index.json"), JSON.stringify(docxIndex, null, 2));

const manifest = [];
let n = 0;
for (const s of sources) {
  n++;
  const id = `W${String(n).padStart(3, "0")}`;
  const ext = extname(s.file).toLowerCase();
  let input = s.file;
  if (ext === ".heic" || ext === ".heif") {
    // sharp's prebuilt binaries do not decode HEIC; macOS sips does.
    input = join(WORK, "all", `${id}-heic.jpg`);
    execFileSync("sips", ["-s", "format", "jpeg", s.file, "--out", input], { stdio: "ignore" });
  }
  const meta = await sharp(input).metadata();
  const exif = readExif(meta.exif);
  const rotate = (meta.orientation ?? 1) > 1;
  const outExt = rotate || ext === ".heic" || ext === ".heif" ? ".jpg" : ext === ".jpeg" ? ".jpg" : ext;
  const label = s.source === "docx" ? `${slug(s.document)}-${slug(s.media)}` : slug(s.originalPath);
  const out = join(WORK, "all", `${id}-${label}${outExt}`);
  if (rotate) await sharp(input).rotate().jpeg({ quality: 95 }).toFile(out);
  else copyFileSync(input, out);
  if (input !== s.file) rmSync(input);
  const upright = await sharp(out).metadata();
  const ctx = s.source === "docx" ? docxIndex.filter((d) => d.media === s.media && d.document === s.document && d.position) : [];
  manifest.push({
    id,
    workFile: relative(BASE, out),
    source: s.source,
    document: s.document,
    originalPath: s.originalPath,
    convertedFrom: s.convertedFrom,
    width: upright.width,
    height: upright.height,
    bytes: statSync(s.file).size,
    format: meta.format,
    orientationFixed: rotate ? meta.orientation : undefined,
    exif: { dateTaken: exif.dateTaken ?? exif.dateTime ?? null, make: exif.make ?? null, model: exif.model ?? null, software: exif.software ?? null, hasGPS: Boolean(exif.hasGPS) },
    docxPositions: ctx.map((c) => c.position),
    captionGuess: ctx[0]?.captionGuess ?? null,
    textBefore: ctx[0]?.textBefore ?? [],
    textAfter: ctx[0]?.textAfter ?? [],
  });
}
writeFileSync(join(WORK, "all-manifest.json"), JSON.stringify({ generated: new Date().toISOString(), count: manifest.length, photos: manifest }, null, 2));

const vec = docxIndex.filter((d) => d.conversion?.startsWith("vector")).length;
console.log(`${inboxFiles.length} inbox files · ${docxIndex.filter((d) => d.position).length} placed docx images · ${manifest.length} images in _work/all (${vec} vector-only metafiles skipped)`);
