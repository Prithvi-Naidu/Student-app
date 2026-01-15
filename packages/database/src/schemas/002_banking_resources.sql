-- Banking Guidance Resources Schema

CREATE TABLE IF NOT EXISTS banking_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- Banking, Credit, Budgeting, etc.
  resource_type VARCHAR(50) NOT NULL, -- article, video, guide
  video_url TEXT, -- For YouTube embeds
  partner_bank_name VARCHAR(255),
  partner_referral_link TEXT,
  tags TEXT[],
  summary TEXT,
  source_urls TEXT[],
  last_verified DATE,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_banking_resources_category ON banking_resources(category);
CREATE INDEX IF NOT EXISTS idx_banking_resources_published ON banking_resources(published);
CREATE INDEX IF NOT EXISTS idx_banking_resources_slug ON banking_resources(slug);

CREATE TRIGGER update_banking_resources_updated_at BEFORE UPDATE ON banking_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

