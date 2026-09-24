# Sato Engineering and Infrastructure — Website Rebuild Prompt Pack

Prompt pack for rebuilding satoengineering.com with Claude Code. Phase 1 is the public website. Phase 2 (the light CMS) comes after launch, but Phase 1 is built so the CMS can plug in without refactoring: every piece of editable content lives in `/content` as JSON, never hardcoded in components.

## What's in the pack

| File | Purpose |
|---|---|
| `CLAUDE.md` | Project memory for Claude Code. Copy it to the repo root before the first prompt. |
| `content/site-content.md` | All site copy, rewritten from the current site, with facts and placeholders. Copy into the repo at `/docs/site-content.md`. |
| `prompts/01-scaffold.md` → `08-qa-launch.md` | Phase 1 build prompts. Run in order, one per session or one at a time. |
| `prompts/09-cms-phase-2.md` | Phase 2. Do not run until the site is live. |

## How to run it

1. Create an empty folder, copy `CLAUDE.md` to its root and `content/site-content.md` to `docs/site-content.md`.
2. Open Claude Code in that folder.
3. Paste prompt 01. Review what it did, commit, then paste 02, and so on.
4. After each prompt, check the dev server yourself before moving on. Each prompt ends with a "Done when" checklist.

## Placeholders

Anything unconfirmed is marked `{{CONFIRM: ...}}` in the content. The build renders these visibly (highlighted) in development, and prompt 08 adds a check that blocks a production build while any remain. This means you can build the whole site now and slot in client answers as they arrive.

## Client inputs still needed (blocking launch, not blocking build)

- [ ] Confirmed new registered name and effective date of the change (and RC number)
- [ ] New logo files (SVG preferred, plus any colour variants)
- [ ] Energy / oil & gas division name and full services list (reviewed by Engr. Wale Osamiluyi)
- [ ] Reference site links for energy content (OGAP via Wayback Machine, Sunrise Engineering, third site)
- [ ] Oil & gas vendor registrations, if any (NOGICJQS / NCDMB, NipeX, DPR/NUPRC permits)
- [ ] Current team roster, and who is "leadership" vs project-team pool
- [ ] Current office addresses, phone numbers, email
- [ ] Status of 2012-era projects (completed or not) and any projects since 2012
- [ ] Domain: stay on satoengineering.com or move to a new domain for the new name
- [ ] Newer project photography, if available (the 2012 images are low resolution)

## Pages dropped from the old site

News & Events, Awards (folded into About), Future Plans, and the "Ongoing Projects" framing. All old URLs redirect to their nearest new page (prompt 08).
