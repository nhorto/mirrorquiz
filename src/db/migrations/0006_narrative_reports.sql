-- LLM-written narrative reports, generated once per quiz and cached.
-- response_count records how many responses existed at generation time so we
-- can regenerate when enough new responses arrive.

CREATE TABLE IF NOT EXISTS narrative_reports (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL UNIQUE REFERENCES quizzes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  model TEXT NOT NULL,
  response_count INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
