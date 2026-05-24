# JobPulse — Private Job Aggregator MVP

A full-stack job aggregation platform for a single private user. Aggregates junior and mid-level software engineering jobs from LinkedIn, Indeed, and Glassdoor with a focus on Brazil, remote worldwide, and English/Portuguese listings.

## Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS** + shadcn-style UI components
- **Supabase** (Auth + Postgres)
- **Playwright** scraping
- **Vercel** deployment + Cron Jobs
- **TanStack Query** for client data fetching
- **Zod** for validation

## Features

- Private single-user authentication (Supabase Auth)
- Dashboard with card/table hybrid job listings
- Filters: source, remote type, seniority, country, stack keyword
- Save/favorite, applied, and hide toggles
- Pagination
- Aggressive deduplication via normalized SHA-256 hashing
- Twice-daily automated scraping (07:00 & 18:00 UTC)

---

## Setup

### 1. Clone and install

```bash
npm install
npx playwright install chromium
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in **SQL Editor**:

   ```
   supabase/migrations/001_initial_schema.sql
   ```

3. **Disable public sign-ups** in Supabase Dashboard:
   - Authentication → Providers → Email → disable "Enable sign ups"

4. **Create the single allowed user** in Authentication → Users → Add user:
   - Email: `giovaniohira@gmail.com`
   - Password: (your chosen password)

5. Copy project URL and keys from Settings → API

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, for scrapers) |
| `ALLOWED_USER_EMAIL` | Only email allowed to access dashboard |
| `CRON_SECRET` | Random secret (min 16 chars) for cron auth |

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to dashboard (login required).

### 5. Manual scrape (optional)

```bash
npm run scrape
```

Or hit the cron endpoint locally:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/scrape
```

---

## Vercel Deployment

1. Push to GitHub and import in Vercel
2. Add all environment variables from `.env.example`
3. Set **CRON_SECRET** — Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically
4. Deploy

Cron schedule is defined in `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/scrape", "schedule": "0 7,18 * * *" }]
}
```

**Note:** Playwright on Vercel requires `@sparticuz/chromium`. The scrape route has `maxDuration = 300` (5 min). You may need a Pro plan for long-running cron jobs.

---

## Scraping Architecture

```
/api/cron/scrape
    └── ScrapingService.runAllScrapers()
            ├── linkedinScraper.ts
            ├── indeedScraper.ts
            └── glassdoorScraper.ts
                    └── BaseScraper (Playwright)
                            └── upsert → jobs table (hash dedup)
                            └── log → scraping_runs table
```

Each scraper:

1. Iterates search keywords (software engineer, backend, full stack, etc.)
2. Iterates locations (Brazil, Remote, Worldwide)
3. Filters junior/mid seniority via title/location heuristics
4. Extracts stack tags from title/keywords
5. Returns normalized `ScrapedJob[]`

**Deduplication:** `buildJobHash()` normalizes title, company, location, apply URL + source into a SHA-256 hash. Upsert uses `ON CONFLICT (hash)`.

**Resilience:** Each scraper runs independently. Failures are logged; other scrapers continue. Run status: `completed`, `partial`, or `failed`.

---

## Project Structure

```
src/
├── actions/          # Server actions (auth, jobs)
├── app/
│   ├── api/cron/scrape/   # Cron endpoint
│   ├── api/jobs/          # Jobs API for React Query
│   ├── dashboard/         # Protected dashboard
│   └── login/
├── components/
│   ├── dashboard/    # Job cards, filters, list
│   └── ui/           # shadcn-style primitives
├── lib/              # Supabase clients, types, hashing
├── repositories/     # Data access layer
├── scrapers/         # Playwright scrapers
└── services/         # Business logic
```

---

## Known Limitations

1. **Anti-bot protection** — LinkedIn, Indeed, and Glassdoor actively block automated scraping. Selectors may break without notice. CAPTCHAs and rate limits are common.
2. **Vercel serverless** — Playwright + Chromium is heavy. Cold starts and timeouts can affect scrape reliability. Consider running scrapers on a dedicated worker for production.
3. **No posted date parsing** — Many listings don't expose exact posted dates in search results; `posted_at` may be null.
4. **Seniority inference** — Heuristic-based from title/location text; not 100% accurate.
5. **Single user only** — Auth middleware + email check; not designed as multi-tenant SaaS.
6. **English/Portuguese** — Scrapers accept both via `Accept-Language` header but don't filter by language explicitly.
7. **Glassdoor/LinkedIn login walls** — Some results may require authenticated sessions not implemented in MVP.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run scrape` | Run all scrapers manually |
| `npm run lint` | ESLint |

---

## License

Private MVP — not for public distribution.
