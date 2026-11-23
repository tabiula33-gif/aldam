-- Adds an optional "was" price so products can show a sale (e.g. 30,000₮ → 21,000₮).
-- Run once in the Supabase SQL editor if your database was created before this change.
alter table products add column if not exists compare_at_mnt integer;
