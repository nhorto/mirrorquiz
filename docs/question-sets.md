# Question Sets — Versioning & Iteration Guide

## Why We're Doing This

The original schema has a single global `questions` table. Every quiz references those questions directly. This creates a problem: if you change, remove, or reword a question in production, every existing quiz that was answered with the old version breaks. The responses become meaningless because they're tied to questions that no longer exist or say something different.

**Question sets** solve this by grouping questions into versioned snapshots. Each quiz records which set it was created with. Old quizzes keep working forever, and you can iterate on questions as much as you want without breaking anything.

---

## What Changed

### New Table: `question_sets`

| Column | Type | Description |
|--------|------|-------------|
| `id` | text (PK) | e.g., `qs_001` |
| `version` | integer | Sequential version number (1, 2, 3...) |
| `label` | text | Human-readable name, e.g., "Launch Set" |
| `is_active` | integer (0/1) | Whether new quizzes use this set. Only one set should be active at a time. |
| `created_at` | text | Timestamp |

### Modified Table: `questions`

- **Added `question_set_id`** — ties each question to a specific set. Old questions stay in the database forever, linked to their original set.

### Modified Table: `quizzes`

- **Added `question_set_id`** — records which question set was used when this quiz was created. This is what makes old quizzes work even after you create new question sets.

### Modified Files

| File | What Changed |
|------|-------------|
| `src/db/schema.ts` | Added `questionSets` table, added `questionSetId` to `questions` and `quizzes` |
| `src/app/api/questions/route.ts` | Filters questions by the active set instead of returning all questions |
| `src/app/api/quiz/route.ts` | Saves `questionSetId` on quiz creation |
| `src/lib/analysis.ts` | Filters questions by the quiz's set when calculating results |

### Files That Did NOT Change

| File | Why |
|------|-----|
| `src/app/api/respond/route.ts` | Friends respond to `questionId`s already tied to the quiz — no set logic needed |
| `src/lib/insights.ts` | Operates on data passed to it, doesn't query questions directly |
| `src/app/(dashboard)/create/page.tsx` | Fetches from `/api/questions` which already returns the active set |
| `src/app/quiz/[slug]/respond/page.tsx` | Same — gets questions from the API, no changes needed |
| All UI components | Generic — they render whatever questions they're given |

---

## How to Create a New Question Set

When you want to change, add, or reword questions, follow these steps:

### Step 1: Write a migration file

Create a new file in `src/db/migrations/` with the next number in sequence:

```sql
-- src/db/migrations/XXXX_new_question_set_v2.sql

-- 1. Create the new set
INSERT INTO question_sets (id, version, label, is_active, created_at)
VALUES ('qs_002', 2, 'Post-Launch Iteration', 1, datetime('now'));

-- 2. Deactivate the old set
UPDATE question_sets SET is_active = 0 WHERE id = 'qs_001';

-- 3. Insert the new questions (all 12, tied to the new set)
INSERT INTO questions (id, question_set_id, category, text_self, text_friend, sort_order) VALUES
  ('q2_01', 'qs_002', 'warmth', 'Self version of question...', 'Friend version of question...', 1),
  ('q2_02', 'qs_002', 'warmth', '...', '...', 2),
  -- ... all 12 questions
  ('q2_12', 'qs_002', 'confidence', '...', '...', 12);
```

### Step 2: Run the migration on production

```bash
bunx wrangler d1 execute perception-quiz-db --remote --file=src/db/migrations/XXXX_new_question_set_v2.sql
```

### Step 3: Done

- New quizzes immediately get the v2 questions
- Existing quizzes continue working with v1
- No code deploy needed — questions are loaded from the database

---

## How to Roll Back to a Previous Set

If a new set isn't working well, you can switch back instantly:

```sql
-- Deactivate the current set
UPDATE question_sets SET is_active = 0 WHERE id = 'qs_002';

-- Reactivate the previous set
UPDATE question_sets SET is_active = 1 WHERE id = 'qs_001';
```

Run this directly:

```bash
bunx wrangler d1 execute perception-quiz-db --remote --command="UPDATE question_sets SET is_active = 0 WHERE id = 'qs_002'; UPDATE question_sets SET is_active = 1 WHERE id = 'qs_001';"
```

New quizzes will immediately use the old set again. Quizzes that were created with v2 while it was active will continue working correctly with their v2 questions.

---

## How to A/B Test Question Sets (Future)

If you want to test two sets against each other:

1. Mark both sets as `is_active = 1`
2. Modify `/api/questions/route.ts` to randomly pick one of the active sets
3. Compare completion rates, response distributions, and feedback across sets
4. Deactivate the worse-performing set

This requires a small code change but no schema changes.

---

## Important Rules

1. **Always create a new set — never edit existing questions.** If you modify a question's text in place, every quiz that used it will display the wrong text in results.

2. **Keep 12 questions per set.** The frontend and API validation both expect exactly 12. If you want to change this number, you'd also need to update the validation in `/api/quiz/route.ts` and `/api/respond/route.ts`, plus the progress counters in the create and respond pages.

3. **Only one active set at a time** (unless A/B testing). The `/api/questions` route returns questions for the active set. If multiple are active and you haven't built A/B logic, it'll just pick the first one it finds.

4. **Old sets are never deleted.** They cost essentially nothing to store (a few KB) and are needed for existing quiz analysis to work.

5. **No code deploy needed to swap sets.** It's purely a database operation. The only time you need to deploy is if you change the number of questions per set or add new features like A/B testing.

---

## Cost Impact

None. D1 charges per rows read/written and storage. Even with 50 question sets (600 rows), the storage is negligible. Old sets are only queried when viewing results for quizzes that used them. New quizzes only query the active set, so per-request cost stays the same.

---

## Schema Reference

```
question_sets
├── id (PK)            "qs_001"
├── version            1
├── label              "Launch Set"
├── is_active          1
└── created_at         "2025-01-15T..."

questions
├── id (PK)            "q01"
├── question_set_id    "qs_001"  ← ties to a set
├── category           "warmth"
├── text_self          "I go out of my way..."
├── text_friend        "[Name] goes out of..."
├── sort_order         1
└── created_at         "2025-01-15T..."

quizzes
├── id (PK)
├── user_id
├── question_set_id    "qs_001"  ← locks quiz to the set used at creation
├── slug
├── title
├── response_count
└── created_at
```
