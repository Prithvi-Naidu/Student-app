-- Add cloud storage and DigiLocker fields to documents table
-- Migration: 007_documents_cloud_storage.sql

-- Add storage type enum (if not exists)
DO $$ BEGIN
    CREATE TYPE storage_type_enum AS ENUM ('local', 'cloud_r2', 'digilocker');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add cloud storage fields
ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS storage_type storage_type_enum DEFAULT 'local',
    ADD COLUMN IF NOT EXISTS cloud_provider VARCHAR(50),
    ADD COLUMN IF NOT EXISTS cloud_url TEXT,
    ADD COLUMN IF NOT EXISTS cloud_key TEXT,
    ADD COLUMN IF NOT EXISTS encryption_key_hash TEXT,
    ADD COLUMN IF NOT EXISTS encryption_iv TEXT,
    ADD COLUMN IF NOT EXISTS digilocker_linked BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS digilocker_document_id TEXT,
    ADD COLUMN IF NOT EXISTS country_code VARCHAR(10);

-- Update existing records to have storage_type = 'local'
UPDATE documents SET storage_type = 'local' WHERE storage_type IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_storage_type ON documents(storage_type);
CREATE INDEX IF NOT EXISTS idx_documents_cloud_key ON documents(cloud_key) WHERE cloud_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_country_code ON documents(country_code) WHERE country_code IS NOT NULL;
