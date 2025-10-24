const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gddblbotzusdpeyedola.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzAxMDQsImV4cCI6MjA3NjgwNjEwNH0.czVjg7ZEljTfV_1TJRWsyl271gB7O8hgG96u5BVhTgE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateMechanicSpecializations() {
    console.log('Updating mechanic specializations...\n');

    // First, check current mechanics
    const { data: mechanics, error: fetchError } = await supabase
        .from('mechanics')
        .select('mechanic_id, name, specialization, specializations');

    if (fetchError) {
        console.log('Error fetching mechanics:', fetchError.message);
        return;
    }

    console.log('Current mechanics:');
    mechanics.forEach(m => {
        console.log(`  ${m.name}: specialization="${m.specialization}", specializations=${JSON.stringify(m.specializations)}`);
    });

    // Define specializations for each mechanic
    const specializationsMap = {
        1: ['Engine Repair', 'Transmission', 'Diagnostics'], // Vinod Mathew
        2: ['Brake Systems', 'Suspension', 'Electrical'], // Prakash Nair
        3: ['AC Service', 'Body Work', 'Paint'], // Benny Wilson
        4: ['Oil Change', 'Tire Service', 'General Maintenance'] // Ashish Krishna
    };

    // Update each mechanic
    console.log('\nUpdating mechanics with specializations...');

    for (const mechanic of mechanics) {
        const newSpecializations = specializationsMap[mechanic.mechanic_id] || ['General Service'];

        const { data, error } = await supabase
            .from('mechanics')
            .update({
                specializations: newSpecializations,
                specialization: newSpecializations[0] // Set first specialization as main
            })
            .eq('mechanic_id', mechanic.mechanic_id)
            .select();

        if (error) {
            console.log(`❌ Error updating ${mechanic.name}:`, error.message);
        } else {
            console.log(`✅ Updated ${mechanic.name}: ${newSpecializations.join(', ')}`);
        }
    }

    // Verify updates
    console.log('\nVerifying updates...');
    const { data: updated, error: verifyError } = await supabase
        .from('mechanics')
        .select('mechanic_id, name, specialization, specializations, hourly_rate, experience_years');

    if (verifyError) {
        console.log('Error verifying:', verifyError.message);
    } else {
        console.log('\n📋 Updated mechanics:');
        updated.forEach(m => {
            console.log(`\n${m.name}:`);
            console.log(`  ID: ${m.mechanic_id}`);
            console.log(`  Experience: ${m.experience_years} years`);
            console.log(`  Hourly Rate: ₹${m.hourly_rate}`);
            console.log(`  Main Specialization: ${m.specialization}`);
            console.log(`  All Specializations: [${m.specializations ? m.specializations.join(', ') : 'None'}]`);
        });
    }

    console.log('\n✅ Specializations update complete!');
}

updateMechanicSpecializations();
