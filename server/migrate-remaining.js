const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Local PostgreSQL connection
const localPool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'garage360',
    user: 'postgres',
    password: 'Astra1512'
});

// Supabase connection
const supabase = createClient(
    'https://gddblbotzusdpeyedola.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkZGJsYm90enVzZHBleWVkb2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIzMDEwNCwiZXhwIjoyMDc2ODA2MTA0fQ.BpvpIXZqulhxIJBz67laJ1TjgKiB3TPM58sIsBR2NGQ'
);

async function migrateRemaining() {
    console.log('🚀 Migrating remaining data (Services, Vehicles, Service Requests)...\n');

    try {
        // Test connections
        console.log('📡 Testing connections...');
        await localPool.query('SELECT 1');
        const { error: testError } = await supabase.from('services').select('count');
        if (testError && testError.code !== 'PGRST116') throw testError;
        console.log('✅ Connected to both databases\n');

        // Migrate Services (with duplicate handling)
        console.log('🛠️  Migrating services...');
        const servicesResult = await localPool.query('SELECT * FROM services ORDER BY service_id');
        if (servicesResult.rows.length > 0) {
            // Check existing services
            const { data: existingServices } = await supabase
                .from('services')
                .select('name');
            const existingNames = new Set((existingServices || []).map(s => s.name.toLowerCase()));

            const newServices = servicesResult.rows.filter(row =>
                !existingNames.has(row.name.toLowerCase())
            );

            if (newServices.length > 0) {
                const { error: svcError } = await supabase
                    .from('services')
                    .insert(newServices.map(row => ({
                        name: row.name,
                        description: row.description,
                        category: row.category,
                        base_price: parseFloat(row.base_price) || 0,
                        estimated_duration: row.estimated_time || '1 hour',
                        active: true
                    })));
                if (svcError) {
                    console.log('⚠️  Services error:', svcError.message);
                } else {
                    console.log(`✅ Migrated ${newServices.length} new services (${servicesResult.rows.length - newServices.length} already exist)`);
                }
            } else {
                console.log(`ℹ️  All ${servicesResult.rows.length} services already exist in Supabase`);
            }
        }

        // Create customer ID mapping (local ID -> Supabase ID)
        console.log('🔄 Creating customer ID mapping...');
        const localCustomers = await localPool.query('SELECT customer_id, email FROM customers');
        const { data: supabaseCustomers } = await supabase.from('customers').select('customer_id, email');

        const customerIdMap = {};
        const emailToSupabaseId = {};
        supabaseCustomers.forEach(c => emailToSupabaseId[c.email.toLowerCase()] = c.customer_id);

        localCustomers.rows.forEach(c => {
            const supabaseId = emailToSupabaseId[c.email.toLowerCase()];
            if (supabaseId) {
                customerIdMap[c.customer_id] = supabaseId;
            }
        });
        console.log(`✅ Mapped ${Object.keys(customerIdMap).length} customers`);

        // Create mechanic ID mapping (local ID -> Supabase ID)
        const localMechanics = await localPool.query('SELECT mechanic_id, email FROM mechanics');
        const { data: supabaseMechanics } = await supabase.from('mechanics').select('mechanic_id, email');

        const mechanicIdMap = {};
        const mechEmailToSupabaseId = {};
        supabaseMechanics.forEach(m => mechEmailToSupabaseId[m.email.toLowerCase()] = m.mechanic_id);

        localMechanics.rows.forEach(m => {
            const supabaseId = mechEmailToSupabaseId[m.email.toLowerCase()];
            if (supabaseId) {
                mechanicIdMap[m.mechanic_id] = supabaseId;
            }
        });
        console.log(`✅ Mapped ${Object.keys(mechanicIdMap).length} mechanics\n`);

        // Migrate Vehicles
        console.log('🚗 Migrating vehicles...');
        const vehiclesResult = await localPool.query('SELECT * FROM vehicles ORDER BY vehicle_id');
        if (vehiclesResult.rows.length > 0) {
            const vehiclesToInsert = vehiclesResult.rows
                .filter(row => customerIdMap[row.customer_id]) // Only include if customer exists
                .map(row => ({
                    customer_id: customerIdMap[row.customer_id], // Use mapped ID
                    brand: row.brand,
                    model: row.model,
                    year: row.year,
                    registration_number: row.registration_number,
                    color: row.color,
                    fuel_type: row.fuel_type,
                    mileage: row.km_driven || 0
                }));

            if (vehiclesToInsert.length > 0) {
                const { error: vehError } = await supabase
                    .from('vehicles')
                    .insert(vehiclesToInsert);
                if (vehError) {
                    console.log('⚠️  Vehicles error:', vehError.message);
                    console.log('Details:', vehError.details);
                } else {
                    console.log(`✅ Migrated ${vehiclesToInsert.length} vehicles (skipped ${vehiclesResult.rows.length - vehiclesToInsert.length} without matching customer)`);
                }
            }
        }

        // Create vehicle ID mapping (local ID -> Supabase ID)
        console.log('🔄 Creating vehicle ID mapping...');
        const localVehicles = await localPool.query('SELECT vehicle_id, registration_number FROM vehicles');
        const { data: supabaseVehicles } = await supabase.from('vehicles').select('vehicle_id, registration_number');

        const vehicleIdMap = {};
        const regToSupabaseId = {};
        supabaseVehicles.forEach(v => regToSupabaseId[v.registration_number] = v.vehicle_id);

        localVehicles.rows.forEach(v => {
            const supabaseId = regToSupabaseId[v.registration_number];
            if (supabaseId) {
                vehicleIdMap[v.vehicle_id] = supabaseId;
            }
        });
        console.log(`✅ Mapped ${Object.keys(vehicleIdMap).length} vehicles\n`);

        // Migrate Service Requests with junction table
        console.log('📋 Migrating service requests...');
        const requestsResult = await localPool.query('SELECT * FROM service_requests ORDER BY request_id');
        if (requestsResult.rows.length > 0) {
            const requestsToInsert = requestsResult.rows
                .filter(row =>
                    customerIdMap[row.customer_id] &&
                    vehicleIdMap[row.vehicle_id] &&
                    (row.assigned_mechanic === null || mechanicIdMap[row.assigned_mechanic])
                )
                .map(row => ({
                    customer_id: customerIdMap[row.customer_id],
                    vehicle_id: vehicleIdMap[row.vehicle_id],
                    assigned_mechanic: row.assigned_mechanic ? mechanicIdMap[row.assigned_mechanic] : null,
                    status: row.status || 'pending',
                    request_date: row.request_date,
                    scheduled_date: row.scheduled_date,
                    completion_date: row.completion_date,
                    estimated_cost: parseFloat(row.estimated_cost) || 0,
                    final_cost: row.final_cost ? parseFloat(row.final_cost) : null,
                    customer_notes: row.customer_notes,
                    mechanic_notes: row.mechanic_notes
                }));

            const { data: insertedRequests, error: reqError } = await supabase
                .from('service_requests')
                .insert(requestsToInsert)
                .select();

            if (reqError) {
                console.log('⚠️  Service requests error:', reqError.message);
                console.log('Details:', reqError.details);
            } else {
                console.log(`✅ Migrated ${requestsToInsert.length} service requests (skipped ${requestsResult.rows.length - requestsToInsert.length} without matching customer/vehicle)`);

                // Create service ID mapping (local ID -> Supabase ID)
                console.log('🔗 Creating service ID mapping...');
                const localServices = await localPool.query('SELECT service_id, name FROM services');
                const { data: supabaseServices } = await supabase.from('services').select('service_id, name');

                const serviceIdMap = {};
                const serviceNameToSupabaseId = {};
                supabaseServices.forEach(s => serviceNameToSupabaseId[s.name.toLowerCase()] = s.service_id);

                localServices.rows.forEach(s => {
                    const supabaseId = serviceNameToSupabaseId[s.name.toLowerCase()];
                    if (supabaseId) {
                        serviceIdMap[s.service_id] = supabaseId;
                    }
                });
                console.log(`✅ Mapped ${Object.keys(serviceIdMap).length} services`);

                // Migrate junction table
                console.log('🔗 Migrating service-request relationships...');
                const junctionResult = await localPool.query('SELECT * FROM service_request_services ORDER BY request_id');

                if (junctionResult.rows.length > 0 && insertedRequests) {
                    // Map old request_ids to new ones
                    const requestIdMapping = {};
                    requestsResult.rows.forEach((oldRow, index) => {
                        if (requestsToInsert[index]) {
                            requestIdMapping[oldRow.request_id] = insertedRequests[index].request_id;
                        }
                    });

                    const junctionToInsert = junctionResult.rows
                        .filter(row => requestIdMapping[row.request_id] && serviceIdMap[row.service_id])
                        .map(row => ({
                            request_id: requestIdMapping[row.request_id],
                            service_id: serviceIdMap[row.service_id]
                        }));

                    if (junctionToInsert.length > 0) {
                        const { error: junctionError } = await supabase
                            .from('service_request_services')
                            .insert(junctionToInsert);

                        if (junctionError) {
                            console.log('⚠️  Service-request relationships error:', junctionError.message);
                        } else {
                            console.log(`✅ Migrated ${junctionToInsert.length} service-request relationships`);
                        }
                    }
                }
            }
        }

        console.log('\n✨ Remaining migrations completed!\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Details:', error);
    } finally {
        await localPool.end();
        console.log('🔌 Database connections closed');
    }
}

// Run migration
migrateRemaining();
