-- Seed: 12 core perception questions
-- Categories: openness, conscientiousness, extraversion, agreeableness, emotional-stability, empathy

INSERT OR IGNORE INTO questions (id, category, text_self, text_friend, sort_order) VALUES
  ('q01', 'openness', 'I enjoy trying new experiences and exploring unfamiliar ideas', 'This person enjoys trying new experiences and exploring unfamiliar ideas', 1),
  ('q02', 'openness', 'I am creative and often come up with original solutions', 'This person is creative and often comes up with original solutions', 2),
  ('q03', 'conscientiousness', 'I follow through on my commitments and meet deadlines', 'This person follows through on their commitments and meets deadlines', 3),
  ('q04', 'conscientiousness', 'I am organized and plan ahead before taking action', 'This person is organized and plans ahead before taking action', 4),
  ('q05', 'extraversion', 'I feel energized by social gatherings and meeting new people', 'This person feels energized by social gatherings and meeting new people', 5),
  ('q06', 'extraversion', 'I tend to take the lead in group conversations', 'This person tends to take the lead in group conversations', 6),
  ('q07', 'agreeableness', 'I go out of my way to help others, even when it is inconvenient', 'This person goes out of their way to help others, even when it is inconvenient', 7),
  ('q08', 'agreeableness', 'I am patient and understanding when people make mistakes', 'This person is patient and understanding when people make mistakes', 8),
  ('q09', 'emotional-stability', 'I stay calm and collected under pressure', 'This person stays calm and collected under pressure', 9),
  ('q10', 'emotional-stability', 'I bounce back quickly from setbacks and disappointments', 'This person bounces back quickly from setbacks and disappointments', 10),
  ('q11', 'empathy', 'I can easily sense how others are feeling without being told', 'This person can easily sense how others are feeling without being told', 11),
  ('q12', 'empathy', 'I make people feel heard and understood when they talk to me', 'This person makes people feel heard and understood when they talk to them', 12);
