-- Add referred_by column to businesses table to track which affiliate brought them in
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS referred_by text;
