-- Seed: Initial question set with 12 questions (v3 — final)
-- Categories: warmth, humor, directness, reliability, composure, confidence

-- Create the launch question set
INSERT OR IGNORE INTO question_sets (id, version, label, is_active)
VALUES ('qs_001', 1, 'Launch Set', 1);

-- Insert 12 questions tied to the launch set
INSERT OR IGNORE INTO questions (id, question_set_id, category, text_self, text_friend, sort_order) VALUES
  ('q01', 'qs_001', 'warmth',      'I go out of my way to include people who seem left out or quiet in a group.', '[Name] goes out of their way to include people who seem left out or quiet in a group.', 1),
  ('q02', 'qs_001', 'warmth',      'I make people feel heard when they talk to me.', '[Name] makes you feel heard when you talk to them.', 2),
  ('q03', 'qs_001', 'humor',       'I regularly make the people around me genuinely laugh.', '[Name] regularly makes you genuinely laugh.', 3),
  ('q04', 'qs_001', 'humor',       'When things get tense or awkward, I''m the one who lightens the mood.', 'When things get tense or awkward, [Name] is the one who lightens the mood.', 4),
  ('q05', 'qs_001', 'directness',  'If a friend is making a mistake, I tell them directly rather than hinting or staying quiet.', 'If you were making a mistake, [Name] would tell you directly rather than hinting or staying quiet.', 5),
  ('q06', 'qs_001', 'directness',  'When someone gives me critical feedback, I take it seriously instead of getting defensive.', 'When [Name] gets critical feedback, they take it seriously instead of getting defensive.', 6),
  ('q07', 'qs_001', 'reliability', 'When I say I''ll do something — text back, show up, send that thing — I follow through.', 'When [Name] says they''ll do something, they actually follow through.', 7),
  ('q08', 'qs_001', 'reliability', 'When someone in my life needs help in a pinch, I''m one of the first people they can count on.', 'When you need help in a pinch, [Name] is one of the first people you can count on.', 8),
  ('q09', 'qs_001', 'composure',   'I come across as calm and steady, even when I''m stressed or overwhelmed inside.', '[Name] comes across as calm and steady, even in stressful situations.', 9),
  ('q10', 'qs_001', 'composure',   'I handle unexpected changes or setbacks without getting thrown off.', '[Name] handles unexpected changes or setbacks without getting thrown off.', 10),
  ('q11', 'qs_001', 'confidence',  'I make people feel comfortable and welcome, especially in new or awkward situations.', '[Name] makes people feel comfortable and welcome, especially in new or awkward situations.', 11),
  ('q12', 'qs_001', 'confidence',  'I leave a strong impression on people when they first meet me.', '[Name] left a strong impression on you when you first met them.', 12);
