-- Kadur - Test Data Seed
-- Run this after schema.sql to populate test data

-- Note: In production, users are created via Supabase Auth
-- These are sample users for development/testing

-- Sample Users (you'll need to create auth.users first or use service role)
-- For testing, we'll use placeholder UUIDs

DO $$
DECLARE
  user1_id UUID := '11111111-1111-1111-1111-111111111111';
  user2_id UUID := '22222222-2222-2222-2222-222222222222';
  user3_id UUID := '33333333-3333-3333-3333-333333333333';
  user4_id UUID := '44444444-4444-4444-4444-444444444444';
  user5_id UUID := '55555555-5555-5555-5555-555555555555';
  game1_id UUID;
  game2_id UUID;
  game3_id UUID;
  game4_id UUID;
  game5_id UUID;
  game6_id UUID;
  game7_id UUID;
  game8_id UUID;
  game9_id UUID;
  game10_id UUID;
BEGIN

-- Insert sample users
INSERT INTO users (id, name, phone, city, position, age, profile_photo_url, games_played)
VALUES
  (user1_id, 'יוסי כהן', '050-1234567', 'פתח תקווה', 'קשר', 28, NULL, 45),
  (user2_id, 'אבי לוי', '052-9876543', 'תל אביב', 'חלוץ', 32, NULL, 67),
  (user3_id, 'דני ישראלי', '054-5555555', 'ירושלים', 'מגן', 25, NULL, 23),
  (user4_id, 'מיכאל גולן', '053-1111111', 'רמת גן', 'שוער', 30, NULL, 89),
  (user5_id, 'רועי אברהם', '058-2222222', 'בני ברק', 'קשר', 27, NULL, 34)
ON CONFLICT (id) DO NOTHING;

-- Insert sample games
-- Game 1: Public 7x7 in Petah Tikva
INSERT INTO games (organizer_id, title, game_date, start_time, format, location_text, location_lat, location_lng, is_public, max_players, current_players, notes, status)
VALUES (user1_id, '7x7 כדורגל ערב פתח תקווה', CURRENT_DATE + INTERVAL '1 day', '18:00', '7x7', 'מגרש ספורט פארק פתח תקווה', 32.0853, 34.8878, TRUE, 14, 5, 'מגרש דשא סינטטי, להביא מים', 'open')
RETURNING id INTO game1_id;

-- Game 2: Public 11x11 in Tel Aviv
INSERT INTO games (organizer_id, title, game_date, start_time, format, location_text, location_lat, location_lng, is_public, max_players, current_players, notes, status)
VALUES (user2_id, '11x11 מלא בספורטק', CURRENT_DATE + INTERVAL '2 days', '20:00', '11x11', 'הספורטק תל אביב', 32.0971, 34.7814, TRUE, 22, 18, 'משחק רציני, רמה גבוהה', 'open')
RETURNING id INTO game2_id;

-- Game 3: Private 5x5 in Jerusalem
INSERT INTO games (organizer_id, title, game_date, start_time, format, location_text, location_lat, location_lng, is_public, max_players, current_players, notes, status)
VALUES (user3_id, '5x5 חברים ירושלים', CURRENT_DATE + INTERVAL '3 days', '17:00', '5x5', 'מגרש גן סאקר', 31.7767, 35.2107, FALSE, 10, 4, 'רק חברים קרובים, צריך אישור', 'open')
RETURNING id INTO game3_id;

-- Game 4: Full game in Ramat Gan
INSERT INTO games (organizer_id, title, game_date, start_time, format, location_text, location_lat, location_lng, is_public, max_players, current_players, notes, status)
VALUES (user4_id, '7x7 שישי בוקר', CURRENT_DATE + INTERVAL '4 days', '09:00', '7x7', 'פארק הלאומי רמת גן', 32.0731, 34.8142, TRUE, 14, 14, 'משחק קבוע כל שישי', 'full')
RETURNING id INTO game4_id;

-- Game 5: Evening game in Bnei Brak
INSERT INTO games (organizer_id, title, game_date, start_time, format, location_text, location_lat, location_lng, is_public, max_players, current_players, notes, status)
VALUES (user5_id, 'כדורגל ערב בני ברק', CURRENT_DATE + INTERVAL '1 day', '21:00', '7x7', 'מגרש העירייה בני ברק', 32.0814, 34.8331, TRUE, 14, 8, 'יש תאורה במגרש', 'open')
RETURNING id INTO game5_id;

-- Game 6: Weekend morning in Petah Tikva
INSERT INTO games (organizer_id, title, game_date, start_time, format, location_text, location_lat, location_lng, is_public, max_players, current_players, notes, status)
VALUES (user1_id, 'בוקר שבת 11x11', CURRENT_DATE + INTERVAL '5 days', '08:00', '11x11', 'מגרש אצטדיון פתח תקווה', 32.0879, 34.8865, TRUE, 22, 12, 'משחק שבועי קבוע, כולם מוזמנים', 'open')
RETURNING id INTO game6_id;

-- Game 7: Evening in Givatayim
INSERT INTO games (organizer_id, title, game_date, start_time, format, location_text, location_lat, location_lng, is_public, max_players, current_players, notes, status)
VALUES (user2_id, '5x5 מהיר גבעתיים', CURRENT_DATE + INTERVAL '2 days', '19:30', '5x5', 'מתחם הספורט גבעתיים', 32.0695, 34.8104, TRUE, 10, 6, 'משחק מהיר, שעה וחצי', 'open')
RETURNING id INTO game7_id;

-- Game 8: Private game in Jerusalem
INSERT INTO games (organizer_id, title, game_date, start_time, format, location_text, location_lat, location_lng, is_public, max_players, current_players, notes, status)
VALUES (user3_id, 'משחק סגור מלחה', CURRENT_DATE + INTERVAL '6 days', '16:00', '7x7', 'מגרש טדי מלחה', 31.7515, 35.1882, FALSE, 14, 7, 'קבוצה סגורה', 'open')
RETURNING id INTO game8_id;

-- Game 9: Morning in Holon
INSERT INTO games (organizer_id, title, game_date, start_time, format, location_text, location_lat, location_lng, is_public, max_players, current_players, notes, status)
VALUES (user4_id, 'בוקר חולון 7x7', CURRENT_DATE + INTERVAL '3 days', '07:00', '7x7', 'פארק פרס חולון', 32.0167, 34.7694, TRUE, 14, 3, 'לפני העבודה, משחק קצר', 'open')
RETURNING id INTO game9_id;

-- Game 10: Evening in Herzliya
INSERT INTO games (organizer_id, title, game_date, start_time, format, location_text, location_lat, location_lng, is_public, max_players, current_players, notes, status)
VALUES (user5_id, 'ערב הרצליה חוף', CURRENT_DATE + INTERVAL '4 days', '18:30', '5x5', 'חוף הרצליה מגרש חול', 32.1658, 34.7983, TRUE, 10, 5, 'כדורגל חופים!', 'open')
RETURNING id INTO game10_id;

-- Add participants to games
-- Game 1 participants
INSERT INTO game_participants (game_id, user_id, is_approved, status) VALUES
  (game1_id, user2_id, TRUE, 'joined'),
  (game1_id, user3_id, TRUE, 'joined'),
  (game1_id, user4_id, TRUE, 'joined'),
  (game1_id, user5_id, TRUE, 'joined');

-- Game 2 participants (many players)
INSERT INTO game_participants (game_id, user_id, is_approved, status) VALUES
  (game2_id, user1_id, TRUE, 'joined'),
  (game2_id, user3_id, TRUE, 'joined'),
  (game2_id, user4_id, TRUE, 'joined'),
  (game2_id, user5_id, TRUE, 'joined');

-- Game 3 participants (private game - some pending)
INSERT INTO game_participants (game_id, user_id, is_approved, status) VALUES
  (game3_id, user1_id, TRUE, 'joined'),
  (game3_id, user2_id, FALSE, 'pending'),
  (game3_id, user4_id, TRUE, 'joined');

-- Game 5 participants
INSERT INTO game_participants (game_id, user_id, is_approved, status) VALUES
  (game5_id, user1_id, TRUE, 'joined'),
  (game5_id, user2_id, TRUE, 'joined'),
  (game5_id, user3_id, TRUE, 'joined');

-- Add sample chat messages
INSERT INTO game_messages (game_id, user_id, message) VALUES
  (game1_id, user1_id, 'היי לכולם! מחכה לראות אתכם מחר'),
  (game1_id, user2_id, 'אני מגיע עם חבר, אפשר?'),
  (game1_id, user1_id, 'בטח, יש מקום'),
  (game1_id, user3_id, 'מה עם ציוד? צריך להביא משהו?'),
  (game1_id, user1_id, 'רק נעליים ומים, יש לי כדור');

INSERT INTO game_messages (game_id, user_id, message) VALUES
  (game2_id, user2_id, 'משחק רציני, בואו מוכנים'),
  (game2_id, user1_id, 'אין בעיה, אני שם'),
  (game2_id, user4_id, 'מי משחק שוער?');

-- Add sample notifications
INSERT INTO notifications (user_id, game_id, type, title, body) VALUES
  (user2_id, game1_id, 'game_nearby', 'משחק חדש באזורך', 'יוסי פתח משחק 7x7 בפתח תקווה'),
  (user3_id, game3_id, 'join_request', 'בקשת הצטרפות', 'אבי רוצה להצטרף למשחק שלך'),
  (user1_id, game2_id, 'message', 'הודעה חדשה', 'אבי: משחק רציני, בואו מוכנים');

END $$;

-- Update current_players counts based on participants
UPDATE games g
SET current_players = 1 + (
  SELECT COUNT(*)
  FROM game_participants gp
  WHERE gp.game_id = g.id
  AND gp.is_approved = TRUE
  AND gp.status = 'joined'
);
