const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://gddblbotzusdpeyedola.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIzMDEwNCwiZXhwIjoyMDc2ODA2MTA0fQ.BpvpIXZqulhxIJBz67laJ1TjgKiB3TPM58sIsBR2NGQ'
);

async function checkSupabaseSchema() {
    try {
        console.log('🔍 Checking Supabase table schemas...\n');

        // Mechanics
        console.log('🔧 MECHANICS:');
        const { data: mech, error: mechErr } = await supabase.from('mechanics').select('*').limit(1);
        if (mech && mech.length > 0) {
            console.log('Columns:', Object.keys(mech[0]).join(', '));
        } else {
            console.log('No data yet');
        }

        // Services
        console.log('\n🛠️  SERVICES:');
        const { data: svc, error: svcErr } = await supabase.from('services').select('*').limit(1);
        if (svc && svc.length > 0) {
            console.log('Columns:', Object.keys(svc[0]).join(', '));
        } else {
            console.log('No data yet');
        }

        // Vehicles
        console.log('\n🚗 VEHICLES:');
        const { data: veh, error: vehErr } = await supabase.from('vehicles').select('*').limit(1);
        if (veh && veh.length > 0) {
            console.log('Columns:', Object.keys(veh[0]).join(', '));
        } else {
            console.log('No data yet');
        }

        // Parts
        console.log('\n🔩 PARTS:');
        const { data: parts, error: partsErr } = await supabase.from('parts').select('*').limit(1);
        if (parts && parts.length > 0) {
            console.log('Columns:', Object.keys(parts[0]).join(', '));
        } else {
            console.log('No data yet');
        }

        // Service Requests
        console.log('\n📋 SERVICE_REQUESTS:');
        const { data: req, error: reqErr } = await supabase.from('service_requests').select('*').limit(1);
        if (req && req.length > 0) {
            console.log('Columns:', Object.keys(req[0]).join(', '));
        } else {
            console.log('No data yet');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkSupabaseSchema();
