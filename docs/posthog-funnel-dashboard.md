# PostHog Funnel & Dashboard Setup

Companion to issue #4. The code now captures the full funnel for every
visitor (anonymous, session-scoped analytics run without consent; cookies
and identified tracking remain consent-gated). This doc is the 10-minute
PostHog-side setup — it needs someone logged into the PostHog project, so
it can't be automated from the repo.

## Event vocabulary

### Creator funnel
| Step | Event | Where it fires |
|---|---|---|
| 1. Visit | `$pageview` | automatic, every page |
| 2. Quiz started | `quiz_started` | first answer selected (`/start` or `/create`; `flow` property: `deferred_signup` vs `authenticated`) |
| 3. Quiz completed | `quiz_completed` | all 12 answered + submitted |
| 4. Email captured | `email_captured` | deferred-signup email step succeeds |
| 5. Quiz created | `quiz_created` | quiz row created (has `slug`) |
| 6. Link shared | `link_shared` | any share button (`method` property: copy / native_share / sms / whatsapp / twitter / facebook / instagram) |
| 7. First friend response | `response_submitted` with `is_first_response = true` | friend submits (fires in the friend's browser, so use it as a funnel step by quiz `slug`, not by person) |
| 8. Results viewed | `results_viewed` | creator opens results |
| 9. Checkout started | `checkout_started` | paywall CTA click |
| 10. Purchase | `purchase_completed` | Stripe success page |

### Respondent (viral-loop) funnel
| Step | Event |
|---|---|
| 1. Invite viewed | `quiz_invite_viewed` |
| 2. Started answering | `respond_started` |
| 3. Submitted | `response_submitted` (`response_number`, `is_first_response`) |

## Dashboard to build (in PostHog UI)

Create a dashboard named **"MirrorQuiz Funnel"** with:

1. **Creator funnel** (Insights → Funnel, unique persons, 1-day window):
   `$pageview` → `quiz_started` → `quiz_completed` → `email_captured` →
   `link_shared` → `checkout_started` → `purchase_completed`
   - Note: pre-consent visitors have a session-scoped identity, so
     conversion within a session is accurate; cross-day return visits by
     non-consenting users will look like new persons. That's the accepted
     privacy tradeoff.
2. **Respondent funnel**: `quiz_invite_viewed` → `respond_started` →
   `response_submitted`.
3. **Trends**: daily unique `$pageview`, `quiz_created`, `response_submitted`,
   `purchase_completed`.
4. **Share method breakdown**: `link_shared` broken down by `method`.
5. **Flow split**: `quiz_created` broken down by `flow`
   (`deferred_signup` vs `authenticated`) — measures the funnel-flip win.

## Optional next step: PostHog "cookieless server hash mode"

posthog-js also supports `cookieless_mode: "on_reject"`, which uses a
server-computed daily hash instead of any client storage — better cross-page
identity for non-consenting users. It requires enabling **cookieless server
hash mode** in the PostHog project settings first. If you flip that setting,
change `persistence: "sessionStorage"` to add `cookieless_mode: "on_reject"`
in `src/lib/analytics.ts`.

## In-app browser verification (manual)

Paste a quiz link into TikTok/Instagram DMs to yourself, open it in the
in-app browser, answer a question, and confirm `quiz_invite_viewed` /
`respond_started` show up in PostHog → Activity within a minute or two.
sessionStorage works in all in-app browsers, so events should flow without
the banner being touched.
