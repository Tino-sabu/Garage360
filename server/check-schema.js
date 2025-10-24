const { query, pool } = require('./config/database');

async function checkSchema() {
    try {
        console.log('Checking customers table schema...\n');
        const result = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      ORDER BY ordinal_position
    `);

        console.log('Customers table columns:');
        console.table(result.rows);

        console.log('\nChecking if any customers exist...');
        const count = await query('SELECT COUNT(*) as count FROM customers');
        console.log(`Total customers: ${count.rows[0].count}`);

        if (count.rows[0].count > 0) {
            const sample = await query('SELECT * FROM customers LIMIT 1');
            console.log('\nSample customer data:');
            console.log(sample.rows[0]);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

checkSchema();
