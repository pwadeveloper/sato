#!/usr/bin/env node
/**
 * Every redirect in vercel.json lands on a page that exists, in one hop.
 *
 *   node scripts/check-redirects.mjs          # exit 1 on any failure
 *   node scripts/check-redirects.mjs --list   # also print every redirect
 *
 * Runs against `/out` after a build. For each redirect it checks:
 *
 *  1. The destination is a page the export actually wrote — not a route that
 *     was renamed, merged or hidden since the redirect was written.
 *  2. The destination is not itself caught by another redirect. Vercel would
 *     follow both, and a chain costs a round trip and some of the link's
 *     search value; a chain that loops never resolves at all.
 *  3. No redirect catches a page that exists. Vercel applies `redirects`
 *     before the filesystem, so a stale rule silently hides a live page —
 *     `/services/electrical-mechanical` once pointed at a route this round
 *     retired, and would have hidden the new page of that name.
 *  4. The source also matches the WordPress form with a trailing slash.
 *     Vercel compiles sources strictly, so `/our-team` does not match
 *     `/our-team/`; every source carries `{/}?` for that reason.
 *
 * Source patterns are matched here with the same reading Vercel gives them
 * (path-to-regexp, strict): `{/}?` is an optional slash, `:name*` any number
 * of segments. Redirects conditioned on a query (`has`) are checked for 1 and
 * 2 only, since their source path is a live page by design.
 */
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const LIST = process.argv.includes("--list");

const { redirects } = JSON.parse(await readFile(join(ROOT, "vercel.json"), "utf8"));

function toRegex(source) {
  let pattern = "";
  for (let i = 0; i < source.length; ) {
    if (source.startsWith("{/}?", i)) {
      pattern += "(?:/)?";
      i += 4;
    } else if (source.startsWith("/:", i)) {
      const name = /^\/:([A-Za-z]+)([*+?]?)/.exec(source.slice(i));
      const modifier = name[2];
      pattern +=
        modifier === "*" ? "(?:/[^/]+)*" : modifier === "+" ? "(?:/[^/]+)+" : modifier === "?" ? "(?:/[^/]+)?" : "/[^/]+";
      i += name[0].length;
    } else {
      pattern += source[i].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      i += 1;
    }
  }
  return new RegExp(`^${pattern}$`);
}

/** The file the export writes for a route, if it wrote one. */
function exported(path) {
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "");
  if (clean === "") return existsSync(join(OUT, "index.html"));
  return existsSync(join(OUT, `${clean}.html`)) || existsSync(join(OUT, clean, "index.html"));
}

const compiled = redirects.map((rule) => ({ ...rule, regex: toRegex(rule.source) }));
const unconditional = compiled.filter((rule) => !rule.has);
const problems = [];

for (const rule of compiled) {
  const dest = rule.destination;
  if (!exported(dest)) problems.push(`${rule.source} → ${dest}: destination is not a page in /out`);

  const chained = unconditional.find((other) => other !== rule && other.regex.test(dest));
  if (chained && dest !== "/")
    problems.push(`${rule.source} → ${dest}: chains into ${chained.source} → ${chained.destination}`);

  if (rule.has || /:/.test(rule.source)) continue;

  const literal = rule.source.replace(/\{\/\}\?$/, "");
  if (literal !== "/" && exported(literal))
    problems.push(`${rule.source}: hides a live page at ${literal}`);
  if (literal !== "/" && !rule.regex.test(`${literal}/`))
    problems.push(`${rule.source}: does not match the trailing-slash form ${literal}/`);

  if (LIST) console.log(`  ${rule.statusCode ?? (rule.permanent ? 308 : 307)}  ${literal}  →  ${dest}`);
}

if (problems.length) {
  console.error(`✗ ${problems.length} redirect problem(s):`);
  for (const problem of problems) console.error(`    ${problem}`);
  process.exit(1);
}
console.log(
  `✓ ${redirects.length} redirects: every destination is a live page, reached in one hop, ` +
    "and every source matches with or without a trailing slash.",
);
