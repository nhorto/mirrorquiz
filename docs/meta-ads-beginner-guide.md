# MirrorQuiz — Meta Ads Beginner Guide

**From zero to running ads.** This guide assumes you have no Meta ads account and no prior experience. Every step is spelled out.

**Companion doc:** `marketing-meta-ads.md` has strategy-level benchmarks, competitive intel, and funnel analytics. This guide is the actionable walkthrough.

---

## Part 1: Setup (From Zero)

You need 5 things before you can run a single ad. Do them in this order.

### Step 1: Create a Facebook Page for MirrorQuiz

You cannot run Meta ads without a Facebook Page. This is non-negotiable.

1. Go to [facebook.com/pages/create](https://www.facebook.com/pages/create)
2. Choose **Business or Brand**
3. Page name: **MirrorQuiz**
4. Category: search "App" or "Entertainment Website"
5. Add a profile photo (your logo) and cover image
6. Fill in the description: "Discover how your friends really see you. 12 questions. 2 minutes. 100% anonymous."
7. Click **Create Page**

You don't need followers. You don't need to post content. The Page just needs to exist so your ads have an identity.

### Step 2: Create an Instagram Professional Account (Recommended)

This lets your ads appear on Instagram too — where most of the 18-35 audience lives.

1. Download Instagram if you haven't already
2. Create an account or use an existing one
3. Go to **Settings → Account → Switch to Professional Account**
4. Choose **Business**
5. Connect it to your MirrorQuiz Facebook Page when prompted

### Step 3: Create a Meta Business Manager Account

Business Manager is the hub that owns everything: your Page, ad account, pixel, and payment.

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click **Create Account**
3. Enter your business name: **MirrorQuiz**
4. Enter your name and business email
5. Follow the prompts to finish setup

### Step 4: Add Your Assets to Business Manager

Once inside Business Manager:

**Add your Facebook Page:**
1. Go to **Business Settings → Accounts → Pages**
2. Click **Add → Add a Page**
3. Search for your MirrorQuiz page and add it

**Add your Instagram account:**
1. Go to **Business Settings → Accounts → Instagram Accounts**
2. Click **Add** and log into your Instagram

**Create an Ad Account:**
1. Go to **Business Settings → Accounts → Ad Accounts**
2. Click **Add → Create a New Ad Account**
3. Name it "MirrorQuiz Ads"

> **WARNING: Timezone and currency are permanent.** You cannot change these after creation. Double-check before clicking Create. Set timezone to your local time. Set currency to USD.

### Step 5: Install the Meta Pixel on mirrorquiz.com

The pixel is a snippet of code that tracks what visitors do on your site. Without it, Meta has no idea if your ads are working.

**Create the pixel:**
1. In Business Manager, go to **Events Manager** (left sidebar or search for it)
2. Click **Connect Data Sources → Web**
3. Name it "MirrorQuiz Pixel"
4. Choose **Meta Pixel** (not Conversions API for now)
5. Copy the base pixel code

**Install the base code:**
Add the pixel base code to the `<head>` of every page on mirrorquiz.com. If you're using a framework (Next.js, etc.), add it to your root layout or `_app` file.

**Set up custom events for MirrorQuiz's funnel:**

These events tell Meta exactly where users are in your funnel. Fire them from your frontend code at the appropriate moments:

| Event | When to Fire | Meta Standard Event | Code |
|-------|-------------|---------------------|------|
| Quiz Start | User clicks "Start Quiz" | ViewContent | `fbq('track', 'ViewContent', {content_name: 'Quiz Start'});` |
| Quiz Complete | User finishes all questions | CompleteRegistration | `fbq('track', 'CompleteRegistration');` |
| Paywall View | Results page loads with paywall | AddToCart | `fbq('track', 'AddToCart', {value: 7.99, currency: 'USD'});` |
| Purchase | Payment confirmed | Purchase | `fbq('track', 'Purchase', {value: 7.99, currency: 'USD'});` |
| Share Link | User copies/sends share link | Custom | `fbq('trackCustom', 'ShareLink');` |

**Verify the pixel is working:**
1. Install the [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper/) Chrome extension
2. Visit mirrorquiz.com and walk through the quiz flow
3. The extension should show a green checkmark for each event firing

### Step 6: Add a Payment Method

1. In Business Manager, go to **Business Settings → Payments**
2. Click **Add Payment Method**
3. Add a credit card or PayPal

You're now ready to create ads.

---

## Part 2: Understanding Campaign Structure

Meta Ads has 3 levels. Understanding this hierarchy is the single most important concept before you touch Ads Manager.

```
Campaign (the goal)
  └── Ad Set (who sees it + budget)
        └── Ad (what they see)
```

### Campaign = Your Goal

This is where you tell Meta what outcome you want. For MirrorQuiz, you'll use **Sales** (if you want purchases) or **Leads** (if you want quiz starts). That's it. Don't use Traffic, Engagement, or Awareness — those optimize for cheap clicks, not conversions.

### Ad Set = Who, Where, Budget

This controls:
- **Who** sees your ad (age, location, interests)
- **Where** it shows up (Facebook feed, Instagram Stories, Reels, etc.)
- **How much** you spend per day

### Ad = What They See

The actual image/video, headline, and text that appears in someone's feed.

**The critical mindset shift:** 95% of beginners jump straight to making the ad — picking images, writing copy. But your campaign objective and ad set targeting determine whether Meta even shows your ad to the right people. Get the structure right first.

---

## Part 3: Creating Your First Campaign (Step by Step)

Open [Ads Manager](https://adsmanager.facebook.com). Click **+ Create**.

### Campaign Level

1. **Campaign objective:** Choose **Sales**
   - We have a trackable purchase event on our site, so Sales is the right choice
   - If you haven't yet installed the pixel or don't have purchase tracking working, choose Leads and optimize for Quiz Start instead
2. **Campaign name:** "MirrorQuiz — Cold — Purchase — v1" (descriptive naming helps later)
3. **Buying type:** Auction (default, leave it)
4. **Special ad categories:** Leave unchecked unless your quiz relates to housing, credit, employment, or politics
5. **Advantage Campaign Budget:** Turn ON, set to **$10-15/day**
   - This lets Meta distribute budget across ad sets automatically

Click **Next**.

### Ad Set Level

1. **Ad set name:** "Broad US 18-35"
2. **Conversion location:** Website
3. **Performance goal:** Maximize number of conversions
4. **Conversion event:** Purchase
   - If you have fewer than 50 purchases per week, start with ViewContent (Quiz Start) instead — Meta needs ~50 conversions per ad set per week to optimize well
   - Switch to Purchase once you have enough volume
5. **Budget & schedule:** If you didn't use Advantage Campaign Budget above, set $10-15/day here. Start date: today. No end date.
6. **Audience:**
   - **Location:** United States
   - **Age:** 18-35
   - **Gender:** All
   - **Interests:** Leave blank to start. Broad targeting gives Meta's algorithm maximum room to find your buyers. You can test interest targeting later (psychology, personality tests, self-improvement).
   - **Advantage+ Audience:** Leave ON — this lets Meta expand beyond your settings when it finds promising signals
7. **Placements:** Choose **Advantage+ Placements** (leave ALL placements on)
   - When you optimize for conversions (Sales/Leads), Meta automatically shows your ad where it converts best, not where clicks are cheapest
   - Manually restricting placements limits Meta's ability to optimize and usually increases your cost per result

Click **Next**.

### Ad Level

1. **Ad name:** "Hook v1 — Identity Challenge"
2. **Identity:** Select your MirrorQuiz Facebook Page and Instagram account
3. **Ad setup:** Choose **Single image or video** to start
4. **Media:**
   - Start with a strong static image. UGC reaction screenshots, results-page screenshots (blurred), or a simple bold-text graphic work well
   - Image specs: 1080x1080 (square) or 1080x1350 (4:5 vertical preferred)
5. **Primary text:** This is the main copy above the image. Write 3-5 variations here (Meta will test them automatically):

   **Variation 1 (Identity Challenge):**
   > You think you know yourself. Your friends disagree.
   >
   > MirrorQuiz asks you 12 questions about your personality — then asks your friends the same questions about you. The gap between how you see yourself and how they see you is... eye-opening.
   >
   > 2 minutes. 100% anonymous. Zero judgment.
   >
   > Take the free quiz now.

   **Variation 2 (Curiosity Gap):**
   > I just found out my friends see me completely differently than I see myself.
   >
   > Took a 2-minute quiz, sent it to my friends, and the results were brutal. Turns out I'm way less "chill" than I thought.
   >
   > MirrorQuiz shows you the gap between your self-image and your friends' perception. 12 questions. Anonymous. Free to start.

   **Variation 3 (Social Proof):**
   > My friends nailed 11 out of 12 things about me — but the one they got wrong changed how I see myself.
   >
   > MirrorQuiz lets you compare how you see yourself vs. how your friends see you. Takes 2 minutes. The results hit different.

   **Variation 4 (Direct Challenge):**
   > How well do your closest friends actually know you?
   >
   > MirrorQuiz reveals the blind spots. You answer 12 questions. Your friends answer the same ones about you. Then you see the gap.
   >
   > Fair warning: some people aren't ready for the truth.

   **Variation 5 (FOMO):**
   > Everyone in my friend group just did this and the results are BRUTAL.
   >
   > It's a personality quiz where your friends answer the same questions about you. Finding out what they really think (anonymously) hits different.
   >
   > Free to start. 2 minutes. mirrorquiz.com

6. **Headline:** "How Do Your Friends Really See You?"
7. **Description:** "12 questions. 2 minutes. 100% anonymous."
8. **Call to action button:** "Learn More" or "Take Quiz"
9. **Website URL:** Your MirrorQuiz landing page URL
10. **URL parameters:** Add `utm_source=meta&utm_medium=paid&utm_campaign=cold_v1` for tracking

Click **Publish**.

Your ad is now in review. Meta typically approves ads within 1-24 hours.

---

## Part 4: Ad Copy & Creative for MirrorQuiz

### The Hook-Problem-Offer-CTA Framework

Every ad follows this structure:

| Element | What It Does | MirrorQuiz Example |
|---------|-------------|-------------------|
| **Hook** | Stops the scroll in 1-2 sentences | "You think you know yourself. Your friends disagree." |
| **Problem** | Identifies the pain/curiosity | "We all have blind spots about our personality that only others can see." |
| **Offer** | What they get and why it's easy | "12 questions, 2 minutes, 100% anonymous feedback from your actual friends." |
| **CTA** | Tell them exactly what to do | "Take the free quiz now." |

### Hook Library for MirrorQuiz

Write these down. You'll test them one at a time:

1. "You think you know yourself. Your friends disagree."
2. "I just found out my friends see me completely differently."
3. "My friends nailed 11 out of 12 things about me — and missed the one that mattered most."
4. "How well do your closest friends actually know you?"
5. "Everyone in my friend group is doing this and the results are brutal."
6. "Don't take this quiz if you're not ready to find out what your friends really think."
7. "The gap between how I see myself and how my friends see me is... uncomfortable."
8. "Your self-image might be a lie. Your friends know the truth."

### Creative Types That Work

**Best performers for quiz products (in order):**

1. **UGC reaction videos** — Someone filming themselves reacting to their MirrorQuiz results. Authentic surprise/shock/laughter. This is gold.
2. **Results screenshots** — Show a blurred or partial results screen. The curiosity gap drives clicks.
3. **Bold text on simple background** — The hook text in large font over a solid or gradient background. Works surprisingly well.
4. **Before/after split** — Left side: "How I see myself" vs. right side: "How my friends see me" with contrasting traits.

**How to get UGC at zero budget:** Give 20 friends free access to MirrorQuiz. Ask them to screen-record their reaction when they see their results compared to friends' responses. These unfiltered reactions are your best creative assets.

### Image Specs

| Placement | Aspect Ratio | Minimum Size |
|-----------|-------------|-------------|
| Feed (Facebook + Instagram) | 1:1 (square) or 4:5 | 1080x1080 or 1080x1350 |
| Stories / Reels | 9:16 (vertical) | 1080x1920 |
| Right column | 1.91:1 (landscape) | 1200x628 |

Start with a single 1080x1350 (4:5) image — it works in feed and can be cropped for other placements. Meta handles the rest when you leave Advantage+ Placements on.

### Multiple Variations Strategy

Rather than creating separate ads, put **multiple text and image variations inside a single ad.** Meta will automatically test combinations and allocate budget to winners. This is more efficient than running 5 separate ads.

- Add 3-5 primary text variations (see examples in Part 3)
- Add 2-3 image/video variations if you have them
- Add 2-3 headline variations
- Meta tests all combinations and finds winners for you

---

## Part 5: Budget Strategy

### Starting Budget: $10-15/Day

This is enough to generate meaningful data without burning money on bad ads. At roughly $10-25 CPM, you'll reach 400-1,000 people per day.

| Daily Budget | Monthly Spend | Good For |
|-------------|--------------|----------|
| $10/day | ~$300/month | Testing your first ads, finding a winning hook |
| $15/day | ~$450/month | Faster testing, enough for 1 cold + 1 retargeting ad set |
| $20/day | ~$600/month | Active scaling once you have a winner |

### The 72-Hour Rule

After publishing your ad, **do not touch anything for 72 hours.** No budget changes. No audience tweaks. No pausing.

Why: Meta's algorithm needs time to learn who responds to your ad. The first 24-48 hours are the "learning phase" — performance will be erratic. If you make changes, the learning phase restarts and you waste money.

**What to expect in the first 72 hours:**
- Day 1: High CPM, few conversions, looks terrible. This is normal.
- Day 2: Costs start to stabilize, early signals appear.
- Day 3: Algorithm is calibrating. You can now start reading the data.

### When to Kill an Ad

After 72+ hours AND at least $30-50 spent, check these metrics:

| Metric | Kill If... | Means... |
|--------|-----------|----------|
| CTR (link click-through rate) | Below 1% | Your creative isn't compelling enough |
| CPC (cost per link click) | Above $2.00 | Too expensive for your price point |
| Landing page → Quiz Start | Below 15% | Landing page isn't converting |
| Cost per Quiz Start | Above $5.00 | Funnel economics won't work |

If any of these are bad after $30-50 spend, pause the ad. Don't delete it (you want the data). Create a new ad with a different hook or image.

### When to Scale

If after 72+ hours your ad shows:
- CTR above 1% (above 1.5% is great)
- CPC below $2.00 (below $1.00 is great)
- Conversions coming in at acceptable CPA

Then increase budget by **20-30% every 3 days.** Not faster.

**Example scaling path:**
- Week 1: $10/day (testing)
- Week 2: $13/day (up 30%)
- Week 3: $17/day (up 30%)
- Week 4: $22/day (up 30%)

Doubling budget overnight resets Meta's learning phase and usually tanks performance.

### Retargeting Layer

After 7-14 days of running cold ads, you'll have enough site visitors to retarget.

1. Create a new ad set within your campaign
2. **Custom Audience:** Website visitors in the last 14 days who did NOT purchase
3. Budget: $3-5/day
4. Use different creative than your cold ads — social proof works better here (testimonials, result screenshots, "thousands of people have discovered...")
5. More direct CTA: "See your results — $7.99"

Retargeting typically converts 3-5x better than cold traffic.

---

## Part 6: Testing & Optimization

### The One-Variable Rule

Only change one thing at a time. If you change the image AND the copy AND the audience simultaneously, you have no idea what worked.

**Testing priority order:**
1. **Hook** (first 1-2 sentences) — this has the biggest impact on performance
2. **Image/video** — second biggest impact
3. **Audience** — test broad vs. interest-based
4. **Body copy** — the text after the hook
5. **CTA and headline** — smallest impact, test last

### How to Run a Test

1. Duplicate your best-performing ad
2. Change ONE variable (e.g., swap the hook)
3. Run both for 72 hours with equal budget
4. Compare CTR, CPC, and cost per conversion
5. Pause the loser, keep the winner
6. Test a new variable against the winner

### Key Metrics Table for MirrorQuiz

| Metric | Bad | Acceptable | Good | Great |
|--------|-----|-----------|------|-------|
| CTR (link clicks) | <0.5% | 0.5-1% | 1-2% | >2% |
| CPC (cost per click) | >$3.00 | $2-3 | $1-2 | <$1 |
| CPM (cost per 1,000 impressions) | >$40 | $25-40 | $10-25 | <$10 |
| Quiz Start Rate (of clicks) | <15% | 15-30% | 30-50% | >50% |
| Quiz Completion Rate | <50% | 50-65% | 65-80% | >80% |
| Cost per Quiz Start | >$5 | $3-5 | $1-3 | <$1 |
| Paywall Conversion | <2% | 2-4% | 4-8% | >8% |
| Cost per Purchase (CPA) | >$20 | $15-20 | $8-15 | <$8 |

### Creative Refresh Schedule

Ad fatigue is real. The same audience seeing the same ad repeatedly leads to declining performance.

- **Check frequency metric weekly.** If frequency goes above 2.5-3.0, your audience is seeing the ad too many times.
- **Refresh creative every 2-3 weeks** even if performance looks fine — proactive refreshes prevent sudden drops.
- Keep winning copy structures and swap visuals, or keep visuals and swap hooks.

---

## Part 7: Scaling

### Prerequisites (All Must Be True)

Before scaling beyond $20/day, confirm:

- [ ] CPA consistently below $15 over a 14-day window
- [ ] Quiz completion rate above 60%
- [ ] Paywall conversion rate above 4%
- [ ] Share rate above 20% of purchasers
- [ ] 3+ hooks tested with a clear winner
- [ ] Pixel has 100+ purchase events

### Scaling Methods

**Method 1: Budget Scaling (Simplest)**
- Increase daily budget by 20-30% every 3 days
- Monitor CPA — if it spikes more than 30% after an increase, pause the increase and let it stabilize

**Method 2: Duplicate and Scale**
- Duplicate your winning ad set
- Set the duplicate to a higher budget
- Run both for 72 hours
- If the duplicate performs well, pause the original and keep scaling the duplicate
- This avoids resetting the learning phase on your proven ad set

**Method 3: Add Retargeting Campaign**
- Allocate 20-30% of total budget to retargeting
- Target: site visitors who started but didn't complete quiz, or completed but didn't purchase
- Use different messaging (urgency, social proof, direct offer)

**Method 4: Lookalike Audiences**
- Available after 100+ purchases tracked by your pixel
- Go to **Audiences → Create Audience → Lookalike Audience**
- Source: People who triggered the Purchase event
- Location: United States
- Size: Start with 1% (most similar to your buyers), test 1-3% and 3-5%
- Create a new ad set targeting this lookalike audience with your best-performing creative

### Scaling Timeline (Realistic)

| Month | Budget | Focus |
|-------|--------|-------|
| Month 1 | $300-450 | Test hooks, find first winner, install pixel events |
| Month 2 | $450-600 | Scale winner, add retargeting, test 2-3 new hooks |
| Month 3 | $600-1,000 | Optimize CPA, add lookalike audiences, creative refresh |
| Month 4+ | $1,000-2,500 | Scale what works, expand to new creative formats (video) |

---

## Part 8: Common Mistakes

### 1. Never Boost a Post

The "Boost Post" button on your Facebook Page is a trap. It optimizes for engagement (likes, comments), not conversions. Always create ads through Ads Manager.

### 2. Don't Use the Traffic Objective

Traffic optimizes for cheap clicks. Meta will show your ad to people who click on everything but never buy anything. Use **Sales** or **Leads** — these optimize for actual conversions.

### 3. Don't Over-Target Your Audience

Beginners love to stack 15 interests and narrow their audience to 50,000 people. This gives Meta's algorithm no room to work. Start broad (18-35, US, no interest targeting). Let the algorithm find your buyers.

### 4. Don't Scale Too Fast

Increasing budget by more than 30% at a time resets Meta's learning phase. Your CPA will spike and you'll think your ad stopped working. Slow, steady increases: 20-30% every 3 days.

### 5. Get Timezone and Currency Right

These are permanent on your ad account. If you set the wrong timezone, your reporting will be confusing forever. If you set the wrong currency, you'll deal with conversion headaches. Double-check before creating your ad account.

### 6. Don't Pick the Wrong Performance Goal

Inside the ad set, "Performance Goal" determines what Meta optimizes for. "Maximize link clicks" and "Maximize conversions" sound similar but produce completely different results. Always choose **Maximize number of conversions** with your Purchase (or Quiz Start) event selected.

### 7. Don't Judge Results Before 72 Hours

The learning phase exists for a reason. Performance on Day 1 means nothing. Wait at least 72 hours and $30-50 in spend before making any decisions.

### 8. Don't Ignore Creative Fatigue

An ad that worked great for 2 weeks can suddenly tank. Check your frequency metric — if it's above 3.0, your audience is tired of seeing it. Have fresh creative ready before this happens.

### 9. Don't Forget UTM Parameters

Without UTM parameters on your ad URLs, you can't tell in Google Analytics (or your own analytics) which ads drove which traffic. Always add `utm_source=meta&utm_medium=paid&utm_campaign=[campaign_name]`.

### 10. Don't Run Ads Without a Working Pixel

If your pixel isn't firing correctly, Meta can't optimize. Verify every custom event with the Meta Pixel Helper extension before spending a dollar.

---

## Glossary

| Term | Definition |
|------|-----------|
| **Ad Account** | The account that holds your campaigns, billing, and reporting. Created inside Business Manager. |
| **Ad Set** | The middle level of campaign structure. Controls audience, placements, budget, and schedule. |
| **Advantage+ Placements** | Meta's automatic placement system. Shows your ads wherever they perform best across Facebook, Instagram, Messenger, and Audience Network. |
| **Advantage+ Audience** | Meta's smart targeting that expands beyond your defined audience when it finds promising signals. |
| **CPA (Cost Per Acquisition)** | How much you pay for each desired action (purchase, quiz start, etc.). Total spend divided by number of conversions. |
| **CPC (Cost Per Click)** | How much you pay for each link click. Total spend divided by number of link clicks. |
| **CPM (Cost Per Mille)** | Cost per 1,000 impressions. How much it costs to show your ad 1,000 times. Lower CPM means Meta likes your creative. |
| **CTR (Click-Through Rate)** | Percentage of people who click your ad after seeing it. Link clicks divided by impressions. |
| **Conversion Event** | A specific action on your website that you want to track and optimize for (e.g., Purchase, ViewContent). |
| **Creative** | The visual and text content of your ad — image/video, primary text, headline. |
| **Custom Audience** | An audience built from your own data — website visitors, customer lists, or app users. Used for retargeting. |
| **Frequency** | Average number of times each person has seen your ad. Above 3.0 usually means ad fatigue. |
| **Hook** | The first 1-2 sentences of your ad copy (or first 3 seconds of video). Determines whether someone stops scrolling. |
| **Impressions** | Number of times your ad was displayed on screen. One person can generate multiple impressions. |
| **K-Factor** | Virality coefficient. If K=0.3, every 10 users bring 3 additional users. Higher K means lower effective CPA. |
| **Landing Page** | The webpage people arrive at after clicking your ad. Should be focused, fast, and match the ad's promise. |
| **Learning Phase** | The period after launching or editing an ad where Meta's algorithm is figuring out who to show it to. Usually 24-72 hours. Performance is unstable during this time. |
| **Lookalike Audience** | An audience Meta builds that resembles your existing customers. Requires a source audience (e.g., 100+ purchasers). |
| **Meta Business Manager** | The central platform for managing your Facebook Page, Instagram, ad accounts, pixels, and team access. |
| **Meta Pixel** | A piece of JavaScript code on your website that tracks visitor actions and reports them back to Meta for ad optimization. |
| **Placement** | Where your ad shows up: Facebook Feed, Instagram Feed, Instagram Stories, Reels, Messenger, Audience Network, etc. |
| **Primary Text** | The main body copy of your ad that appears above the image/video. |
| **Retargeting** | Showing ads to people who already visited your site or interacted with your content but didn't convert. |
| **ROAS (Return on Ad Spend)** | Revenue generated divided by ad spend. A ROAS of 2.0 means $2 revenue for every $1 spent. |
| **UGC (User-Generated Content)** | Content created by real users, not brands. UGC-style ads consistently outperform polished branded creative. |
| **UTM Parameters** | Tags added to your URL (utm_source, utm_medium, utm_campaign) that let analytics tools track where traffic came from. |

---

## Quick Reference: First-Week Checklist

- [ ] Facebook Page created for MirrorQuiz
- [ ] Instagram Professional account connected
- [ ] Business Manager account created at business.facebook.com
- [ ] Ad account created (correct timezone + currency)
- [ ] Meta Pixel installed on mirrorquiz.com
- [ ] All 5 custom events firing correctly (verified with Pixel Helper)
- [ ] Payment method added
- [ ] First campaign created: Sales objective, $10-15/day
- [ ] Ad set: Broad US 18-35, Advantage+ Placements, Purchase optimization
- [ ] Ad: 1 image, 3-5 primary text variations, strong hook
- [ ] UTM parameters added to destination URL
- [ ] Calendar reminder set: "Check ad results" in 72 hours (not before)
