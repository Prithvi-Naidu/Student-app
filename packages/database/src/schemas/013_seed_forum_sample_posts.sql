-- Seed sample forum discussions (3 per category)

-- Housing
INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'Housing', 'Best areas to live near campus?', 'I’m looking for safe, walkable neighborhoods with reasonable rent near campus. What areas would you recommend and why?', 12, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'Best areas to live near campus?');

INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'Housing', 'Tips for finding roommates as an international student', 'What platforms or campus groups are best for finding reliable roommates? Any red flags to watch out for?', 8, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'Tips for finding roommates as an international student');

INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'Housing', 'Lease basics: what should I check before signing?', 'First time renting in the U.S. What clauses should I pay attention to in a lease? Any tips for avoiding hidden fees?', 15, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'Lease basics: what should I check before signing?');

-- Finance
INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'Finance', 'Opening a bank account without SSN: what worked for you?', 'Which banks were easiest to open accounts with using a passport and proof of address?', 18, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'Opening a bank account without SSN: what worked for you?');

INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'Finance', 'Best budget apps for students?', 'Looking for a simple budget tracker. Any recommendations that work well for international students?', 9, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'Best budget apps for students?');

INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'Finance', 'How to build credit from scratch', 'I just arrived and have no credit history. What’s the fastest safe way to build credit?', 21, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'How to build credit from scratch');

-- General
INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'General', 'What should I pack for my first semester?', 'Any essentials you wish you had brought as an international student?', 7, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'What should I pack for my first semester?');

INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'General', 'Making friends in the first month', 'What helped you meet people quickly on campus?', 14, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'Making friends in the first month');

INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'General', 'Best ways to manage homesickness', 'Any routines or clubs that helped you adjust?', 11, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'Best ways to manage homesickness');

-- Academic
INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'Academic', 'How to choose classes in the first semester', 'How many credits should I take and how do I balance difficulty?', 10, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'How to choose classes in the first semester');

INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'Academic', 'Office hours: how to make the most of them?', 'I’m not sure what to ask or how to prepare. Any advice?', 6, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'Office hours: how to make the most of them?');

INSERT INTO forum_posts (id, user_id, category, title, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), NULL, 'Academic', 'Study groups: finding the right people', 'What’s the best way to form or join effective study groups?', 13, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'active'
WHERE NOT EXISTS (SELECT 1 FROM forum_posts WHERE title = 'Study groups: finding the right people');

-- Sample comments for each post (2 comments per post)
INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'I recommend checking campus housing boards and local Facebook groups. Ask about commute time and safety.', 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'active'
FROM forum_posts p
WHERE p.title = 'Best areas to live near campus?'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Try to visit or video tour before signing. Some areas look cheaper but can be far from transit.', 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'active'
FROM forum_posts p
WHERE p.title = 'Best areas to live near campus?'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Grad student groups on Discord helped me. Ask for references and do a video call.', 4, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'active'
FROM forum_posts p
WHERE p.title = 'Tips for finding roommates as an international student'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Red flags: refusing to sign a lease, inconsistent rent details, or asking for cash only.', 2, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours', 'active'
FROM forum_posts p
WHERE p.title = 'Tips for finding roommates as an international student'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Check lease length, renewal terms, and who pays utilities. Take pictures during move-in.', 5, NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours', 'active'
FROM forum_posts p
WHERE p.title = 'Lease basics: what should I check before signing?'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Make sure you understand the early termination clause and any fees.', 1, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', 'active'
FROM forum_posts p
WHERE p.title = 'Lease basics: what should I check before signing?'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Chase and Bank of America were friendly for me with passport + proof of address.', 6, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'active'
FROM forum_posts p
WHERE p.title = 'Opening a bank account without SSN: what worked for you?'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Local credit unions can be easier and have lower fees.', 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'active'
FROM forum_posts p
WHERE p.title = 'Opening a bank account without SSN: what worked for you?'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'YNAB is great but paid. A simple Google Sheet is often enough.', 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'active'
FROM forum_posts p
WHERE p.title = 'Best budget apps for students?'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'I use Goodbudget because it works well on mobile and is easy to share.', 1, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours', 'active'
FROM forum_posts p
WHERE p.title = 'Best budget apps for students?'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'A secured credit card is a safe start. Pay in full every month.', 7, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'active'
FROM forum_posts p
WHERE p.title = 'How to build credit from scratch'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Keep utilization under 30% and set up autopay to avoid late fees.', 4, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'active'
FROM forum_posts p
WHERE p.title = 'How to build credit from scratch'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Pack a few adapters, a light jacket, and your favorite snacks.', 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', 'active'
FROM forum_posts p
WHERE p.title = 'What should I pack for my first semester?'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Bring originals of important docs; don’t rely on scans only.', 2, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', 'active'
FROM forum_posts p
WHERE p.title = 'What should I pack for my first semester?'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Orientation events were the best for meeting people quickly.', 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'active'
FROM forum_posts p
WHERE p.title = 'Making friends in the first month'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Join a club that meets weekly so you see the same people often.', 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'active'
FROM forum_posts p
WHERE p.title = 'Making friends in the first month'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Regular calls with family and a routine helped me a lot.', 2, NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours', 'active'
FROM forum_posts p
WHERE p.title = 'Best ways to manage homesickness'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Try campus counseling or support groups if it gets tough.', 1, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', 'active'
FROM forum_posts p
WHERE p.title = 'Best ways to manage homesickness'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Start with 12–15 credits and add a lighter elective if unsure.', 3, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'active'
FROM forum_posts p
WHERE p.title = 'How to choose classes in the first semester'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Check RateMyProfessors and ask seniors about workloads.', 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'active'
FROM forum_posts p
WHERE p.title = 'How to choose classes in the first semester'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Bring a short list of questions and try to attend early in the semester.', 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'active'
FROM forum_posts p
WHERE p.title = 'Office hours: how to make the most of them?'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Think of it like a 1:1 session—prepare one topic you struggled with.', 1, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '8 hours', 'active'
FROM forum_posts p
WHERE p.title = 'Office hours: how to make the most of them?'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Start a small group from class and meet weekly to review notes.', 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'active'
FROM forum_posts p
WHERE p.title = 'Study groups: finding the right people'
  AND NOT EXISTS (SELECT 1 FROM forum_comments c WHERE c.post_id = p.id);

INSERT INTO forum_comments (id, post_id, user_id, parent_id, content, upvotes, created_at, updated_at, status)
SELECT uuid_generate_v4(), p.id, NULL, NULL, 'Set goals for each session and keep the group small (3–5).', 2, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', 'active'
FROM forum_posts p
WHERE p.title = 'Study groups: finding the right people'
  AND (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) < 2;
