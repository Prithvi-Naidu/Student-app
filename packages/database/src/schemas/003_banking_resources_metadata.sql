-- Banking resources: metadata for sources + SEO

ALTER TABLE banking_resources
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS source_urls TEXT[],
  ADD COLUMN IF NOT EXISTS last_verified DATE;

CREATE INDEX IF NOT EXISTS idx_banking_resources_last_verified ON banking_resources(last_verified);


