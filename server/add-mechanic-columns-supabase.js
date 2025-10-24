const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gddblbotzusdpeyedola.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIzMDEwNCwiZXhwIjoyMDc2ODA2MTA0fQ.cOZ8e4t4N9h3J_n9jW93oMYe-sEzxA7yETWB3dVyN6k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMechanicColumns() {
    console.log('Adding missing columns to mechanics table...\n');

    // SQL to add columns
    const sql = `
        -- Add hourly_rate column
        ALTER TABLE mechanics 
        ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2) DEFAULT 0.00;

        -- Add specializations array column
        ALTER TABLE mechanics 
        ADD COLUMN IF NOT EXISTS specializations TEXT[];

        -- Add availability_status column
        ALTER TABLE mechanics 
        ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) DEFAULT 'available';

        -- Migrate data: Convert available boolean to availability_status
        UPDATE mechanics 
        SET availability_status = CASE 
            WHEN available = true THEN 'available'
            WHEN available = false THEN 'offline'
            ELSE 'available'
        END
        WHERE availability_status = 'available';

        -- Migrate data: Convert specialization to specializations array
        UPDATE mechanics 
        SET specializations = ARRAY[specialization]
        WHERE specialization IS NOT NULL 
        AND (specializations IS NULL OR array_length(specializations, 1) IS NULL);

        -- Set default hourly_rate based on experience
        UPDATE mechanics 
        SET hourly_rate = CASE 
            WHEN experience_years >= 10 THEN 500.00
            WHEN experience_years >= 5 THEN 350.00
            WHEN experience_years >= 2 THEN 250.00
            ELSE 150.00
        END
        WHERE hourly_rate = 0.00 OR hourly_rate IS NULL;
    `;

    try {
        // Note: Supabase client doesn't support raw SQL execution directly
        // We need to use the REST API or run this in SQL Editor
        console.log('⚠️  Please run the following SQL in Supabase SQL Editor:\n');
        console.log(sql);
        console.log('\n📝 Instructions:');
        console.log('1. Go to https://supabase.com/dashboard/project/gddblbotzusdpeyedola/sql/new');
        console.log('2. Copy the SQL above');
        console.log('3. Paste it into the SQL Editor');
        console.log('4. Click "Run" to execute');
        console.log('\n✅ After running, mechanics will have:');
        console.log('   - hourly_rate (decimal)');
        console.log('   - specializations (text array)');
        console.log('   - availability_status (varchar)');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

addMechanicColumns();
