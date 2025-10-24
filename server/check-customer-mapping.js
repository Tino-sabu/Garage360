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

async function checkMapping() {
    try {
        const local = await localPool.query('SELECT customer_id, email, name FROM customers ORDER BY customer_id');
        const { data: remote } = await supabase.from('customers').select('customer_id, email, name').order('customer_id');

        console.log('\n=== LOCAL CUSTOMERS ===');
        local.rows.forEach(c => console.log(`ID: ${c.customer_id}, Email: ${c.email}, Name: ${c.name}`));

        console.log('\n=== SUPABASE CUSTOMERS ===');
        remote.forEach(c => console.log(`ID: ${c.customer_id}, Email: ${c.email}, Name: ${c.name}`));

        // Create mapping by email
        console.log('\n=== ID MAPPING (Local -> Supabase) ===');
        const emailMap = {};
        remote.forEach(r => emailMap[r.email.toLowerCase()] = r.customer_id);

        local.rows.forEach(l => {
            const supabaseId = emailMap[l.email.toLowerCase()];
            if (supabaseId) {
                console.log(`${l.customer_id} -> ${supabaseId} (${l.email})`);
            } else {
                console.log(`${l.customer_id} -> NOT FOUND (${l.email}) ❌`);
            }
        });

        await localPool.end();
    } catch (error) {
        console.error('Error:', error.message);
        await localPool.end();
    }
}

checkMapping();
