-- Migration: Add email verification columns to users table
-- Date: 2025-11-03
-- Purpose: Enable email verification for new user registrations

-- Add email verification columns
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP;

-- Create index on verification token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token
ON users(email_verification_token)
WHERE email_verification_token IS NOT NULL;

-- Update existing users to have verified emails (grandfather clause)
UPDATE users
SET is_email_verified = TRUE
WHERE is_email_verified IS NULL OR is_email_verified = FALSE;

-- Add comment to table
COMMENT ON COLUMN users.is_email_verified IS 'Whether user has verified their email address';
COMMENT ON COLUMN users.email_verification_token IS 'Token sent to user for email verification';
COMMENT ON COLUMN users.verification_token_expires_at IS 'Expiration timestamp for verification token (24 hours)';
