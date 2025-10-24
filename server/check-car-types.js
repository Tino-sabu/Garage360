const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

const localPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'garage360',
    user: 'postgres',
    password: 'Astra1512'
});

const supabase = createClient(
    'https://gddblbotzusdpeyedola.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIzMDEwNCwiZXhwIjoyMDc2ODA2MTA0fQ.BpvpIXZqulhxIJBz67laJ1TjgKiB3TPM58sIsBR2NGQ'
);

async function checkCarTypes() {
    console.log('\n🔍 Checking car_types table...\n');

    try {
        // Check local database
        console.log('=== LOCAL DATABASE ===');
        const localResult = await localPool.query("SELECT * FROM car_types ORDER BY id");
        console.log(`Found ${localResult.rows.length} car types in local database:`);
        localResult.rows.forEach(ct => {
            console.log(`  - ID: ${ct.id}, Brand: ${ct.brand}, Model: ${ct.model}, Year: ${ct.year}`);
        });

        // Check Supabase
        console.log('\n=== SUPABASE DATABASE ===');
        const { data: supabaseData, error } = await supabase
            .from('car_types')
            .select('*')
            .order('id');

        if (error) {
            if (error.code === '42P01' || error.message.includes('does not exist')) {
                console.log('❌ car_types table does NOT exist in Supabase!');
            } else {
                console.log('Error:', error.message);
            }
        } else {
            console.log(`Found ${supabaseData.length} car types in Supabase:`);
            supabaseData.forEach(ct => {
                console.log(`  - ID: ${ct.id}, Brand: ${ct.brand}, Model: ${ct.model}, Year: ${ct.year}`);
            });
        }

        await localPool.end();

    } catch (error) {
        console.error('Error:', error.message);
        await localPool.end();
    }
}

checkCarTypes();
