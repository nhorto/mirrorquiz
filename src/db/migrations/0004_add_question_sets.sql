-- Migration: Add question sets for versioned questions
-- This allows changing questions in production without breaking existing quizzes.

-- 1. Create question_sets table
CREATE TABLE IF NOT EXISTS question_sets (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  label TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Add question_set_id to questions table
ALTER TABLE questions ADD COLUMN question_set_id TEXT REFERENCES question_sets(id);

-- 3. Add question_set_id to quizzes table
ALTER TABLE quizzes ADD COLUMN question_set_id TEXT REFERENCES question_sets(id);

-- 4. Create the initial question set
INSERT INTO question_sets (id, version, label, is_active)
VALUES ('qs_001', 1, 'Launch Set', 1);

-- 5. Backfill existing questions with the initial set
UPDATE questions SET question_set_id = 'qs_001' WHERE question_set_id IS NULL;

-- 6. Backfill existing quizzes with the initial set
UPDATE quizzes SET question_set_id = 'qs_001' WHERE question_set_id IS NULL;
