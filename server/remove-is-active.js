const db = require('./config/database');

async function removeIsActiveColumns() {
    const tables = ['customers', 'vehicles', 'services', 'managers', 'mechanics'];

    try {
        console.log('Starting removal of is_active columns from all tables...\n');

        for (const table of tables) {
            console.log(`Removing is_active column from ${table} table...`);

            const query = `ALTER TABLE ${table} DROP COLUMN IF EXISTS is_active;`;
            await db.pool.query(query);

            console.log(`✓ Successfully removed is_active from ${table}`);
        }

        console.log('\n✅ All is_active columns have been removed successfully!');

        // Verify the changes
        console.log('\nVerifying changes...');
        const result = await db.pool.query(`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_name = 'is_active'
        `);

        if (result.rows.length === 0) {
            console.log('✅ Verification successful: No is_active columns found in database');
        } else {
            console.log('❌ Some is_active columns still exist:');
            console.table(result.rows);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Database error:', error.message);
        process.exit(1);
    }
}

removeIsActiveColumns();