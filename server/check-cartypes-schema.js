const { Pool } = require('pg');

const localPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'garage360',
    user: 'postgres',
    password: 'Astra1512'
});

async function checkSchema() {
    const result = await localPool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name='cartypes' 
        ORDER BY ordinal_position
    `);

    console.log('\nCartypes table columns:');
    result.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));

    const data = await localPool.query('SELECT * FROM cartypes LIMIT 2');
    console.log('\nSample data:');
    console.log(data.rows);

    await localPool.end();
}

checkSchema();
