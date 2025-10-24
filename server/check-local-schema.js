const { Pool } = require('pg');

const localPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'garage360',
    user: 'postgres',
    password: 'Astra1512'
});

async function checkSchema() {
    try {
        console.log('🔍 Checking local database schema...\n');

        // Get all tables
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;
        const { rows: tables } = await localPool.query(tablesQuery);

        console.log('📊 Tables in local database:');
        console.log(tables.map(t => `  - ${t.table_name}`).join('\n'));
        console.log('');

        // Check each table's data
        for (const table of tables) {
            const tableName = table.table_name;
            try {
                const countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
                const { rows } = await localPool.query(countQuery);
                const count = rows[0].count;

                if (count > 0) {
                    console.log(`✅ ${tableName}: ${count} rows`);

                    // Show sample data
                    const sampleQuery = `SELECT * FROM ${tableName} LIMIT 1`;
                    const { rows: sample } = await localPool.query(sampleQuery);
                    if (sample.length > 0) {
                        console.log(`   Sample columns: ${Object.keys(sample[0]).join(', ')}`);
                    }
                } else {
                    console.log(`⚪ ${tableName}: 0 rows (empty)`);
                }
            } catch (err) {
                console.log(`❌ ${tableName}: Error - ${err.message}`);
            }
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await localPool.end();
    }
}

checkSchema();
