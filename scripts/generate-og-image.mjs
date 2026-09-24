#!/usr/bin/env node
/**
 * Builds the default Open Graph card at public/images/og/default.png.
 *
 *   node scripts/generate-og-image.mjs
 *
 * A link preview is often the first thing a recipient of the letters sees, so
 * it carries the mark, the registered name and the founding year rather than a
 * cropped site photograph — the point of the card is to say who this is.
 *
 * Composited with sharp rather than rendered in a browser: it is one static
 * image, and adding a headless Chromium to the toolchain to draw two lines of
 * text would not be a good trade.
 */
import { mkdir, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "images", "og", "default.png");
const LOGO = join(ROOT, "public", "images", "sato-logo-light-text.png");

const site = JSON.parse(
  await readFile(join(ROOT, "content", "site.json"), "utf8"),
);

/** Design tokens, kept in step with styles/tokens.css. */
const ASPHALT = "#22272b";
const CONCRETE = "#e9e6e1";
const STEEL_LIGHT = "#9aa2a4";
const SURVEY = "#e2b236";
const LATERITE = "#8f3f1e";

const W = 1200;
const H = 630;
const PAD = 72;

const escape = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Strip any unresolved placeholder before it reaches a shared image. */
const clean = (text) =>
  text.replace(/\{\{CONFIRM(?::\s*[\s\S]*?)?\}\}/g, "").replace(/\s+/g, " ").trim();

const name = clean(site.name);
const former = clean(site.formerNameLabel);
const founded = String(site.foundedYear);

const logo = await sharp(LOGO).resize({ height: 64 }).toBuffer();
const logoMeta = await sharp(logo).metadata();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${ASPHALT}"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${SURVEY}"/>
  <rect x="${PAD}" y="${PAD + 132}" width="64" height="3" fill="${LATERITE}"/>
  <text x="${PAD}" y="${PAD + 250}"
        font-family="Archivo, Helvetica Neue, Arial, sans-serif"
        font-size="68" font-weight="800" letter-spacing="-1.4" fill="${CONCRETE}">
    Engineering Nigeria's
  </text>
  <text x="${PAD}" y="${PAD + 330}"
        font-family="Archivo, Helvetica Neue, Arial, sans-serif"
        font-size="68" font-weight="800" letter-spacing="-1.4" fill="${CONCRETE}">
    infrastructure since ${founded}.
  </text>
  <text x="${PAD}" y="${H - PAD - 34}"
        font-family="Archivo, Helvetica Neue, Arial, sans-serif"
        font-size="25" font-weight="500" fill="${CONCRETE}">
    ${escape(name)}
  </text>
  <text x="${PAD}" y="${H - PAD + 4}"
        font-family="Archivo, Helvetica Neue, Arial, sans-serif"
        font-size="21" font-weight="400" fill="${STEEL_LIGHT}">
    ${escape(former)}
  </text>
</svg>`;

await mkdir(dirname(OUT), { recursive: true });

await sharp(Buffer.from(svg))
  .composite([{ input: logo, left: PAD, top: PAD, blend: "over" }])
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const { size } = await stat(OUT);
console.log(
  `Wrote public/images/og/default.png — ${W}x${H}, ` +
    `logo ${logoMeta.width}x${logoMeta.height}, ${Math.round(size / 1024)}KB`,
);
