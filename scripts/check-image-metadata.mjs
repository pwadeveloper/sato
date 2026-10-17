#!/usr/bin/env node
/**
 * Fails if any published image still carries metadata: EXIF (camera, date,
 * GPS), XMP or IPTC.
 *
 *   node scripts/check-image-metadata.mjs
 *
 * The client's photographs arrive with GPS positions and camera details in
 * them, and the site must not republish either. optimise-images.mjs never asks
 * sharp to keep metadata, so nothing should get through — this proves it on
 * every file in /public/images/, by reading each container's own structure
 * rather than trusting the encoder:
 *
 *   WebP  no EXIF or XMP chunk, and the VP8X header claims neither
 *   PNG   no eXIf chunk, no iTXt/tEXt/zTXt chunk (XMP rides in iTXt)
 *   JPEG  no APP1 (EXIF/XMP) or APP13 (IPTC) segment
 *
 * plus sharp's own reading of exif / xmp / iptc as a second opinion.
 */
import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const DIR = join(ROOT, "public", "images");

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

function webp(buf) {
  const found = [];
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return ["not a WebP container"];
  for (let i = 12; i + 8 <= buf.length; ) {
    const id = buf.toString("ascii", i, i + 4);
    const size = buf.readUInt32LE(i + 4);
    if (id === "EXIF") found.push("EXIF chunk");
    if (id === "XMP ") found.push("XMP chunk");
    if (id === "VP8X") {
      const flags = buf[i + 8];
      if (flags & 0x08) found.push("VP8X claims EXIF");
      if (flags & 0x04) found.push("VP8X claims XMP");
    }
    i += 8 + size + (size & 1);
  }
  return found;
}

function png(buf) {
  const found = [];
  for (let i = 8; i + 8 <= buf.length; ) {
    const size = buf.readUInt32BE(i);
    const type = buf.toString("ascii", i + 4, i + 8);
    if (["eXIf", "iTXt", "tEXt", "zTXt"].includes(type)) found.push(`${type} chunk`);
    i += 12 + size;
  }
  return found;
}

function jpeg(buf) {
  const found = [];
  for (let i = 2; i + 4 <= buf.length && buf[i] === 0xff; ) {
    const marker = buf[i + 1];
    if (marker === 0xda) break; // start of scan: no more headers
    const size = buf.readUInt16BE(i + 2);
    if (marker === 0xe1) found.push("APP1 (EXIF/XMP) segment");
    if (marker === 0xed) found.push("APP13 (IPTC) segment");
    i += 2 + size;
  }
  return found;
}

const files = (await walk(DIR)).filter((f) => [".webp", ".png", ".jpg", ".jpeg"].includes(extname(f).toLowerCase()));
const failures = [];
for (const f of files) {
  const buf = await readFile(f);
  const ext = extname(f).toLowerCase();
  const found = ext === ".webp" ? webp(buf) : ext === ".png" ? png(buf) : jpeg(buf);
  const meta = await sharp(buf).metadata();
  if (meta.exif) found.push("sharp reads EXIF");
  if (meta.xmp) found.push("sharp reads XMP");
  if (meta.iptc) found.push("sharp reads IPTC");
  if (found.length) failures.push(`${relative(ROOT, f)}: ${[...new Set(found)].join(", ")}`);
}

if (failures.length) {
  console.error(`✗ ${failures.length} of ${files.length} published image(s) carry metadata:`);
  failures.forEach((x) => console.error(`  ${x}`));
  process.exit(1);
}
console.log(`✓ ${files.length} published images checked: no EXIF, GPS, XMP or IPTC`);
