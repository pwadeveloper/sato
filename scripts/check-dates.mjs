#!/usr/bin/env node
/**
 * Fails the build if a year reaches a project page or a photo caption.
 *
 *   node scripts/check-dates.mjs          # exit 1 on any hit
 *   node scripts/check-dates.mjs --quiet  # only print failures
 *
 * The client asked for no dates on project entries or on photographs
 * (docs/decisions/launch-ready.md, section 4). `showProjectDates: false` in
 * site.json hides the `year` field; this is the check that nothing else
 * carries one — a caption that says "November 2011", a narrative that says
 * "awarded in 2016", an alt text, a title, a meta description.
 *
 * What is scanned, against `/out`:
 *
 *  - every project page, project category page and the Projects landing page
 *    (`projects.html`, `projects/*.html`): everything a reader is shown —
 *    visible text, `alt` / `title` / `aria-label`, `<title>` and the meta
 *    description and Open Graph / Twitter text;
 *  - on every other page, photo captions (`<figcaption>`) and image `alt`
 *    text, because a project photograph can also sit in a service gallery.
 *
 * Script bodies are not scanned. They hold the React flight payload (a second
 * copy of the visible text, already covered) and the Organization JSON-LD,
 * whose `foundingDate` is the company's, not a project's.
 *
 * Allowed, and nothing else:
 *
 *  - the founding year in the tagline's own wording, "since 1997" — company
 *    copy, which the brief keeps;
 *  - "© <year>" in the footer, the copyright line, which is not a date on a
 *    project.
 *
 * No page is exempt. `/projects/oil-gas` was, while its partner table kept a
 * Year column; the client settled it — dates off there too — and the column
 * now follows `showProjectDates` like every other year on the site.
 */
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const QUIET = process.argv.includes("--quiet");

const site = JSON.parse(await readFile(join(ROOT, "content", "site.json"), "utf8"));
const FOUNDED = String(site.foundedYear);

const YEAR = /\b(19|20)\d{2}\b/g;

async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith(".html")) found.push(full);
  }
  return found.sort();
}

const decode = (text) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");

const withoutScripts = (html) =>
  html.replace(/<script\b[\s\S]*?<\/script>/gi, "").replace(/<style\b[\s\S]*?<\/style>/gi, "");

/** alt / title / aria-label, and the text meta tags a reader or a share card shows. */
function attributeTexts(html) {
  const texts = [];
  for (const match of html.matchAll(/\s(?:alt|title|aria-label)="([^"]*)"/g)) {
    texts.push({ where: "attribute", text: match[1] });
  }
  for (const match of html.matchAll(/<meta\s+(?:name|property)="([^"]+)"\s+content="([^"]*)"/g)) {
    if (/description|title|image:alt/.test(match[1])) {
      texts.push({ where: `meta ${match[1]}`, text: match[2] });
    }
  }
  const title = /<title>([\s\S]*?)<\/title>/.exec(html);
  if (title) texts.push({ where: "title", text: title[1] });
  return texts;
}

const visibleText = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");

const captions = (html) =>
  [...html.matchAll(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/gi)].map((match) => ({
    where: "figcaption",
    text: match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " "),
  }));

const altTexts = (html) =>
  [...html.matchAll(/<img\b[^>]*\salt="([^"]*)"/gi)].map((match) => ({
    where: "img alt",
    text: match[1],
  }));

/** Years in a string that no allowance covers, each with a little context. */
function offending(text) {
  const clean = decode(text);
  const hits = [];
  for (const match of clean.matchAll(YEAR)) {
    const at = match.index;
    const before = clean.slice(Math.max(0, at - 6), at).toLowerCase();
    if (match[0] === FOUNDED && before.endsWith("since ")) continue;
    if (clean.slice(Math.max(0, at - 2), at) === "© ") continue;
    hits.push(clean.slice(Math.max(0, at - 50), at + 30).trim());
  }
  return hits;
}

const files = await htmlFiles(OUT);
let failures = 0;
let scannedProjectPages = 0;

for (const file of files) {
  const rel = relative(OUT, file);
  const html = withoutScripts(await readFile(file, "utf8"));
  const isProjectPage = rel === "projects.html" || rel.startsWith("projects/");

  const texts = isProjectPage
    ? [{ where: "text", text: visibleText(html) }, ...attributeTexts(html)]
    : [...captions(html), ...altTexts(html)];

  const hits = texts.flatMap(({ where, text }) =>
    offending(text).map((context) => ({ where, context })),
  );
  if (isProjectPage) scannedProjectPages += 1;
  if (!hits.length) continue;

  failures += hits.length;
  console.error(`✗ ${rel}`);
  for (const hit of hits) console.error(`    ${hit.where}: …${hit.context}…`);
}

if (!QUIET) {
  console.log(
    `Date check: ${scannedProjectPages} project pages scanned in full, ` +
      `${files.length - scannedProjectPages} other pages scanned for captions and alt text.`,
  );
}

if (failures) {
  console.error(`\n${failures} date(s) found on project pages or photo captions.`);
  process.exit(1);
}
if (!QUIET) console.log("✓ No dates on project pages or photo captions.");
