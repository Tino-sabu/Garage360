const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gddblbotzusdpeyedola.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzAxMDQsImV4cCI6MjA3NjgwNjEwNH0.czVjg7ZEljTfV_1TJRWsyl271gB7O8hgG96u5BVhTgE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMechanicLogin() {
    console.log('Testing mechanic login...\n');

    // First, check if mechanics exist
    const { data: allMechanics, error: listError } = await supabase
        .from('mechanics')
        .select('*');

    console.log('All mechanics in database:');
    if (listError) {
        console.log('Error:', listError.message);
    } else {
        console.log(`Found ${allMechanics.length} mechanics:`);
        if (allMechanics.length > 0) {
            console.log('Columns available:', Object.keys(allMechanics[0]));
            allMechanics.forEach(m => {
                console.log(`  - ${m.name} (${m.email})`);
            });
        }
    }

    // Try to login as a mechanic (using first mechanic if exists)
    if (allMechanics && allMechanics.length > 0) {
        const testMechanic = allMechanics[0];
        console.log(`\nTrying to fetch mechanic with email: ${testMechanic.email}`);

        const { data: mechanic, error: mechanicError } = await supabase
            .from('mechanics')
            .select('*')
            .eq('email', testMechanic.email)
            .single();

        if (mechanicError) {
            console.log('Error fetching mechanic:', mechanicError.message);
        } else {
            console.log('Mechanic data:', mechanic);
            console.log('\nNote: You need to use this email and password to login:');
            console.log(`  Email: ${mechanic.email}`);
            console.log(`  Password: ${mechanic.password || '(check database)'}`);
        }
    }
}

testMechanicLogin();
