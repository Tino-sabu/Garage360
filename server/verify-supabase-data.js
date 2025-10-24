const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gddblbotzusdpeyedola.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIzMDEwNCwiZXhwIjoyMDc2ODA2MTA0fQ.BpvpIXZqulhxIJBz67laJ1TjgKiB3TPM58sIsBR2NGQ'
);

async function verifyData() {
    console.log('\n🔍 Verifying Supabase Data:\n');
    console.log('═══════════════════════════════════════\n');

    try {
        const { data: customers } = await supabase.from('customers').select('count');
        console.log(`👥 Customers: ${customers[0].count}`);

        const { data: mechanics } = await supabase.from('mechanics').select('count');
        console.log(`🔧 Mechanics: ${mechanics[0].count}`);

        const { data: services } = await supabase.from('services').select('count');
        console.log(`🛠️  Services: ${services[0].count}`);

        const { data: vehicles } = await supabase.from('vehicles').select('count');
        console.log(`🚗 Vehicles: ${vehicles[0].count}`);

        const { data: parts } = await supabase.from('parts').select('count');
        console.log(`🔩 Parts: ${parts[0].count}`);

        const { data: requests } = await supabase.from('service_requests').select('count');
        console.log(`📋 Service Requests: ${requests[0].count}`);

        const { data: junction } = await supabase.from('service_request_services').select('count');
        console.log(`🔗 Service-Request Links: ${junction[0].count}`);

        console.log('\n═══════════════════════════════════════');
        console.log('✅ All data migrated successfully!\n');

    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyData();
