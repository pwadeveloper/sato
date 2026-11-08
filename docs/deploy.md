# Deploying satoengineering.com

Written for whoever runs the cutover. It assumes access to the GitHub repo, a
Vercel account, and the Cloudflare account that holds the DNS zone.

---

## What this site is, in deployment terms

- Next.js App Router with `output: "export"` — the build writes plain HTML, CSS,
  JS and images to `out/`. **There is no server and no runtime.**
- No database, no environment variables, no API routes, no authentication.
- Redirects and headers come from `vercel.json`, which Vercel applies at its
  edge. They are the only piece of behaviour that is not a static file.

Because it is fully static, a bad deploy cannot corrupt data — the worst case is
the wrong HTML being served, and rollback is instant.

---

## Vercel setup

### 1. Import the repository

In Vercel, **Add New → Project → Import** `pwadeveloper/sato`.

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Build Command | `npm run build:prod` |
| Output Directory | `out` (Vercel detects this from `output: "export"`) |
| Install Command | `npm ci` |
| Node version | 24.x (the current default) |
| Environment variables | none |

**Use `build:prod`, not `build`.** `build:prod` runs the placeholder gate first
and fails the deploy if any `{{CONFIRM: ...}}` is still in `/content`. That is
deliberate — see "Before the first production deploy" below. While the site is
still being drafted on preview deployments, `build` is the one to use.

### 2. Check the first preview deployment

Every push to a branch gets a preview URL. Every push to `main` goes to
production once the domain is attached. Before attaching the domain, push a
branch and check the preview URL against the list in "Verification" below.

### 3. Protect the preview deployments

While the old site is still live, preview URLs are public and indexable by
anyone who finds them. Turn on **Settings → Deployment Protection → Vercel
Authentication** for preview environments so the unfinished site cannot be found
or indexed before cutover. Turn it off for production, or the real site will ask
visitors to log in.

---

## The domain

**DNS is on Cloudflare**, not at the registrar — the zone's nameservers are
`aida.ns.cloudflare.com` and `aaron.ns.cloudflare.com`. The cutover is therefore
done inside the Cloudflare dashboard, and you need access to that account.

Today's records:

| Record | Value | Notes |
|---|---|---|
| `satoengineering.com` A | `104.21.49.92`, `172.67.189.114` | Cloudflare proxy IPs — the real WordPress origin is hidden behind them |
| `www.satoengineering.com` | same pair | |
| `MX` | Google Workspace (`aspmx.l.google.com` and friends) | **Company email. Do not touch these.** |

### The one rule for this cutover

**Change only the A/AAAA/CNAME records for the website. Leave MX, TXT (SPF,
DKIM, DMARC) and any `google._domainkey` records exactly as they are.** Sato's
email runs on Google Workspace through this same zone. Deleting or replacing the
whole record set — which is easy to do when "pointing a domain at Vercel" — takes
the company's email down with the website, and that is a far worse outage than a
late website.

### Pointing the domain at Vercel

1. In Vercel: **Project → Settings → Domains → Add**, and add both
   `satoengineering.com` and `www.satoengineering.com`. Pick one as primary and
   let Vercel redirect the other to it. `www` is the primary here, because
   `content/site.json` sets `url` to `https://www.satoengineering.com` and that
   value generates every canonical URL, the sitemap and the Open Graph tags. If
   you decide the apex should be primary instead, change `site.json` first and
   redeploy, or the canonicals will point at the wrong hostname.
2. Vercel will show the records it wants. For a Cloudflare zone:
   - `www` → **CNAME** to `cname.vercel-dns.com`
   - apex → **A** to the address Vercel gives you
3. **Set the Cloudflare proxy to "DNS only" (grey cloud) for both records.**
   Leaving Cloudflare's orange cloud on puts two CDNs in series. It usually
   works, but it breaks Vercel's certificate issuance on first setup and makes
   cache behaviour hard to reason about. Vercel already provides the CDN and the
   certificate.
4. Wait for Vercel to report the domain as **Valid** and the certificate as
   issued. This is normally a few minutes.

---

## Keeping the old WordPress site reachable until cutover

The new site does not replace anything until DNS moves, so the old site stays up
on its own. Two things are worth doing first.

**Lower the TTL a day ahead.** In Cloudflare, set the TTL on the website A and
CNAME records to **5 minutes** (Auto is fine once the record is grey-clouded, but
an explicit low TTL is clearer). Do this at least one full TTL period before the
cutover. Without it, anyone who resolved the old address keeps hitting WordPress
for however long the old TTL says — and a rollback would be just as slow.

**Find out where WordPress actually lives, and write it down.** The origin is
hidden behind Cloudflare's proxy today, so before you grey-cloud anything, record
the origin IP or hostname from the existing Cloudflare DNS records. You need it
to put the old site back, and you cannot look it up from outside once the proxy
is off. Get the hosting login from the client at the same time.

**Do not cancel the WordPress hosting on cutover day.** Keep it paid and running
for at least 30 days. It costs very little and it is the only rollback that does
not depend on the new site working.

---

## Before the first production deploy

As of 8 November 2026 (docs/decisions/launch-ready.md):

1. **Every service is approved** and the two Oil & Gas questions are settled on
   their safe defaults, so `npm run build:prod` no longer stops on review
   status. The one remaining placeholder (a job title on the hidden Leadership
   page) is on hold and does not block.
2. **Check `site.json` is right.** In particular `url`, the office addresses
   in order, the telephone number and the general enquiries email. Leave
   `showRcNumber` false, `showProjectDates` false and `showLeadership` false.
3. **Confirm `NEXT_PUBLIC_REVIEW_MODE` is not set** on the production
   environment in Vercel. It must never be on in production.
4. **The contact form is not live.** `contactFormEndpoint` in `site.json` is
   empty, so the contact page says the enquiry form is not accepting
   submissions and shows the telephone number and email instead. The site is
   static and cannot receive a POST itself; it needs a third-party endpoint
   (Formspree, Basin, Web3Forms or similar). Launching without it is possible
   — the email address and telephone number are on `/contact` — but decide it
   deliberately.
5. **Run everything locally**: `npm run typecheck && npm run lint && npm run build:prod`.
   `build:prod` runs, in order: the placeholder gate, the image-metadata check,
   the build, the banned-terms and contact-details check, the date check and
   the redirect check. Any one failing fails the deploy.

---

## The review deployment

The client and his oil and gas collaborator need to read the unapproved
pages — Oil & Gas especially — in context, on a real URL, before they can
approve them. `npm run build:prod` will not build them, by design.

`npm run build:review` produces a full production build with
`NEXT_PUBLIC_REVIEW_MODE=1`, which keeps the gates' subject matter visible:

- a **"Review deployment"** strip above the header on every page,
- a **"Not yet approved"** banner on every service still marked draft,
- unresolved `{{CONFIRM: ...}}` placeholders highlighted in yellow.

To put it on a preview URL:

```sh
vercel link                      # first time only
vercel env add NEXT_PUBLIC_REVIEW_MODE preview   # value: 1
vercel deploy                    # preview, not --prod
```

Two things to get right:

1. **Set the variable on the Preview environment only.** If it reaches
   Production, the live site tells procurement officers it is a draft.
2. **Protect the URL.** Vercel Deployment Protection should stay on for
   previews. This build contains a partner's client list and an unapproved
   page; it should not be indexable or publicly guessable.

Send the reviewers `docs/services-for-review.md` alongside the URL — the page
shows the copy, the document asks the questions.

---

## Cutover checklist: satoengineering.com to Vercel, keeping email working

**The rule that matters most: the website and the company's email share one
DNS zone.** info@satoengineering.com is delivered by the zone's MX records and
authenticated by its TXT records (SPF, DKIM, DMARC). Moving the website means
changing two records. Anything more than that risks taking email down, and a
day without email is a far worse outage than a late website.

### A. Before the day (nothing here is visible to anyone)

- [ ] `npm run build:prod` passes on the commit you will deploy.
- [ ] The client has read the site on a preview URL and said yes.
- [ ] **Export every DNS record in the zone and keep the file.** In
      Cloudflare: **DNS → Records → Export** (a BIND zone file). Also take a
      screenshot of the records page. Then, for an independent copy taken
      from outside, run and save the output:

      ```bash
      for t in A AAAA CNAME MX TXT NS CAA SRV; do
        echo "== $t satoengineering.com"; dig +short "$t" satoengineering.com
        echo "== $t www.satoengineering.com"; dig +short "$t" www.satoengineering.com
      done
      dig +short TXT _dmarc.satoengineering.com
      dig +short TXT google._domainkey.satoengineering.com
      dig +short CNAME mail.satoengineering.com
      dig +short CNAME autodiscover.satoengineering.com
      ```

      **Mark the mail records** in that list so nobody touches them: every
      `MX` (Google Workspace: `aspmx.l.google.com` and the `alt*` hosts), the
      root `TXT` holding `v=spf1 …`, any `google-site-verification` TXT, the
      `google._domainkey` TXT (DKIM), `_dmarc` TXT, and any mail-related CNAME
      (`mail`, `autodiscover`, `webmail`, `smtp`, `imap`). If the zone has
      anything you cannot explain, leave it alone.
- [ ] **Write down the old website records** — the apex A record(s) and the
      `www` record, with their values and proxy status. These are the
      rollback. The WordPress origin is hidden behind Cloudflare's proxy, so
      record the origin IP from the Cloudflare dashboard now; it cannot be
      looked up from outside.
- [ ] **Lower the TTL** on the apex A and `www` records to 300 seconds (5
      minutes), at least 24 hours before the switch, so both the cutover and
      any rollback take effect in minutes.
- [ ] **Keep the WordPress hosting paid** for at least 30 days after cutover.
- [ ] **Send a test email to and from info@satoengineering.com now** and note
      that it works, so there is a baseline to compare with afterwards.

### B. Prefer adding records at the current DNS provider

**Do not change the nameservers.** DNS is on Cloudflare (nameservers
`aida.ns.cloudflare.com` and `aaron.ns.cloudflare.com`) and the mail records
live there. Vercel works by adding two records to the existing zone, and that
leaves every mail record exactly where it is. Moving the nameservers to Vercel
would mean recreating every record by hand, and any record missed is email that
stops arriving.

**If the nameservers have to change anyway** (for example, the client loses
access to Cloudflare): first recreate **every** record from the export in step
A at the new provider — MX, every TXT, every CNAME — check each one with `dig
@<new-nameserver>` before switching, and only then change the nameservers at
the registrar. Nameserver changes can take up to 48 hours to settle
everywhere, and during that window some senders see the old zone and some the
new, so both must carry identical mail records.

### C. The switch

- [ ] In Vercel: **Project → Settings → Domains → Add** both
      `www.satoengineering.com` and `satoengineering.com`. Make `www` the
      primary and let Vercel redirect the apex to it — `content/site.json`
      sets `url` to `https://www.satoengineering.com`, and every canonical
      URL, the sitemap and the Open Graph tags come from it.
- [ ] In Cloudflare, change **only these two records**, to the values Vercel
      shows on the Domains page:
      - `www` → **CNAME** `cname.vercel-dns.com` (or the project-specific
        target Vercel gives)
      - `satoengineering.com` (apex, `@`) → **A** `76.76.21.21` (or the
        address Vercel gives). Delete any other A or AAAA record on the apex
        so it does not split traffic with WordPress — but **only A/AAAA on the
        apex. Not MX. Not TXT.**
- [ ] Set both to **DNS only** (grey cloud). The orange-cloud proxy in front
      of Vercel blocks its certificate issuance and puts two CDNs in series.
- [ ] Wait for Vercel to show both domains **Valid** with a certificate
      issued. With the TTL at 5 minutes this is usually 5–30 minutes; allow up
      to a few hours for every resolver to catch up. Nothing about email
      changes during this wait, because no mail record was touched.

### D. Verify

- [ ] `dig +short www.satoengineering.com` returns Vercel's target and
      `dig +short satoengineering.com` Vercel's address, not the old ones.
- [ ] `dig +short MX satoengineering.com` and `dig +short TXT
      satoengineering.com` return **exactly** what the step A export says.
- [ ] **Email both ways.** From an outside account (a personal Gmail), send a
      message **to** info@satoengineering.com and confirm it arrives. Reply
      **from** info@satoengineering.com and confirm the reply arrives and is
      not in spam. In the received message, **Show original** should report
      SPF: PASS and DKIM: PASS. If either fails, compare the TXT records with
      the export before anything else.
- [ ] Run the checks in "Verification after cutover" below against the live
      domain.
- [ ] Turn **Deployment Protection off** for production (leave it on for
      previews).
- [ ] Submit `https://www.satoengineering.com/sitemap.xml` in Google Search
      Console.
- [ ] Only after a week of clean logs and working email: take WordPress down.

### E. Roll back

If the website is wrong, in order of speed:

1. **Content or code problem:** in Vercel, **Deployments → the last good
   deployment → Promote to Production**. Seconds; DNS is not touched.
2. **Domain, certificate or routing problem:** in Cloudflare, **restore the
   old apex A record(s) and the old `www` record** from the values written
   down in step A, and turn the orange cloud back on if it was on before.
   With the 5-minute TTL most visitors see WordPress again within minutes.
   Then remove the domains from the Vercel project so it stops trying to
   issue certificates.
3. **Email problem** (should not happen if only the two records changed):
   compare the zone with the step A export, record by record, and restore
   whatever differs. MX and TXT changes also propagate within their TTL.

There is no data to restore in any case: the site is static.

---

## Verification after cutover

Spot-check these by hand. `npm run check:redirects` proves the redirect map
against the build (every destination a live page, one hop, trailing slash
matched); these confirm Vercel serves it.

| Check | Expected |
|---|---|
| `https://www.satoengineering.com` | Home page, padlock, no certificate warning |
| `https://satoengineering.com` | Redirects to `www` |
| `http://www.satoengineering.com` | Redirects to `https` |
| `/about-us/` | 301 to `/about` |
| `/our-team/` and `/leadership` | 302 to `/about` (Leadership is hidden, not gone) |
| `/building-and-construction/` | 301 to `/projects/building-construction` |
| `/civil-eng-road-projects/` | 301 to `/projects/civil-engineering-road` |
| `/water-supply-and-water-resources/` | 301 to `/projects/water-resources-development-management` |
| `/project-3/` | 301 to `/projects/lagos-state-road-rehabilitation` |
| `/services/civil-engineering-construction` | 301 to `/services/civil-engineering-road` |
| `/services/electrical-engineering` | 301 to `/services/electrical-mechanical` |
| `/projects/civil-engineering-construction` | 301 to `/projects/civil-engineering-road` |
| `/projects/electrical-engineering` | 301 to `/projects/electrical-mechanical` |
| `/services/electrical-mechanical` | The page itself, **not** a redirect |
| `/hse` | 302 to `/about` while the page is on hold |
| `/wp-admin/` | 301 to `/` |
| `/robots.txt` | Allows everything except `/styleguide`, names the sitemap |
| `/sitemap.xml` | All routes on the `www` hostname; no `/leadership`, no `/equipment` |
| Any unknown URL | The site's own 404 page, not a Vercel error page |
| Paste the home URL into WhatsApp or LinkedIn | Branded Open Graph card appears |

**Why every source ends in `{/}?`.** Vercel matches redirect sources strictly,
so `/our-team` does not match `/our-team/` — and the old WordPress links all
end in a slash. `{/}?` makes the slash optional. Do not fix this with
`"trailingSlash": false` instead: Vercel applies that rule before the
redirects, so every old link would take two hops.

To re-check every redirect in bulk after cutover:

```bash
node -e "require('./vercel.json').redirects.filter(r=>!r.has&&!r.source.includes(':')).forEach(r=>console.log(r.source.replace('{/}?','/')))" |
while read -r path; do
  printf '%-60s %s\n' "$path" \
    "$(curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' "https://www.satoengineering.com$path")"
done
```

Every line should read `301` or `302`, and following the `redirect_url` should
give `200` with no further redirect.

---

## Routine work after launch

- **Content changes:** edit the JSON in `/content` and push to `main`. Vercel
  rebuilds and deploys automatically.
- **New photographs:** drop the originals into `raw-assets/old-site/`, add an
  entry to `scripts/image-map.json`, run `npm run images`, and commit the
  generated files from `public/images/`. `raw-assets/` is deliberately not
  committed. `docs/image-report.md` is the standing request to the client for
  better photography.
- **The Open Graph card** is generated by `npm run og` from `content/site.json`
  and the logo. Re-run it if the company name or founding year changes.
- **Phase 2 (a CMS)** replaces the files in `/content` with an API. Nothing in
  `/components` reads JSON directly — everything goes through `lib/content.ts` —
  so that swap does not touch the components.
