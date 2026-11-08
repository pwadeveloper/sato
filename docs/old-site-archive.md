# The old site's archive

A full copy of the old satoengineering.com (WordPress 3.3.2), taken on
2026-11-08 before the site is switched off. Every image is also sorted into
one folder and checked against what the new site already has.

## Where it lives

- **`raw-assets/old-site-archive/`** on the developer's machine. It is
  gitignored and never committed. Start with its `INDEX.md`.
- **Backup:** Google Drive, `My Drive/Sato Engineering/old-site-archive-2026-11-08.zip`
  (193 MB, all 2,284 files), with a `.sha256` beside it
  (`d3f1557f5377960a2f847bebb94df60c611cc254922ebcc461f1d0157fb13456`).
  Check a restored copy with `shasum -a 256 -c old-site-archive-2026-11-08.zip.sha256`.

```
mirror/www.satoengineering.com/   the site as served, links rewritten to browse offline;
                                  each rewritten file's original kept beside it as .orig
endpoints/                        the feed (every page), sitemap and REST probes, the
                                  Wayback Machine's index, the satoeng.com page it holds
crawl/manifest.json               every URL: how it was found, redirects, live status,
                                  and whether the copy is `live` or `wayback:<timestamp>`
crawl/id-scan.json                what /?p=N returned for N = 1…1507
images/<category>/<project>/      one file per picture, <nn>-<old-site-caption>.<ext>
pages/*.md, pages.csv             every page's text; title, URL, saved file, source
index.csv                         one row per image: path, original URL, page, position,
                                  caption, alt, project, published or why not
review.json                       judgements made by eye on what the check found
```

Nothing in it is published. An image found here goes onto the site the usual
way, and the helmet rule, the children exclusion and one photo, one place apply
to it as to anything else.

## How it was made

```bash
node scripts/archive-old-site.mjs                  # needs the old site up (~70 min)
node scripts/archive-old-site.mjs --retry-wayback  # re-asks the Wayback Machine for what failed
node scripts/organise-old-site-archive.mjs         # offline; rebuilds images/, pages/, the index
```

`wget` isn't installed, so `archive-old-site.mjs` does what
`wget --mirror --page-requisites --adjust-extension --convert-links --no-parent`
does, in Node, with the same file layout.

- **Pages.** It follows every link from the home page, the feed and the pages
  in `docs/old-site-inventory.json`. Then it walks `/?p=1…1507`: WordPress
  redirects that to any published post, page or attachment, so attachment pages
  nothing links to are found too.
- **Uploads.** `wp-content/uploads/` can't be listed (403), so the tree is
  rebuilt from five sources:
  - every reference in the pages, stylesheets and feed;
  - every attachment the ID scan finds;
  - the Wayback Machine's index of the domain;
  - the original behind every resized or rotated copy;
  - the sizes WordPress makes of every original, probed by name.
- **Page lists.** `/?feed=rss2` answers (10 pages of posts). WordPress 3.3.2
  predates `wp-sitemap.xml` and the REST API, so both 404, and `?rest_route=`
  just returns the home page. `endpoints/endpoints.json` records each one.
- **The Wayback Machine.** A URL that failed live and is in the Wayback
  Machine's index came from its latest capture (`id_`, as originally served).
  That is how the 2011 static site is in the archive. Its home page,
  `index.htm`, has one capture, and that capture won't replay.

`organise-old-site-archive.mjs` keeps the largest copy of each picture, byte
for byte, with nothing stripped. Each picture's project comes from, in order:
where the new site publishes it, `scripts/content-mirror-plan.json`, or a
project its caption names. Failing all three, the old page it sits on decides
the category. It then compares every picture with
`docs/old-site-inventory.json`, `raw-assets/old-site/` and `public/images/`, by
URL and by the pHash of `scripts/compare-photo-batch.mjs`, with the centre
crop tried both ways. A distance of 10 or less (of 64) is the same photograph.

## What it found (2026-11-08)

- **Crawl:** 1,904 URLs, 1,376 files saved (1,330 live, 46 from the Wayback
  Machine), 317 pages. The ID scan resolved 310 IDs.
- **What failed:** 340 URLs, nearly all page furniture of the 2011 site, which
  the Wayback Machine never captured.
- **Lost for good:** the 2011 site's full-size project photographs
  (`/pictures_sato/`, 15 files). Only their 100×75 thumbnails survive, uploaded
  to WordPress in 2012.
- **Images:** 740 image files, 259 distinct pictures:
  - 151 photographs, 62 of them published on the new site;
  - 22 equipment photos;
  - 33 banners;
  - 2 logos;
  - 51 template graphics.
- **In none of the three sources:** 50 files, 31 pictures, listed with a
  judgement each in `INDEX.md`:
  - 7 fail the helmet rule;
  - 5 carry the former name;
  - 6 are stock imagery;
  - 7 survive only as thumbnails;
  - 2 can't be judged at their size;
  - 4 nothing in the rules stops: the "office_ota" building, the
    "Horizon_suites" photograph (which a 2012 post calls a residential
    development in Abuja), Biobaku road and a classroom collage banner. All
    four are for the client to identify before any use.

  None shows children. Two banners were matched by eye to the Horizon Suites
  photograph the site already shows (`samePhotographAs` in `review.json`).
