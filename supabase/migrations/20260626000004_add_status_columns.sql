-- Add status column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add status column to businesses
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
