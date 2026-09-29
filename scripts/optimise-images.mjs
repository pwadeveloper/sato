#!/usr/bin/env node
/**
 * Builds the web image set in /public/images/ from the originals in /raw-assets/.
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
 *
 * It also sweeps /raw-assets/client-photos/<service>/, which needs no map entry at all. The
 * client sends labelled photographs of completed work in batches; requiring a hand-written map
 * line for each one would put a code edit between him and his own pictures. Anything dropped in
 * one of those folders is processed into /public/images/services/<service>/ under a slug made
 * from its filename, and scripts/client-photo-manifest.json records the original filename beside
 * the generated paths — his label is the only description of what the photograph shows, and it
 * is what the alt text gets written from. Mapping a processed file into the site is then a
 * content edit: see docs/adding-client-photos.md.
 */
import { readFile, writeFile, mkdir, stat, readdir } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
/**
 * Where a map entry's `source` may live. Tried in order.
 *  - raw-assets/old-site: the 2012 site, not committed
 *  - raw-assets: anything supplied since — the oil and gas deck images
 *  - hero: client-supplied hero photography, committed
 */
const SOURCE_ROOTS = [join(ROOT, 'raw-assets', 'old-site'), join(ROOT, 'raw-assets'), ROOT];
const OUT = join(ROOT, 'public', 'images');
/** Where the client drops labelled photographs, one folder per service. */
const CLIENT_PHOTOS = join(ROOT, 'raw-assets', 'client-photos');
/** The record of what each processed photograph was called when it arrived. */
const MANIFEST = join(ROOT, 'scripts', 'client-photo-manifest.json');
const PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff', '.heic']);
const MAX_WIDTH = 1920;
const SMALL_WIDTH = 800;
const QUALITY = 82;

const force = process.argv.includes('--force');

const exists = (p) => stat(p).then(() => true, () => false);

/** First root that actually holds this source, or null. */
async function resolveSource(rel) {
  for (const root of SOURCE_ROOTS) {
    const candidate = join(root, rel);
    if (await exists(candidate)) return candidate;
  }
  return null;
}

const { images } = JSON.parse(await readFile(join(ROOT, 'scripts', 'image-map.json'), 'utf8'));

/** Write one variant, downscaling only. Both variants are always written. */
async function variant(src, srcMtime, absOut, width, sourceWidth, exposure, lossless) {
  if (!force && (await exists(absOut)) && (await stat(absOut)).mtimeMs > srcMtime) return 'cached';
  await mkdir(dirname(absOut), { recursive: true });
  const pipeline = sharp(src).rotate();                           // honour EXIF orientation
  if (sourceWidth > width) pipeline.resize({ width, withoutEnlargement: true });
  /**
   * Hero photographs are bright, high-key and carry white text over them, so
   * their exposure is pulled down at build time. Doing it here rather than
   * with an overlay means the shipped file is already calm — a CSS scrim
   * alone would have to be heavy enough for the brightest image in the set.
   */
  if (exposure && exposure !== 1) {
    pipeline.modulate({ brightness: exposure, saturation: 0.92 });
  }
  /**
   * Diagrams are line art, not photography: lossy WebP smears the hairlines
   * and the 9pt labels into grey mush at exactly the size someone zooms in to
   * read them. Lossless costs more bytes on a photograph and almost nothing
   * on a mostly-white drawing, so the map entry opts in per image.
   */
  const info = await pipeline
    .webp(lossless ? { lossless: true, effort: 6 } : { quality: QUALITY, effort: 5 })
    .toFile(absOut);
  return info;
}

let written = 0, cached = 0, bytes = 0;
const missing = [];
const results = [];

for (const entry of images) {
  const src = await resolveSource(entry.source);
  if (!src) { missing.push(entry.source); continue; }

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
  /**
   * The small variant exists so components can build a srcset without
   * branching. A diagram opts out: at 800px its labels are unreadable, so it
   * is served at one size inside a scroll container and a second file would
   * only be dead weight in the repo.
   */
  const sizes = entry.noSmall ? [['', MAX_WIDTH]] : [['', MAX_WIDTH], ['-800', SMALL_WIDTH]];
  for (const [suffix, width] of sizes) {
    const rel = `${entry.out}${suffix}.webp`;
    const res = await variant(
      src, srcMtime, join(OUT, rel), width, sourceWidth, entry.exposure, entry.lossless,
    );
    if (!res) continue;
    if (res === 'cached') { cached++; made.push(rel); continue; }
    written++; bytes += res.size;
    made.push(rel);
  }
  results.push({ out: entry.out, sourceWidth, files: made });
}

/* ------------------------------------------------- client photographs ---- */

/**
 * `IMG_20240912_103301 (3).JPG` -> `img-20240912-103301-3`.
 *
 * The filename is the client's own and may hold spaces, brackets, accents and
 * a shouted extension. The slug is what the file is served as, so it has to be
 * URL-safe; the original is kept in the manifest, never thrown away.
 */
function slugify(name) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'photo';
}

const clientPhotos = [];
if (await exists(CLIENT_PHOTOS)) {
  for (const folder of await readdir(CLIENT_PHOTOS, { withFileTypes: true })) {
    if (!folder.isDirectory()) continue;
    const service = folder.name;
    const dir = join(CLIENT_PHOTOS, service);
    const taken = new Map();

    for (const file of (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      if (!file.isFile() || file.name.startsWith('.')) continue;
      const ext = extname(file.name).toLowerCase();
      if (!PHOTO_EXTENSIONS.has(ext)) continue;

      const src = join(dir, file.name);
      let meta;
      try {
        meta = await sharp(src).metadata();
      } catch (e) {
        missing.push(`client-photos/${service}/${file.name} (unreadable: ${e.message})`);
        continue;
      }

      // Two photographs whose names differ only in punctuation would otherwise
      // overwrite each other silently.
      const base = slugify(file.name.slice(0, -ext.length));
      const seen = (taken.get(base) ?? 0) + 1;
      taken.set(base, seen);
      const stem = seen === 1 ? base : `${base}-${seen}`;

      const out = `services/${service}/${stem}`;
      const srcMtime = (await stat(src)).mtimeMs;
      const upright = meta.orientation >= 5;
      const sourceWidth = upright ? meta.height : meta.width;
      const files = [];

      for (const [suffix, width] of [['', MAX_WIDTH], ['-800', SMALL_WIDTH]]) {
        const rel = `${out}${suffix}.webp`;
        const res = await variant(src, srcMtime, join(OUT, rel), width, sourceWidth);
        if (!res) continue;
        if (res === 'cached') { cached++; files.push(rel); continue; }
        written++; bytes += res.size;
        files.push(rel);
      }

      results.push({ out, sourceWidth, files });
      clientPhotos.push({
        service,
        /** The client's own filename — the only label the photograph has. */
        originalFilename: file.name,
        src: `/images/${out}.webp`,
        small: `/images/${out}-800.webp`,
        width: Math.min(sourceWidth, MAX_WIDTH),
        height: Math.round(
          (Math.min(sourceWidth, MAX_WIDTH) / sourceWidth) *
            (upright ? meta.width : meta.height),
        ),
      });
    }
  }
}

/**
 * The manifest is written even when empty, and committed, so the client's
 * labels survive /raw-assets/ being cleared — they are what the alt text is
 * written from, and nothing else records them.
 */
await writeFile(
  MANIFEST,
  `${JSON.stringify(
    {
      note: 'Generated by scripts/optimise-images.mjs. See docs/adding-client-photos.md.',
      photos: clientPhotos,
    },
    null,
    2,
  )}\n`,
);

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
console.log(
  clientPhotos.length
    ? `${clientPhotos.length} client photo(s) in ${relative(ROOT, MANIFEST)} — map them into content/services.json`
    : `no client photographs in ${relative(ROOT, CLIENT_PHOTOS)}`,
);
if (missing.length) {
  console.log(`\n${missing.length} mapped source(s) missing from raw-assets/old-site:`);
  missing.forEach((m) => console.log('  ' + m));
}
if (orphans.length) {
  console.log(`\n${orphans.length} file(s) in public/images with no map entry (delete by hand if stale):`);
  orphans.forEach((o) => console.log('  ' + o));
}
