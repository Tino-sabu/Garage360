const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gddblbotzusdpeyedola.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzAxMDQsImV4cCI6MjA3NjgwNjEwNH0.czVjg7ZEljTfV_1TJRWsyl271gB7O8hgG96u5BVhTgE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMechanicsAPI() {
    console.log('Testing mechanics API...\n');

    const { data, error } = await supabase
        .from('mechanics')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.log('Error:', error.message);
        return;
    }

    console.log(`✅ Found ${data.length} mechanics\n`);

    data.forEach((mechanic, index) => {
        console.log(`${index + 1}. ${mechanic.name}`);
        console.log(`   Email: ${mechanic.email}`);
        console.log(`   Phone: ${mechanic.phone}`);
        console.log(`   Experience: ${mechanic.experience_years} years`);
        console.log(`   Hourly Rate: ₹${mechanic.hourly_rate}`);
        console.log(`   Main Specialization: ${mechanic.specialization || 'None'}`);
        console.log(`   All Specializations: ${mechanic.specializations ? `[${mechanic.specializations.join(', ')}]` : '[]'}`);
        console.log(`   Available: ${mechanic.available}`);
        console.log(`   Availability Status: ${mechanic.availability_status}`);
        console.log('');
    });

    // Extract unique specializations like the frontend does
    const uniqueSpecs = [...new Set(data.map(m => m.specializations).filter(Boolean).flat())];
    console.log('📋 Unique specializations for filter:');
    uniqueSpecs.forEach(spec => console.log(`  - ${spec}`));
}

testMechanicsAPI();
