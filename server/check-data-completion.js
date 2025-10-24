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

async function checkDataCompletion() {
    console.log('\n📊 Checking Data Completion...\n');

    const tables = [
        'customers', 'managers', 'mechanics', 'services', 'vehicles', 'parts',
        'service_requests', 'service_request_services', 'cartypes', 'invoices',
        'payments', 'activity_logs', 'service_parts'
    ];

    try {
        console.log('Table                      | Local  | Supabase | Status');
        console.log('═══════════════════════════════════════════════════════════');

        const needsMigration = [];

        for (const table of tables) {
            // Get local count
            const localResult = await localPool.query(`SELECT COUNT(*) as count FROM ${table}`);
            const localCount = parseInt(localResult.rows[0].count);

            // Get Supabase count
            const { data, error } = await supabase.from(table).select('count');
            const supabaseCount = error ? 0 : (data?.[0]?.count || 0);

            const status = localCount === supabaseCount ? '✅' :
                supabaseCount === 0 ? '❌ EMPTY' :
                    supabaseCount < localCount ? '⚠️  INCOMPLETE' : '✅';

            console.log(`${table.padEnd(26)} | ${String(localCount).padStart(6)} | ${String(supabaseCount).padStart(8)} | ${status}`);

            if (localCount > 0 && supabaseCount < localCount) {
                needsMigration.push({
                    table,
                    localCount,
                    supabaseCount,
                    missing: localCount - supabaseCount
                });
            }
        }

        if (needsMigration.length > 0) {
            console.log('\n🔧 Tables needing migration:');
            needsMigration.forEach(t => {
                console.log(`  • ${t.table}: ${t.missing} rows missing (${t.supabaseCount}/${t.localCount})`);
            });
        } else {
            console.log('\n✅ All tables are synchronized!');
        }

        await localPool.end();

    } catch (error) {
        console.error('Error:', error.message);
        await localPool.end();
    }
}

checkDataCompletion();
