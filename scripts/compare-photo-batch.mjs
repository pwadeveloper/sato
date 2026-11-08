#!/usr/bin/env node
/**
 * Compares an incoming photo batch with every image the site already
 * publishes, so a resent photograph is skipped rather than published twice.
 *
 *   node scripts/compare-photo-batch.mjs <folder>
 *
 * For each file in <folder>: its size, whether it carries EXIF (which
 * `npm run images` strips), and the nearest published images by 64-bit DCT
 * pHash, upright (EXIF orientation applied) and on a centre crop to the
 * published file's own ratio, because a published copy is usually a resized
 * crop. Distance ≤ 10 of 64 is the same photograph; ≤ 16 is worth a look by
 * eye. See docs/decisions/launch-ready.md, section 3.
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SAME = 10;
const NEAR = 16;

const COS = Array.from({ length: 32 }, (_, k) =>
  Array.from({ length: 32 }, (_, n) => Math.cos(((2 * n + 1) * k * Math.PI) / 64)),
);
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
const grey = (img) =>
  img.flatten({ background: "#fff" }).greyscale().resize(32, 32, { fit: "fill" }).raw().toBuffer();
const dist = (a, b) => a.reduce((d, bit, i) => d + (bit !== b[i] ? 1 : 0), 0);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const folder = process.argv[2];
if (!folder) {
  console.error("Usage: node scripts/compare-photo-batch.mjs <folder>");
  process.exit(1);
}

const published = [];
for (const file of walk(join(ROOT, "public", "images"))) {
  if (!/\.(webp|jpe?g|png)$/i.test(file) || /-800\./.test(file)) continue;
  try {
    const meta = await sharp(file).metadata();
    published.push({
      file: relative(join(ROOT, "public"), file),
      ratio: meta.width / meta.height,
      hash: hashOf(await grey(sharp(file))),
    });
  } catch {
    /* not an image sharp can read; nothing to compare */
  }
}

for (const name of readdirSync(folder).sort()) {
  const path = join(folder, name);
  let meta;
  try {
    meta = await sharp(path).metadata();
  } catch {
    continue;
  }
  const upright = await sharp(path).rotate().toBuffer({ resolveWithObject: true });
  const { width, height } = upright.info;
  const whole = hashOf(await grey(sharp(upright.data)));

  const scored = [];
  for (const entry of published) {
    // Crop the incoming frame to the published file's ratio, centred.
    let w = width;
    let h = Math.round(width / entry.ratio);
    if (h > height) {
      h = height;
      w = Math.round(height * entry.ratio);
    }
    const cropped = hashOf(
      await grey(
        sharp(upright.data).extract({
          left: Math.floor((width - w) / 2),
          top: Math.floor((height - h) / 2),
          width: w,
          height: h,
        }),
      ),
    );
    scored.push({ file: entry.file, d: Math.min(dist(whole, entry.hash), dist(cropped, entry.hash)) });
  }
  scored.sort((a, b) => a.d - b.d);
  const best = scored[0];
  const verdict = best.d <= SAME ? "ALREADY PUBLISHED" : best.d <= NEAR ? "check by eye" : "new";
  console.log(
    `${name}\n  ${width}x${height}, EXIF ${meta.exif ? "present" : "none"} → ${verdict}` +
      `\n  nearest: ${scored.slice(0, 2).map((s) => `${s.file} (${s.d})`).join(", ")}`,
  );
}
