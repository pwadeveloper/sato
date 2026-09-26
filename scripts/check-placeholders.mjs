#!/usr/bin/env node
/**
 * Fails the production build while any `{{CONFIRM: ...}}` remains in /content.
 *
 *   node scripts/check-placeholders.mjs            # report, exit 1 if any found
 *   node scripts/check-placeholders.mjs --report   # also rewrite docs/open-items.md
 *   node scripts/check-placeholders.mjs --allow-empty-exit   # never exit non-zero
 *
 * Two things block a production build:
 *
 *  1. `{{CONFIRM: note}}` markers in /content. These are for copy the site
 *     cannot launch without. Optional content is stored empty ("" or []) and
 *     its section is hidden, so it never appears here.
 *  2. Services still marked `"reviewStatus": "draft"` in services.json. Those
 *     describe capabilities Sato has not yet approved. Unreviewed capability
 *     claims must not reach an oil company's procurement team.
 *
 * The report is grouped by *who has to answer*, not by which file the question
 * came from. Anything touching the oil and gas service needs both Sato and its
 * technical collaborator, and sending the client a single flat list would hide
 * that half of it is not his to answer alone.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const REPORT = join(ROOT, "docs", "open-items.md");

const PATTERN = /\{\{CONFIRM(?::\s*([\s\S]*?))?\}\}/g;

/**
 * Services whose copy Sato cannot sign off alone.
 *
 * The oil and gas page describes a joint offer and quotes a partner's track
 * record, so both parties have to approve it before it can be published.
 */
const COLLABORATOR_SLUGS = new Set(["oil-gas"]);

const GROUPS = [
  {
    id: "client",
    heading: "Client to confirm",
    blurb:
      "Questions for Sato. Everything here is either visible on the site as a" +
      " placeholder, or a service whose copy is written but not yet approved.",
  },
  {
    id: "collaborator",
    heading: "Client and collaborator to confirm",
    blurb:
      "The oil and gas service describes a joint offer and quotes the partner" +
      " team's track record, so both Sato and its technical collaborator have" +
      " to approve these before the page can be published.",
  },
  {
    id: "on-hold",
    heading: "On hold",
    blurb:
      "Decided, but deliberately parked. Nothing here blocks the build —" +
      " it is recorded so it is not lost.",
  },
];

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
  // A field that is nothing but the placeholder has no sentence to quote, and
  // "[ ? ]" on its own tells the reader nothing.
  if (marked === "[ ? ]") return "_(the whole field is this question)_";
  if (marked.length <= 180) return marked;
  const at = marked.indexOf("[ ? ]");
  const from = Math.max(0, at - 80);
  return (from ? "…" : "") + marked.slice(from, at + 100).trim() + "…";
}

const files = await jsonFiles(CONTENT);
const servicesFile = join(CONTENT, "services.json");
const services = JSON.parse(await readFile(servicesFile, "utf8"));

/**
 * Which service a placeholder inside services.json belongs to.
 *
 * The walker reports a path like `[5].partner.caseStudy.note`; the leading
 * index is the position in the array, which is how a question gets routed to
 * the people who can answer it.
 */
function serviceForPath(path) {
  const index = Number(/^\[(\d+)\]/.exec(path)?.[1]);
  return Number.isInteger(index) ? services[index] : undefined;
}

/** Who has to answer this placeholder. */
function ownerOf(file, path) {
  if (file !== servicesFile) return "client";
  const service = serviceForPath(path);
  return service && COLLABORATOR_SLUGS.has(service.slug)
    ? "collaborator"
    : "client";
}

const groups = new Map();
let total = 0;

for (const file of files) {
  const parsed = JSON.parse(await readFile(file, "utf8"));
  const items = [...walk(parsed)].map((item) => ({
    ...item,
    owner: ownerOf(file, item.path),
  }));
  if (!items.length) continue;
  total += items.length;
  groups.set(groupName(file), {
    file: relative(ROOT, file),
    rank: groupRank(file),
    items,
  });
}

/* -------------------------------------------------- unapproved services */

const drafts = services
  .filter((service) => service.reviewStatus === "draft")
  .map((service) => ({
    slug: service.slug,
    name: service.name,
    owner: COLLABORATOR_SLUGS.has(service.slug) ? "collaborator" : "client",
  }));

/* ------------------------------------------------------------ terminal */

const ordered = [...groups.entries()].sort(([, a], [, b]) =>
  a.rank[0] - b.rank[0] || String(a.rank[1]).localeCompare(String(b.rank[1])),
);

if (!total && !drafts.length) {
  console.log("No unresolved placeholders, and every division is approved.");
} else if (!total) {
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

if (drafts.length) {
  console.log(`${drafts.length} division(s) awaiting Sato's approval:`);
  drafts.forEach((d) => console.log(`    ${d.slug} — ${d.name}`));
  console.log("  See docs/services-for-review.md\n");
}

/* -------------------------------------------------------------- report */

if (process.argv.includes("--report")) {
  const today = new Date().toISOString().slice(0, 10);

  /**
   * The hand-kept half of the report.
   *
   * `docs/open-items-extra.md` holds one `## <group heading>` section per
   * group, for the things the build cannot detect — a missing logo file, a
   * photograph, a decision. Its sections are merged into the matching
   * generated group rather than dumped at the end, so the client reads one
   * list per audience instead of two.
   */
  const extraPath = join(ROOT, "docs", "open-items-extra.md");
  const extraRaw = await readFile(extraPath, "utf8").catch(() => "");
  const extra = new Map();
  for (const block of extraRaw.split(/^## /m).slice(1)) {
    const newline = block.indexOf("\n");
    const heading = block.slice(0, newline).trim();
    const group = GROUPS.find((entry) => entry.heading === heading);
    if (group) extra.set(group.id, block.slice(newline + 1).trim());
  }

  const lines = [
    "# Open items",
    "",
    "Everything the website still needs, grouped by who has to answer it.",
    "",
    `**${total} placeholder${total === 1 ? "" : "s"} outstanding** and ` +
      `**${drafts.length} service${drafts.length === 1 ? "" : "s"} awaiting approval.** ` +
      `Generated ${today} by \`npm run check:placeholders\`, so the detected ` +
      "items are always current. The rest is kept by hand in " +
      "`docs/open-items-extra.md`.",
    "",
    "A placeholder is text that is visible on the site right now. The " +
      "production build is blocked until every one is resolved and every " +
      "service is approved.",
    "",
  ];

  for (const group of GROUPS) {
    const placeholders = ordered
      .map(([name, entry]) => [
        name,
        entry,
        entry.items.filter((item) => item.owner === group.id),
      ])
      .filter(([, , items]) => items.length > 0);

    const groupDrafts = drafts.filter((draft) => draft.owner === group.id);
    const handKept = extra.get(group.id);

    if (!placeholders.length && !groupDrafts.length && !handKept) continue;

    lines.push("---", "", `## ${group.heading}`, "", group.blurb, "");

    for (const [name, entry, items] of placeholders) {
      lines.push(`### ${name}`, "");
      for (const item of items) {
        lines.push(`- **${item.note || "Needs confirming"}**`);
        lines.push("");
        lines.push(`  > ${context(item.value, item.raw)}`);
        lines.push("");
        lines.push(`  <sub>${entry.file} → \`${item.path}\`</sub>`);
        lines.push("");
      }
    }

    if (groupDrafts.length) {
      lines.push(
        "### Services awaiting approval",
        "",
        "These describe what each service offers. They are capability " +
          "descriptions, not claims of work already delivered. The full text " +
          "is in `docs/services-for-review.md`.",
        "",
      );
      groupDrafts.forEach((draft) => lines.push(`- **${draft.name}**`));
      lines.push("");
    }

    if (handKept) lines.push(handKept, "");
  }

  lines.push(
    "---",
    "",
    "## How to answer",
    "",
    "Each placeholder shows the question in bold and, underneath it, the " +
      "sentence it appears in — `[ ? ]` marks the exact spot. Reply against " +
      "the bold question; the small grey line is only there so we can find " +
      "the right field.",
    "",
    "Anything you cannot answer yet, say so and we will decide together " +
      "whether to cut the sentence or hold the page back.",
    "",
  );

  await writeFile(REPORT, lines.join("\n"));
  console.log(`Wrote ${relative(ROOT, REPORT)}`);
}

/* ---------------------------------------------------------------- gate */

if ((total || drafts.length) && !process.argv.includes("--allow-empty-exit")) {
  console.error(
    "\nProduction build blocked: resolve the placeholders and get the drafted" +
      " divisions approved, or run `npm run build` for a development build that" +
      " allows them.",
  );
  process.exit(1);
}
