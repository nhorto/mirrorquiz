# PerceptionQuiz — Question Draft (v2 Alternative)

An alternative question set to compare against `question-draft.md`. Same research basis, different design philosophy.

## Philosophy Differences from v1 Draft

| | v1 Draft | This Draft (v2-alt) |
|---|---|---|
| **Count** | 15 questions, 5 categories | 12 questions, 6 categories |
| **Tone** | Earnest, reflective | Lighter, more conversational |
| **Category focus** | Heavy on blind spots (patience, reliability, self-awareness) | Balanced — includes humor, creativity, directness |
| **Gap balance** | ~60% blind spot, ~40% hidden strength | ~50/50 split |
| **Shareability** | Strong for "growth" sharing | Stronger for "fun" sharing |
| **Anchor type** | Mixed (frequency + comparison) | Uniform 5-point agreement scale |

### Why 12 instead of 15?
- Completion rates drop meaningfully above 12 questions (Outgrow research: 45-65% at 8-15 items)
- 12 gives us 2 per category across 6 categories — enough signal per dimension without redundancy
- Matches the current DB schema (12 questions) so implementation is simpler
- Keeps the "takes 2 minutes" promise honest

### Why a uniform scale?
- Switching between frequency and comparison anchors mid-quiz creates cognitive friction
- A single agreement scale (Strongly Disagree → Strongly Agree) is the most familiar to users
- Behavioral framing in the question itself handles specificity — the scale doesn't need to

---

## Scale

All questions use the same 5-point agreement scale:

1 = Strongly Disagree | 2 = Disagree | 3 = Neutral | 4 = Agree | 5 = Strongly Agree

---

## Category 1: Warmth & Inclusiveness

*Research basis: Agreeableness has the lowest self-other agreement (r=.46). But rather than testing "are you nice?" — which everyone says yes to — these questions test observable social warmth that friends can actually judge.*

### Q1 — Making space for others
- **Self:** "I go out of my way to include people who seem left out or quiet in a group."
- **Friend:** "[Name] goes out of their way to include people who seem left out or quiet in a group."
- **Expected gap:** Most people overrate. Strong blind spot territory. Friends notice who actually does this vs. who just thinks they do.

### Q2 — Remembering what matters
- **Self:** "I remember small details about people's lives — what they're going through, what matters to them."
- **Friend:** "[Name] remembers small details about your life — things you mentioned in passing that you didn't expect them to remember."
- **Expected gap:** Mixed. People with high empathy often underrate this (hidden strength). People who are self-focused overrate it (blind spot). Either way, the gap is interesting.

---

## Category 2: Humor & Lightness

*Research basis: Self-ratings and peer ratings of humor diverge substantially. This is one of the most fun categories to see results for because the stakes are low and the surprises are delightful. Someone discovering their friends think they're funnier than they realized is peak shareable content.*

### Q3 — Making people laugh
- **Self:** "I regularly make the people around me genuinely laugh."
- **Friend:** "[Name] regularly makes you genuinely laugh."
- **Expected gap:** Large. Funny people often don't realize how funny they are (hidden strength). People who try hard to be funny often overrate their success (blind spot). High shareability either way.

### Q4 — Lightening the mood
- **Self:** "When things get tense or awkward, I'm the one who lightens the mood."
- **Friend:** "When things get tense or awkward, [Name] is the one who lightens the mood."
- **Expected gap:** Moderate. Tests a specific social skill (tension diffusion) that people have strong but inaccurate self-beliefs about.

---

## Category 3: Directness & Honesty

*Research basis: Self-awareness and openness to feedback are among the most ironically overrated traits. People who think they're brutally honest are often perceived as either indirect or blunt-without-kindness. This category creates the most thought-provoking gaps.*

### Q5 — Saying the hard thing
- **Self:** "If a friend is making a mistake, I tell them directly rather than hinting or staying quiet."
- **Friend:** "If you were making a mistake, [Name] would tell you directly rather than hinting or staying quiet."
- **Expected gap:** Large blind spot. Most people believe they're more direct than they actually are. Friends know exactly who would actually speak up.

### Q6 — Taking feedback
- **Self:** "When someone gives me critical feedback, I take it seriously instead of getting defensive."
- **Friend:** "When [Name] gets critical feedback, they take it seriously instead of getting defensive."
- **Expected gap:** Very large blind spot. The Dunning-Kruger of self-awareness — the least receptive people rate themselves the most receptive. The irony is the insight.

---

## Category 4: Reliability & Follow-Through

*Research basis: Conscientiousness shows significant overestimation bias. People remember their follow-through successes and forget their dropped balls. Friends track every "I'll text you back" that never came.*

### Q7 — Keeping your word
- **Self:** "When I say I'll do something — text back, show up, send that thing — I follow through."
- **Friend:** "When [Name] says they'll do something, they actually follow through."
- **Expected gap:** Large blind spot. This is the most universally relatable gap. Everyone thinks they're reliable; friends know the truth. Painfully specific.

### Q8 — Being dependable in a crisis
- **Self:** "When someone in my life needs help in a pinch, I'm one of the first people they can count on."
- **Friend:** "When you need help in a pinch, [Name] is one of the first people you can count on."
- **Expected gap:** Mixed. Some people underrate their dependability (hidden strength — they don't realize how much others rely on them). Others overrate it (blind spot).

---

## Category 5: Composure & Calm

*Research basis: Neuroticism is primarily known to the self — internal anxiety is invisible to others. The gap between "how stressed I feel" and "how calm I appear" is one of the most emotionally moving results categories. Strong hidden strength territory.*

### Q9 — Calm under pressure
- **Self:** "I come across as calm and steady, even when I'm stressed or overwhelmed inside."
- **Friend:** "[Name] comes across as calm and steady, even in stressful situations."
- **Expected gap:** Large hidden strength. Most people think their stress is more visible than it is. Discovering that friends see you as composed when you feel like a mess is genuinely moving and highly shareable.

### Q10 — Being a stabilizing presence
- **Self:** "When things are chaotic, I'm the person who helps others feel like it's going to be okay."
- **Friend:** "When things are chaotic, [Name] is the kind of person who makes you feel like it's going to be okay."
- **Expected gap:** Hidden strength for most. People underestimate their calming effect on others. This is one of the most emotionally resonant questions — friends often rate this very high.

---

## Category 6: Confidence & Presence

*Research basis: Extraversion has the highest self-other agreement for raw energy levels, but the quality and impact of someone's presence shows bigger gaps. Introverts systematically underestimate how engaging they are. This is the strongest hidden strength category for a large user segment.*

### Q11 — Owning your opinions
- **Self:** "I confidently share my opinions, even when they might be unpopular."
- **Friend:** "[Name] confidently shares their opinions, even when they might be unpopular."
- **Expected gap:** Mixed. Some people think they're bolder than they are (blind spot). Others — especially women and introverts — underestimate how confidently they actually come across (hidden strength).

### Q12 — Making an impression
- **Self:** "I leave a strong impression on people when they first meet me."
- **Friend:** "[Name] left a strong impression on you when you first met them."
- **Expected gap:** Hidden strength for most. People chronically underestimate how memorable they are. The "liking gap" research shows we consistently underestimate how much others like us and find us interesting.

---

## Summary Table

| # | Category | Theme | Expected Gap | Emotional Tone |
|---|---|---|---|---|
| 1 | Warmth | Including the quiet ones | Blind spot | Humbling |
| 2 | Warmth | Remembering details | Mixed | Touching |
| 3 | Humor | Making people laugh | Mixed (often hidden strength) | Delightful |
| 4 | Humor | Lightening tension | Moderate | Fun |
| 5 | Directness | Telling hard truths | Blind spot | Provocative |
| 6 | Directness | Taking feedback well | Blind spot | Ironic |
| 7 | Reliability | Following through | Blind spot | Painfully relatable |
| 8 | Reliability | Being dependable in crisis | Mixed | Meaningful |
| 9 | Composure | Calm under pressure | Hidden strength | Moving |
| 10 | Composure | Stabilizing presence | Hidden strength | Emotional |
| 11 | Confidence | Owning opinions | Mixed | Empowering |
| 12 | Confidence | First impressions | Hidden strength | Confidence-boosting |

---

## Gap Distribution

| Gap Type | Questions | Count |
|---|---|---|
| **Blind spot** (self overrates) | Q1, Q5, Q6, Q7 | 4 |
| **Hidden strength** (friends rate higher) | Q3, Q9, Q10, Q12 | 4 |
| **Mixed** (varies by personality type) | Q2, Q4, Q8, Q11 | 4 |

This 4/4/4 split ensures:
- Every user gets at least 1-2 genuine blind spots (growth insight)
- Every user gets at least 1-2 hidden strengths (positive surprise, shareable)
- The mixed questions create the most personalized, unpredictable results

---

## Category Emotional Arc

The categories are ordered to create a deliberate emotional experience:

1. **Warmth** — Start with something relatable and human
2. **Humor** — Lighten the mood, make it fun
3. **Directness** — Get thought-provoking
4. **Reliability** — Hit close to home
5. **Composure** — Build toward emotional resonance
6. **Confidence** — End on an empowering note

This means the quiz starts light (warmth, humor) and ends strong (composure, confidence), and the results — when revealed — move from humbling to empowering.

---

## What This Draft Includes That v1 Doesn't

| Dimension | In v1? | In this draft? | Why it matters |
|---|---|---|---|
| **Humor** | No | Yes (Q3, Q4) | Highest shareability, lowest emotional risk, large gap |
| **Directness** | No | Yes (Q5, Q6) | Ironic gaps, thought-provoking, universally relatable |
| **Confidence / Presence** | Partially (Social Presence) | Yes (Q11, Q12) | "Liking gap" research — people underestimate their impact |
| **Self-Awareness** | Yes (3 questions) | Folded into Directness (Q6) | One targeted question captures the irony better than three |

## What v1 Includes That This Draft Doesn't

| Dimension | In v1? | In this draft? | Trade-off |
|---|---|---|---|
| **Self-Awareness (dedicated category)** | Yes (3 Qs) | 1 question (Q6) | v1 goes deeper on meta-awareness; this draft says one sharp question is enough |
| **Patience under pressure** | Yes (Q1-Q3) | Partially (Q1) | v1 has 3 patience questions; this draft covers it with warmth + directness |
| **Organization** | Yes (Q6) | No | Low emotional resonance; dropped in favor of humor |

---

## Implementation Notes

### No Reverse-Scored Questions
Unlike v1 draft (which has Q8 reverse-scored), this draft uses no reverse scoring. Every question is framed so that a higher score = more of the trait. This simplifies the scoring logic and avoids the comprehension issues research warns about.

### Result Framing
- **Blind spots** → "What your friends see that you don't"
- **Hidden strengths** → "What your friends see in you that you undervalue"
- **Alignment** → "Where you and your friends agree — you know yourself well here"

### Archetype Ideas (based on top gap combinations)
- **"The Secret Comedian"** — Low self-rated humor, high friend-rated humor
- **"The Quiet Anchor"** — Low self-rated composure, high friend-rated calm
- **"The Honest Mirror"** — High self-rated directness, lower friend-rated directness
- **"The Invisible Leader"** — Low self-rated presence, high friend-rated impression
- **"The Loyal Skeptic"** — Low self-rated warmth, high friend-rated dependability
- **"The Steady Flame"** — High alignment everywhere (rare — genuinely self-aware)
