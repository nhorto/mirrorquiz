-- Migration: Add performance indexes for scale
--
-- idx_friend_responses_quiz_question: "Covering index" for the analysis query.
-- Lets D1 compute AVG(score) GROUP BY question_id entirely from the index
-- without reading the actual table rows. Big speedup as friend_responses grows.
--
-- idx_sessions_user: Speeds up Better Auth session-to-user lookups.

CREATE INDEX IF NOT EXISTS idx_friend_responses_quiz_question
  ON friend_responses(quiz_id, question_id, score);

CREATE INDEX IF NOT EXISTS idx_sessions_user
  ON sessions(user_id);
