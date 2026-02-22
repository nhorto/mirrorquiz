-- Migration: Initial schema (Better Auth + App tables)
-- Created: 2026-02-21

-- ═══════════════════════════════════════════════════════════════
-- Better Auth tables
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at INTEGER,
  refresh_token_expires_at INTEGER,
  scope TEXT,
  password TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER,
  updated_at INTEGER
);

-- ═══════════════════════════════════════════════════════════════
-- App tables
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  text_self TEXT NOT NULL,
  text_friend TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT,
  response_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS self_responses (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id),
  score INTEGER NOT NULL CHECK(score >= 1 AND score <= 5),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS self_responses_quiz_question
  ON self_responses(quiz_id, question_id);

CREATE TABLE IF NOT EXISTS respondents (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  display_name TEXT,
  browser_token TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS respondents_quiz_browser
  ON respondents(quiz_id, browser_token);

CREATE TABLE IF NOT EXISTS friend_responses (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  respondent_id TEXT NOT NULL REFERENCES respondents(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL REFERENCES questions(id),
  score INTEGER NOT NULL CHECK(score >= 1 AND score <= 5),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS friend_responses_respondent_question
  ON friend_responses(respondent_id, question_id);

CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS email_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  sent_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_quizzes_user ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON quizzes(slug);
CREATE INDEX IF NOT EXISTS idx_self_responses_quiz ON self_responses(quiz_id);
CREATE INDEX IF NOT EXISTS idx_friend_responses_quiz ON friend_responses(quiz_id);
CREATE INDEX IF NOT EXISTS idx_respondents_quiz ON respondents(quiz_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_quiz ON purchases(user_id, quiz_id);
