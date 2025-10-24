const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gddblbotzusdpeyedola.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzAxMDQsImV4cCI6MjA3NjgwNjEwNH0.czVjg7ZEljTfV_1TJRWsyl271gB7O8hgG96u5BVhTgE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simulate the login function
async function testLogin(email, password) {
    try {
        console.log(`\n🔐 Testing login for: ${email}`);
        console.log(`Password: ${password}\n`);

        const { data: mechanic, error: mechanicError } = await supabase
            .from('mechanics')
            .select('mechanic_id, name, email, phone, password, experience_years, specialization, specializations, available, availability_status, rating, hourly_rate')
            .eq('email', email)
            .eq('password', password)
            .single();

        if (mechanicError) {
            console.log('❌ Login failed:', mechanicError.message);
            return null;
        }

        if (!mechanic) {
            console.log('❌ No mechanic found with these credentials');
            return null;
        }

        console.log('✅ Login successful!');
        console.log('\nMechanic data from database:');
        console.log(mechanic);

        // Build user response like the API does
        const userResponse = {
            id: mechanic.mechanic_id,
            name: mechanic.name,
            email: mechanic.email,
            phone: mechanic.phone,
            role: 'mechanic',
            mechanic_id: mechanic.mechanic_id,
            experience_years: mechanic.experience_years,
            rating: mechanic.rating,
            // Support both old and new column names
            hourly_rate: mechanic.hourly_rate || 0,
            specializations: mechanic.specializations || (mechanic.specialization ? [mechanic.specialization] : []),
            availability_status: mechanic.availability_status || (mechanic.available ? 'available' : 'offline'),
            available: mechanic.available
        };

        console.log('\nUser object that will be stored in localStorage:');
        console.log(JSON.stringify(userResponse, null, 2));

        return userResponse;

    } catch (error) {
        console.log('❌ Error:', error.message);
        return null;
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('MECHANIC LOGIN TEST');
    console.log('='.repeat(60));

    // Test with Prakash
    await testLogin('Prakash@gmail.com', 'prakash123');

    // Test with Vinod
    await testLogin('Vinod@gmail.com', 'vinod123');

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60));
    console.log('\n📝 Use these credentials to login:');
    console.log('   Email: Prakash@gmail.com');
    console.log('   Password: prakash123');
    console.log('\n   Email: Vinod@gmail.com');
    console.log('   Password: vinod123');
}

runTests();
