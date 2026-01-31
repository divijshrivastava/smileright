-- ========================================
-- Upgrade snehakedia2@gmail.com to Admin Role
-- ========================================

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'snehakedia2@gmail.com';
