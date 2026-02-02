-- Kadur - Israeli Pickup Football Game Organizer
-- Supabase Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- TABLES
-- ============================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  city TEXT DEFAULT 'פתח תקווה',
  position TEXT, -- שוער, מגן, קשר, חלוץ
  age INTEGER CHECK (age >= 10 AND age <= 100),
  profile_photo_url TEXT,
  push_token TEXT,
  games_played INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  format TEXT NOT NULL DEFAULT '7x7', -- 5x5, 7x7, 11x11
  location_text TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  is_public BOOLEAN DEFAULT TRUE,
  max_players INTEGER DEFAULT 14 CHECK (max_players >= 2 AND max_players <= 50),
  current_players INTEGER DEFAULT 1,
  notes TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game participants (join table)
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_approved BOOLEAN DEFAULT TRUE, -- FALSE for private games until approved
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'pending', 'declined', 'left')),
  UNIQUE(game_id, user_id)
);

-- Game messages (chat)
CREATE TABLE game_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table (for tracking sent notifications)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'game_nearby', 'join_request', 'game_full', 'game_cancelled', 'message'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_games_date ON games(date);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_organizer ON games(organizer_id);
CREATE INDEX idx_games_location ON games(location_lat, location_lng);
CREATE INDEX idx_game_participants_game ON game_participants(game_id);
CREATE INDEX idx_game_participants_user ON game_participants(user_id);
CREATE INDEX idx_game_messages_game ON game_messages(game_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update current_players count
CREATE OR REPLACE FUNCTION update_game_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_approved = TRUE AND NEW.status = 'joined' THEN
    UPDATE games
    SET current_players = current_players + 1,
        status = CASE
          WHEN current_players + 1 >= max_players THEN 'full'
          ELSE status
        END,
        updated_at = NOW()
    WHERE id = NEW.game_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Player approved
    IF OLD.is_approved = FALSE AND NEW.is_approved = TRUE AND NEW.status = 'joined' THEN
      UPDATE games
      SET current_players = current_players + 1,
          status = CASE
            WHEN current_players + 1 >= max_players THEN 'full'
            ELSE status
          END,
          updated_at = NOW()
      WHERE id = NEW.game_id;
    -- Player left or declined
    ELSIF OLD.status = 'joined' AND NEW.status IN ('left', 'declined') AND OLD.is_approved = TRUE THEN
      UPDATE games
      SET current_players = GREATEST(current_players - 1, 1),
          status = CASE
            WHEN status = 'full' THEN 'open'
            ELSE status
          END,
          updated_at = NOW()
      WHERE id = NEW.game_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.is_approved = TRUE AND OLD.status = 'joined' THEN
    UPDATE games
    SET current_players = GREATEST(current_players - 1, 1),
        status = CASE
          WHEN status = 'full' THEN 'open'
          ELSE status
        END,
        updated_at = NOW()
    WHERE id = OLD.game_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate distance between two points (in km)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lng1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lng2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  R DOUBLE PRECISION := 6371; -- Earth's radius in km
  dlat DOUBLE PRECISION;
  dlng DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dlat := RADIANS(lat2 - lat1);
  dlng := RADIANS(lng2 - lng1);
  a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlng/2) * SIN(dlng/2);
  c := 2 * ATAN2(SQRT(a), SQRT(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby games
CREATE OR REPLACE FUNCTION get_nearby_games(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10,
  filter_city TEXT DEFAULT NULL,
  filter_format TEXT DEFAULT NULL,
  filter_date DATE DEFAULT NULL,
  filter_public_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  organizer_id UUID,
  title TEXT,
  date DATE,
  time TIME,
  format TEXT,
  location_text TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  is_public BOOLEAN,
  max_players INTEGER,
  current_players INTEGER,
  notes TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION,
  organizer_name TEXT,
  organizer_photo TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.organizer_id,
    g.title,
    g.date,
    g.time,
    g.format,
    g.location_text,
    g.location_lat,
    g.location_lng,
    g.is_public,
    g.max_players,
    g.current_players,
    g.notes,
    g.status,
    g.created_at,
    calculate_distance(user_lat, user_lng, g.location_lat, g.location_lng) AS distance_km,
    u.name AS organizer_name,
    u.profile_photo_url AS organizer_photo
  FROM games g
  JOIN users u ON g.organizer_id = u.id
  WHERE
    g.status IN ('open', 'full')
    AND g.date >= CURRENT_DATE
    AND (g.location_lat IS NULL OR calculate_distance(user_lat, user_lng, g.location_lat, g.location_lng) <= radius_km)
    AND (filter_city IS NULL OR g.location_text ILIKE '%' || filter_city || '%')
    AND (filter_format IS NULL OR g.format = filter_format)
    AND (filter_date IS NULL OR g.date = filter_date)
    AND (filter_public_only = FALSE OR g.is_public = TRUE)
  ORDER BY g.date ASC, g.time ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER trigger_update_player_count
AFTER INSERT OR UPDATE OR DELETE ON game_participants
FOR EACH ROW EXECUTE FUNCTION update_game_player_count();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_games_updated_at
BEFORE UPDATE ON games
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Games policies
CREATE POLICY "Anyone can view public games"
  ON games FOR SELECT
  USING (
    is_public = TRUE
    OR organizer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM game_participants
      WHERE game_id = games.id
      AND user_id = auth.uid()
      AND is_approved = TRUE
    )
  );

CREATE POLICY "Authenticated users can create games"
  ON games FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own games"
  ON games FOR UPDATE
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete own games"
  ON games FOR DELETE
  USING (auth.uid() = organizer_id);

-- Game participants policies
CREATE POLICY "Users can view participants of accessible games"
  ON game_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games
      WHERE id = game_participants.game_id
      AND (
        is_public = TRUE
        OR organizer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM game_participants gp
          WHERE gp.game_id = games.id
          AND gp.user_id = auth.uid()
          AND gp.is_approved = TRUE
        )
      )
    )
  );

CREATE POLICY "Users can join games"
  ON game_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON game_participants FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM games
      WHERE id = game_participants.game_id
      AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can leave games"
  ON game_participants FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM games
      WHERE id = game_participants.game_id
      AND organizer_id = auth.uid()
    )
  );

-- Game messages policies
CREATE POLICY "Participants can view game messages"
  ON game_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM game_participants
      WHERE game_id = game_messages.game_id
      AND user_id = auth.uid()
      AND is_approved = TRUE
    )
    OR EXISTS (
      SELECT 1 FROM games
      WHERE id = game_messages.game_id
      AND organizer_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON game_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      EXISTS (
        SELECT 1 FROM game_participants
        WHERE game_id = game_messages.game_id
        AND user_id = auth.uid()
        AND is_approved = TRUE
      )
      OR EXISTS (
        SELECT 1 FROM games
        WHERE id = game_messages.game_id
        AND organizer_id = auth.uid()
      )
    )
  );

-- Admin users policies
CREATE POLICY "Only admins can view admin table"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage admins"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE game_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
