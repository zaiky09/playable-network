# PlayAble Network

Marketing site for **PlayAble Network** — a Kenyan NGO doing youth development through football in Turkana County. Tagline: _Built through play, driven by purpose._

Astro 6 + Tailwind 4, multilingual (EN / SW / FR / AR / ES), content via Sanity, contact form posts to Airtable + email notification via Resend.

## Stack

- **Astro 6** with built-in i18n routing (5 locales, Arabic RTL)
- **Tailwind 4** with CSS-based `@theme` configuration (Noto Sans / Noto Sans Arabic)
- **Sanity** headless CMS (schemas in `/sanity/schemas`, studio in `/studio`)
- **Airtable** for inquiry records, **Resend** for email notifications
- **Vercel** hosting

## Local setup

```bash
npm install
cp .env.example .env       # fill in real values (see Integrations below)
npm run dev                # site at http://localhost:4321
```

The site auto-redirects `/` to `/en/`. Site works without any env vars — Sanity content falls back to static placeholders, and the contact form will render but fail to submit until Airtable + Resend keys are set.

## Project layout

```
src/
  components/   Reusable Astro components (Header, Footer, ContactForm, LatestGrid, LanguageSwitcher)
  i18n/         Locale config + translation JSON files (5 locales)
  layouts/      BaseLayout handles <html lang dir> + RTL font swap
  lib/sanity.ts Sanity client + query helpers (returns null when no project ID)
  pages/
    index.astro              redirects to /en/
    [locale]/                one file per page, generates 5 locale variants each
    api/contact.ts           form handler -> Airtable + Resend
  styles/global.css          Tailwind import + @theme tokens
sanity/
  schemas/      Schema-as-code (siteSettings, page, program, partner, latestPost)
studio/         Sanity Studio (separate package — see "Sanity setup")
```

## Integrations

### Sanity (CMS)

The studio is a separate npm package in `/studio` that imports schemas from `/sanity/schemas`. One-time setup:

```bash
cd studio
npm install
npx sanity login                          # browser OAuth
npx sanity init --create-project --reconfigure   # creates project, prints projectId
```

Take the **project ID** that prints out and put it in two places:

1. Root `.env`:
   ```
   PUBLIC_SANITY_PROJECT_ID=your-project-id
   PUBLIC_SANITY_DATASET=production
   ```
2. `studio/.env`:
   ```
   SANITY_STUDIO_PROJECT_ID=your-project-id
   SANITY_STUDIO_DATASET=production
   ```

Then run the studio locally:

```bash
cd studio
npm run dev    # studio at http://localhost:3333
```

When you're ready to share editing access with NGO staff: `npx sanity deploy` from the studio folder gives you a free hosted URL like `playablenetwork.sanity.studio`.

### Behold.so (optional — auto-pull Instagram for the "Latest" section)

The home page's "Latest" section follows a priority chain:

1. **Sanity** `latestPost` documents (NGO-curated) — wins if any exist
2. **Behold.so** Instagram feed — auto-pulls recent posts
3. **Static i18n fallback** — placeholder cards (currently shown)

If the NGO wants Instagram posts to flow automatically:

1. Sign up at https://behold.so and connect the Instagram account.
2. Create a feed, copy the **feed ID** (looks like a long hex string).
3. Add to `.env`:
   ```
   PUBLIC_BEHOLD_FEED_ID=your-feed-id
   ```

No API key needed — Behold's JSON feed endpoint is public. The free tier covers up to ~25 posts and refreshes every 10 minutes. Posts are fetched **at build time**, so trigger a Vercel redeploy (or set up a periodic redeploy webhook) when fresh content matters.

If the NGO wants to curate which posts appear instead of all-recent, leave Behold off and use Sanity's `Latest Post` document type — those override the Instagram feed.

**Local preview without signing up:** set `INSTAGRAM_MOCK=true` in `.env`. The `LatestGrid` will swap in 3 realistic fixture posts (matching Behold's exact response shape) so you can see the auto-pull layout, image cards, captions, dates, and Instagram links rendered. Useful for stakeholder demos before the NGO connects Behold. The section will render with `data-source="behold"` exactly as it would with real data. Remove or set to `false` before deploying to production.

### Airtable (inquiry records)

1. Create a base called e.g. **PlayAble Network — Inquiries**.
2. Add a table named **Inquiries** with these fields:
   | Field | Type |
   |---|---|
   | Name | Single line text |
   | Email | Email |
   | Message | Long text |
   | ReceivedAt | Date (with time, ISO format) |
   | IP | Single line text |
3. Create a personal access token at https://airtable.com/create/tokens with scopes `data.records:read` and `data.records:write`, restricted to this base.
4. Add to `.env`:
   ```
   AIRTABLE_API_KEY=patXXXX...
   AIRTABLE_BASE_ID=appXXXX...
   AIRTABLE_TABLE_NAME=Inquiries
   ```

### Resend (email notifications)

1. Sign up at https://resend.com, verify the sending domain (e.g. `theplayablenetwork.org`).
2. Generate an API key.
3. Add to `.env`:
   ```
   RESEND_API_KEY=re_XXXX...
   NOTIFICATION_EMAIL=hello@theplayablenetwork.org
   NOTIFICATION_FROM=noreply@theplayablenetwork.org
   ```

The contact form will keep working even if one of Airtable/Resend is down — they fire in parallel via `Promise.allSettled` and only the form-level success/failure is shown to the user.

## Adding / translating content

1. Source-of-truth strings live in `src/i18n/en.json`.
2. The other locale files (`sw.json`, `fr.json`, `ar.json`, `es.json`) currently contain the English text as placeholders. Translators replace each value but keep the keys identical.
3. For long-form copy (program descriptions, partner blurbs, news/Instagram posts), use Sanity rather than the JSON files.

## RTL guidelines

Always use Tailwind's **logical properties** so layouts mirror correctly under `dir="rtl"`:

- `ms-4` / `me-4` instead of `ml-4` / `mr-4`
- `ps-4` / `pe-4` instead of `pl-4` / `pr-4`
- `text-start` / `text-end` instead of `text-left` / `text-right`

Test every new page/component in Arabic (`/ar/...`) before merging.

## Logo & brand assets

The brand identity lives in `/public`:

| File | Purpose | Dimensions |
|---|---|---|
| `logo.png` | Source logo (master) | 1024×1024 |
| `favicon.svg` | Browser tab icon | scalable |
| `apple-touch-icon.png` | iOS home screen | 180×180 |
| `icon-192.png` | PWA / Android | 192×192 |
| `icon-512.png` | PWA / Android | 512×512 |
| `og-image.png` | Social share unfurl | 1200×630 |
| `manifest.webmanifest` | PWA install metadata | — |

If the master logo changes, regenerate the derived icons with:

```bash
cd public
sips -z 180 180 logo.png --out apple-touch-icon.png
sips -z 192 192 logo.png --out icon-192.png
sips -z 512 512 logo.png --out icon-512.png
sips -z 630 630 logo.png --padToHeightWidth 630 1200 --padColor FFFFFF --out og-image.png
```

The brand color palette is in `src/styles/global.css` under the `@theme` block — 8 tokens sampled from the official logo (navy/cyan/orange/gold). Update those if the official brand guide diverges.

**Known limitation**: the manifest icons use `purpose: "any"`. We don't yet ship a `maskable` variant because the logo's wordmark extends close to the edges of the square — a maskable mask would crop "Play" and "ble". A future enhancement is to produce a padded maskable variant (probably hand-designed rather than auto-generated).

## Deployment

Connect this repo to Vercel. Set the environment variables from `.env.example` in the Vercel dashboard. Preview deploys are automatic on PRs; production deploys on push to `main`. The Sanity Studio is deployed separately via `cd studio && npx sanity deploy`.
