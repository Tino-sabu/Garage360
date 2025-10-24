const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gddblbotzusdpeyedola.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIzMDEwNCwiZXhwIjoyMDc2ODA2MTA0fQ.BpvpIXZqulhxIJBz67laJ1TjgKiB3TPM58sIsBR2NGQ'
);

async function addMissingColumns() {
    try {
        console.log('🔧 Adding missing columns to vehicles table...\n');

        // Execute SQL to add missing columns
        const { data, error } = await supabase.rpc('exec_sql', {
            query: `
                -- Add vin column (nullable)
                ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vin VARCHAR(50);
                
                -- Add engine_number column (nullable)
                ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_number VARCHAR(50);
                
                -- Add chassis_number column (nullable)
                ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(50);
                
                -- Add last_oil_change column (nullable)
                ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS last_oil_change DATE;
                
                -- Rename mileage to km_driven for consistency (if needed)
                -- Note: We'll keep mileage as it is and use it for km_driven
            `
        });

        if (error) {
            // If exec_sql doesn't exist, we need to use raw SQL via pg
            console.log('Note: exec_sql RPC not available. Using direct approach...\n');

            // We'll need to run these via Supabase SQL Editor or use node-postgres
            console.log('Please run the following SQL in Supabase SQL Editor:\n');
            console.log(`
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vin VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_number VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS last_oil_change DATE;
            `);
            console.log('\nOr use the Supabase dashboard: Database -> SQL Editor -> New Query');
            console.log('Then paste the SQL above and run it.\n');

            return;
        }

        console.log('✅ Columns added successfully!\n');

        // Verify the changes
        const { data: sample } = await supabase.from('vehicles').select('*').limit(1);
        if (sample && sample.length > 0) {
            console.log('📋 Updated columns:', Object.keys(sample[0]).join(', '));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

addMissingColumns();
