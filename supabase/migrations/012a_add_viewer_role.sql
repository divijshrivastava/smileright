-- ========================================
-- Step 1: Add 'viewer' to the app_role enum
-- ========================================
-- This must be committed in a separate transaction before
-- the new value can be referenced in policies or defaults.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';
