# Perception Quiz App - Implementation Plan

## Context

"Self-perception vs. others' perception" quiz app where users answer questions about themselves, share a link with friends, and see how their self-image compares to how others see them. $7.99 one-time for detailed reports. No Supabase anywhere in the stack.

**Project location:** `~/Projects/perception-quiz`

---

## Architecture

```
Cloudflare CDN (static assets, caching)
        |
Cloudflare Workers (OpenNext adapter)
        |
  Next.js App Router (TypeScript)
        |
  ┌─────┼─────────┐
  │     │         │
  D1   KV     Upstash Redis
(SQLite) (OG cache) (rate limiting)

External: Stripe | Resend | PostHog
```

**Key decisions:**
- `@opennextjs/cloudflare` (NOT deprecated `next-on-pages`)
- Better Auth for creator accounts (Lucia is deprecated as of March 2025)
- Drizzle ORM for type-safe D1 queries
- Normalized response rows (NOT JSON blobs) - enables standard SQL aggregation
- No Supabase anywhere in the stack

---

## Phase 1: Foundation ✅ COMPLETE

**Goal:** Project scaffolding, D1 database, Cloudflare deployment working

**What was built:**
- Next.js 16 with TypeScript, Tailwind v4, App Router, src directory
- OpenNext for Cloudflare Workers (`open-next.config.ts`, `wrangler.jsonc`)
- D1 database with full schema via Drizzle ORM (10 tables)
- shadcn/ui (new-york style)
- Landing page
- 12 core questions seeded into D1

**Database tables:** users, sessions, magic_links, quizzes, questions, self_responses, respondents, friend_responses, purchases, email_notifications

**Schema approach:** Normalized rows for responses (one row per question per response), NOT JSONB.

**Verified:** `bun dev` runs locally with local D1, landing page returns 200.

---

## Phase 2: Auth + Quiz Creation ✅ COMPLETE

**Goal:** Users can sign up, create a quiz, and get a shareable link

**What was built:**
- Better Auth v1.4.18 with D1 adapter + magic link plugin
- Promise-based singleton `initAuth()` pattern for Cloudflare Workers D1 binding
- Auth catch-all API route at `/api/auth/[...all]`
- Magic link email via Resend (falls back to console.log in dev)
- Cookie-based session + middleware route protection for `/dashboard` and `/create`
- Auth client with `magicLinkClient()` plugin
- Login page with magic link form + "check your email" state
- Quiz creation page with 12 question cards + likert scale (1-5)
- Dashboard page showing user's quizzes with share links + copy button
- Quiz creation API at `/api/quiz` with validation
- Questions API at `/api/questions`
- Slug generation with nanoid (name-based: `sarah-kx7mn2pq`)
- Updated DB schema: Better Auth tables (users, sessions, accounts, verifications) + app tables
- shadcn/ui components: button, card, input, label
- Custom components: QuestionCard, LikertScale, ShareLink, SignOutButton

**Note:** Next.js 16 shows middleware deprecation warning (middleware → proxy). Still functional.

**Key files:**
```
src/lib/auth.ts                    -- Better Auth config with D1
src/lib/session.ts                 -- Session helpers
src/lib/email.ts                   -- Resend helpers
src/lib/slug.ts                    -- nanoid-based slug generation
src/app/(auth)/login/page.tsx      -- Email input
src/app/(auth)/verify/page.tsx     -- "Check your email"
src/app/api/auth/magic-link/route.ts
src/app/api/auth/verify/route.ts
src/app/(dashboard)/dashboard/page.tsx
src/app/(dashboard)/create/page.tsx
src/components/question-card.tsx
src/components/likert-scale.tsx
```

**Tricky part:** Better Auth requires D1 binding which is only available at request time via `getCloudflareContext()`. The auth instance must be created per-request, not as a module-level singleton.

**Milestone:** User signs up via magic link, answers 12 questions, sees shareable link on dashboard

---

## Phase 3: Friend Response Flow ✅ COMPLETE

**Goal:** Friends can take the quiz without any account

**What was built:**
- Public quiz landing page at `/quiz/[slug]` (SSR, loads quiz + creator name from D1)
- Friend response form at `/quiz/[slug]/respond` (reuses QuestionCard with `textFriend`)
- Optional display name for respondents (shown only to quiz creator)
- Browser token cookie (`pq_respondent`) via `respondent-token.ts` for dedup
- Response submission API at `/api/respond` with full validation (12 scores, integers 1-5)
- Duplicate submission check via DB constraint `UNIQUE(quiz_id, browser_token)` + pre-check
- Quiz info API at `/api/quiz/[slug]` for client-side fetching
- `response_count` auto-increment on quiz table after each submission
- Email notification to creator on each new response via `notifications.ts`
- "Results ready" email triggered when 3rd response arrives (sent only once)
- Thanks page at `/quiz/[slug]/thanks` with CTA to create own quiz

**Verified:** All pages compile — landing (200), login (200), quiz/fake-slug (404), respond (200), thanks (200), API returns correct 404 for missing quiz.

---

## Phase 4: Results & Visualization ✅ COMPLETE

**Goal:** Creator sees comparison of self vs. friends' perceptions

**What was built:**
- `src/lib/analysis.ts` — Full analysis engine: self vs. friends comparison per question and category, match percentage calc (`100 - avgGap × 20`)
- `src/lib/insights.ts` — Blind spot detection (self ≥ 1.5 higher), hidden strength detection (friends ≥ 1.5 higher), category insight text
- `src/components/radar-chart.tsx` — Recharts radar chart with self vs. friends overlay
- `src/components/match-percentage.tsx` — Animated SVG circle gauge with color-coded labels
- `src/components/category-breakdown.tsx` — Per-category score bars with insight text
- `src/components/blind-spot-card.tsx` — Amber-themed blind spot insight card
- `src/components/hidden-strength-card.tsx` — Emerald-themed hidden strength insight card
- Results page at `/dashboard/[quizId]/results` — Free tier: radar chart + match percentage + paywall CTA
- Report page at `/dashboard/[quizId]/report` — Paid tier: trait breakdown, blind spots, hidden strengths (blurred with backdrop-blur if not purchased)
- Minimum 3 responses enforced before any results shown
- Purchase check (reads `purchases` table) determines blur state
- OG image generation deferred to Phase 6 (Polish)

**Verified:** All pages compile — results/report redirect to login when unauthenticated (307), questions API returns 12 questions.

---

## Phase 5: Stripe Payments ✅ COMPLETE

**Goal:** $7.99 one-time purchase unlocks detailed report

**What was built:**
- `src/lib/stripe.ts` — Workers-compatible Stripe init using `Stripe.createFetchHttpClient()`
- `/api/stripe/checkout` (GET) — Creates Checkout session, stores pending purchase in D1, redirects to Stripe
- `/api/stripe/webhook` (POST) — Verifies signature with `constructEventAsync`, handles `checkout.session.completed`, idempotent
- `/purchase/success` — Success page with link to view report
- Already-purchased detection: checkout route redirects to report if purchase exists
- Purchase metadata flow: purchaseId + quizId + userId stored in Stripe session metadata, used by webhook to mark correct purchase as completed

**All Workers gotchas handled:** raw body via `text()`, async signature verification, fetch-based HTTP client.

**Verified:** All routes compile — checkout returns 500 without auth/keys (expected), webhook returns proper error without config, success page renders 200.

---

## Phase 6: Polish & Launch ✅ COMPLETE

**Goal:** Production-ready app

**What was built:**
- Rate limiting via Upstash Redis (`src/lib/rate-limit.ts`) — magic links: 3/15min, quiz creation: 5/hr per user, friend responses: 10/hr per IP
- Rate limiting integrated into API routes: `/api/auth/[...all]`, `/api/quiz`, `/api/respond`
- PostHog analytics integration (`src/lib/analytics.ts` + `src/components/posthog-provider.tsx`) wrapped in root layout
- SEO: sitemap.ts, robots.ts (blocks /dashboard, /create, /api, /purchase)
- Error handling: `not-found.tsx` (404), `error.tsx` (500 with retry), `loading.tsx` (spinner)
- Privacy policy page at `/privacy` with data collection, storage, cookies, deletion info
- GitHub Actions CI/CD pipeline (`.github/workflows/deploy.yml`) — lint → staging → production
- Privacy link added to landing page footer

**Remaining (manual/later):**
- E2E tests with Playwright (requires test infrastructure setup)
- OG image generation (deferred)
- Mobile responsiveness audit
- Production deployment with real domain + Cloudflare config

**Verified:** All pages compile — `/` (200), `/privacy` (200), `/login` (200), `/sitemap.xml` (200), `/robots.txt` (200), `/nonexistent` (404), `/dashboard` (307 auth redirect).

---

## Project Structure

```
perception-quiz/
  .github/workflows/deploy.yml
  e2e/
  public/fonts/
  src/
    app/
      page.tsx                      -- Landing page (marketing)
      (auth)/login/ & verify/       -- Auth pages
      (dashboard)/                  -- Authenticated pages
        dashboard/
          page.tsx                  -- Quiz list
          [quizId]/results/         -- Free results
          [quizId]/report/          -- Paid report
        create/                     -- Quiz creation
      quiz/[slug]/                  -- Public quiz (no auth)
      api/auth/ & quiz/ & respond/ & stripe/ & og/
    components/ui/                  -- shadcn/ui
    components/                     -- App components
    db/schema.ts & index.ts & migrations/ & seed.sql
    lib/auth.ts & stripe.ts & email.ts & analysis.ts & etc.
    middleware.ts
    types/env.d.ts                  -- Cloudflare bindings
  wrangler.jsonc
  open-next.config.ts
  drizzle.config.ts
```

---

## Tech Stack Quick Reference

- **Runtime:** Cloudflare Workers via @opennextjs/cloudflare
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
