-- Add admin_reply column to support_tickets

ALTER TABLE support_tickets
ADD COLUMN admin_reply TEXT;
