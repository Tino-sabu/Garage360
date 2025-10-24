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

async function migrateData() {
    console.log('🚀 Starting data migration from Local PostgreSQL to Supabase...\n');

    try {
        // Test connections
        console.log('📡 Testing local database connection...');
        await localPool.query('SELECT 1');
        console.log('✅ Local database connected\n');

        console.log('📡 Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase.from('customers').select('count');
        if (testError && testError.code !== 'PGRST116') throw testError;
        console.log('✅ Supabase connected\n');

        // Get existing customers in Supabase to avoid conflicts
        console.log('� Checking existing Supabase customers...');
        const { data: existingCustomers } = await supabase
            .from('customers')
            .select('email, phone');
        const existingEmails = new Set((existingCustomers || []).map(c => c.email.toLowerCase()));
        const existingPhones = new Set((existingCustomers || []).map(c => c.phone));
        console.log(`Found ${existingEmails.size} existing customers in Supabase\n`);

        // Migrate Customers (skip existing ones)
        console.log('👥 Migrating customers...');
        const customersResult = await localPool.query('SELECT * FROM customers ORDER BY customer_id');
        let newCustomers = [];
        if (customersResult.rows.length > 0) {
            newCustomers = customersResult.rows.filter(row =>
                !existingEmails.has(row.email.toLowerCase()) && !existingPhones.has(row.phone)
            );

            if (newCustomers.length > 0) {
                const { error: custError } = await supabase
                    .from('customers')
                    .insert(newCustomers.map(row => ({
                        name: row.name,
                        email: row.email,
                        phone: row.phone,
                        password: row.password,
                        address: row.address,
                        email_verified: row.email_verified || false,
                        phone_verified: row.phone_verified || false,
                        created_at: row.created_at,
                        last_login: row.last_login
                    })));
                if (custError) {
                    console.log('⚠️  Customers error:', custError.message);
                } else {
                    console.log(`✅ Migrated ${newCustomers.length} new customers (skipped ${customersResult.rows.length - newCustomers.length} existing)`);
                }
            } else {
                console.log('ℹ️  All customers already exist in Supabase');
            }
        } else {
            console.log('ℹ️  No customers to migrate');
        }

        // Skip Managers (as requested)
        console.log('👔 Skipping managers (as requested)...');
        const managersResult = await localPool.query('SELECT COUNT(*) as count FROM managers');
        console.log(`ℹ️  ${managersResult.rows[0].count} managers in local database (not migrated)`);
        const managersCount = parseInt(managersResult.rows[0].count) || 0;

        // Migrate Mechanics
        console.log('🔧 Migrating mechanics...');
        const mechanicsResult = await localPool.query('SELECT * FROM mechanics ORDER BY mechanic_id');
        if (mechanicsResult.rows.length > 0) {
            const { error: mechError } = await supabase
                .from('mechanics')
                .insert(mechanicsResult.rows.map(row => ({
                    name: row.name,
                    email: row.email,
                    phone: row.phone,
                    password: row.password,
                    experience_years: row.experience_years || 0,
                    created_at: row.created_at,
                    last_login: row.last_login
                })));
            if (mechError) {
                console.log('⚠️  Mechanics error:', mechError.message);
            } else {
                console.log(`✅ Migrated ${mechanicsResult.rows.length} mechanics`);
            }
        } else {
            console.log('ℹ️  No mechanics to migrate');
        }

        // Migrate Services
        console.log('🛠️  Migrating services...');
        const servicesResult = await localPool.query('SELECT * FROM services ORDER BY service_id');
        if (servicesResult.rows.length > 0) {
            const { error: svcError } = await supabase
                .from('services')
                .insert(servicesResult.rows.map(row => ({
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
                console.log(`✅ Migrated ${servicesResult.rows.length} services`);
            }
        } else {
            console.log('ℹ️  No services to migrate');
        }

        // Migrate Vehicles
        console.log('🚗 Migrating vehicles...');
        const vehiclesResult = await localPool.query('SELECT * FROM vehicles ORDER BY vehicle_id');
        if (vehiclesResult.rows.length > 0) {
            const { error: vehError } = await supabase
                .from('vehicles')
                .insert(vehiclesResult.rows.map(row => ({
                    customer_id: row.customer_id,
                    brand: row.brand,
                    model: row.model,
                    year: row.year,
                    registration_number: row.registration_number,
                    color: row.color,
                    fuel_type: row.fuel_type,
                    mileage: row.km_driven || 0,
                    created_at: row.created_at
                })));
            if (vehError) {
                console.log('⚠️  Vehicles error:', vehError.message);
            } else {
                console.log(`✅ Migrated ${vehiclesResult.rows.length} vehicles`);
            }
        } else {
            console.log('ℹ️  No vehicles to migrate');
        }

        // Migrate Parts
        console.log('🔩 Migrating parts...');
        const partsResult = await localPool.query('SELECT * FROM parts ORDER BY id');
        if (partsResult.rows.length > 0) {
            const { error: partError } = await supabase
                .from('parts')
                .insert(partsResult.rows.map(row => ({
                    part_name: row.part_name,
                    part_code: row.part_code,
                    category: row.category,
                    current_stock: parseInt(row.current_stock) || 0,
                    stock_min: parseInt(row.stock_min) || 0,
                    avg_cost: parseFloat(row.avg_cost) || 0,
                    price: parseFloat(row.avg_cost) || 0,
                    supplier: row.supplier || null,
                    description: null,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                })));
            if (partError) {
                console.log('⚠️  Parts error:', partError.message);
            } else {
                console.log(`✅ Migrated ${partsResult.rows.length} parts`);
            }
        } else {
            console.log('ℹ️  No parts to migrate');
        }

        // Migrate Service Requests
        console.log('📋 Migrating service requests...');
        const requestsResult = await localPool.query('SELECT * FROM service_requests ORDER BY request_id');
        if (requestsResult.rows.length > 0) {
            // First, insert service requests without service_id
            const { data: insertedRequests, error: reqError } = await supabase
                .from('service_requests')
                .insert(requestsResult.rows.map(row => ({
                    customer_id: row.customer_id,
                    vehicle_id: row.vehicle_id,
                    assigned_mechanic: row.assigned_mechanic,
                    status: row.status || 'pending',
                    request_date: row.request_date,
                    scheduled_date: row.scheduled_date,
                    completion_date: row.completion_date,
                    estimated_cost: parseFloat(row.estimated_cost) || 0,
                    final_cost: row.final_cost ? parseFloat(row.final_cost) : null,
                    customer_notes: row.customer_notes,
                    mechanic_notes: row.mechanic_notes
                })))
                .select();

            if (reqError) {
                console.log('⚠️  Service requests error:', reqError.message);
            } else {
                console.log(`✅ Migrated ${requestsResult.rows.length} service requests`);

                // Now migrate service_request_services junction table
                console.log('🔗 Migrating service-request relationships...');
                const junctionResult = await localPool.query('SELECT * FROM service_request_services ORDER BY request_id');

                if (junctionResult.rows.length > 0 && insertedRequests) {
                    // Map old request_ids to new ones
                    const idMapping = {};
                    requestsResult.rows.forEach((oldRow, index) => {
                        idMapping[oldRow.request_id] = insertedRequests[index].request_id;
                    });

                    const { error: junctionError } = await supabase
                        .from('service_request_services')
                        .insert(junctionResult.rows.map(row => ({
                            request_id: idMapping[row.request_id] || row.request_id,
                            service_id: row.service_id
                        })));

                    if (junctionError) {
                        console.log('⚠️  Service-request relationships error:', junctionError.message);
                    } else {
                        console.log(`✅ Migrated ${junctionResult.rows.length} service-request relationships`);
                    }
                }
            }
        } else {
            console.log('ℹ️  No service requests to migrate');
        }

        console.log('\n✨ Migration completed successfully!\n');

        // Print summary
        console.log('📊 Migration Summary:');
        console.log('─────────────────────────────');
        console.log(`Customers:        ${customersResult.rows.length} (new: ${newCustomers?.length || 0})`);
        console.log(`Managers:         ${managersCount} (skipped)`);
        console.log(`Mechanics:        ${mechanicsResult.rows.length}`);
        console.log(`Services:         ${servicesResult.rows.length}`);
        console.log(`Vehicles:         ${vehiclesResult.rows.length}`);
        console.log(`Parts:            ${partsResult.rows.length}`);
        console.log(`Service Requests: ${requestsResult.rows.length}`);
        console.log('─────────────────────────────\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Details:', error);
    } finally {
        await localPool.end();
        console.log('🔌 Database connections closed');
    }
}

// Run migration
migrateData();
