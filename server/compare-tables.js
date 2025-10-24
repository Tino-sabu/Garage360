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

async function compareTables() {
    console.log('\n🔍 Comparing Local vs Supabase Tables...\n');

    try {
        // Get all tables from local database
        console.log('=== LOCAL DATABASE TABLES ===');
        const localTablesResult = await localPool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        const localTables = localTablesResult.rows.map(row => row.table_name);
        console.log(`Found ${localTables.length} tables:`);
        localTables.forEach(t => console.log(`  ✓ ${t}`));

        // Check each table in Supabase
        console.log('\n=== CHECKING SUPABASE ===');
        const missingTables = [];

        for (const tableName of localTables) {
            const { data, error } = await supabase
                .from(tableName)
                .select('count')
                .limit(0);

            if (error && (error.code === '42P01' || error.message.includes('does not exist') || error.code === 'PGRST204')) {
                console.log(`  ❌ ${tableName} - MISSING`);
                missingTables.push(tableName);
            } else {
                console.log(`  ✓ ${tableName} - EXISTS`);
            }
        }

        if (missingTables.length > 0) {
            console.log('\n=== MISSING TABLES IN SUPABASE ===');
            missingTables.forEach(t => console.log(`  • ${t}`));

            // Get schema for missing tables
            console.log('\n=== SCHEMA FOR MISSING TABLES ===\n');
            for (const tableName of missingTables) {
                console.log(`\n-- Table: ${tableName}`);
                const schemaResult = await localPool.query(`
                    SELECT 
                        column_name, 
                        data_type, 
                        character_maximum_length,
                        is_nullable,
                        column_default
                    FROM information_schema.columns 
                    WHERE table_name = $1 
                    ORDER BY ordinal_position
                `, [tableName]);

                console.log('Columns:');
                schemaResult.rows.forEach(col => {
                    console.log(`  - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
                });

                // Get row count
                const countResult = await localPool.query(`SELECT COUNT(*) as count FROM ${tableName}`);
                console.log(`Data: ${countResult.rows[0].count} rows`);
            }
        } else {
            console.log('\n✅ All local tables exist in Supabase!');
        }

        await localPool.end();

    } catch (error) {
        console.error('Error:', error.message);
        await localPool.end();
    }
}

compareTables();
