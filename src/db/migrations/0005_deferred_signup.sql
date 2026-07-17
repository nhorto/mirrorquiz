-- Deferred signup (quiz-before-email funnel)
-- 1. Better Auth anonymous plugin: flag anonymous (guest) users
-- 2. quiz_claims: maps an email to the anonymous user who created quizzes
--    before signing up, so quizzes can be attached to the real account on
--    first sign-in — even when the magic link opens in a different browser.

ALTER TABLE users ADD COLUMN is_anonymous INTEGER;

CREATE TABLE IF NOT EXISTS quiz_claims (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  anonymous_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS quiz_claims_anon_user ON quiz_claims(anonymous_user_id);
CREATE INDEX IF NOT EXISTS quiz_claims_email ON quiz_claims(email);
