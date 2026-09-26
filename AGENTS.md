# AGENTS.md — Sato Engineering and Infrastructure website

**Read [`CLAUDE.md`](./CLAUDE.md). It is the only project brief, and it applies
to every agent working in this repo, not just Claude.**

This file used to be a copy of it. The two drifted — by September 2026 this
copy still described three service groups instead of four, an `/hse` page that
no longer exists, and a "Formerly Sato Engineering Nigeria Limited" line that
is now a build failure. An out-of-date brief is worse than no brief, because
an agent will follow it.

So this is a pointer now, and there is nothing below to fall behind.

## The two things most likely to bite you

Both are enforced by `npm run build:prod`; `CLAUDE.md` explains why.

1. **Banned terms.** "Nigeria", "Nigerian", "formerly" and the RC number
   `317208` must not appear anywhere in the built site — copy, headings,
   titles, meta descriptions, alt text, JSON-LD, sitemap, URLs. Avoid
   "indigenous" too. The only contact details allowed anywhere are
   `info@satoengineering.com` and `+234 803 330 3278`.
   Check with `npm run check:banned`, which scans the exported `/out`.

2. **Unapproved copy.** A service with `"reviewStatus": "draft"` and any
   `{{CONFIRM: ...}}` placeholder both block a production build, on purpose.
   Use `npm run build` while working.

## Commands

| | |
|---|---|
| `npm run build` | development build; allows drafts and placeholders |
| `npm run build:prod` | placeholder and draft gate, build, then banned-terms scan |
| `npm run build:review` | production build that still marks drafts and placeholders |
| `npm run check:placeholders` | rewrites `docs/open-items.md` |
| `npm run check:banned` | scans `/out` for banned terms and stray contact details |
