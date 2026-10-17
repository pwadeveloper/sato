// Builds raw-assets/client-photos/_work/proposals.json and review.html.
// Usage: node build-review.mjs <path to _work>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WORK = process.argv[2];
const { photos } = JSON.parse(readFileSync(join(WORK, "filter-report.json"), "utf8"));
const byW = Object.fromEntries(photos.map((p) => [p.id, p]));

const RESCUED = {
  W001: "Blur score low because of the plain wall and sky; sharp on inspection.",
  W013: "Blur score low because of plain walls; sharp on inspection.",
  W022: "Blur score low because of plain walls and sky; sharp on inspection.",
  W044: "Blur score low because of plain walls; sharp on inspection.",
  W050: "Blur score low because of plain walls and paving; sharp on inspection.",
  W067: "Blur score low because the subject is a flat bed of sand; sharp on inspection.",
  W074: "Slightly soft at full size; fine at gallery size.",
  W095: "Blur score low because of the plain panel door; sharp on inspection.",
  W148: "Phone photograph, slightly soft; one of only two of the Unilag building.",
};

// Flags that apply wherever the photo is used.
const FLAG = {
  vest: "Hi-vis vests read “Sato Engineering Nigeria Limited” (former name + country) — legible at 1920px. Needs the text masked, or publish at 800px only.",
  board: "Project signboard reads “Federal Government of Nigeria” and “Sato Engineering Nigeria Limited” — legible at 1920px. Needs the board masked.",
  unilagBoard: "Project signboard shows the former company name and a Lagos street address. Needs a crop or mask.",
  tenant: "Tenant’s shop sign (“Raysak Nig Enterprises”) is legible at full size.",
  emf: "Recovered from a Word metafile at 16-bit colour: slight banding in skies.",
  small: "Under 1200px: gallery or card only, not a header.",
  scan: "Scanned print (no camera data); fine at card size.",
  people: "People in the middle distance.",
  old: "Taken 2006–2012 — not current work.",
};

const P = [];
let n = 0;
const add = (place, wid, confidence, reason, flags = [], extra = {}) =>
  P.push({ pid: `P${String(++n).padStart(3, "0")}`, place, wid, confidence, reason, flags, ...extra });
const gap = (to) => { n = to - 1; };

/* ---------- About ---------- */
const ABOUT_Q = "No water photograph in this batch is recent: the newest is May 2012. All four below are Ogere / Arakanga water-treatment work.";
add("about-single", "W089", "High", "Ground tank at the Ogere water supply scheme, holding water. No people, no signage, reads clearly at the aside’s size. Same structure as W087, which the document captions “Construction work in progress at Ogere water scheme”.", ["old"]);
add("about-single", "W065", "High", "Docx caption: “Sand filter during testing and commissioning at Arakanga water treatment plant in Abeokuta”. Water visibly running through the filter: the most “working water plant” image in the batch. Alternative to the tank.", ["emf", "old"]);
add("about-collage", "W065", "High", "Arakanga sand filter in operation (docx caption).", ["emf", "old"]);
add("about-collage", "W089", "High", "Ogere ground tank holding water.", ["old"]);
add("about-collage", "W110", "High", "Docx caption: “Construction of high lift pump building at Ogere water supply scheme”. The completed pump house.", ["old"]);
add("about-collage", "W081", "High", "Docx caption: “Constructed overhead tank at Oshitelu Memorial Grammar School at Ogere”.", ["small", "old"]);

/* ---------- Service pages ---------- */
gap(10);
add("svc-civil", "W019", "Medium", "Header. Life University roads (docx captions name Life University for this series; same campus buildings and same 26 June 2010 shoot as W021/W023). Finished asphalt, kerbs and a completed building in one frame.", [], { role: "header" });
add("svc-civil", "W024", "Low", "Completed asphalt road through a campus. Captioned “A section complete asphaltic concrete road”, location not given — gallery only.", [], { role: "gallery" });
add("svc-civil", "W027", "High", "Docx caption: “A section completed asphaltic concrete, Adetoro Close, Abeokuta”. Not a project on the site, so gallery only.", [], { role: "gallery" });
add("svc-civil", "W115", "High", "Docx caption: “Box culvert under construction”. No location.", [], { role: "gallery" });
add("svc-civil", "W141", "Medium", "Completed box culvert deck. The docx caption after it is “Construction of box culvert”; the one before it is a Fiditi caption, but the photograph is plainly a culvert, not a dam.", [], { role: "gallery" });
add("svc-civil", "W132", "High", "Classroom block with “Block of classrooms” painted on it; captioned School of Nursing, Ilaro. Also proposed for that project.", [], { role: "gallery" });
add("svc-civil", "W051", "High", "Completed lock-up shops, Owode Yewa market (docx caption).", ["tenant"], { role: "gallery" });
gap(20);
add("svc-electrical", "W094", "High", "Header. Docx caption: “Works complete in panels at Iperu booster station”. Capacitor bank and breakers, fully wired.", [], { role: "header" });
add("svc-electrical", "W095", "High", "Second completed panel at the Iperu booster station (same caption, same shoot).", [], { role: "gallery" });
gap(30);
add("svc-mechanical", "W054", "High", "Header. Docx caption: “The drilling rig and Ingersoll Rand compressor 825cfm”. Sato-branded compressor; no plates visible.", [], { role: "header" });
add("svc-mechanical", "W074", "High", "High lift pump installation at Ogere (docx caption; same photo as the current ogere-7 at 590px). The best mechanical photo in the batch.", ["vest", "people"], { role: "gallery" });
add("svc-mechanical", "W056", "High", "Docx caption: “Drilling work in progress at Laderin Estate, Abeokuta”. Crew in helmets and hi-vis, the best safety practice in the batch.", ["vest", "people"], { role: "gallery" });
gap(40);
add("svc-water", "W103", "Medium", "Header. Sato excavator dredging the Omi river (docx caption: “Work in progress at Omi River, Ibadan”).", [], { role: "header" });
add("svc-water", "W065", "High", "Arakanga sand filter in operation.", ["emf"], { role: "gallery" });
add("svc-water", "W090", "High", "Docx caption: “Construction of clear water tank in progress at the Ogere water supply scheme”. Base reinforcement, people small in the background.", [], { role: "gallery" });
add("svc-water", "W110", "High", "Completed high lift pump building, Ogere.", [], { role: "gallery" });
add("svc-water", "W081", "High", "Completed overhead tank, Oshitelu Memorial Grammar School, Ogere.", ["small"], { role: "gallery" });
add("svc-water", "W112", "High", "Docx caption: “Reinforcement work (erosion control) in progress at Mabunmi Junction, Ijebu-Ode”.", [], { role: "gallery" });
add("svc-water", "W061", "High", "Completed solar-powered borehole, Tube primary health centre (docx caption).", ["board"], { role: "gallery" });

/* ---------- Projects ---------- */
gap(101);
const proj = (slug, wid, conf, reason, flags = [], extra = {}) => add(`project:${slug}`, wid, conf, reason, flags, extra);
// Currently without a photograph.
proj("ijaiye-river-dredging", "W096", "High", "Docx caption: “Ongoing work in progress at Ijaye, Abeokuta”, and the photo is river dredging. The project is “Dredging of River, Ijaiye”, Abeokuta.", ["scan"]);
proj("ijaiye-river-dredging", "W097", "High", "Same caption and site; supervisor in a hard hat.", ["scan", "people"]);
proj("ogungbade-river-dredging", "W104", "Medium", "Docx caption: “Work in progress at Omi River, Ibadan”. The project is “Dredging of Omi Ogungbade River”, Oyo State, 2012, and the photos are dated May 2012. Ogungbade is on the edge of Ibadan, but the caption doesn’t name it — please confirm.", []);
proj("ogungbade-river-dredging", "W103", "Medium", "Same caption and same 12 May 2012 shoot.", []);
proj("ogungbade-river-dredging", "W106", "Medium", "Same caption and shoot.", []);
proj("ogungbade-river-dredging", "W105", "Medium", "Same caption.", ["emf"]);
proj("unilag-creative-arts-building", "W149", "High", "Filename “Creative Arts Building Unilag”, signboard naming the project and University of Lagos, Akoka, GPS on the Akoka campus, June 2015 (project year 2015). Portrait: the signboard sits in the lower right and can be cropped out.", ["unilagBoard"]);
proj("unilag-creative-arts-building", "W148", "High", "Same evidence. The signboard is near the centre, so it needs masking rather than cropping.", ["unilagBoard"]);
proj("ilaro-school-of-nursing", "W132", "High", "Docx caption “Construction of block of classrooms, School of Nursing Ilaro”, “Block of classrooms” painted on the building, taken June 2007 (project year 2007).", []);
proj("ilaro-school-of-nursing", "W002", "Medium", "Taken in the same minute as W132 (EXIF 8 June 2007, 16:53 vs 16:54), so the same site.", []);
// Better photographs for projects that already have one.
gap(111);
proj("asphaltic-concrete-road-and-drainage-ajebo", "W023", "High", "Docx caption: “Asphaltic concrete road under construction at Life University Ajebo”. Full-size original of the current ajebo-road-1 (544px).", []);
proj("asphaltic-concrete-road-and-drainage-ajebo", "W021", "High", "Same caption.", []);
proj("asphaltic-concrete-road-and-drainage-ajebo", "W025", "High", "Docx caption: “Asphaltic concrete road & drainage system under construction at Life University Ajebo”. Original of ajebo-road-2.", []);
proj("asphaltic-concrete-road-and-drainage-ajebo", "W020", "Medium", "Captioned without a location, but the same campus buildings and the same 26 June 2010 shoot as W021/W023.", []);
proj("asphaltic-concrete-road-and-drainage-ajebo", "W017", "Medium", "As W020.", []);
proj("mcpherson-administrative-block-and-laboratory", "W088", "High", "Docx caption: “Work in progress at McPherson University administrative block, Ajebo”. Full-size original of mcpherson-admin-1 (589px).", []);
proj("mcpherson-administrative-block-and-laboratory", "W099", "High", "Same caption: the rear of the administrative block.", ["emf"]);
proj("mcpherson-administrative-block-and-laboratory", "W052", "High", "Docx caption: “Construction of laboratory building in progress at McPherson University”.", []);
proj("obstetrics-care-facility-mowe", "W033", "High", "Docx caption: “Work in progress at obstetrics care facility in Mowe”. 2048px vs the current 927px.", []);
proj("owode-yewa-lock-up-shops", "W051", "High", "Docx caption: “Block of shops at Owode Yewa International Market”.", ["tenant"]);
proj("horizon-suites-hotel-complex", "W044", "High", "Docx caption: “Horizon Suites in Ibadan constructed by Sato”. Hotel sign visible. 2816px vs 929px now.", []);
proj("horizon-suites-hotel-complex", "W050", "High", "Same caption; the chalet courtyard.", []);
proj("alabi-olorunda-primary-health-centre", "W022", "High", "Docx caption: “Completed national primary health centre at Alabi-Olorunda”. Taken June 2007 (project year 2007). 2816px vs 602px now.", []);
proj("iperu-area-office", "W001", "Medium", "Same photograph as the current iperu-1, which the old website labelled “Iperu area office”. The document places it at the top beside a general heading, not under the Iperu caption.", []);
proj("solar-powered-boreholes", "W061", "High", "Docx caption: “Completed solar powered borehole project at primary health centre Tube”. The signboard confirms it.", ["board"]);
proj("solar-powered-boreholes", "W063", "High", "Docx caption: borehole at the Ago-Sasa primary health centre.", ["board"]);
proj("solar-powered-boreholes", "W064", "High", "Docx caption: borehole at the Ijofin primary health centre.", ["board"]);
proj("solar-powered-boreholes", "W062", "High", "Docx caption: borehole at Methodist Primary School, Ijofin.", ["board"]);
proj("solar-powered-boreholes", "W057", "High", "Docx caption and signboard: borehole at the Idogo primary health centre.", ["board"]);
proj("ogere-water-supply-scheme-rehabilitation", "W110", "High", "Completed high lift pump building (docx caption). Original of ogere-8.", []);
proj("ogere-water-supply-scheme-rehabilitation", "W090", "High", "Clear water tank in progress (docx caption).", []);
proj("ogere-water-supply-scheme-rehabilitation", "W089", "Medium", "Ground tank: its caption names no site, but it sits in the Ogere section and is the same tank as W087, which is captioned Ogere.", []);
proj("ogere-water-supply-scheme-rehabilitation", "W081", "High", "Completed overhead tank at Oshitelu Memorial Grammar School (docx caption). Original of ogere-10 at higher resolution.", ["small"]);
proj("ogere-water-supply-scheme-rehabilitation", "W074", "High", "High lift pump installation (docx caption). Original of ogere-7.", ["vest", "people"]);
proj("fiditi-earth-dam", "W127", "High", "Docx caption: access ramp for the segment 2 cut-off trench. Original of fiditi-1.", ["people"]);
proj("fiditi-earth-dam", "W134", "High", "Docx caption: compaction of the cut-off trench. Original of fiditi-2.", []);
proj("fiditi-earth-dam", "W128", "High", "Docx caption: clearing the river course downstream. Original of fiditi-3.", []);
proj("fiditi-earth-dam", "W124", "High", "Docx caption: ramp access to the first cut-off trench segment.", []);
proj("fiditi-earth-dam", "W131", "High", "Docx caption: excavation for the third cut-off trench segment.", []);
proj("fiditi-earth-dam", "W126", "High", "Docx caption: topsoil removal in the third segment.", []);
proj("fiditi-earth-dam", "W137", "High", "Docx caption: spreading clay for the second segment.", []);
proj("fiditi-earth-dam", "W113", "Medium", "Placed among the Mabunmi photos, but its caption names Fiditi and it matches the Fiditi series (same camera, same resolution, Feb 2012).", []);

/* ---------- Landing tiles ---------- */
gap(151);
add("tiles", "W088", "High", "Civil Engineering & Construction tile (replaces funaab-colplant-1, 1040×520). McPherson administrative block.", [], { tile: "civil-engineering-construction" });
add("tiles", "W094", "High", "Electrical Engineering tile (replaces the Sagamu pump-panel photo). Iperu booster station panel.", [], { tile: "electrical-engineering" });
add("tiles", "W089", "High", "Water Resources tile (replaces ogere-1, a rebar mat). Ogere ground tank holding water.", [], { tile: "water-resources-development-management" });
add("tiles-placeholder", "W099", "High", "Optional: Buildings stand-in (today it is the AI-generated drawing photograph). Plain view of a completed block, no signage.", ["emf"], { tile: "buildings" });
add("tiles-placeholder", "W027", "High", "Optional: Roads & Pavements stand-in. A completed carriageway.", [], { tile: "roads-pavements" });
add("tiles-placeholder", "W095", "High", "Optional: Electrical stand-in.", [], { tile: "electrical-engineering" });
add("tiles-placeholder", "W065", "High", "Optional: Water Resources stand-in.", ["emf"], { tile: "water-resources-development-management" });

/* ---------- Possible new projects ---------- */
gap(201);
const A = "Building A — red, white and brick, three storeys. WhatsApp copies (1080px, no date or location data, filenames are random IDs). Nothing names the building.";
const B = "Building B — cream, three storeys round a grassed courtyard. WhatsApp copies, nothing names the building. It resembles the FUNAAB administrative block already on the site (three storeys of open corridors round a court), but that one has red balustrades — not enough to match.";
for (const w of ["W146", "W144", "W152", "W153", "W143", "W150"]) add("new-a", w, "—", A, ["small"]);
for (const w of ["W145", "W147", "W151"]) add("new-b", w, "—", B, ["small"]);

/* ---------- Unassigned but good ---------- */
gap(301);
const un = (type, wid, reason, flags = []) => add(`unassigned:${type}`, wid, "Low", reason, flags);
un("water", "W098", "Docx caption: “Ongoing work in progress at Sagamu”. River dredging. There is a Sagamu intake project, but nothing ties these to it.", ["scan"]);
un("water", "W100", "Sagamu, as W098.", ["scan"]);
un("water", "W101", "Sagamu, as W098.", ["scan"]);
un("water", "W114", "Docx caption: erosion control at Mabunmi Junction, Ijebu-Ode (Feb 2011). The site’s Ijebu-Ode project is Ajagunmolu flood and erosion control (2014): same town, different name and year.", []);
un("water", "W119", "Mabunmi Junction excavation (May 2009).", []);
un("water", "W120", "Mabunmi Junction excavation (May 2009).", []);
un("water", "W067", "Arakanga water treatment plant: sand loaded in the filter. Arakanga isn’t a project on the site.", ["emf"]);
un("roads", "W014", "Road works in Lagos: GPS puts this BlackBerry set (Oct 2011) around Oshodi/Ilupeju. No project on the site matches. Note: the current lagos-road-1 is W015 from this set, filed under Amuwo Odofin, about 10 km away.", []);
un("roads", "W015", "Same Lagos set; this is the photo now shown as lagos-road-1.", []);
un("roads", "W006", "Same Lagos set: fresh asphalt on a campus road.", []);
un("roads", "W026", "Docx caption: “Completed section of road”. Same shoot as the Adetoro Close photo.", []);
un("roads", "W018", "Life University series, captioned without a location.", []);
un("buildings", "W013", "The document captions this “Administrative block, School of Nursing Ilaro”, but EXIF puts it two minutes before the Alabi-Olorunda health centre photo (W022), and it looks like the same building. The evidence conflicts, so it isn’t matched.", []);
un("buildings", "W055", "Sato’s office in Abeokuta (docx caption). No place on the site for it now.", []);
un("buildings", "W066", "Sato’s office in Abeokuta, front elevation.", []);

writeFileSync(join(WORK, "proposals.json"), JSON.stringify({ generated: new Date().toISOString(), rescuedFromFilter: RESCUED, flags: FLAG, proposals: P }, null, 2));

/* ---------- Excluded ---------- */
const EXCL = {
  safety: [["W003", "Deep trench, workers without helmets"], ["W005", "Workers without helmets beside a grader"], ["W010", "Workers without helmets, close"], ["W011", "Roller crew without helmets"], ["W012", "Workers beside rollers without helmets"], ["W068", "Inside a filter bed, no PPE"], ["W069", "Man standing on beams over an open filter cell, no helmet"], ["W072", "Pipe-joint crew without helmets, faces close"], ["W073", "Worker in a pit without a helmet"], ["W075", "Filter bed crew without helmets (currently on the site as ogere-6)"], ["W076", "People in a deep trench without helmets (currently on the site as ogere-12)"], ["W078", "People in a trench without helmets"], ["W079", "Unshored trench, mixed PPE"], ["W082", "Pipe laying, no helmets"], ["W083", "Deep unshored trench, workers without helmets"], ["W085", "Worker without a helmet on rebar (current ogere-2)"], ["W087", "Group without helmets on an excavation edge"], ["W091", "Crew on rebar without helmets"], ["W116", "Workers on formwork edge without helmets"], ["W122", "Stone-pitching crew without helmets"], ["W123", "Client inspection, no PPE (currently on the site as ogere-11)"], ["W140", "People at a flooded excavation edge without helmets"], ["W142", "Drain crew without helmets"]],
  privacy: [["W058", "Crowd of women and children at the tap stand"], ["W060", "Children, one partly dressed"], ["W070", "Face clearly visible at close range"], ["W071", "Two faces at close range"], ["W093", "Faces at close range"], ["W092", "Crew at close range, no helmets"]],
  vehicles: [["W028", "Compressor (plant)"], ["W029", "Drilling rig truck"], ["W030", "Wheel loader"], ["W031", "Excavator"], ["W032", "Wheel loader"], ["W034", "Excavator"], ["W035", "Hiab truck, number plate"], ["W036", "Backhoe loader"], ["W037", "Mack dump truck, number plate"], ["W038", "Low loader, number plate"], ["W039", "Bulldozer"], ["W040", "Backhoe and truck"], ["W041", "Pickup, number plate"], ["W042", "Pickup"], ["W043", "Bulldozer"], ["W045", "Wheel loader"], ["W046", "Grader"], ["W047", "Roller"], ["W048", "Truck"], ["W049", "Pickup"], ["W077", "Office forecourt with a car’s number plate"]],
  text: [["W004", "Caption burned into the image"], ["W007", "Caption burned into the image"], ["W008", "Caption burned in (“Yaba-Iddo”)"], ["W009", "Caption burned in (“Yaba-Iddo”)"], ["W117", "Date stamp burned in"], ["W118", "Date stamp burned in"]],
};
const used = new Set(P.map((p) => p.wid));
const listed = new Set(Object.values(EXCL).flat().map(([w]) => w));
const other = photos.filter((p) => !used.has(p.id) && !listed.has(p.id)).map((p) => [p.id, p.reasons.join("; ") || "Weaker duplicate of a proposed shot, or no place on the site"]);

/* ---------- HTML ---------- */
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const src = (w) => {
  const p = byW[w];
  if (p.source === "docx") {
    const cap = p.captionGuess ? `“${p.captionGuess}”` : "no caption";
    return `${esc(p.document)} · ${esc(p.originalPath.split("/").pop())} · position ${p.docxPositions.join(", ")}<br><span class="cap">Docx caption: ${esc(cap)}</span>`;
  }
  return `Folder file: <b>${esc(p.originalPath)}</b>`;
};
const card = (p) => {
  const w = byW[p.wid];
  const date = w.exif.dateTaken ? w.exif.dateTaken.slice(0, 10).replace(/:/g, "-") : "no date";
  const fl = p.flags.map((f) => `<li>${esc(FLAG[f])}</li>`).join("");
  const res = RESCUED[p.wid] ? `<p class="rescue">Filter override: ${esc(RESCUED[p.wid])}</p>` : "";
  return `<figure class="card"><a href="${esc(w.workFile.replace(/^_work\//, ""))}" target="_blank"><img loading="lazy" src="thumbs/${p.wid}.jpg" alt=""></a>
<figcaption><div class="id"><b>${p.pid}</b> <span class="w">${p.wid}</span> ${p.role ? `<span class="role">${p.role}</span>` : ""}${p.tile ? `<span class="role">${p.tile}</span>` : ""} <span class="conf c-${esc(p.confidence[0])}">${esc(p.confidence)}</span></div>
<div class="meta">${w.width}×${w.height} · ${Math.round(w.bytes / 1024)} KB · ${date}</div>
<div class="src">${src(p.wid)}</div><p>${esc(p.reason)}</p>${fl ? `<ul class="flags">${fl}</ul>` : ""}${res}</figcaption></figure>`;
};
const grid = (list) => `<div class="grid">${list.map(card).join("")}</div>`;
const section = (id, title, intro, list) => `<section id="${id}"><h2>${title}</h2>${intro ? `<p class="intro">${intro}</p>` : ""}${list.length ? grid(list) : `<p class="none">No suitable photograph in this batch.</p>`}</section>`;
const of = (place) => P.filter((p) => p.place === place);

const projectSlugs = [...new Set(P.filter((p) => p.place.startsWith("project:")).map((p) => p.place.slice(8)))];
const projects = JSON.parse(readFileSync(join(WORK, "..", "..", "..", "content", "projects.json"), "utf8"));
const projArr = Array.isArray(projects) ? projects : projects.projects;
const titleOf = (s) => projArr.find((x) => x.slug === s)?.title ?? s;
const empty = projArr.filter((x) => !(x.images || []).length);
const filledEmpty = empty.filter((x) => projectSlugs.includes(x.slug));
const stillEmpty = empty.filter((x) => !projectSlugs.includes(x.slug));

const exclSection = (key, title) => `<h3>${title} (${EXCL[key].length})</h3><div class="grid small">${EXCL[key].map(([w, why]) => `<figure class="card"><a href="${esc(byW[w].workFile.replace(/^_work\//, ""))}" target="_blank"><img loading="lazy" src="thumbs/${w}.jpg" alt=""></a><figcaption><b>${w}</b> · ${esc(byW[w].originalPath.split("/").pop())}<br>${esc(why)}</figcaption></figure>`).join("")}</div>`;

const { counts } = JSON.parse(readFileSync(join(WORK, "filter-report.json"), "utf8"));
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Client photos — review</title>
<style>
:root{--ink:#1d2320;--muted:#5b6560;--line:#d9dfdb;--bg:#f6f7f5;--brand:#2E7229;--warn:#9A2218}
*{box-sizing:border-box}body{margin:0;font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:var(--bg)}
header,main{max-width:1320px;margin:0 auto;padding:24px 16px}header{border-bottom:1px solid var(--line)}
h1{margin:0 0 8px;font-size:28px}h2{margin:40px 0 4px;font-size:22px;border-top:3px solid var(--brand);padding-top:12px}h3{margin:28px 0 8px;font-size:17px}
nav a{margin-right:14px;color:var(--brand)}.intro{color:var(--muted);max-width:80ch}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}.grid.small{grid-template-columns:repeat(auto-fill,minmax(190px,1fr))}
.card{margin:0;background:#fff;border:1px solid var(--line);border-radius:6px;overflow:hidden}.card img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#222}
figcaption{padding:10px 12px;font-size:13px}.id{font-size:15px}.w{color:var(--muted)}.role{background:#e3ede6;color:#136509;border-radius:3px;padding:1px 6px;margin-left:4px;font-size:12px}
.conf{float:right;font-weight:600;border-radius:3px;padding:0 6px}.c-H{background:#e3ede6;color:#136509}.c-M{background:#fff4cc;color:#6b5200}.c-L,.c-—{background:#eee;color:#555}
.meta{color:var(--muted);margin:2px 0 6px}.src{color:var(--muted);font-size:12px}.cap{color:var(--ink)}.flags{margin:6px 0 0;padding-left:18px;color:var(--warn)}.rescue{color:#6b5200;margin:6px 0 0}
table{border-collapse:collapse;margin:8px 0}td,th{border:1px solid var(--line);padding:4px 10px;text-align:left}.none{color:var(--warn)}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:24px}@media(max-width:800px){.cols{grid-template-columns:1fr}}
.collage{display:grid;grid-template-columns:1fr 1fr;gap:6px;max-width:520px}.collage img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
</style></head><body><header><h1>Client photographs — proposed selection</h1>
<p>Local review page, not published. Approve, reject or move by <b>P-number</b>. Click a thumbnail for the full working copy. W-numbers are the working-set IDs in <code>all-manifest.json</code>.</p>
<table><tr><th>Total</th><th>After duplicates</th><th>After size</th><th>After blur</th><th>Candidates</th><th>Gallery-only (&lt;1200px)</th></tr><tr><td>${counts.total}</td><td>${counts.afterDuplicates}</td><td>${counts.afterSize}</td><td>${counts.afterBlur}</td><td>${counts.candidates}</td><td>${counts.galleryOnly}</td></tr></table>
<p class="intro">${Object.keys(RESCUED).length} photos the blur filter dropped were brought back after inspection; each one says so on its card. Every proposal was then checked against the content rules by eye.</p>
<nav><a href="#about">About</a><a href="#truck">Truck</a><a href="#services">Services</a><a href="#projects">Projects</a><a href="#tiles">Tiles</a><a href="#new">Possible new projects</a><a href="#unassigned">Unassigned</a><a href="#excluded">Excluded</a></nav></header><main>

<section id="about"><h2>About page — right-hand image</h2><p class="intro">${ABOUT_Q} The current photo is the sold Iveco tipper (<code>/images/equipment/tipping-trailer.webp</code>).</p>
<div class="cols"><div><h3>Option 1 — one photograph (P001, or P002 instead)</h3>${grid(of("about-single"))}</div>
<div><h3>Option 2 — 2×2 collage (P003–P006)</h3><div class="collage">${of("about-collage").map((p) => `<img src="thumbs/${p.wid}.jpg" alt="">`).join("")}</div><p class="intro">Built as a CSS grid of four images, not one merged file.</p>${grid(of("about-collage"))}</div></div></section>

<section id="truck"><h2>Anywhere else the truck appears</h2><p class="intro">The tipper renders only on <code>/about</code> (checked in <code>content/</code> and the built <code>out/</code>). <code>content/equipment.json</code> still points at it and at the other plant photos, but no page renders that file since /equipment was removed. Nothing else to replace. In Phase 2 I’ll delete the file and drop that reference.</p></section>

<section id="services"><h2>Infrastructure service pages</h2>
${section("svc-civil", "Civil Engineering &amp; Construction", "Header plus six for the gallery.", of("svc-civil"))}
${section("svc-electrical", "Electrical Engineering", "<b>Short:</b> only two electrical photographs in the batch (the Iperu booster panels). That’s a header plus one, not three to six. Ask the client for more (meter installations, panels, substations).", of("svc-electrical"))}
${section("svc-mechanical", "Mechanical Engineering", "<b>Short:</b> a header plus two. Every pump-installation photo bar one (W074) shows faces at close range or no helmets, and W074 needs its vest text dealt with.", of("svc-mechanical"))}
${section("svc-water", "Water Resources Development &amp; Management", "Header plus six.", of("svc-water"))}</section>

<section id="projects"><h2>Projects</h2><p class="intro"><b>${empty.length}</b> projects have no photograph today (not 28). This batch fills <b>${filledEmpty.length}</b>: ${filledEmpty.map((x) => esc(x.title)).join("; ")}. The rest are full-resolution originals of photos the site already shows at about 600px, plus new views of the same projects.</p>
${projectSlugs.map((s) => section(`p-${s}`, `${esc(titleOf(s))} <small style="color:var(--muted);font-weight:400">${s}${empty.some((e) => e.slug === s) ? " · currently no photo" : ""}</small>`, "", of(`project:${s}`))).join("")}
<h3>Still without a photograph (${stillEmpty.length})</h3><ul>${stillEmpty.map((x) => `<li>${esc(x.title)} <small>(${x.slug})</small></li>`).join("")}</ul>
<h3>Photos on the site now that fail the new rules</h3><ul>
<li><b>ogere-6, ogere-12, ogere-11, ogere-2</b> are low-res copies of W075, W076, W123 and W085, all excluded below for missing helmets. ogere-5 (not in this batch) also shows workers without helmets. I suggest taking them off when the new Ogere set goes in.</li>
<li><b>lagos-road-1</b> (filed under Rehabilitation of Roads, Amuwo Odofin) is W015. Its GPS puts it around Oshodi/Ilupeju, about 10 km from Amuwo Odofin, and its caption names no place. I suggest removing it unless the client confirms.</li></ul></section>

<section id="tiles"><h2>Projects landing tiles</h2><p class="intro">Four visible categories: Civil Engineering &amp; Construction, Electrical Engineering, Water Resources, Oil &amp; Gas. Oil &amp; Gas keeps its current image. The stand-in proposals are optional: today the Buildings stand-in is an AI-generated image.</p>${grid(of("tiles"))}<h3>Optional: card stand-ins</h3>${grid(of("tiles-placeholder"))}</section>

<section id="new"><h2>Possible new projects</h2><p class="intro"><b>Unilag:</b> the Creative Arts Building photos match the existing project <i>Construction and Furnishing of the Department of Creative Arts Building</i> (2015), so they appear under Projects above, not here.<br><b>The second university:</b> two unidentified buildings arrived as WhatsApp copies. “Aguocha” could be a mishearing of “University of Agric(ulture)”, i.e. FUNAAB, where Sato has an academic building complex (Block B) on record. That is a guess for the client to confirm, not a match.</p>
<h3>Building A</h3>${grid(of("new-a"))}<h3>Building B</h3>${grid(of("new-b"))}</section>

<section id="unassigned"><h2>Unassigned but good</h2>
${["water", "roads", "buildings", "electrical", "mechanical", "other"].map((t) => { const l = of(`unassigned:${t}`); return `<h3>${t[0].toUpperCase() + t.slice(1)}</h3>${l.length ? grid(l) : `<p class="intro">None beyond those proposed above.</p>`}`; }).join("")}</section>

<section id="excluded"><h2>Excluded and why</h2><table>
<tr><td>Safety: missing helmets or dangerous position</td><td>${EXCL.safety.length}</td></tr><tr><td>Privacy: faces at close range, children</td><td>${EXCL.privacy.length}</td></tr>
<tr><td>Plant and vehicles: number plates, nowhere on the site for them</td><td>${EXCL.vehicles.length}</td></tr><tr><td>Burned-in captions or date stamps</td><td>${EXCL.text.length}</td></tr>
<tr><td>Other: near-duplicate, blur or weaker shot of a proposed view</td><td>${other.length}</td></tr></table>
<p class="intro">None of the vehicles is the sold Iveco tipper.</p>
${exclSection("safety", "Safety — please double-check")}${exclSection("privacy", "Privacy — please double-check")}${exclSection("vehicles", "Plant and vehicles")}${exclSection("text", "Burned-in text")}
<h3>Other (${other.length})</h3><div class="grid small">${other.map(([w, why]) => `<figure class="card"><img loading="lazy" src="thumbs/${w}.jpg" alt=""><figcaption><b>${w}</b> · ${esc(byW[w].originalPath.split("/").pop())}<br>${esc(why)}</figcaption></figure>`).join("")}</div></section>
</main></body></html>`;
writeFileSync(join(WORK, "review.html"), html);
console.log(`${P.length} proposals · ${filledEmpty.length}/${empty.length} empty projects filled · excluded ${Object.values(EXCL).flat().length} + ${other.length} other`);
console.log("still empty:", stillEmpty.map((x) => x.slug).join(", "));
