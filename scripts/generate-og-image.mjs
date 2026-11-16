#!/usr/bin/env node
/**
 * Builds the default Open Graph card at public/images/og/default.png.
 *
 *   node scripts/generate-og-image.mjs           # the default card
 *   node scripts/generate-og-image.mjs --pages   # the oil and gas cards too
 *
 * `--pages` also writes one card per page that asks for its own: the Oil &
 * Gas service page and each published Oil & Gas use case. Their words are
 * read from services.json and use-cases.json, never typed here, and none of
 * them carries the founding year: Sato's dates stay with Sato's own work.
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
const BRAND = "#2e7229";

const W = 1200;
const H = 630;
const PAD = 72;

const escape = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Strip any unresolved placeholder before it reaches a shared image. */
const clean = (text) =>
  text.replace(/\{\{CONFIRM(?::\s*[\s\S]*?)?\}\}/g, "").replace(/\s+/g, " ").trim();

const name = clean(site.name);
const tagline = clean(site.tagline);
const founded = String(site.foundedYear);

const logo = await sharp(LOGO).resize({ height: 64 }).toBuffer();
const logoMeta = await sharp(logo).metadata();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${ASPHALT}"/>
  <rect x="0" y="0" width="${W}" height="6" fill="${SURVEY}"/>
  <rect x="${PAD}" y="${PAD + 132}" width="64" height="3" fill="${BRAND}"/>
  <text x="${PAD}" y="${PAD + 250}"
        font-family="Archivo, Helvetica Neue, Arial, sans-serif"
        font-size="68" font-weight="800" letter-spacing="-1.4" fill="${CONCRETE}">
    Engineering
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
    ${escape(tagline)}
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

/* ------------------------------------------------------------ page cards */

if (process.argv.includes("--pages")) {
  const services = JSON.parse(await readFile(join(ROOT, "content", "services.json"), "utf8"));
  const useCases = JSON.parse(await readFile(join(ROOT, "content", "use-cases.json"), "utf8"));
  const oilGas = services.find((service) => service.slug === "oil-gas");
  const art = join(ROOT, "public", oilGas.image.src);

  /** Greedy word wrap to a character budget; good enough for two lines. */
  const wrap = (text, max) => {
    const lines = [];
    let line = "";
    for (const word of clean(text).split(" ")) {
      if ((line + " " + word).trim().length > max && line) {
        lines.push(line);
        line = word;
      } else {
        line = (line + " " + word).trim();
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const LEFT = 640;

  async function card(out, eyebrow, title, lead) {
    const titleLines = wrap(title, 22).slice(0, 4);
    const leadLines = wrap(lead, 46).slice(0, 3);
    const titleTop = PAD + 182;
    const leadTop = titleTop + (titleLines.length - 1) * 52 + 48;
    const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${LEFT}" height="${H}" fill="${ASPHALT}"/>
  <rect x="${LEFT}" y="0" width="4" height="${H}" fill="${BRAND}"/>
  <text x="${PAD}" y="${PAD + 118}" font-family="Helvetica Neue, Arial, sans-serif"
        font-size="17" letter-spacing="2.5" fill="${STEEL_LIGHT}">${escape(eyebrow.toUpperCase())}</text>
  ${titleLines
    .map(
      (line, i) => `<text x="${PAD}" y="${titleTop + i * 52}" font-family="Georgia, Times New Roman, serif"
        font-size="46" letter-spacing="-0.8" fill="${CONCRETE}">${escape(line)}</text>`,
    )
    .join("\n  ")}
  ${leadLines
    .map(
      (line, i) => `<text x="${PAD}" y="${leadTop + i * 29}" font-family="Helvetica Neue, Arial, sans-serif"
        font-size="20" fill="${STEEL_LIGHT}">${escape(line)}</text>`,
    )
    .join("\n  ")}
  <text x="${PAD}" y="${H - PAD + 4}" font-family="Helvetica Neue, Arial, sans-serif"
        font-size="21" font-weight="500" fill="${CONCRETE}">${escape(name)}</text>
</svg>`;

    const picture = await sharp(art)
      .resize({ width: W - LEFT - 4, height: H, fit: "cover", position: "right" })
      .toBuffer();
    const target = join(ROOT, "public", "images", "og", out);
    await sharp(Buffer.from(text))
      .composite([
        { input: picture, left: LEFT + 4, top: 0 },
        { input: logo, left: PAD, top: PAD },
      ])
      .png({ compressionLevel: 9 })
      .toFile(target);
    const { size: bytes } = await stat(target);
    console.log(`Wrote public/images/og/${out} — ${W}x${H}, ${Math.round(bytes / 1024)}KB`);
  }

  await card("oil-gas.png", "Oil & Gas", oilGas.name, oilGas.summary);

  for (const useCase of useCases.filter((entry) => entry.published && entry.serviceSlug === "oil-gas")) {
    const featured = useCase.featuredResultIds
      .map((id) => useCase.results.items.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => item.label)
      .join(" · ");
    await card(`${useCase.slug}.png`, `Use case · ${useCase.clientDisplay}`, useCase.title, featured);
  }
}
