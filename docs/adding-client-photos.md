# Adding the client's photographs

Three steps: drop the files in a folder, run one command, add a few lines of
JSON. No component is touched and no code is written.

The client sends labelled photographs of completed work in batches. His
filename is usually the only description of what the photograph shows, so the
pipeline keeps it: nothing renames a file without recording what it was
called.

---

## 1. Drop the files in

```
raw-assets/client-photos/
  civil-engineering-construction/
  electrical-engineering/
  mechanical-engineering/
  water-resources-development-management/
```

One folder per service, named with the service's slug from
`content/services.json`. **Keep the filenames the client sent.** A folder for a
new service is just a new folder with that service's slug — nothing else has to
change.

`raw-assets/` is not committed, so these originals stay on your machine.

## 2. Run the script

```bash
npm run images
```

Every photograph in those folders is resized and re-encoded into
`public/images/services/<service>/`, at two widths:

- `<name>.webp` — up to 1920px
- `<name>-800.webp` — up to 800px, for cards and phones

`<name>` is a slug of the client's filename: `Osiele Panel (2).JPG` becomes
`osiele-panel-2`. Nothing is ever upscaled, and a file already processed is
skipped unless the original has changed (`npm run images -- --force` re-does
everything).

The run writes `scripts/client-photo-manifest.json`:

```json
{
  "photos": [
    {
      "service": "electrical-engineering",
      "originalFilename": "Osiele Panel Installation (2).JPG",
      "src": "/images/services/electrical-engineering/osiele-panel-installation-2.webp",
      "small": "/images/services/electrical-engineering/osiele-panel-installation-2-800.webp",
      "width": 1920,
      "height": 1440
    }
  ]
}
```

That file **is** committed. It is the only record of the client's own labels
once `raw-assets/` is cleared, and it is what the alt text gets written from.

## 3. Map them into the content

Open `content/services.json`, find the service, and fill its `images` array
from the manifest:

```json
"images": [
  {
    "src": "/images/services/electrical-engineering/osiele-panel-installation-2.webp",
    "alt": "Installed high lift pump control panel at the Sagamu intake",
    "width": 1920,
    "height": 1440,
    "caption": "Sagamu intake, Ogun State Water Corporation"
  }
]
```

- `src`, `width` and `height` come straight from the manifest.
- `alt` is written by hand, from the client's filename and anything he said
  about the photograph. Describe what is in the picture, not that it is a
  picture. Every image on the site has alt text — that is the accessibility
  floor in CLAUDE.md, and this is no exception.
- `caption` is optional and shown under the photograph. Leave it out rather
  than inventing one.

The gallery renders only when `images` holds something, so a service with an
empty array shows nothing at all. Never put a placeholder in it.

`image` (singular) is a different field: the header shot at the top of the
service page. Leave it alone unless the client has sent something better for
that slot.

## Then

```bash
npm run build && npm run check:banned
```

The banned-terms check scans alt text and captions like everything else, so a
caption naming a country fails the build. Write locations as city and state.

## Committing

Commit `public/images/services/<service>/*.webp`,
`scripts/client-photo-manifest.json` and `content/services.json`. The
originals in `raw-assets/` stay out of git — keep them wherever the client's
batches are stored.
