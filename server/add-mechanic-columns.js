const { Client } = require('pg');

const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.gddblbotzusdpeyedola',
    password: 'Garage360@supabase',
    ssl: { rejectUnauthorized: false }
});

async function addMechanicColumns() {
    try {
        await client.connect();
        console.log('Connected to Supabase PostgreSQL');

        // Check current columns
        console.log('\n=== Checking current mechanics table schema ===');
        const currentColumns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'mechanics' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        `);

        console.log('Current columns:');
        currentColumns.rows.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });

        // Add missing columns
        console.log('\n=== Adding missing columns ===');

        const alterations = [
            {
                name: 'hourly_rate',
                sql: `ALTER TABLE mechanics ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2) DEFAULT 0.00`,
                description: 'Add hourly_rate column for mechanic pay rate'
            },
            {
                name: 'specializations',
                sql: `ALTER TABLE mechanics ADD COLUMN IF NOT EXISTS specializations TEXT[]`,
                description: 'Add specializations array column (replacing singular specialization)'
            },
            {
                name: 'availability_status',
                sql: `ALTER TABLE mechanics ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) DEFAULT 'available'`,
                description: 'Add availability_status column (available/busy/offline)'
            }
        ];

        for (const alteration of alterations) {
            try {
                console.log(`\n${alteration.description}...`);
                await client.query(alteration.sql);
                console.log(`✅ Successfully added ${alteration.name}`);
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log(`ℹ️  Column ${alteration.name} already exists`);
                } else {
                    console.log(`❌ Error adding ${alteration.name}:`, error.message);
                }
            }
        }

        // Migrate data from old columns to new ones
        console.log('\n=== Migrating data ===');

        // Convert available (boolean) to availability_status (string)
        console.log('Converting available boolean to availability_status...');
        await client.query(`
            UPDATE mechanics 
            SET availability_status = CASE 
                WHEN available = true THEN 'available'
                WHEN available = false THEN 'offline'
                ELSE 'available'
            END
            WHERE availability_status IS NULL OR availability_status = 'available'
        `);
        console.log('✅ Converted available to availability_status');

        // Convert specialization (text) to specializations (array)
        console.log('Converting specialization text to specializations array...');
        await client.query(`
            UPDATE mechanics 
            SET specializations = ARRAY[specialization]
            WHERE specialization IS NOT NULL 
            AND (specializations IS NULL OR array_length(specializations, 1) IS NULL)
        `);
        console.log('✅ Converted specialization to specializations array');

        // Set default hourly_rate based on experience
        console.log('Setting default hourly_rate based on experience...');
        await client.query(`
            UPDATE mechanics 
            SET hourly_rate = CASE 
                WHEN experience_years >= 10 THEN 500.00
                WHEN experience_years >= 5 THEN 350.00
                WHEN experience_years >= 2 THEN 250.00
                ELSE 150.00
            END
            WHERE hourly_rate = 0.00 OR hourly_rate IS NULL
        `);
        console.log('✅ Set default hourly_rate');

        // Show updated schema
        console.log('\n=== Updated mechanics table schema ===');
        const updatedColumns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'mechanics' 
            AND table_schema = 'public'
            ORDER BY ordinal_position
        `);

        console.log('Updated columns:');
        updatedColumns.rows.forEach(col => {
            console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
        });

        // Show sample data
        console.log('\n=== Sample mechanic data ===');
        const sampleData = await client.query(`
            SELECT mechanic_id, name, email, experience_years, hourly_rate, 
                   specialization, specializations, available, availability_status
            FROM mechanics 
            LIMIT 3
        `);

        sampleData.rows.forEach(mechanic => {
            console.log(`\n${mechanic.name}:`);
            console.log(`  Email: ${mechanic.email}`);
            console.log(`  Experience: ${mechanic.experience_years} years`);
            console.log(`  Hourly Rate: ₹${mechanic.hourly_rate}`);
            console.log(`  Old Specialization: ${mechanic.specialization || 'None'}`);
            console.log(`  New Specializations: ${mechanic.specializations ? `[${mechanic.specializations.join(', ')}]` : '[]'}`);
            console.log(`  Old Available: ${mechanic.available}`);
            console.log(`  New Status: ${mechanic.availability_status}`);
        });

        console.log('\n✅ All columns added and data migrated successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
        console.log('\nDatabase connection closed.');
    }
}

addMechanicColumns();
