# MirrorQuiz Improvement Plan — July 2026

A full product + marketing review of the live app at [mirrorquiz.com](https://mirrorquiz.com), done July 16, 2026. This is the working plan for getting MirrorQuiz to real users and real revenue. Each section maps to a GitHub issue under the umbrella tracking issue.

**TL;DR:** The landing page and core mechanic are good. The funnel after the click is what's broken — an email wall before the quiz, a free-tier promise the app doesn't keep, a thin paid report, and analytics that couldn't see most visitors. Fix the funnel, upgrade the report, restyle the inner pages, then market in the right order: seed by hand → organic real-face video → micro-influencers → paid ads last.

---

## Part 1 — Product findings (priority order)

### P1: The email wall kills the funnel before it starts

Every CTA on the landing page routes to `/login`, where a brand-new visitor sees **"Welcome back"** and must enter an email, leave the site, open their inbox, and click a magic link — before seeing a single quiz question. Inside the TikTok/Facebook in-app browsers (where nearly all ad traffic lives), the magic link usually opens in a different browser where the session doesn't carry over.

This is the single biggest conversion killer, and it also strangles the viral loop: creators who never get through the wall never send links to friends.

**Fix — deferred signup:**
- Visitor clicks any CTA → goes straight into the 12 questions with an anonymous session token.
- After the last question: "Enter your email to save your results and get your share link."
- Create the account (magic link, as today) at that point; attach the anonymous quiz session to it.
- Fix the "Welcome back" copy — new visitors need a create-flow voice, returning users a sign-in voice.

By the time we ask for the email, the visitor has invested two minutes and the ask feels like a natural step instead of a toll booth.

### P1: Free-tier promise mismatch — the blurred radar chart

The landing pricing table says the **free** tier includes "Radar chart comparison" and "Overall match percentage." But the results page blurs the radar chart unless the user has paid. Anyone who reads the pricing table and then hits a blurred chart feels baited — at the exact moment we ask them for $7.99.

**Fix:** show the free radar chart for real (it's the shareable hook and the screenshot people will post), and sell the premium on what's genuinely premium: trait-by-trait breakdown, blind spots, hidden strengths, and the written narrative report (below).

### P1: Analytics can't see most visitors

PostHog only initializes after the visitor clicks "Accept" on the cookie banner. Most mobile visitors ignore or decline it, so they're invisible. The "3–4 visitors" from the first ad campaign was almost certainly a large undercount — Meta's own link-click numbers are the more reliable signal from that test.

**Fix:**
- Run PostHog in cookieless/anonymous mode for pageviews and funnel events (no consent banner needed for anonymous aggregate analytics in most jurisdictions); keep consent gating only for identified tracking.
- Instrument the funnel end to end: `visit → quiz started → quiz completed → email captured → link shared → first friend response → purchase`.
- We cannot make marketing decisions until this exists.

### P2: The $7.99 report is too thin

The report engine is rule-based one-liners: a 1.5-point gap threshold and templated sentences ("You rate yourself higher on X than your friends do"). For $7.99, buyers expect something that feels written *about them*. (This was also the #2 item on the original March TODO.)

**Fix — LLM-written narrative report:**
- At purchase time, one LLM call takes the full self-vs-friends comparison data and writes a personal 4–6 paragraph narrative — grounded in the Johari Window / Vazire research the site already cites, in the app's fun, casual voice.
- Add a short "what to do with this" section for each blind spot and hidden strength.
- Generate once, cache in D1.
- Fix readability issues in the report cards (blind spot / hidden strength color contrast).
- This is also what justifies testing a $9.99 price later.

### P2: The viral loop needs its second engine

Two gaps:

1. **Respondent conversion.** The friend who answers a quiz is the highest-intent prospect we will ever get for free. The respondent thank-you screen needs a hard CTA: "Want to know how YOUR friends see you? Create yours — free." This CTA *is* the viral coefficient.
2. **Response notifications.** Creators should get an email when a friend responds ("2 people have answered — see what changed"). That's what brings creators back, and returning after 3+ responses is the natural purchase moment. Verify `src/lib/notifications.ts` is actually wired to the respondent-submit path.

### P2: App-wide UI overhaul

The homepage looks good; everything past it doesn't match. (March TODO items 1, 4, 5.)

**Scope — every screen, one design language:**
- Carry the homepage's visual identity (gradient brand, typography, spacing, card style) through login/onboard, dashboard, create, quiz-taking, results, report, and purchase-success pages.
- Dashboard: greet the user by name; make quiz cards feel alive (response counts, freshness).
- Results: make the radar chart a centerpiece (color, animation on load, labeled axes), not a bland widget.
- Report: fix blind-spot / hidden-strength card colors and contrast; make it feel like a premium document.
- Quiz-taking: progress feel, micro-interactions on answer select — this is the screen every friend sees, it carries the brand.
- Mobile-first pass on everything (nearly all traffic is mobile).

### P3: Share card for Instagram / social

There's no good way to share results where the audience actually is. Instagram has no share-URL web intent, so the practical mechanic is a generated image.

**Fix:** generate a shareable result-card image (the OG-image pipeline + KV cache already exist) — radar chart, match percentage, one teaser insight, and the quiz URL — with a "Share to story / Download" button on results and report pages.

---

## Part 2 — Why the first ad campaign flopped ($100–150 → "3–4 visitors")

Three compounding causes, none of which mean "ads don't work for this":

1. **Undercounting.** Analytics were consent-gated (see above), so most visitors were invisible. Diagnose the campaign from Meta Ads Manager numbers, not PostHog.
2. **AI-generated creative.** Meta/TikTok users pattern-match obviously-AI video as spam within a second; engagement tanks, the algorithm charges more and delivers less. The ad *scripts* in this repo (Shocked Reaction, The Dare, the gossip format) are genuinely good — they need a real human face delivering them. A 20-second selfie reaction video will outperform a polished AI video ten to one in this category.
3. **Budget below the learning threshold.** Meta needs roughly 50 conversion events per week per ad set to optimize. A fresh pixel, no purchase history, and ~$150 spread across ads means the test never actually ran.

**The strategic point:** at $7.99 one-time, breakeven CPA is a few dollars — cold paid traffic to an unknown brand won't hit that. The product's built-in loop (each creator recruits 3–5 friends, each respondent is a potential creator) is the free channel. Ads come last, as fuel on a fire that's already lit.

## Part 3 — Marketing plan (in order; do not reorder)

1. **Fix the funnel first** (P1 issues above). Buying or earning traffic into the current funnel wastes it.
2. **Seed by hand — the founding 50.** Send the quiz to friends, family, coworkers, group chats; post real results on personal socials. Goal: 50 creators, each pulling 3–5 respondents. This also produces real reaction screenshots for content.
3. **Organic short-form with real faces.** 2–3 posts/week for a month using the existing scripts in `ad results/social-media-captions.md` — real results on screen, real reactions. TikTok organic is the honest test of the hook: if a real-face reaction video can't get views, ads won't save it; if one hits, it outperforms any $150 campaign.
4. **Micro-influencers.** Free premium codes to 20–30 small creators (10k–100k followers) in the friendship / self-awareness / college niche, plus a ~50% affiliate cut. One mid-sized "my best friend rated me and I'm not okay" video is the realistic breakout scenario.
5. **Paid ads, last and differently.** Once the funnel converts organically: one campaign, $20–30/day for two full weeks, optimized for **quiz completed** (an event with volume), real-face creative only. Retarget quiz-completers with the purchase offer. The existing `marketing-meta-ads.md` / `meta-ads-beginner-guide.md` mechanics still apply; this sequencing is what was missing.

**Occasion moments to plan around:** New Year's, Valentine's Day (future couples edition), National Best Friends Day (June 8), back-to-school.

## Part 4 — Decisions made

- **No native app for now.** The share link is the product's superpower — a friend taps and is answering in five seconds. An app-install wall would do to the viral loop what the email wall did to ad traffic, plus a 15–30% store cut and review delays on every fix. Revisit only if the product pivots to daily-engagement (e.g., couples edition) where push notifications drive retention — and even then, PWA or a thin wrapper first.
- **Couples edition: later, as a mode, not a pivot.** Keep the friends version (with its viral loop) as the core; add "Couples Edition" as a second question set + report + higher price point on the same engine once the friends funnel is proven.
- **Price stays $7.99 until the narrative report ships**, then test $9.99.
