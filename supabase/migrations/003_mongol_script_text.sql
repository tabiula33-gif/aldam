-- Optional product name and description in Mongol bichig (traditional script),
-- shown vertically in the Mongol bichig version of the site.
-- Run once in the Supabase SQL editor.
alter table products add column if not exists title_mong text;
alter table products add column if not exists description_mong text;
