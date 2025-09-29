const db = require('./config/database');

async function checkPasswords() {
    try {
        console.log('Checking user passwords...\n');

        // Check customers with passwords
        const customers = await db.pool.query('SELECT customer_id, name, email, password FROM customers LIMIT 5');
        console.log('Customers (name - email - password):');
        customers.rows.forEach(user => {
            console.log(`${user.name} - ${user.email} - ${user.password}`);
        });

        // Check managers with passwords
        const managers = await db.pool.query('SELECT manager_id, name, email, password FROM managers LIMIT 5');
        console.log('\nManagers (name - email - password):');
        managers.rows.forEach(user => {
            console.log(`${user.name} - ${user.email} - ${user.password}`);
        });

        // Check mechanics with passwords
        const mechanics = await db.pool.query('SELECT mechanic_id, name, email, password FROM mechanics LIMIT 5');
        console.log('\nMechanics (name - email - password):');
        mechanics.rows.forEach(user => {
            console.log(`${user.name} - ${user.email} - ${user.password}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkPasswords();