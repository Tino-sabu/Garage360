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

async function migrateMissingData() {
    console.log('🚀 Migrating Missing Data to Supabase...\n');

    try {
        // 1. Migrate missing customer (Varun)
        console.log('👥 Migrating missing customers...');
        const { data: existingCustomers } = await supabase.from('customers').select('email, phone');
        const existingEmails = new Set((existingCustomers || []).map(c => c.email.toLowerCase()));
        const existingPhones = new Set((existingCustomers || []).map(c => c.phone));

        const customersResult = await localPool.query('SELECT * FROM customers ORDER BY customer_id');
        const missingCustomers = customersResult.rows.filter(c =>
            !existingEmails.has(c.email.toLowerCase()) && !existingPhones.has(c.phone)
        );

        if (missingCustomers.length > 0) {
            const { error } = await supabase.from('customers').insert(
                missingCustomers.map(row => ({
                    name: row.name,
                    email: row.email,
                    phone: row.phone,
                    password: row.password,
                    address: row.address,
                    email_verified: row.email_verified || false,
                    phone_verified: row.phone_verified || false,
                    created_at: row.created_at,
                    last_login: row.last_login
                }))
            );
            if (error) {
                console.log('  ⚠️  Error:', error.message);
            } else {
                console.log(`  ✅ Migrated ${missingCustomers.length} missing customers`);
            }
        } else {
            console.log('  ℹ️  No missing customers (all exist or have duplicate phone numbers)');
        }

        // 2. Migrate missing managers
        console.log('\n👔 Migrating missing managers...');
        const { data: existingManagers } = await supabase.from('managers').select('email');
        const existingManagerEmails = new Set((existingManagers || []).map(m => m.email.toLowerCase()));

        const managersResult = await localPool.query('SELECT * FROM managers ORDER BY manager_id');
        const missingManagers = managersResult.rows.filter(m => !existingManagerEmails.has(m.email.toLowerCase()));

        if (missingManagers.length > 0) {
            const { error } = await supabase.from('managers').insert(
                missingManagers.map(row => ({
                    name: row.name,
                    email: row.email,
                    phone: row.phone,
                    password: row.password,
                    created_at: row.created_at,
                    last_login: row.last_login
                }))
            );
            if (error) {
                console.log('  ⚠️  Error:', error.message);
            } else {
                console.log(`  ✅ Migrated ${missingManagers.length} missing managers`);
            }
        } else {
            console.log('  ℹ️  No missing managers');
        }

        // 3. Migrate cartypes (all 30 rows)
        console.log('\n🚗 Migrating car types...');
        const cartypesResult = await localPool.query('SELECT * FROM cartypes ORDER BY cartype_id');

        if (cartypesResult.rows.length > 0) {
            console.log(`  Found ${cartypesResult.rows.length} car types in local database`);

            const { error } = await supabase.from('cartypes').insert(
                cartypesResult.rows.map(row => ({
                    brand: row.brand,
                    model: row.model,
                    body_type: row.body_type,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                }))
            );

            if (error) {
                console.log('  ⚠️  Error:', error.message);
                console.log('  Details:', error.details);
            } else {
                console.log(`  ✅ Migrated ${cartypesResult.rows.length} car types`);
            }
        } else {
            console.log('  ℹ️  No car types to migrate');
        }

        console.log('\n✨ Migration completed!\n');

        await localPool.end();

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Details:', error);
        await localPool.end();
    }
}

migrateMissingData();
