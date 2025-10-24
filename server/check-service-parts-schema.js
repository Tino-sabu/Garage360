const { Client } = require('pg');

const client = new Client({
    host: 'aws-0-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.gddblbotzusdpeyedola',
    password: 'Garage360@supabase',
    ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
    try {
        await client.connect();
        console.log('Connected to Supabase');

        // Check if table exists
        const tableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'service_request_parts'
        `);

        console.log('\nTable exists:', tableCheck.rows.length > 0);

        if (tableCheck.rows.length > 0) {
            // Get columns
            const columns = await client.query(`
                SELECT 
                    column_name, 
                    data_type, 
                    is_nullable,
                    column_default
                FROM information_schema.columns 
                WHERE table_name = 'service_request_parts'
                ORDER BY ordinal_position
            `);

            console.log('\nColumns in service_request_parts:');
            columns.rows.forEach(col => {
                console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default})`);
            });

            // Check current data
            const data = await client.query('SELECT * FROM service_request_parts LIMIT 5');
            console.log(`\nCurrent rows: ${data.rows.length}`);
            if (data.rows.length > 0) {
                console.log('Sample data:', data.rows[0]);
            }
        }

        await client.end();
    } catch (error) {
        console.error('Error:', error.message);
        await client.end();
    }
}

checkSchema();
