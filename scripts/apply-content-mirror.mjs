#!/usr/bin/env node
/**
 * Applies scripts/content-mirror-plan.json to the site
 * (docs/decisions/mirror-old-site-content.md). Two steps, with
 * `npm run images` between them:
 *
 *   node scripts/apply-content-mirror.mjs --selection   # files to make / retire
 *   npm run images
 *   node scripts/apply-content-mirror.mjs               # content/*.json
 *
 * The plan is the only input: which project each old-site photograph belongs
 * to and in what order, its cleaned caption, which batch photographs stay or
 * are held, the one photograph each tile and header uses, and the old site's
 * titles, details and narratives. Re-running either step is harmless.
 */
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const write = (p, v) => writeFileSync(join(ROOT, p), JSON.stringify(v, null, 2) + "\n");
const plan = read("scripts/content-mirror-plan.json");
const OLD_BASE = "https://www.satoengineering.com/wp-content/uploads/";

/** The upright working copy of a batch photograph. */
function batchSource(id) {
  const all = read("raw-assets/client-photos/_work/all-manifest.json").photos;
  const p = all.find((x) => x.id === id);
  if (!p) throw new Error(`no batch photograph ${id}`);
  return { source: `raw-assets/client-photos/${p.workFile}`, originalFilename: p.originalPath };
}

/** Alt text from a caption: what the photograph shows, without the credit line. */
const altFrom = (caption) =>
  caption.replace(/^Picture showing /i, "").replace(/ by Sato\.?$/, "").replace(/\.$/, "").replace(/^./, (c) => c.toUpperCase());

/* ------------------------------------------------------------ selection -- */

/** Files from prompt 16 that this round retires: held photographs and their crops. */
const RETIRE = [
  "projects/ogere-water-supply-scheme-rehabilitation/ground-tank",
  "projects/asphaltic-concrete-road-and-drainage-ajebo/road-and-kerbed-island",
  "projects/asphaltic-concrete-road-and-drainage-ajebo/tandem-roller",
  "projects/asphaltic-concrete-road-and-drainage-ajebo/kerbed-road-junction",
  "projects/ilaro-school-of-nursing/building-and-water-tower",
  "services/civil-engineering-construction/life-university-road-header",
  "services/civil-engineering-construction/funaab-building-red-and-brick",
  "services/civil-engineering-construction/funaab-building-courtyard",
  "services/water-resources-development-management/arakanga-sand-filter-header",
  "services/electrical-engineering/iperu-booster-station-capacitor-panel",
];

if (process.argv.includes("--selection")) {
  const sel = read("scripts/client-photo-selection.json");
  sel.photos = sel.photos.filter((p) => !RETIRE.includes(p.out));
  for (const out of RETIRE) for (const s of ["", "-800"]) rmSync(join(ROOT, "public", "images", `${out}${s}.webp`), { force: true });

  const wanted = [];
  for (const o of plan.old.filter((x) => x.out)) {
    const src = o.batch ? batchSource(o.batch) : { source: o.source ?? `raw-assets/old-site/${o.url.replace(OLD_BASE, "")}`, originalFilename: `old site: ${o.url.replace(OLD_BASE, "")}` };
    wanted.push({ out: o.out, working: o.batch ?? null, oldSite: o.url, ...src, alt: altFrom(o.caption), ...(o.crop ? { crop: o.crop, cropWhy: o.cropWhy } : {}) });
  }
  for (const group of Object.values(plan.roles)) for (const r of Object.values(group)) {
    if (!r.out) continue;
    const src = batchSource(r.batch);
    const base = sel.photos.find((p) => p.working === r.batch) ?? wanted.find((p) => p.working === r.batch);
    wanted.push({ out: r.out, working: r.batch, ...src, alt: base?.alt ?? r.out, header: { aspect: [16, 7], focusY: r.focusY ?? 0.5 } });
  }
  for (const w of wanted) {
    const i = sel.photos.findIndex((p) => p.out === w.out);
    if (i >= 0) sel.photos[i] = { ...sel.photos[i], ...w };
    else sel.photos.push(w);
  }
  write("scripts/client-photo-selection.json", sel);
  console.log(`selection: ${sel.photos.length} entries; retired ${RETIRE.length}; ${wanted.length} added or refreshed. Now run npm run images.`);
  process.exit(0);
}

/* -------------------------------------------------------------- content -- */

const manifest = read("scripts/client-photo-manifest.json").approved;
const imageMap = read("scripts/image-map.json").images;
/** Width and height of a published file, from whichever pipeline made it. */
function dims(file) {
  const a = manifest.find((x) => x.src === `/images/${file}.webp`);
  if (a) return { width: a.width, height: a.height };
  const m = imageMap.find((x) => x.out === file);
  if (m && existsSync(join(ROOT, "public", "images", `${file}.webp`))) {
    const buf = readFileSync(join(ROOT, "public", "images", `${file}.webp`));
    // VP8X/VP8/VP8L headers — enough for a width and height without decoding.
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") { const b = buf.readUInt32LE(21); return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 }; }
  }
  throw new Error(`no dimensions for ${file}`);
}
const fileOf = (x) => x.file ?? x.out;
const ref = (x, caption) => {
  const file = fileOf(x);
  if (!existsSync(join(ROOT, "public", "images", `${file}.webp`))) throw new Error(`missing /images/${file}.webp — run npm run images`);
  const text = caption === null ? null : caption ?? x.caption;
  // A captioned photograph's alt text comes from its caption; a header or
  // tile has none, and keeps the description written when the file was made.
  const recorded = manifest.find((a) => a.src === `/images/${file}.webp`)?.alt ?? imageMap.find((m) => m.out === file)?.alt;
  return { src: `/images/${file}.webp`, alt: x.alt ?? (text ? altFrom(text) : recorded), ...dims(file), ...(text ? { caption: text } : {}) };
};

// Projects: the old site's photographs in its order, then the kept new ones.
const projects = read("content/projects.json");
for (const p of projects) {
  const old = plan.old.filter((o) => o.action === "project" && o.target === p.slug);
  const kept = plan.batch.filter((b) => b.action === "kept" && b.target === p.slug);
  p.images = [...old, ...kept].map((x) => ref(x));
  const t = plan.projects[p.slug];
  if (t) {
    for (const k of ["title", "client", "location", "summary"]) if (t[k]) p[k] = t[k];
    if (t.scope) p.scope = t.scope;
  }
}
write("content/projects.json", projects);

// Services: headers from the plan's roles; galleries only what the plan keeps there.
const services = read("content/services.json");
const rolesH = plan.roles.serviceHeaders;
for (const s of services) {
  const r = rolesH[s.slug];
  if (r?.none) delete s.image;
  else if (r) s.image = { ...ref(r, null), alt: s.image?.alt && fileOf(r) === s.image.src.replace(/^\/images\/|\.webp$/g, "") ? s.image.alt : ref(r, null).alt };
  const gallery = plan.batch.filter((b) => b.action === "service" && b.target === `services:${s.slug}`);
  if (s.group === "infrastructure") s.images = gallery.map((b) => ref(b));
}
write("content/services.json", services);

// Projects page: header, tiles, no stand-ins, and the category photographs.
const pp = read("content/pages/projects.json");
pp.images.header = ref(plan.roles.pageHeaders.projects, null);
pp.labels.categoryPhotos = "Other photographs";
const facets = pp.sections.find((x) => x.id === "all-projects").facets;
const categoryPhotos = (target) => plan.old.filter((o) => o.action === "category" && o.target === target).map((o) => ref(o));
for (const f of facets) {
  const tile = plan.roles.tiles[f.value];
  if (tile) f.image = ref(tile, null);
  delete f.placeholderImages;
  const own = categoryPhotos(f.value);
  if (own.length) f.photos = own; else delete f.photos;
  for (const sub of f.subcategories ?? []) {
    delete sub.placeholderImages;
    const photos = categoryPhotos(`${f.value}/${sub.id}`);
    if (photos.length) sub.photos = photos; else delete sub.photos;
  }
}
write("content/pages/projects.json", pp);

// About: the collage held a Medium-confidence photograph, so one photograph instead.
const about = read("content/pages/about.json");
const aboutPhoto = plan.batch.find((b) => b.target === "about");
about.images.aside = { ...ref(aboutPhoto, null), alt: "Water running through a sand filter during commissioning at the Arakanga water treatment plant, Abeokuta" };
delete about.imageSets;
write("content/pages/about.json", about);

// Page headers, each a different photograph.
const clients = read("content/pages/clients.json");
clients.images.header = ref(plan.roles.pageHeaders.clients, null);
writeFileSync(join(ROOT, "content/pages/clients.json"), readFileSync(join(ROOT, "content/pages/clients.json"), "utf8").replace(/("header": )\{[\s\S]*?\n    \}/, `$1${JSON.stringify(clients.images.header, null, 2).replace(/\n/g, "\n    ")}`));

const infra = read("content/pages/infrastructure.json");
infra.images.header = ref(plan.roles.pageHeaders.infrastructure, null);
// Its four solution-group pictures each repeated a photograph shown elsewhere.
for (const g of infra.serviceSections?.capabilities?.groups ?? []) delete g.image;
write("content/pages/infrastructure.json", infra);

console.log("content updated from the plan");
