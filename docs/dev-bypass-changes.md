# Dev Bypass Changes — Rate Limiting & Stripe

**Date:** February 2026
**Purpose:** Allow full end-to-end testing locally without Upstash Redis or Stripe accounts.
**Safety:** All bypasses are gated on `ENVIRONMENT !== "production"`. Production is unaffected.

---

## What Was Changed

### 1. Rate Limiting Bypass

**Files modified:**
- `src/app/api/quiz/route.ts` (quiz creation)
- `src/app/api/respond/route.ts` (friend response submission)

**What changed:** Previously, if Upstash Redis credentials were missing, both routes returned 503 immediately (fail-secure). Now, the logic is:
- If Upstash is configured → rate limiting works normally
- If Upstash is NOT configured AND `ENVIRONMENT === "production"` → 503 (fail-secure, same as before)
- If Upstash is NOT configured AND `ENVIRONMENT !== "production"` → skip rate limiting, allow the request through

### 2. Stripe Checkout Bypass

**File modified:**
- `src/app/api/stripe/checkout/route.ts`

**What changed:** When `ENVIRONMENT !== "production"`, the checkout route:
- Creates a purchase record with `status: "completed"` immediately (no Stripe session)
- Redirects to `/purchase/success?quizId=...`
- Skips Stripe entirely

In production (`ENVIRONMENT === "production"`), the full Stripe checkout flow runs as normal.

---

## How to Revert

### Option A: Revert all dev bypasses at once

```bash
git diff HEAD -- src/app/api/quiz/route.ts src/app/api/respond/route.ts src/app/api/stripe/checkout/route.ts
git checkout HEAD -- src/app/api/quiz/route.ts src/app/api/respond/route.ts src/app/api/stripe/checkout/route.ts
```

### Option B: Revert individually

**Rate limiting (quiz creation):**
```bash
git checkout HEAD -- src/app/api/quiz/route.ts
```

**Rate limiting (friend responses):**
```bash
git checkout HEAD -- src/app/api/respond/route.ts
```

**Stripe checkout:**
```bash
git checkout HEAD -- src/app/api/stripe/checkout/route.ts
```

### Option C: Manual revert

**Rate limiting (`quiz/route.ts` and `respond/route.ts`):**

Replace the current pattern:
```typescript
if (isRateLimitConfigured(rlEnv)) {
  // ... rate limit check ...
} else if (isProduction) {
  return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
}
```

With the original fail-secure pattern:
```typescript
if (!isRateLimitConfigured(rlEnv)) {
  return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
}
{
  // ... rate limit check ...
}
```

**Stripe (`stripe/checkout/route.ts`):**

Delete the entire `if (!isProduction) { ... }` block at the top of the Stripe logic (the block that creates a completed purchase and redirects immediately).

---

## Environment Variable Reference

| Variable | Local (`.dev.vars`) | Production (Cloudflare secrets) |
|----------|--------------------|---------------------------------|
| `ENVIRONMENT` | `development` | `production` |
| `UPSTASH_REDIS_REST_URL` | Not needed (bypassed) | Required |
| `UPSTASH_REDIS_REST_TOKEN` | Not needed (bypassed) | Required |
| `STRIPE_SECRET_KEY` | Not needed (bypassed) | Required |
| `STRIPE_WEBHOOK_SECRET` | Not needed (bypassed) | Required |
