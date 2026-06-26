-- Add Flutterwave Subaccount fields to businesses table
ALTER TABLE businesses 
ADD COLUMN flutterwave_subaccount_id TEXT,
ADD COLUMN bank_name TEXT,
ADD COLUMN account_number TEXT;
