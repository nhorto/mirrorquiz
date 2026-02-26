# Meta Ads Setup Guide for MirrorQuiz

## How Many Ads to Create

Start with **3-5 ads** in one ad set. Not all 15 variations at once.

- Meta needs enough budget per ad to learn what works
- Too many ads = budget spread too thin = nothing gets enough data
- After a week, kill the losers and test new ones

### Recommended starting ads:
1. **Identity Challenge + Split** (before/after is visually striking)
2. **Stat Attack + Gradient** (bold stat catches attention)
3. **Curiosity Gap + Results** (blurred results create curiosity)

## Ad Structure

Each ad = **1 image** + its matching copy. So 3 ads = 3 images.

**Pairing rule:** Keep hook and copy matched. Don't mix the Identity Challenge image with the Stat Attack copy.

## Creating an Ad Step by Step

### 1. Ad Setup
- **Format:** Single image or video
- **Creative source:** Manual upload
- **Image:** Use the **1080x1080 feed** version (Meta auto-adapts for stories)

### 2. Destination
- **Main destination:** Website
- **Website URL:** `www.mirrorquiz.com`
- **Display link:** Yes, keep it — use `Mirrorquiz.com`

### 3. Ad Creative — Text Variations
For each ad, add **multiple variations** of each text field (click the + icon next to Primary Text, Headline, and Description fields):

- **2-3 primary text** variations (the long copy)
- **2-3 headlines** (short punchy lines)
- **1 description** (shows less often, not worth testing heavily)
- **"Optimize text per person"** = Enabled (lets Meta pick the best combo per viewer)

All 5 variations for each hook are available on the `/ads` page — just copy-paste.

### 4. Call to Action
- Use **"Learn more"** — lowest friction for a quiz
- Don't use "Sign up" (feels like commitment) or "Shop now" (not selling a product)

### 5. Tracking
- **Website events:** MirrorQuiz Pixel should be selected
- **URL parameters:** Add UTM tracking:
  ```
  utm_source=meta&utm_medium=paid&utm_campaign=mirrorquiz_launch
  ```

### 6. Creative Enhancements
- Turn **off** Advantage+ creative enhancements for your first test
- This gives you clean data on YOUR creatives
- You can test enhancements later

## Creating Multiple Ads in One Ad Set

1. Create **Ad 1**: Upload Identity Challenge + Split image, paste matching copy
2. Click **"Duplicate ad"** in Ads Manager (or create new ad in same ad set)
3. **Ad 2**: Swap the image for Stat Attack + Gradient, use that hook's copy
4. Duplicate again
5. **Ad 3**: Swap for Curiosity Gap + Results, use that hook's copy

## Feed vs Story Images

- **Start with 1080x1080 (feed)** — Meta auto-adapts for stories
- 1080x1920 story images do NOT work well in feed (gets cropped badly)
- **Advanced:** In "Feeds" and "Stories, Status, Reels" sections, you can upload different images per placement — feed gets 1080x1080, stories gets 1080x1920

## After Launch

- Let ads run for **3-5 days** minimum before making decisions
- Look at **cost per click (CPC)** and **click-through rate (CTR)**
- Kill ads with CTR below 1% after sufficient impressions (~1000+)
- Duplicate winning ads and test new variations against them

## Campaign Score

Don't stress about the campaign score number (e.g., 81). It always nags you to spend more or add features. Focus on actual results, not the score.
