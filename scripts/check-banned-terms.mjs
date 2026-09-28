#!/usr/bin/env node
/**
 * Scans the exported site and fails on anything the company has asked never
 * to publish.
 *
 *   node scripts/check-banned-terms.mjs          # exit 1 on any hit
 *   node scripts/check-banned-terms.mjs --quiet  # only print failures
 *
 * This runs against `/out`, not `/content`, because that is the only place
 * the question can actually be answered. A term can reach the built HTML from
 * a component, a page title, a meta description, an alt attribute, a URL in a
 * link, JSON-LD or the sitemap — grepping the content files would miss most of
 * those routes.
 *
 * Two families of rule:
 *
 *  1. Banned terms. The company is registering internationally and must not
 *     read as tied to one country, and the former name and registration
 *     number are off the site (see `showRcNumber` in site.json).
 *
 *  2. Contact details. Exactly one email address and one telephone number may
 *     appear anywhere on the site. The source material for the oil and gas
 *     pages contained personal contact details for the founder, and this is
 *     the check that stops one reaching production by accident.
 *
 * One scoped exception. The founder's own profile names each institution in
 * full, country included, because he asked for it. So the country pattern —
 * and only that pattern — skips whatever sits inside an element marked
 * `data-allow-country="true"`, and only on the leadership page. Everything
 * else on that page is scanned as before, including its title, meta
 * description, Open Graph tags and JSON-LD; and the attribute appearing on
 * any other page is itself a failure, so the exemption cannot spread by
 * being copied.
 */
import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const QUIET = process.argv.includes("--quiet");

/** Files worth reading: anything a visitor or a crawler is served as text. */
const SCANNED = new Set([".html", ".xml", ".txt", ".json"]);

const ALLOWED_EMAIL = "info@satoengineering.com";
/** The one telephone number, as bare digits, for comparison. */
const ALLOWED_PHONE_DIGITS = "2348033303278";

const TERMS = [
  {
    id: "country",
    pattern: /nigerian?/gi,
    why: "the site must not read as tied to one country",
  },
  {
    id: "former-name",
    pattern: /formerly/gi,
    why: "the change of name is not mentioned anywhere on the site",
  },
  {
    id: "rc-number",
    pattern: /317208/g,
    why: "the registration number is held back — see showRcNumber in site.json",
  },
];

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
/**
 * International numbers only: a leading `+` or `00`, then at least nine
 * digits with the usual separators. Anchoring on the prefix keeps years,
 * quantities and identifiers out of the results.
 */
const PHONE = /(?:\+|\b00)\d[\d\s().‑-—-]{7,}\d/g;
const TEL_HREF = /href="tel:([^"]+)"/g;

/**
 * The one page whose marked element may carry country names.
 *
 * Every file the leadership route emits, not just its HTML: Next also writes
 * the same tree as React flight payloads (`leadership.txt`, the `__next.*`
 * files), which are served for client-side navigation and contain a second
 * copy of the bio. The page's title, meta description, Open Graph tags and
 * JSON-LD are real markup in `leadership.html` and are scanned there
 * whatever happens to the payloads.
 */
const COUNTRY_EXCEPTION =
  /^out[/\\]leadership(?:[/\\].*)?\.(?:html|txt)$/;
const ALLOW_ATTR = 'data-allow-country="true"';
/**
 * The attribute actually set to true, in any of the three encodings it is
 * written in: the rendered attribute, the flight payload, and the flight
 * payload escaped inside a script tag in the HTML. Matching the value
 * matters — React serialises the unset case as `"$undefined"`, and a page
 * that merely *renders* the component without opting in must not be flagged.
 */
const ALLOW_ATTR_SET = /data-allow-country\\?["']?\s*[:=]\s*\\?["']?true/i;

/**
 * Blanks every `data-allow-country="true"` subtree, preserving length.
 *
 * Spaces rather than deletion because `context()` reports a hit by its offset
 * into the string it scanned — keeping the length identical means the country
 * rule's messages line up with every other rule's, which all still scan the
 * untouched document.
 *
 * The walk counts nested tags of the same name so a `<div>` inside the marked
 * `<div>` cannot end it early. Anything it cannot parse is left in place: an
 * unparsed element is scanned, which fails loudly, rather than skipped, which
 * would let a country name through unseen.
 */
function blankAllowedCountry(text) {
  let out = text;

  for (let guard = 0; guard < 50; guard += 1) {
    const at = out.search(ALLOW_ATTR_SET);
    if (at === -1) return out;

    const span =
      out.startsWith(ALLOW_ATTR, at) || out[at + ALLOW_ATTR.indexOf("=")] === "="
        ? elementSpan(out, at)
        : objectSpan(out, at);

    // Unparsed means scanned, not skipped: leaving it in place fails the
    // check loudly rather than waving a country name through unseen.
    if (!span) return out;

    out = out.slice(0, span[0]) + " ".repeat(span[1] - span[0]) + out.slice(span[1]);
  }

  return out;
}

/** `[start, end)` of the HTML element carrying the attribute at `at`. */
function elementSpan(text, at) {
  const open = text.lastIndexOf("<", at);
  const name = open === -1 ? null : /^<([a-zA-Z][\w-]*)/.exec(text.slice(open, at))?.[1];
  const openEnd = text.indexOf(">", at);
  if (!name || openEnd === -1) return null;

  const tags = new RegExp(`<(/?)${name}\\b`, "gi");
  tags.lastIndex = openEnd + 1;
  let depth = 1;
  for (let match; (match = tags.exec(text)); ) {
    depth += match[1] ? -1 : 1;
    if (depth === 0) {
      const close = text.indexOf(">", match.index);
      return close === -1 ? null : [open, close + 1];
    }
  }
  return null;
}

/**
 * `[start, end)` of the serialized props object carrying the attribute.
 *
 * React writes the same subtree a second time as flight data, where the
 * element is `{"data-allow-country":"true","children":[…]}`. Braces are
 * literal in both the raw and the backslash-escaped spelling, so counting
 * them finds the object without having to know which one this is. An
 * unbalanced count returns null, which leaves the text to be scanned.
 */
function objectSpan(text, at) {
  const open = text.lastIndexOf("{", at);
  if (open === -1) return null;

  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === "{") depth += 1;
    else if (text[i] === "}") {
      depth -= 1;
      if (depth === 0) return [open, i + 1];
    }
  }
  return null;
}

/** Every scannable file under `dir`, sorted for stable output. */
async function walk(dir) {
  const found = [];
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(full)));
    else if (SCANNED.has(extname(entry.name))) found.push(full);
  }
  return found;
}

/** The text around a hit, so the failure names the sentence, not the offset. */
function context(text, index, length) {
  const from = Math.max(0, index - 70);
  const to = Math.min(text.length, index + length + 70);
  const slice = text
    .slice(from, to)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return (from ? "…" : "") + slice + (to < text.length ? "…" : "");
}

let files;
try {
  files = await walk(OUT);
} catch {
  console.error(
    `No exported site at ${relative(ROOT, OUT)}. Run \`npm run build\` first.`,
  );
  process.exit(1);
}

const failures = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  const where = relative(ROOT, file);

  const exempt = COUNTRY_EXCEPTION.test(where);

  // The marker belongs on the leadership page and nowhere else. Finding it
  // elsewhere means the exemption has been copied, which is exactly how a
  // scoped exception stops being scoped.
  if (!exempt && ALLOW_ATTR_SET.test(text)) {
    const at = text.search(ALLOW_ATTR_SET);
    failures.push({
      file: where,
      rule: "country-exception",
      found: "data-allow-country",
      why: "only the founder's bio on the leadership page may carry country names",
      context: context(text, at, ALLOW_ATTR.length),
    });
  }

  // Only the country rule is relaxed, and only inside the marked element.
  const countryText = exempt ? blankAllowedCountry(text) : text;

  for (const term of TERMS) {
    const scanned = term.id === "country" ? countryText : text;
    term.pattern.lastIndex = 0;
    for (const match of scanned.matchAll(term.pattern)) {
      failures.push({
        file: where,
        rule: term.id,
        found: match[0],
        why: term.why,
        context: context(scanned, match.index ?? 0, match[0].length),
      });
    }
  }

  for (const match of text.matchAll(EMAIL)) {
    if (match[0].toLowerCase() === ALLOWED_EMAIL) continue;
    failures.push({
      file: where,
      rule: "email",
      found: match[0],
      why: `only ${ALLOWED_EMAIL} may appear on the site`,
      context: context(text, match.index ?? 0, match[0].length),
    });
  }

  for (const match of [...text.matchAll(PHONE), ...text.matchAll(TEL_HREF)]) {
    const digits = (match[1] ?? match[0]).replace(/\D/g, "");
    if (digits === ALLOWED_PHONE_DIGITS) continue;
    failures.push({
      file: where,
      rule: "phone",
      found: match[0].trim(),
      why: "only +234 803 330 3278 may appear on the site",
      context: context(text, match.index ?? 0, match[0].length),
    });
  }
}

/* ------------------------------------------------------------------ report */

if (!failures.length) {
  if (!QUIET) {
    console.log(
      `Banned-terms check passed: ${files.length} exported file(s), no banned ` +
        `term, no contact detail other than ${ALLOWED_PHONE_DIGITS.replace(
          /^234(\d{3})(\d{3})(\d{4})$/,
          "+234 $1 $2 $3",
        )} and ${ALLOWED_EMAIL}.`,
    );
  }
  process.exit(0);
}

// One line per distinct problem, then where it appears — a term in the footer
// is otherwise reported once per page and buries everything else.
const byKey = new Map();
for (const failure of failures) {
  const key = `${failure.rule}\u0000${failure.found.toLowerCase()}`;
  if (!byKey.has(key)) byKey.set(key, { ...failure, files: new Set() });
  byKey.get(key).files.add(failure.file);
}

console.error(`\nBanned-terms check FAILED — ${byKey.size} problem(s):\n`);
for (const entry of byKey.values()) {
  console.error(`  [${entry.rule}] "${entry.found}" — ${entry.why}`);
  console.error(`      ${entry.context}`);
  const shown = [...entry.files].slice(0, 5);
  console.error(
    `      in ${entry.files.size} file(s): ${shown.join(", ")}` +
      (entry.files.size > shown.length ? ", …" : ""),
  );
  console.error("");
}

process.exit(1);
