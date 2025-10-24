const { Client } = require('pg');

const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.gddblbotzusdpeyedola',
    password: 'Garage360@supabase',
    ssl: { rejectUnauthorized: false }
});

async function createServicePartsTable() {
    try {
        console.log('🔧 Connecting to Supabase...\n');
        await client.connect();

        console.log('📝 Creating service_parts table...\n');

        await client.query(`
            CREATE TABLE IF NOT EXISTS service_parts (
                id SERIAL PRIMARY KEY,
                service_request_id INTEGER REFERENCES service_requests(request_id) ON DELETE CASCADE,
                part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
                quantity INTEGER NOT NULL DEFAULT 1,
                unit_price DECIMAL(10, 2) NOT NULL,
                total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('✅ service_parts table created successfully!\n');

        // Create indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_service_parts_request_id ON service_parts(service_request_id);
            CREATE INDEX IF NOT EXISTS idx_service_parts_part_id ON service_parts(part_id);
        `);

        console.log('✅ Indexes created successfully!\n');

        // Verify
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'service_parts'
            ORDER BY ordinal_position;
        `);

        console.log('📋 Table structure:');
        result.rows.forEach(row => {
            console.log(`   ${row.column_name}: ${row.data_type}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

createServicePartsTable();
