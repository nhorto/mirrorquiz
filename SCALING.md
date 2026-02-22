# PerceptionQuiz — Scaling & Cost Optimization Guide

> Last updated: 2026-02-21
> Target scale: 50K to 500K+ monthly active users

---

## Table of Contents

1. [Current Architecture Overview](#current-architecture-overview)
2. [Cost Analysis by Scale](#cost-analysis-by-scale)
3. [Email: The #1 Cost Driver](#email-the-1-cost-driver)
4. [Backend Architecture at Scale](#backend-architecture-at-scale)
5. [Database (D1) Scaling](#database-d1-scaling)
6. [Caching Strategy](#caching-strategy)
7. [Queue & Async Processing](#queue--async-processing)
8. [Rate Limiting at Scale](#rate-limiting-at-scale)
9. [Authentication at Scale](#authentication-at-scale)
10. [Schema Optimization](#schema-optimization)
11. [Implementation Roadmap](#implementation-roadmap)
12. [Projected Costs After Optimization](#projected-costs-after-optimization)

---

## Current Architecture Overview

| Layer              | Technology                     | Notes                                  |
|--------------------|--------------------------------|----------------------------------------|
| Runtime            | Cloudflare Workers             | Via `@opennextjs/cloudflare`           |
| Framework          | Next.js 16 (App Router)        | Turbopack, TypeScript strict           |
| Database           | Cloudflare D1 (SQLite)         | Drizzle ORM                            |
| Auth               | Better Auth v1.4.18            | Magic link plugin, D1 adapter          |
| Email              | Resend                         | Magic links + response notifications   |
| Payments           | Stripe                         | One-time $7.99 report purchase         |
| Rate Limiting      | Upstash Redis                  | Sliding window (3 endpoints)           |
| Analytics          | PostHog                        | Pageview + pageleave tracking          |
| Cache              | Cloudflare KV                  | Reserved for OG images (not yet used)  |

### Key Traffic Patterns

Per user session, the app generates:

- **Quiz creator:** 1 auth request (magic link), 1 question fetch, 1 quiz creation (13 DB writes), N dashboard views
- **Friend respondent:** 1 question fetch, 1 quiz lookup, 1 response submission (14 DB writes), 1 notification email
- **Results viewer:** 1 session check, 4 DB reads for analysis computation

At 500K users/month with ~3 friend responses per quiz, that is roughly:
- 2.7M Worker requests/month
- 1.5M friend response submissions/month
- 500K+ emails/month (under the current per-response notification model)

---

## Cost Analysis by Scale

### Current Architecture (No Optimizations)

| Service            | 50K users/mo | 150K users/mo | 500K users/mo |
|--------------------|-------------|---------------|---------------|
| Cloudflare Workers | $5          | $5            | $5            |
| D1 Database        | $0          | $0            | $0-5          |
| Upstash Redis      | $0          | $0-10         | $10-20        |
| PostHog            | $0          | $0            | $0            |
| Resend (email)     | $20-90      | $90-270       | $450-900      |
| Stripe fees (2.9% + $0.30) | $265 | $795     | $2,650        |
| **Total infra (excl. Stripe)** | **$25-95** | **$95-285** | **$465-930** |
| **Revenue**        | $3,990      | $11,970       | $39,900       |

Email is the dominant infrastructure cost at every scale tier.

### After Optimizations (See Roadmap Below)

| Service            | 50K users/mo | 150K users/mo | 500K users/mo |
|--------------------|-------------|---------------|---------------|
| Cloudflare Workers | $5          | $5            | $5            |
| D1 Database        | $0          | $0            | $0-5          |
| Rate Limiting      | $0          | $0            | $0            |
| KV Cache           | $0          | $0            | $0.50         |
| Queues             | $0          | $0            | $1.40         |
| Email (SES + milestone-only) | $1-2 | $5-10    | $10-50        |
| Stripe fees        | $265        | $795          | $2,650        |
| **Total infra (excl. Stripe)** | **$6-7** | **$10-15** | **$17-62** |
| **Revenue**        | $3,990      | $11,970       | $39,900       |
| **Margin (excl. Stripe)** | **99.8%** | **99.9%** | **99.8%** |

---

## Email: The #1 Cost Driver

### The Problem

The current notification system in `src/lib/notifications.ts` sends an email on **every single friend response**. A quiz with 50 respondents generates 50 individual emails to the creator. At scale, this is the overwhelming cost driver.

Email types and their volume:

| Email Type          | Trigger                      | Volume at 500K users/mo |
|---------------------|------------------------------|------------------------|
| Magic link auth     | User signs in                | ~100K/mo (one-time)    |
| New response        | Every friend submission      | ~1.5M/mo (unbounded)   |
| Results ready       | 3rd response (once per quiz) | ~150K/mo (capped)      |
| **Total**           |                              | **~1.75M/mo**          |

### Provider Pricing Comparison

Actual current pricing as of early 2026:

| Provider        | 100K emails/mo | 500K emails/mo | 1.75M emails/mo | Per-email at 500K |
|-----------------|---------------|----------------|-----------------|-------------------|
| **Amazon SES**  | $10           | $50            | $175            | $0.0001           |
| **SendGrid Pro**| $90           | $90            | $90             | $0.00018          |
| **Resend Scale**| $90           | ~$450          | ~$1,575         | $0.00090          |
| **Mailgun**     | $90           | ~$530          | ~$1,865         | $0.00106          |
| **Postmark**    | $126          | $606           | ~$2,100         | $0.00121          |

#### Amazon SES

- $0.10 per 1,000 emails, no base fee
- 9x cheaper than Resend at scale
- Requires more setup: SPF/DKIM/DMARC configuration, SNS+SQS for bounce handling
- No built-in template editor
- Best for: maximum cost efficiency when you're comfortable with AWS

#### SendGrid Pro

- $89.95/month flat, covers up to 2.5M emails
- Best managed option in the middle ground
- Strong deliverability, good API, template editor included
- Free tier was eliminated in May 2025
- Best for: developer-friendly experience without AWS complexity

#### Cloudflare Email Service (Future)

- Private beta launched November 2025
- Native Workers binding (no API keys needed)
- Pricing not finalized, expected to be competitive with SES
- Best for: future migration once GA, since the app is already on Cloudflare Workers

### Volume Reduction Strategies

More impactful than switching providers is **sending fewer emails**.

#### Strategy 1: Milestone-Only Notifications (80-90% Volume Reduction)

Instead of emailing on every response, only email at milestones:

| Milestone | Email Message                              |
|-----------|--------------------------------------------|
| 1st       | "Your first response is in!"               |
| 3rd       | "Results unlocked! View your analysis."    |
| 10th      | "10 people have shared their perception."  |
| 25th      | "25 responses — your data is getting rich."|
| 50th      | "50 responses!"                            |
| 100th     | "100 responses — incredible."              |

A quiz with 50 respondents goes from 50 emails to 4. **This is the single highest-impact change.**

Implementation: modify `src/lib/notifications.ts` to check `newCount` against a milestone array before sending.

#### Strategy 2: In-App Notification System

Add a `notifications` table and show response counts as a dashboard badge:

```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read INTEGER NOT NULL DEFAULT 0,
  metadata TEXT, -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
```

Dashboard shows: "7 new responses since your last visit." Email only goes out for milestone events.

This is what Typeform and SurveyMonkey do. SurveyMonkey caps instant email notifications at 20/day per user and force-switches to digest mode above that.

#### Strategy 3: Web Push Notifications (Free)

Web push via Firebase Cloud Messaging (FCM) is completely free at any scale:

- Add a `push_subscriptions` table (stores browser push subscription per user)
- Register a Service Worker in the Next.js app
- Send push notifications via FCM when a response comes in
- Fall back to email only if user has no push subscription

Requires user opt-in. Covers ~40-60% of engaged users. Zero per-message cost.

#### Strategy 4: Daily Digest (Optional)

Store pending notifications in a table. A Cloudflare Workers CRON trigger runs daily and sends one summary email per creator: "You got 12 new responses today." Users opt-in to real-time vs. daily digest in preferences.

### Recommended Email Migration Path

| Phase   | Action                                          | Impact                    |
|---------|------------------------------------------------|---------------------------|
| Phase 1 | Milestone-only notifications (code change only) | -80-90% email volume      |
| Phase 2 | Switch Resend to SES or SendGrid Pro            | -80-95% email cost        |
| Phase 3 | Add in-app notifications + web push             | -40-60% remaining email   |
| Phase 4 | Evaluate Cloudflare Email Service when GA        | Potential further savings  |

### Email Deliverability Requirements (2025/2026)

Google, Yahoo, and Microsoft enforce these for senders above 5,000 emails/day:

- **SPF:** Required (publish sending IPs in DNS)
- **DKIM:** Required (2048-bit recommended)
- **DMARC:** Required with at least `p=none`
- **One-click unsubscribe:** Required for marketing emails (RFC 8058)
- **Spam complaint rate:** Must stay below 0.3%
- **Bounce rate:** Must stay below 2%

When switching providers, warm up the new IP gradually:
- Week 1: max 1,000 emails/day
- Week 2: 5,000/day
- Week 3: 20,000/day
- Week 4+: full volume

Keep Resend active as fallback during the 30-day transition.

---

## Backend Architecture at Scale

### Cloudflare Workers Limits

| Limit                  | Free        | Paid ($5/mo)           |
|------------------------|-------------|------------------------|
| Requests included      | 100K/day    | 10M/month              |
| Overage request cost   | —           | $0.30/million          |
| CPU time per request   | 10ms        | 30 seconds (5 min max) |
| Memory per Worker      | 128 MB      | 128 MB                 |
| Subrequests/invocation | 50          | 10,000                 |

Workers bill for **CPU time, not wall-clock time**. When your Worker is waiting for D1 to respond, that time is free. This is why the pricing model works well for DB-heavy apps.

### Workers Cost at 500K Users/Month

| Traffic component      | Requests/month | CPU per request |
|-----------------------|---------------|-----------------|
| Quiz page views        | ~500K         | ~5ms            |
| Response submissions   | ~1.5M         | ~15ms           |
| Dashboard/API calls    | ~500K         | ~10ms           |
| Auth requests          | ~200K         | ~10ms           |
| **Total**              | **~2.7M**     | **~30M CPU-ms** |

At $0.30/million requests over 10M included: **$0 in overage** (well within paid plan).
At $0.02/million CPU-ms: **$0.60/month** in CPU costs.

**Workers cost at 500K users is effectively $5/month (the base plan).**

---

## Database (D1) Scaling

### D1 Hard Limits

| Limit                | Free        | Paid                    |
|----------------------|-------------|-------------------------|
| Storage per database | 500 MB      | 10 GB (hard cap)        |
| Total account storage| 5 GB        | 1 TB                    |
| Rows read included   | 5M/day      | 25 billion/month        |
| Rows written included| 100K/day    | 50 million/month        |
| Overage: rows read   | —           | $0.001/million          |
| Overage: rows written | —          | $1.00/million           |
| Max databases/account| 10          | Unlimited               |

### Storage Estimate at Scale

Each quiz submission (respondent + 12 response rows) averages ~1KB. At 500K users with 3 responses each:

- 1.5M submissions × 1KB = ~1.5 GB of friend response data
- Plus quiz records, self responses, users, sessions = ~500 MB
- **Total: ~2 GB at 500K users** (well within 10 GB cap)

The 10 GB cap allows roughly **10 million total submissions** before you need to shard across multiple D1 databases.

### D1 Read Replicas

D1 read replication entered public beta in April 2025 and is available at **no additional cost**. It routes read queries to the nearest regional replica with sequential consistency.

Enable it in `wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "perception-quiz-db",
    "database_id": "your-id",
    "read_replication": { "mode": "auto" }
  }
]
```

This helps all read-heavy endpoints (quiz page loads, dashboard, analysis) but **all writes still go to the single primary**. Enable this immediately — it's free.

### D1 Write Concurrency

D1 is single-threaded for writes. Each write query is serialized. Throughput depends on query latency:

- 1ms query = ~1,000 writes/second theoretical max
- 10ms query = ~100 writes/second

The concern is burst concurrency from a viral quiz. If one quiz receives hundreds of simultaneous submissions, D1 will queue requests and eventually return "overloaded" errors.

**Mitigation:** Move response processing to Cloudflare Queues (see Queue section). The queue serializes writes naturally and handles retries.

### D1 vs Alternatives

| Database      | Price at 500K users | Strengths                                     | Weaknesses                                |
|---------------|--------------------|-------------------------------------------------|-------------------------------------------|
| **D1**        | $0-5/mo            | Zero config, Workers-native, read replicas free | 10 GB cap, single-threaded writes         |
| **Turso**     | $5/mo              | libSQL, embedded replicas, per-tenant DBs       | Extra network hop, not Cloudflare-native  |
| **Neon**      | $19-69/mo          | Postgres, branching, serverless                 | Cold starts, not edge-native, egress      |
| **PlanetScale**| $39/mo             | MySQL, vitess sharding                          | No SQLite, not edge-native                |
| **Supabase**  | $25/mo             | Postgres + auth + realtime                      | Not edge-native, latency from Workers     |

**Recommendation: Stay on D1 through 500K+ users.** The workload fits comfortably within limits. Re-evaluate if you hit the 10 GB storage cap or experience sustained "overloaded" errors during write spikes.

---

## Caching Strategy

### What to Cache and Where

| Data                       | Volatility              | Recommended Cache      | TTL     | Cost    |
|----------------------------|-------------------------|------------------------|---------|---------|
| `/api/questions` response  | Never changes post-deploy| Cache API (CDN)       | 7 days  | Free    |
| Quiz public page (slug)   | Changes on new response  | Cache API + purge     | 5 min   | Free    |
| Quiz analysis result       | Changes per new response| Workers KV            | 60 sec  | ~$0/mo  |
| Auth sessions              | Read-heavy, write-once  | Workers KV            | Session | ~$0/mo  |

### Cache API (Free, CDN-Layer)

The Cloudflare Cache API (`caches.default`) is free and serves responses from the nearest CDN edge. Use it for HTTP GET responses that can tolerate short staleness.

**Best candidate: `/api/questions`**

Questions are static seed data inserted at deployment. Currently, every quiz page load hits D1 for the same 12 rows. Caching this at the CDN layer eliminates all D1 reads for the most frequently hit endpoint:

```typescript
export async function GET(request: Request) {
  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/questions', request.url));

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  // ... fetch from D1 ...

  const response = NextResponse.json({ questions });
  response.headers.set('Cache-Control', 'public, max-age=604800, s-maxage=604800');
  await cache.put(cacheKey, response.clone());
  return response;
}
```

### Workers KV (Programmatic Cache)

KV is paid per read/write but can be read/written inside any Worker logic regardless of HTTP method. Use it for computed values.

**Best candidate: `getQuizAnalysis()` results**

The analysis function runs 4 D1 queries every time someone views results. Cache the output in KV keyed by `quiz:{quizId}:analysis` with a 60-second TTL. Invalidate on new response submission:

```typescript
// In getQuizAnalysis()
const cacheKey = `quiz:${quizId}:analysis`;
const cached = await env.OG_CACHE.get(cacheKey, 'json');
if (cached) return cached;

// ... run 4 D1 queries, compute analysis ...

await env.OG_CACHE.put(cacheKey, JSON.stringify(analysis), { expirationTtl: 60 });
return analysis;
```

```typescript
// In POST /api/respond, after incrementing response_count
await env.OG_CACHE.delete(`quiz:${quizId}:analysis`);
```

### Cache Invalidation Approaches

| Approach               | Complexity | Freshness  | Cost |
|------------------------|-----------|------------|------|
| TTL-based (60 sec)     | None      | 60s stale  | Free |
| Write-through (delete) | Low       | Immediate  | 1 KV write per response |
| Surrogate keys (purge) | Medium    | Immediate  | Requires Cache Rules |

For PerceptionQuiz, **TTL-based with write-through invalidation** is the sweet spot. A 60-second stale analysis is acceptable, and the explicit delete on new response ensures freshness for the most common case.

---

## Queue & Async Processing

### The Current Problem

`POST /api/respond` currently runs 7 sequential D1 queries plus a fire-and-forget email call:

```
1. Rate limit check (Upstash HTTP roundtrip)
2. Verify quiz exists (D1 read)
3. Check duplicate by browser token (D1 read)
4. Check duplicate by IP hash (D1 read)
5. Insert respondent row (D1 write)
6. Batch insert 12 friend_responses (D1 write)
7. Increment response_count (D1 write)
8. Re-read response_count (D1 read)
9. notifyNewResponse() — fire-and-forget (2-3 D1 reads + Resend HTTP call)
```

The fire-and-forget pattern (`notifyNewResponse().catch(...)`) is **unsafe in Workers**. When the HTTP response is sent, the Worker's lifecycle ends. The notification call is not guaranteed to complete.

### Cloudflare Queues Solution

Move notification processing to a queue:

```
POST /api/respond (fast path):
  1. Rate limit check
  2. Verify quiz + check duplicates (D1 reads)
  3. Insert respondent + 12 responses (D1 writes)
  4. Increment response_count (D1 write)
  5. Queue.send({ type: "new_response", quizId, newCount })
  6. Return 200 immediately

Queue consumer Worker (async, retryable):
  1. Receive message
  2. Check email_notifications for dedup (D1 read)
  3. Send email via SES/Resend
  4. Insert email_notifications record (D1 write)
  5. Acknowledge message
```

### Queues Pricing

| Tier                      | Price                    |
|---------------------------|--------------------------|
| Included in Workers Paid  | 1M operations/month      |
| Overage                   | $0.40/million operations |

Each message costs 3 operations (write + read + delete). At 1.5M submissions/month:
- 1.5M × 3 = 4.5M operations
- 4.5M - 1M included = 3.5M × $0.40/M = **$1.40/month**

### Benefits of Queue Architecture

- **Reliability:** Failed email sends are automatically retried (configurable backoff)
- **Decoupled latency:** Response submission returns in ~50ms instead of ~200ms (no email call in path)
- **Burst handling:** Queue absorbs write spikes; consumer processes at sustainable rate
- **Observability:** Queue metrics show processing lag, failure rates

---

## Rate Limiting at Scale

### Current: Upstash Redis

Three rate limit types using sliding window algorithm:

| Type            | Limit           | Key       |
|-----------------|-----------------|-----------|
| Magic link      | 3 per 15 min    | IP        |
| Quiz creation   | 5 per hour      | User ID   |
| Friend response | 10 per hour     | IP        |

Upstash cost at 500K users: ~$10-20/month (depending on command volume).

### Better Option: Native Workers Rate Limiting

Cloudflare's Workers Rate Limiting binding went GA in September 2025. It's included in Workers Paid at **no additional cost** and eliminates the Upstash HTTP roundtrip.

Configuration in `wrangler.jsonc`:

```jsonc
"unsafe": {
  "bindings": [
    {
      "name": "RL_MAGIC_LINK",
      "type": "ratelimit",
      "namespace_id": "1",
      "simple": { "limit": 3, "period": 900 }
    },
    {
      "name": "RL_QUIZ_CREATE",
      "type": "ratelimit",
      "namespace_id": "2",
      "simple": { "limit": 5, "period": 3600 }
    },
    {
      "name": "RL_FRIEND_RESPONSE",
      "type": "ratelimit",
      "namespace_id": "3",
      "simple": { "limit": 10, "period": 3600 }
    }
  ]
}
```

Usage in route handlers:

```typescript
const { success } = await env.RL_FRIEND_RESPONSE.limit({ key: ip });
if (!success) {
  return NextResponse.json({ error: "Too many responses" }, { status: 429 });
}
```

### Trade-offs

| Feature                | Upstash Redis        | Native Workers RL     |
|------------------------|---------------------|-----------------------|
| Cost at 500K users     | $10-20/mo           | $0 (included)         |
| Latency                | 20-50ms (HTTP)      | <1ms (in-process)     |
| Algorithm              | Sliding window       | Fixed window          |
| Multiple identifiers   | Flexible             | One binding per limit |
| External dependency    | Yes                  | No                    |

For PerceptionQuiz's use case (simple per-IP and per-user limits), the fixed window algorithm is sufficient. The latency improvement (50ms to <1ms per request) and zero cost make this a clear win.

---

## Authentication at Scale

### Better Auth Assessment

Better Auth is self-hosted, runs inside Workers, stores sessions in D1, and costs $0. At 500K users, the `sessions` table will have hundreds of thousands of rows, but D1 handles this efficiently via the UNIQUE index on `token`.

### Managed Auth Provider Comparison

| Provider        | Cost at 500K MAU    | Notes                          |
|-----------------|--------------------|---------------------------------|
| **Better Auth** | $0 (self-hosted)   | You pay for infra only          |
| **WorkOS**      | $0 (up to 1M MAU)  | Enterprise SSO focus            |
| **Supabase Auth** | ~$1,462/mo       | $0.00325/MAU after 50K free    |
| **Clerk**       | ~$9,800/mo         | $0.02/MAU after 10K free       |
| **Auth0**       | ~$34,300/mo        | $0.07/MAU                      |

**Better Auth is the correct choice.** Any managed auth provider at 500K MAU adds $1,500-$34,000/month.

### Session Caching with KV

Every authenticated request currently hits D1 for session lookup. At 500K users, this is a significant portion of D1 read volume. Move sessions to KV for sub-5ms lookups:

```typescript
// In src/lib/auth.ts
export const auth = betterAuth({
  // ... existing config ...
  secondaryStorage: {
    get: async (key) => await env.SESSION_KV.get(key),
    set: async (key, value, ttl) =>
      await env.SESSION_KV.put(key, value, { expirationTtl: ttl }),
    delete: async (key) => await env.SESSION_KV.delete(key),
  },
});
```

This requires adding a `SESSION_KV` KV namespace in `wrangler.jsonc`.

### Magic Link Email Volume

At 500K users with ~20% authenticating via magic link monthly = 100K magic link emails/month. This is a fixed cost regardless of email provider (~$10/mo on SES).

To further reduce: add Google OAuth as an alternative sign-in method. Users who choose OAuth generate zero email sends.

---

## Schema Optimization

### Current Schema Performance

At 500K users × 3 responses per quiz × 12 questions per response:

| Table              | Estimated Rows | Size   |
|--------------------|---------------|--------|
| users              | 500K          | ~50 MB |
| sessions           | 500K          | ~50 MB |
| quizzes            | 500K          | ~30 MB |
| self_responses     | 6M            | ~200 MB|
| respondents        | 1.5M          | ~100 MB|
| friend_responses   | 18M           | ~600 MB|
| **Total**          |               | **~1 GB** |

Well within D1's 10 GB limit.

### Missing Indexes

Add this covering index to dramatically speed up the analysis `AVG(score) GROUP BY question_id` query:

```sql
CREATE INDEX idx_friend_responses_quiz_question
  ON friend_responses(quiz_id, question_id, score);
```

This lets D1 compute the average entirely from the index without touching table data rows.

Also add for Better Auth session-to-user lookups:

```sql
CREATE INDEX idx_sessions_user ON sessions(user_id);
```

### Denormalization Opportunity: Self-Responses

The `self_responses` table stores 12 rows per quiz (one per question). Since self-assessments never change after creation, these can be stored as a JSON column on the `quizzes` table:

```sql
ALTER TABLE quizzes ADD COLUMN self_scores TEXT; -- JSON: {"q1": 4, "q2": 3, ...}
```

Benefits:
- Eliminates the `self_responses` table entirely (saves 6M rows at 500K users)
- Reduces analysis query from 4 D1 queries to 3
- Quiz creation goes from 13 DB writes to 2 (quiz insert + JSON column)

Trade-off: slightly more complex application code to parse JSON. Worth doing at 150K+ users.

### Do NOT Denormalize Friend Responses

The `friend_responses` table should remain normalized. The per-row storage enables:
- SQL-level `AVG()` and `GROUP BY` aggregation (fast with covering index)
- Individual response deletion for GDPR compliance
- Future features like response-level insights

Denormalizing friend responses to JSON would prevent SQL aggregation and make the analysis query slower, not faster.

---

## Implementation Roadmap

### Phase 1: Immediate (This Week) — Zero Cost

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 1 | Enable D1 read replicas in `wrangler.jsonc` | Reduced read latency globally | 1 line config change |
| 2 | Cache `/api/questions` with Cache API | Eliminate D1 reads for static data | ~20 lines of code |
| 3 | Add covering index `idx_friend_responses_quiz_question` | Faster analysis queries | 1 SQL migration |
| 4 | Implement milestone-only notifications | -80-90% email volume | Modify `notifications.ts` |
| 5 | Add `idx_sessions_user` index | Faster auth session lookups | 1 SQL migration |

### Phase 2: Short Term (1-2 Months) — $5-20/mo

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 6 | Switch Resend to Amazon SES or SendGrid Pro | -80-95% email cost | Provider migration |
| 7 | Move notifications to Cloudflare Queues | Reliable async email, faster responses | Queue setup + consumer Worker |
| 8 | Replace Upstash with native Workers Rate Limiting | Eliminate dependency, -50ms latency | Config + code change |
| 9 | Cache analysis results in KV (60s TTL) | Eliminate 4 D1 queries per results view | ~30 lines of code |

### Phase 3: Medium Term (3-6 Months) — Preparing for 500K+

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 10 | Add Better Auth KV session caching | Reduce D1 read load from auth | Config change |
| 11 | Add in-app notification system | Further reduce email dependency | New table + UI component |
| 12 | Cache quiz public pages at CDN (5 min) | Workers not hit for repeat visitors | Cache headers |
| 13 | Denormalize self_responses to JSON column | Eliminate 1 table, simplify writes | Migration + code change |
| 14 | Add Google OAuth sign-in option | Reduce magic link email volume | Auth config |

### Phase 4: Long Term (6+ Months) — 500K+ Scale Hardening

| # | Action | Impact | Effort |
|---|--------|--------|--------|
| 15 | Add web push notifications (FCM) | Free notification channel | Service Worker + FCM setup |
| 16 | Evaluate Cloudflare Email Service (when GA) | Potential further email savings | Provider migration |
| 17 | Add daily digest notification option | User preference, further email reduction | CRON trigger + preferences |
| 18 | Monitor D1 for "overloaded" errors under viral load | Identify if write sharding is needed | Observability |

---

## Projected Costs After Optimization

### Conservative Estimate (SES + Milestone Notifications)

| Scale           | Infra Cost/mo | Stripe Fees/mo | Revenue/mo | Net Profit/mo | Margin |
|-----------------|--------------|----------------|------------|---------------|--------|
| 50K users/mo    | $7            | $265           | $3,990     | $3,718        | 93%    |
| 150K users/mo   | $15           | $795           | $11,970    | $11,160       | 93%    |
| 500K users/mo   | $62           | $2,650         | $39,900    | $37,188       | 93%    |

### Aggressive Estimate (SES + Milestones + Web Push + In-App)

| Scale           | Infra Cost/mo | Stripe Fees/mo | Revenue/mo | Net Profit/mo | Margin |
|-----------------|--------------|----------------|------------|---------------|--------|
| 50K users/mo    | $6            | $265           | $3,990     | $3,719        | 93%    |
| 150K users/mo   | $10           | $795           | $11,970    | $11,165       | 93%    |
| 500K users/mo   | $17           | $2,650         | $39,900    | $37,233       | 93%    |

The key insight: **with the right architecture, infrastructure costs stay under $65/month even at 500K users.** The only cost that scales linearly with revenue is Stripe's 2.9% + $0.30 per transaction.

---

## Key Files Reference

| File | Role | Optimization Relevant |
|------|------|-----------------------|
| `src/app/api/respond/route.ts` | High-write hot path (7 D1 queries) | Queue migration, dedup optimization |
| `src/app/api/questions/route.ts` | Static data endpoint | Cache API candidate |
| `src/lib/analysis.ts` | 4-query analysis computation | KV cache candidate |
| `src/lib/notifications.ts` | Synchronous email delivery | Queue migration, milestone logic |
| `src/lib/rate-limit.ts` | Upstash-based rate limiting | Native Workers RL migration |
| `src/lib/auth.ts` | Better Auth config | KV session caching |
| `src/db/schema.ts` | Full database schema | Index optimization, self_scores denorm |
| `wrangler.jsonc` | Cloudflare bindings config | Read replicas, rate limit bindings |

---

## Sources

- [Cloudflare D1 Limits](https://developers.cloudflare.com/d1/platform/limits/)
- [Cloudflare D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [D1 Read Replication](https://developers.cloudflare.com/d1/best-practices/read-replication/)
- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Workers KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [Cloudflare Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [Workers Rate Limiting GA](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Amazon SES Pricing](https://aws.amazon.com/ses/pricing/)
- [SendGrid Pricing](https://sendgrid.com/en-us/pricing)
- [Resend Pricing](https://resend.com/pricing)
- [Postmark Pricing](https://postmarkapp.com/pricing)
- [Mailgun Pricing](https://www.mailgun.com/pricing/)
- [Cloudflare Email Service (Beta)](https://blog.cloudflare.com/email-service/)
- [Clerk Pricing](https://clerk.com/pricing)
- [Turso Pricing](https://turso.tech/pricing)
