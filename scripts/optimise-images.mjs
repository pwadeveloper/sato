#!/usr/bin/env node
/**
 * Builds the web image set in /public/images/ from the originals in /raw-assets/old-site/.
 *
 *   node scripts/optimise-images.mjs [--force]
 *
 * Static export has no image server, so every image is resized and re-encoded here, ahead of
 * the build. Each entry in scripts/image-map.json produces:
 *
 *   <out>.webp      capped at MAX_WIDTH
 *   <out>-800.webp  capped at 800px, for cards and small viewports
 *
 * Neither variant is ever upscaled: a source narrower than 800px just gets re-encoded at its own
 * width, so both paths always exist and components can build a srcset without branching.
 * /raw-assets/ is not committed (see .gitignore); without it the script exits 0 and says so,
 * because the generated images in /public/images/ are committed and the site builds from those.
 */
import { readFile, mkdir, stat, readdir } from "node:fs/promises";
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'raw-assets', 'old-site');
const OUT = join(ROOT, 'public', 'images');
const MAX_WIDTH = 1920;
const SMALL_WIDTH = 800;
const QUALITY = 82;

const force = process.argv.includes('--force');

const exists = (p) => stat(p).then(() => true, () => false);

if (!(await exists(RAW))) {
  console.log(`No originals at ${RAW} — nothing to do.`);
  console.log('raw-assets/ is not committed; re-download it if you need to regenerate.');
  process.exit(0);
}

const { images } = JSON.parse(await readFile(join(ROOT, 'scripts', 'image-map.json'), 'utf8'));

/** Write one variant, downscaling only. Both variants are always written. */
async function variant(src, srcMtime, absOut, width, sourceWidth) {
  if (!force && (await exists(absOut)) && (await stat(absOut)).mtimeMs > srcMtime) return 'cached';
  await mkdir(dirname(absOut), { recursive: true });
  const pipeline = sharp(src).rotate();                           // honour EXIF orientation
  if (sourceWidth > width) pipeline.resize({ width, withoutEnlargement: true });
  const info = await pipeline.webp({ quality: QUALITY, effort: 5 }).toFile(absOut);
  return info;
}

let written = 0, cached = 0, bytes = 0;
const missing = [];
const results = [];

for (const entry of images) {
  const src = join(RAW, entry.source);
  if (!(await exists(src))) { missing.push(entry.source); continue; }

  const srcMtime = (await stat(src)).mtimeMs;
  let meta;
  try {
    meta = await sharp(src).metadata();
  } catch (e) {
    missing.push(`${entry.source} (unreadable: ${e.message})`);
    continue;
  }
  // .rotate() swaps width/height for EXIF orientations 5-8.
  const upright = meta.orientation >= 5;
  const sourceWidth = upright ? meta.height : meta.width;

  const made = [];
  for (const [suffix, width] of [['', MAX_WIDTH], ['-800', SMALL_WIDTH]]) {
    const rel = `${entry.out}${suffix}.webp`;
    const res = await variant(src, srcMtime, join(OUT, rel), width, sourceWidth);
    if (!res) continue;
    if (res === 'cached') { cached++; made.push(rel); continue; }
    written++; bytes += res.size;
    made.push(rel);
  }
  results.push({ out: entry.out, sourceWidth, files: made });
}

// Flag anything in public/images that no longer has a map entry, so deletions are visible.
const wanted = new Set(results.flatMap((r) => r.files));
const orphans = [];
async function walk(dir, prefix = '') {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) await walk(join(dir, e.name), rel);
    else if (e.name.endsWith('.webp') && !wanted.has(rel)) orphans.push(rel);
  }
}
if (await exists(OUT)) await walk(OUT);

console.log(`${written} written, ${cached} up to date, ${(bytes / 1024 / 1024).toFixed(1)} MB encoded`);
if (missing.length) {
  console.log(`\n${missing.length} mapped source(s) missing from raw-assets/old-site:`);
  missing.forEach((m) => console.log('  ' + m));
}
if (orphans.length) {
  console.log(`\n${orphans.length} file(s) in public/images with no map entry (delete by hand if stale):`);
  orphans.forEach((o) => console.log('  ' + o));
}
