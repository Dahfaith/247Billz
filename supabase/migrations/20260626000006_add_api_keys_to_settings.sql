-- Add API key columns to platform_settings table
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS flutterwave_public_key text;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS flutterwave_secret_key text;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS paystack_public_key text;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS paystack_secret_key text;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS resend_api_key text;
