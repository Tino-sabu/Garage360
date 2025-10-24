const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gddblbotzusdpeyedola.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIzMDEwNCwiZXhwIjoyMDc2ODA2MTA0fQ.cOZ8e4t4N9h3J_n9jW93oMYe-sEzxA7yETWB3dVyN6k';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
    console.log('Checking service_request_parts schema...\n');

    try {
        // Use rpc to run raw SQL if available, or check by trying to select all columns
        const { data, error } = await supabase
            .rpc('exec_sql', {
                query: `
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = 'service_request_parts'
                    AND table_schema = 'public'
                    ORDER BY ordinal_position
                `
            });

        if (error) {
            console.log('RPC not available, trying direct query...');

            // Alternative: Try to insert with all possible columns and see what fails
            const { error: selectError } = await supabase
                .from('service_request_parts')
                .select('*')
                .limit(0);

            console.log('Select error:', selectError);
        } else {
            console.log('✅ Columns found:');
            data.forEach(col => {
                console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
            });
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkColumns();
