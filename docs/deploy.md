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

These must be done, in this order:

1. **Resolve the open items.** `docs/open-items.md` lists every unconfirmed piece
   of copy, generated from the content itself. `npm run build:prod` refuses to
   build while any remain. Regenerate the list at any time with
   `npm run check:placeholders`.
2. **Check `site.json` is right.** In particular `url`, `rcNumber`, the office
   addresses, the telephone number and the general enquiries email. These feed
   the footer legal line, the company facts panel and the Organization
   structured data.
3. **Decide where the contact form posts.** `contactFormEndpoint` in
   `site.json` is empty, so the contact page currently shows "the enquiry form is
   not accepting submissions yet" instead of a form. The site is static and
   cannot receive a POST itself, so this needs a third-party endpoint (Formspree,
   Basin, Web3Forms or similar). Until it is set, the only route to the company
   from the website is the telephone number.
4. **Run the checks locally**: `npm run typecheck && npm run lint && npm run build:prod`.

---

## Cutover checklist

Work down it in order. Nothing before step 6 is visible to the public.

- [ ] Open items in `docs/open-items.md` resolved, `npm run build:prod` passes
- [ ] `contactFormEndpoint` set and a test enquiry received
- [ ] Final content read-through with the client, on a preview URL
- [ ] Origin IP/hostname of the WordPress site recorded somewhere safe
- [ ] WordPress hosting confirmed paid for the next 30 days
- [ ] TTL on the website DNS records lowered to 5 minutes, at least a day ahead
- [ ] Domains added in Vercel, both apex and `www`
- [ ] **Cutover:** in Cloudflare, update the website A/CNAME records to Vercel's
      values and set both to "DNS only" (grey cloud). **Touch nothing else.**
- [ ] `dig www.satoengineering.com` returns Vercel's target, not Cloudflare's
      proxy IPs
- [ ] Vercel shows both domains Valid with a certificate issued
- [ ] Deployment Protection turned **off** for production
- [ ] Run the verification list below against the live domain
- [ ] **Send a test email to and from a company address.** This is the check that
      catches a broken MX record, and it is the one people forget.
- [ ] Submit `https://www.satoengineering.com/sitemap.xml` in Google Search
      Console, and use the URL Inspection tool on the home page
- [ ] Only after a week of clean logs: take the WordPress site down

---

## Verification after cutover

Spot-check these by hand. They cover the things that break silently.

| Check | Expected |
|---|---|
| `https://www.satoengineering.com` | Home page, padlock, no certificate warning |
| `https://satoengineering.com` | Redirects to `www` |
| `http://www.satoengineering.com` | Redirects to `https` |
| `/about-us` | 301 to `/about` |
| `/our-team` | 301 to `/leadership` |
| `/equipments` | 301 to `/equipment` |
| `/safety-policies` | 301 to `/hse` |
| `/contact-us` | 301 to `/contact` |
| `/building-and-construction` | 301 to `/projects?sector=buildings` |
| `/project-3` | 301 to `/projects/fiditi-earth-dam` |
| `/wp-admin/` | 301 to `/` |
| `/robots.txt` | Allows everything except `/styleguide`, names the sitemap |
| `/sitemap.xml` | 29 URLs, all on the `www` hostname |
| Any unknown URL | The site's own 404 page, not a Vercel error page |
| Paste the home URL into WhatsApp or LinkedIn | Branded Open Graph card appears |

`vercel.json` holds 112 redirects covering every URL found on the old site. To
re-check them in bulk after cutover:

```bash
while read -r path; do
  printf '%-40s %s\n' "$path" \
    "$(curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' "https://www.satoengineering.com$path")"
done < <(node -e "require('./vercel.json').redirects.forEach(r=>console.log(r.source))")
```

---

## Rollback

If something is badly wrong after cutover, in rough order of speed:

1. **Vercel deployment rollback** — if the problem is the site's content or code,
   **Deployments → the last good one → Promote to Production**. Takes seconds and
   does not touch DNS.
2. **DNS rollback** — if the problem is the domain, certificates or routing, put
   the old A/CNAME records back in Cloudflare and re-enable the orange cloud.
   With a 5-minute TTL this is visible within minutes. This is the reason the
   WordPress hosting stays paid and the origin address is written down.

There is no data to restore in either case.

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
