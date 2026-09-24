#!/usr/bin/env node
/**
 * Fails the production build while any `{{CONFIRM: ...}}` remains in /content.
 *
 *   node scripts/check-placeholders.mjs            # report, exit 1 if any found
 *   node scripts/check-placeholders.mjs --report   # also rewrite docs/open-items.md
 *   node scripts/check-placeholders.mjs --allow-empty-exit   # never exit non-zero
 *
 * Unconfirmed copy is authored inline as `{{CONFIRM: note}}`. That is fine
 * while the site is being built — development highlights them — but shipping
 * one to satoengineering.com puts a note-to-self in front of a procurement
 * officer, so the production build refuses to run until they are resolved.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const REPORT = join(ROOT, "docs", "open-items.md");

const PATTERN = /\{\{CONFIRM(?::\s*([\s\S]*?))?\}\}/g;

/** Every .json under /content, deepest last, sorted for stable output. */
async function jsonFiles(dir) {
  const found = [];
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await jsonFiles(full)));
    else if (entry.name.endsWith(".json")) found.push(full);
  }
  return found;
}

/**
 * Walks parsed JSON and yields every placeholder with the path to the field
 * that holds it, e.g. `sections[2].items[0]`.
 */
function* walk(value, path = "") {
  if (typeof value === "string") {
    for (const match of value.matchAll(PATTERN)) {
      yield { path, note: (match[1] ?? "").trim(), raw: match[0], value };
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const [index, item] of value.entries()) {
      yield* walk(item, `${path}[${index}]`);
    }
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      yield* walk(item, path ? `${path}.${key}` : key);
    }
  }
}

/** Pages in the order a reader meets them; anything else sorts after. */
const PAGE_ORDER = [
  "home", "about", "services", "projects", "clients",
  "leadership", "hse", "equipment", "contact",
];

/** "content/pages/home.json" -> "Home"; "content/projects.json" -> "Projects". */
function groupName(file) {
  const rel = relative(CONTENT, file).replace(/\.json$/, "");
  const leaf = rel.split("/").pop() ?? rel;
  const title = leaf
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return rel.startsWith("pages/") ? `${title} page` : `${title} (shared)`;
}

/** Sort key: pages in site order, then shared collections alphabetically. */
function groupRank(file) {
  const rel = relative(CONTENT, file).replace(/\.json$/, "");
  const leaf = rel.split("/").pop() ?? rel;
  if (!rel.startsWith("pages/")) return [1, leaf];
  const index = PAGE_ORDER.indexOf(leaf);
  return [0, String(index === -1 ? PAGE_ORDER.length : index).padStart(2, "0")];
}

/**
 * The sentence the placeholder sits in, with the placeholder itself marked.
 *
 * Without this the report is a list of bare notes like "year" — the client
 * needs to see which sentence they are being asked about.
 */
function context(value, raw) {
  const marked = value.split(raw).join(" [ ? ] ").replace(/\s+/g, " ").trim();
  if (marked.length <= 180) return marked;
  const at = marked.indexOf("[ ? ]");
  const from = Math.max(0, at - 80);
  return (from ? "…" : "") + marked.slice(from, at + 100).trim() + "…";
}

const files = await jsonFiles(CONTENT);
const groups = new Map();
let total = 0;

for (const file of files) {
  const parsed = JSON.parse(await readFile(file, "utf8"));
  const items = [...walk(parsed)];
  if (!items.length) continue;
  total += items.length;
  groups.set(groupName(file), {
    file: relative(ROOT, file),
    rank: groupRank(file),
    items,
  });
}

/* ------------------------------------------------------------ terminal */

const ordered = [...groups.entries()].sort(([, a], [, b]) =>
  a.rank[0] - b.rank[0] || String(a.rank[1]).localeCompare(String(b.rank[1])),
);

if (!total) {
  console.log("No unresolved placeholders in /content.");
} else {
  console.log(`${total} unresolved placeholder(s) in /content:\n`);
  for (const [name, group] of ordered) {
    console.log(`  ${name}  —  ${group.file}`);
    for (const item of group.items) {
      console.log(`    ${item.path}`);
      console.log(`      ${item.note || "(no note)"}`);
    }
    console.log("");
  }
}

/* -------------------------------------------------------------- report */

if (process.argv.includes("--report")) {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    "# Open items — information we still need from Sato",
    "",
    "Everything below is a gap in the website copy. Each one is a real question,",
    "not a formatting problem: the site cannot go live with any of them showing,",
    "because the placeholder text would be visible to anyone who visited.",
    "",
    `**${total} item${total === 1 ? "" : "s"} outstanding.** Generated ${today} from the site content` +
      " by `npm run check:placeholders`, so this file is always current.",
    "",
    "---",
    "",
  ];

  for (const [name, group] of ordered) {
    lines.push(`## ${name}`, "");
    for (const item of group.items) {
      lines.push(`- **${item.note || "Needs confirming"}**`);
      lines.push("");
      lines.push(`  > ${context(item.value, item.raw)}`);
      lines.push("");
      lines.push(`  <sub>${group.file} → \`${item.path}\`</sub>`);
      lines.push("");
    }
  }

  lines.push(
    "---",
    "",
    "## How to answer",
    "",
    "Each item shows the question in bold and, underneath it, the sentence it",
    "appears in — `[ ? ]` marks the exact spot. Reply against the bold question;",
    "the small grey line is only there so we can find the right field.",
    "",
    "Anything you cannot answer yet, say so and we will decide together whether to",
    "cut the sentence or hold the page back.",
    "",
  );

  await writeFile(REPORT, lines.join("\n"));
  console.log(`Wrote ${relative(ROOT, REPORT)}`);
}

/* ---------------------------------------------------------------- gate */

if (total && !process.argv.includes("--allow-empty-exit")) {
  console.error(
    "\nProduction build blocked: resolve the placeholders above, or run" +
      " `npm run build` for a development build that allows them.",
  );
  process.exit(1);
}
