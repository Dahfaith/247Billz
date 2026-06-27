-- Add short_token columns for compact public links

ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS short_token TEXT UNIQUE;

ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS short_token TEXT UNIQUE;

-- Create indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_invoices_short_token ON invoices(short_token);
CREATE INDEX IF NOT EXISTS idx_quotations_short_token ON quotations(short_token);
