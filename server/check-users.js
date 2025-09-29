const db = require('./config/database');

async function checkUsers() {
    try {
        console.log('Checking existing users...\n');

        // Check customers
        const customers = await db.pool.query('SELECT customer_id, name, email FROM customers LIMIT 5');
        console.log('Customers:');
        console.table(customers.rows);

        // Check managers  
        const managers = await db.pool.query('SELECT manager_id, name, email FROM managers LIMIT 5');
        console.log('\nManagers:');
        console.table(managers.rows);

        // Check mechanics
        const mechanics = await db.pool.query('SELECT mechanic_id, name, email FROM mechanics LIMIT 5');
        console.log('\nMechanics:');
        console.table(mechanics.rows);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkUsers();