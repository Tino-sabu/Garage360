const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    'https://gddblbotzusdpeyedola.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIzMDEwNCwiZXhwIjoyMDc2ODA2MTA0fQ.BpvpIXZqulhxIJBz67laJ1TjgKiB3TPM58sIsBR2NGQ'
);

async function createCartypesTable() {
    console.log('🔧 Creating cartypes table in Supabase...\n');

    try {
        // Read the SQL file
        const sqlContent = fs.readFileSync(
            path.join(__dirname, 'database', 'create-cartypes-table.sql'),
            'utf8'
        );

        console.log('SQL to execute:');
        console.log(sqlContent);
        console.log('\n---\n');

        // Execute using Supabase REST API (rpc)
        // Note: For direct SQL execution, we'll need to use a different approach
        // Let's create the table using the client API instead

        console.log('⚠️  Note: Please run this SQL manually in Supabase SQL Editor:');
        console.log('   1. Go to https://supabase.com/dashboard/project/gddblbotzusdpeyedola/sql');
        console.log('   2. Copy the SQL from database/create-cartypes-table.sql');
        console.log('   3. Run it in the SQL editor\n');

        console.log('Or you can create it via API (attempting now)...\n');

        // Alternative: Create using direct table creation
        // This won't work with RLS policies, but let's try basic creation
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS public.cartypes (
                    cartype_id SERIAL PRIMARY KEY,
                    brand VARCHAR(100) NOT NULL,
                    model VARCHAR(100) NOT NULL,
                    body_type VARCHAR(50),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
            `
        });

        if (error) {
            console.log('❌ API method failed:', error.message);
            console.log('\n📝 Please create the table manually using the SQL above.');
        } else {
            console.log('✅ Table created successfully!');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

createCartypesTable();
