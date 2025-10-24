const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gddblbotzusdpeyedola.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzAxMDQsImV4cCI6MjA3NjgwNjEwNH0.czVjg7ZEljTfV_1TJRWsyl271gB7O8hgG96u5BVhTgE'
);

async function testLogin() {
    console.log('=== Testing Login Issues ===\n');

    // Check managers
    console.log('1. Checking managers table:');
    const { data: managers, error: mgError } = await supabase
        .from('managers')
        .select('*');
    console.log('Managers:', JSON.stringify(managers, null, 2));
    console.log('Manager Error:', mgError);

    // Check customers
    console.log('\n2. Checking customers table:');
    const { data: customers, error: custError } = await supabase
        .from('customers')
        .select('customer_id, name, email, password')
        .limit(3);
    console.log('Customers:', JSON.stringify(customers, null, 2));
    console.log('Customer Error:', custError);

    // Test manager login (using actual manager from DB)
    if (managers && managers.length > 0) {
        const testMgr = managers[0];
        console.log(`\n3. Testing manager login with email: ${testMgr.email}`);
        const { data: managerTest, error: managerLoginError } = await supabase
            .from('managers')
            .select('manager_id, name, email, phone, password')
            .eq('email', testMgr.email)
            .eq('password', testMgr.password)
            .single();
        console.log('Manager login test:', JSON.stringify(managerTest, null, 2));
        console.log('Manager login error:', managerLoginError);
    }

    // Test customer login (use actual data from above)
    if (customers && customers.length > 0) {
        const testCust = customers[0];
        console.log(`\n4. Testing customer login with email: ${testCust.email}`);
        const { data: customerTest, error: customerLoginError } = await supabase
            .from('customers')
            .select('customer_id, name, email, phone, password')
            .eq('email', testCust.email)
            .eq('password', testCust.password)
            .single();
        console.log('Customer login test:', JSON.stringify(customerTest, null, 2));
        console.log('Customer login error:', customerLoginError);
    }
}

testLogin().catch(console.error);
