const { Client } = require('pg');

const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.gddblbotzusdpeyedola',
    password: 'Garage360@supabase',
    ssl: { rejectUnauthorized: false }
});

async function addMissingColumns() {
    try {
        console.log('🔧 Connecting to Supabase...\n');
        await client.connect();

        console.log('📝 Adding missing columns to vehicles table...\n');

        // Add vin column
        await client.query(`
            ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS vin VARCHAR(50);
        `);
        console.log('✅ Added vin column');

        // Add engine_number column
        await client.query(`
            ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS engine_number VARCHAR(50);
        `);
        console.log('✅ Added engine_number column');

        // Add chassis_number column
        await client.query(`
            ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(50);
        `);
        console.log('✅ Added chassis_number column');

        // Add last_oil_change column
        await client.query(`
            ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS last_oil_change DATE;
        `);
        console.log('✅ Added last_oil_change column');

        console.log('\n🎉 All columns added successfully!\n');

        // Verify the changes
        const result = await client.query('SELECT * FROM vehicles LIMIT 1');
        if (result.rows.length > 0) {
            console.log('📋 Updated columns:', Object.keys(result.rows[0]).join(', '));
        } else {
            console.log('📋 Table structure updated (no data to verify)');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

addMissingColumns();
