-- Verification tokens table for NextAuth.js (required for email verification and magic links)
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMP NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON verification_tokens(expires);
