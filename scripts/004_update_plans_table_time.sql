-- Update plans table to use a single due_date timestamp instead of separate date and time fields
-- This aligns with how the application currently works

-- First, let's update existing records to combine date and time into due_date
UPDATE public.plans 
SET due_date = CASE 
  WHEN due_time IS NOT NULL THEN 
    (due_date::text || ' ' || due_time::text)::timestamp with time zone
  ELSE 
    (due_date::text || ' 23:59:59')::timestamp with time zone
END
WHERE due_date::text NOT LIKE '%:%';

-- Now alter the table structure
ALTER TABLE public.plans 
ALTER COLUMN due_date TYPE timestamp with time zone USING due_date::timestamp with time zone;

-- Remove the separate due_time column since we're storing everything in due_date
ALTER TABLE public.plans DROP COLUMN IF EXISTS due_time;

-- Add a comment to clarify the field usage
COMMENT ON COLUMN public.plans.due_date IS 'Complete due date and time for the plan';
