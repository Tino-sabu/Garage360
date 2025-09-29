const db = require('./config/database');

async function checkIsActiveColumns() {
    try {
        const result = await db.pool.query(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_name = 'is_active'
        `);

        console.log('Tables with is_active column:');
        console.table(result.rows);

        // Also check what columns exist in each main table
        const customerCols = await db.pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'customers' 
            ORDER BY ordinal_position
        `);

        const mechanicCols = await db.pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'mechanics' 
            ORDER BY ordinal_position
        `);

        console.log('\nCustomers table structure:');
        console.table(customerCols.rows);

        console.log('\nMechanics table structure:');
        console.table(mechanicCols.rows);

        process.exit(0);
    } catch (error) {
        console.error('Database error:', error.message);
        process.exit(1);
    }
}

checkIsActiveColumns();