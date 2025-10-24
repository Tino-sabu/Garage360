-- ============================================
-- ADD MISSING COLUMNS TO MECHANICS TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Add hourly_rate column for mechanic pay rate
ALTER TABLE mechanics 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2) DEFAULT 0.00;

-- Add specializations array column (replacing singular specialization)
ALTER TABLE mechanics 
ADD COLUMN IF NOT EXISTS specializations TEXT[];

-- Add availability_status column (available/busy/offline)
ALTER TABLE mechanics 
ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) DEFAULT 'available';

-- ============================================
-- MIGRATE DATA FROM OLD COLUMNS TO NEW ONES
-- ============================================

-- Convert available (boolean) to availability_status (string)
UPDATE mechanics 
SET availability_status = CASE 
    WHEN available = true THEN 'available'
    WHEN available = false THEN 'offline'
    ELSE 'available'
END
WHERE availability_status = 'available';

-- Convert specialization (text) to specializations (array)
UPDATE mechanics 
SET specializations = ARRAY[specialization]
WHERE specialization IS NOT NULL 
AND (specializations IS NULL OR array_length(specializations, 1) IS NULL);

-- Set default hourly_rate based on experience years
UPDATE mechanics 
SET hourly_rate = CASE 
    WHEN experience_years >= 10 THEN 500.00
    WHEN experience_years >= 5 THEN 350.00
    WHEN experience_years >= 2 THEN 250.00
    ELSE 150.00
END
WHERE hourly_rate = 0.00 OR hourly_rate IS NULL;

-- ============================================
-- VERIFY CHANGES
-- ============================================

-- Check the updated schema
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'mechanics' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check sample data
SELECT 
    mechanic_id, 
    name, 
    email, 
    experience_years, 
    hourly_rate, 
    specialization, 
    specializations, 
    available, 
    availability_status
FROM mechanics 
LIMIT 5;
