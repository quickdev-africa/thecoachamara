-- Migration: add optional paystack_reference column to payments
-- Run this against your production/staging DB after rotating secrets and taking a backup.

ALTER TABLE IF EXISTS payments
ADD COLUMN IF NOT EXISTS paystack_reference TEXT;

-- Optional: add an index for faster lookups by paystack_reference
CREATE INDEX IF NOT EXISTS idx_payments_paystack_reference ON payments (paystack_reference);
