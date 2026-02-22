# PerceptionQuiz

"How do others really see you?" — A self-perception vs. others' perception quiz app. Users answer 12 personality questions about themselves, share a link with friends, and see how their self-image compares to reality. $7.99 one-time purchase unlocks detailed reports (blind spots, hidden strengths, trait breakdowns).

## Tech Stack

- **Runtime:** Cloudflare Workers via `@opennextjs/cloudflare`
- **Framework:** Next.js 16, App Router, Turbopack
- **Language:** TypeScript (strict)
- **Styling:** Tailwind v4 + shadcn/ui (new-york)
- **Database:** Cloudflare D1 (SQLite) via Drizzle ORM
- **Auth:** Better Auth with D1 adapter, magic links via Resend
- **Payments:** Stripe Checkout ($7.99 one-time)
- **Email:** Resend
- **Rate Limiting:** Upstash Redis
- **Analytics:** PostHog
- **Cache:** Cloudflare KV (OG images)
- **Package Manager:** bun (NOT npm/yarn/pnpm)
- **Deploy:** `opennextjs-cloudflare build && wrangler deploy`

---

## Local Development Setup

### Prerequisites

- [Bun](https://bun.sh/) installed (`curl -fsSL https://bun.sh/install | bash`)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (runs via `bunx wrangler`, no global install needed)
- A Cloudflare account (free tier is fine for dev)

### 1. Install dependencies

```bash
cd ~/Documents/perception-quiz
bun install
```

### 2. Set up local environment variables

The file `.dev.vars` contains secrets for local development. It already has placeholder values:

```bash
# .dev.vars (already exists — update if needed)
BETTER_AUTH_SECRET=dev-secret-change-me-in-production-32chars
APP_URL=http://localhost:3000
ENVIRONMENT=development
```

For **optional** local features, add these to `.dev.vars`:

```bash
# Resend — magic link emails (without this, magic link URLs print to console)
RESEND_API_KEY=re_...

# Stripe — payments (without this, checkout returns 500, which is expected)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Upstash Redis — rate limiting (without this, rate limiting is skipped)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

> **None of the optional keys are required to run the app locally.** The app gracefully degrades — emails print to console, rate limiting is skipped, and Stripe routes return errors.

### 3. Set up the local D1 database

```bash
# Create tables and seed 12 questions
bun run db:setup:local
```

This runs two commands:
- `db:migrate:local` — applies the SQL migration to create all tables
- `db:seed:local` — inserts the 12 personality questions

The local D1 database is stored at `.wrangler/state/v3/d1/` (auto-created by Wrangler).

### 4. Start the dev server

```bash
bun dev
```

The app runs at `http://localhost:3000`.

### 5. Test the basic flow locally

1. Go to `http://localhost:3000` — landing page
2. Click "Get Started" → login page
3. Enter any email → magic link URL appears in your **terminal console** (since no Resend key)
4. Open that URL in the browser → you're logged in
5. Go to `/create` → answer 12 questions → submit
6. Dashboard shows your quiz with a shareable link
7. Open the share link in an incognito window → friend response form
8. Submit as a friend (repeat 3x total for results to appear)
9. Back in the main window, go to your quiz results

---

## External Services Setup (for production)

You need to set up these services before deploying. All have free tiers.

### 1. Cloudflare (Required)

**What you need:** Workers, D1 database, KV namespace

```bash
# Login to Cloudflare
bunx wrangler login

# Create the production D1 database
bunx wrangler d1 create perception-quiz-db
```

This outputs a `database_id`. Update `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "perception-quiz-db",
    "database_id": "YOUR_ACTUAL_DATABASE_ID"  // <-- paste here
  }
]
```

```bash
# Create KV namespace for OG image cache
bunx wrangler kv namespace create OG_CACHE
```

Update the `kv_namespaces` section in `wrangler.jsonc` with the returned ID.

```bash
# Apply the migration to the REMOTE D1 database
bunx wrangler d1 execute perception-quiz-db --remote --file=src/db/migrations/0001_initial.sql

# Seed questions into REMOTE D1
bunx wrangler d1 execute perception-quiz-db --remote --file=src/db/seed.sql
```

### 2. Stripe (Required for payments)

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Get your test keys from Dashboard → Developers → API keys:
   - `STRIPE_SECRET_KEY` (starts with `sk_test_`)
3. Set up webhook:
   - Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://YOUR_DOMAIN/api/stripe/webhook`
   - Events: select `checkout.session.completed`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
4. For **local testing** with Stripe CLI:
   ```bash
   # Install Stripe CLI: https://stripe.com/docs/stripe-cli
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   # This prints a webhook signing secret — use that for local .dev.vars
   ```
5. Test card number: `4242 4242 4242 4242` (any future expiry, any CVC)

### 3. Resend (Required for magic link emails)

1. Create a [Resend account](https://resend.com/signup)
2. Add and verify your domain (DNS records)
3. Get API key from Dashboard → API Keys
4. Set `RESEND_API_KEY` in your environment

> Without Resend configured, magic link URLs print to the dev server console log instead of being emailed.

### 4. Upstash Redis (Required for rate limiting)

1. Create an [Upstash account](https://console.upstash.com/)
2. Create a Redis database (free tier, pick the closest region)
3. Copy the REST URL and token from the database details page
4. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

> Without Upstash configured, rate limiting is skipped entirely (the app still works).

### 5. PostHog (Optional — analytics)

1. Create a [PostHog account](https://app.posthog.com/signup)
2. Get your project API key from Settings → Project → API Key
3. Set `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST`

> Without PostHog configured, analytics calls are no-ops.

### 6. Domain (Optional but recommended)

Register a domain via Cloudflare Registrar or any registrar. Point DNS to your Cloudflare Workers deployment.

---

## Deploying to Production

### Set environment secrets on Cloudflare

```bash
# Required
bunx wrangler secret put BETTER_AUTH_SECRET
bunx wrangler secret put APP_URL              # e.g., https://perceptionquiz.com
bunx wrangler secret put STRIPE_SECRET_KEY
bunx wrangler secret put STRIPE_WEBHOOK_SECRET
bunx wrangler secret put RESEND_API_KEY

# Optional
bunx wrangler secret put UPSTASH_REDIS_REST_URL
bunx wrangler secret put UPSTASH_REDIS_REST_TOKEN
```

> `BETTER_AUTH_SECRET` must be a strong random string (32+ chars). Generate one: `openssl rand -hex 32`

### Build and deploy

```bash
bun run deploy
```

This runs `opennextjs-cloudflare build && wrangler deploy`.

### CI/CD (GitHub Actions)

The repo includes `.github/workflows/deploy.yml` which runs:
1. **Lint + type check** on every push/PR
2. **Deploy to staging** on merge to main
3. **Deploy to production** after staging succeeds

To enable it:
1. Add `CLOUDFLARE_API_TOKEN` as a GitHub Actions secret
   - Create at Cloudflare Dashboard → My Profile → API Tokens
   - Template: "Edit Cloudflare Workers" (or custom with Workers + D1 + KV permissions)
2. Create `staging` and `production` environments in GitHub Settings → Environments
3. Optionally add approval gates on the production environment

---

## Useful Commands

```bash
# Development
bun dev                           # Start dev server (Turbopack)
bun run lint                      # ESLint
bunx tsc --noEmit                 # Type check

# Database
bun run db:setup:local            # Migrate + seed local D1
bun run db:migrate:local          # Apply migration only
bun run db:seed:local             # Seed questions only
bun run db:generate               # Generate new migration from schema changes

# Deploy
bun run preview                   # Build + local Wrangler preview
bun run deploy                    # Build + deploy to Cloudflare

# Stripe local testing
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Project Structure

```
perception-quiz/
  .github/workflows/deploy.yml    -- CI/CD pipeline
  public/
  src/
    app/
      page.tsx                     -- Landing page
      layout.tsx                   -- Root layout (PostHog provider)
      loading.tsx                  -- Global loading spinner
      error.tsx                    -- Global error boundary
      not-found.tsx                -- 404 page
      sitemap.ts                   -- SEO sitemap
      robots.ts                    -- SEO robots.txt
      privacy/page.tsx             -- Privacy policy
      (auth)/
        login/page.tsx             -- Magic link login
        verify/page.tsx            -- "Check your email"
      (dashboard)/
        dashboard/page.tsx         -- Quiz list
        dashboard/[quizId]/
          results/page.tsx         -- Free results (radar + match %)
          report/page.tsx          -- Paid report (blur paywall)
        create/page.tsx            -- Quiz creation form
      quiz/[slug]/
        page.tsx                   -- Public quiz landing
        respond/page.tsx           -- Friend response form
        thanks/page.tsx            -- Thank you page
      purchase/success/page.tsx    -- Post-payment success
      api/
        auth/[...all]/route.ts     -- Better Auth handler
        questions/route.ts         -- GET all questions
        quiz/route.ts              -- POST create quiz
        quiz/[slug]/route.ts       -- GET quiz by slug
        respond/route.ts           -- POST friend response
        stripe/checkout/route.ts   -- GET → Stripe Checkout
        stripe/webhook/route.ts    -- POST Stripe webhook
    components/
      ui/                          -- shadcn/ui components
      radar-chart.tsx              -- Recharts radar (self vs friends)
      match-percentage.tsx         -- SVG circle gauge
      category-breakdown.tsx       -- Per-category score bars
      blind-spot-card.tsx          -- Blind spot insight
      hidden-strength-card.tsx     -- Hidden strength insight
      question-card.tsx            -- Question display
      likert-scale.tsx             -- 1-5 rating buttons
      share-link.tsx               -- Copy-to-clipboard share URL
      sign-out-button.tsx          -- Logout button
      posthog-provider.tsx         -- Analytics wrapper
    db/
      schema.ts                    -- Drizzle ORM schema (10 tables)
      index.ts                     -- getDb() helper
      migrations/0001_initial.sql  -- Full SQL migration
      seed.sql                     -- 12 personality questions
    lib/
      auth.ts                      -- Better Auth config (per-request D1)
      auth-client.ts               -- Client-side auth
      session.ts                   -- getSession() / requireSession()
      stripe.ts                    -- Workers-compatible Stripe init
      email.ts                     -- Resend email helpers
      slug.ts                      -- nanoid slug generation
      respondent-token.ts          -- Browser cookie dedup
      notifications.ts             -- Email notifications
      analysis.ts                  -- Quiz analysis engine
      insights.ts                  -- Blind spots / hidden strengths
      rate-limit.ts                -- Upstash rate limiter
      analytics.ts                 -- PostHog client wrapper
    middleware.ts                   -- Auth route protection
    types/env.d.ts                 -- Cloudflare binding types
  wrangler.jsonc                   -- Cloudflare Workers config
  open-next.config.ts              -- OpenNext adapter config
  drizzle.config.ts                -- Drizzle ORM config
  .dev.vars                        -- Local dev secrets
  .env.example                     -- Template for all env vars
```

---

## Remaining TODO (Not Yet Implemented)

- [ ] **E2E tests** — Playwright tests for quiz creation and friend response flows
- [ ] **OG image generation** — Dynamic OG images for shared result cards (`/api/og/[quizId]`)
- [ ] **Mobile responsiveness audit** — Review all pages on mobile viewports
- [ ] **Account deletion UI** — Self-service button (currently requires email request)
- [ ] **Custom domain** — Register and connect via Cloudflare
- [ ] **Production D1 database** — Create remote D1, run migration + seed
- [ ] **Stripe live mode** — Switch from test keys to live keys after testing
