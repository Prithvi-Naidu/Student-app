-- Roommate matching tables

CREATE TABLE IF NOT EXISTS roommate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  school VARCHAR(255),
  program VARCHAR(255),
  graduation_year VARCHAR(10),
  bio TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  move_in_date DATE,
  lease_length_months INTEGER,
  preferred_locations TEXT[],
  room_type VARCHAR(50), -- private/shared
  gender_preference VARCHAR(50),
  smoking_preference VARCHAR(20),
  pets_preference VARCHAR(20),
  sleep_schedule VARCHAR(20),
  noise_tolerance VARCHAR(20),
  cleanliness_level VARCHAR(20),
  guests_preference VARCHAR(20),
  cooking_frequency VARCHAR(20),
  work_from_home VARCHAR(20),
  social_style VARCHAR(20),
  compatibility_tags TEXT[],
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  discoverable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roommate_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending/accepted/rejected
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (requester_user_id, target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_roommate_profiles_discoverable ON roommate_profiles(discoverable);
CREATE INDEX IF NOT EXISTS idx_roommate_profiles_budget ON roommate_profiles(budget_min, budget_max);
CREATE INDEX IF NOT EXISTS idx_roommate_profiles_move_in ON roommate_profiles(move_in_date);
CREATE INDEX IF NOT EXISTS idx_roommate_profiles_locations ON roommate_profiles USING GIN(preferred_locations);
CREATE INDEX IF NOT EXISTS idx_roommate_requests_target ON roommate_requests(target_user_id);

CREATE TRIGGER update_roommate_profiles_updated_at BEFORE UPDATE ON roommate_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roommate_requests_updated_at BEFORE UPDATE ON roommate_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



