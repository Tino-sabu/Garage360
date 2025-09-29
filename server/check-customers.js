const { query } = require('./config/database');

async function checkCustomers() {
    try {
        console.log('🔍 Checking customers in database...\n');

        // Get all customers
        const customers = await query('SELECT customer_id, name, email FROM customers ORDER BY customer_id');

        console.log('📋 Available customers:');
        customers.rows.forEach((customer, index) => {
            console.log(`${index + 1}. ID: ${customer.customer_id}, Name: ${customer.name}, Email: ${customer.email}`);
        });

        console.log(`\n📊 Total customers: ${customers.rows.length}`);

        // Check if any vehicles exist
        const vehicles = await query('SELECT COUNT(*) as count FROM vehicles');
        console.log(`🚗 Total vehicles: ${vehicles.rows[0].count}`);

        // Check vehicle-customer relationships
        if (parseInt(vehicles.rows[0].count) > 0) {
            const vehicleCustomers = await query(`
                SELECT v.vehicle_id, v.registration_number, v.brand, v.model, v.customer_id, c.name as customer_name
                FROM vehicles v
                LEFT JOIN customers c ON v.customer_id = c.customer_id
                ORDER BY v.customer_id
            `);

            console.log('\n🔗 Vehicle-Customer relationships:');
            vehicleCustomers.rows.forEach((row, index) => {
                console.log(`${index + 1}. Vehicle: ${row.brand} ${row.model} (${row.registration_number}) -> Customer: ${row.customer_name} (ID: ${row.customer_id})`);
            });
        }

        console.log('\n✅ Check completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error checking customers:', error);
        process.exit(1);
    }
}

checkCustomers();