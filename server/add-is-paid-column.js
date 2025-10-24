const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gddblbotzusdpeyedola.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzExNjk1MzIsImV4cCI6MjA0Njc0NTUzMn0.YX5odXkNCQRmo0vStB0ZPvYpGpZLVVLFbKMXYUwgcRA'
);

async function addIsPaidColumn() {
    console.log('📋 Please run the following SQL in Supabase SQL Editor:');
    console.log('='.repeat(80));
    console.log(`
-- Add is_paid column to service_requests table
ALTER TABLE service_requests 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN service_requests.is_paid IS 'Whether this job has been included in a salary payment';

-- Update existing completed jobs to be unpaid by default
UPDATE service_requests 
SET is_paid = FALSE 
WHERE is_paid IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_service_requests_is_paid ON service_requests(is_paid);
CREATE INDEX IF NOT EXISTS idx_service_requests_mechanic_paid ON service_requests(assigned_mechanic, is_paid);
    `);
    console.log('='.repeat(80));
    console.log('\n✅ After running the SQL, the salary reset will persist across page refreshes!');
}

addIsPaidColumn();
