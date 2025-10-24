const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gddblbotzusdpeyedola.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzAxMDQsImV4cCI6MjA3NjgwNjEwNH0.czVjg7ZEljTfV_1TJRWsyl271gB7O8hgG96u5BVhTgE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log('Testing service_request_parts insert...\n');

    // First, let's check what columns exist
    const { data: tableInfo, error: tableError } = await supabase
        .from('service_request_parts')
        .select('*')
        .limit(1);

    console.log('Table check result:', { data: tableInfo, error: tableError });

    // Try to insert test data
    const testData = {
        request_id: 33,
        part_id: 1,
        quantity_used: 2,
        part_cost: 500
    };

    console.log('\nAttempting to insert:', testData);

    const { data, error } = await supabase
        .from('service_request_parts')
        .insert([testData])
        .select();

    if (error) {
        console.log('\n❌ Insert failed!');
        console.log('Error:', error);
        console.log('Error message:', error.message);
        console.log('Error details:', error.details);
        console.log('Error hint:', error.hint);
    } else {
        console.log('\n✅ Insert successful!');
        console.log('Inserted data:', data);
    }
}

testInsert();
