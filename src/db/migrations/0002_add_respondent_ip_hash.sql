-- Migration: Add ip_hash column to respondents for dedup strengthening
-- Prevents same IP from submitting multiple responses to the same quiz

ALTER TABLE respondents ADD COLUMN ip_hash TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS respondents_quiz_ip
  ON respondents(quiz_id, ip_hash);
