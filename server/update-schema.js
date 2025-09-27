const fs = require('fs');
const path = require('path');
const { query } = require('./config/database');

async function runSchemaUpdates() {
  try {
    console.log('🔄 Running schema updates...');
    
    // Drop the old users table if it exists
    console.log('📋 Dropping old users table...');
    await query('DROP TABLE IF EXISTS users CASCADE');
    
    // Create customers table
    console.log('📋 Creating customers table...');
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
          customer_id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          address TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          email_verified BOOLEAN DEFAULT FALSE,
          phone_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP WITH TIME ZONE
      );
    `);
    
    // Create managers table
    console.log('📋 Creating managers table...');
    await query(`
      CREATE TABLE IF NOT EXISTS managers (
          manager_id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          employee_id VARCHAR(50) UNIQUE,
          department VARCHAR(100),
          is_active BOOLEAN DEFAULT TRUE,
          email_verified BOOLEAN DEFAULT FALSE,
          phone_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP WITH TIME ZONE
      );
    `);
    
    // Create mechanics table
    console.log('📋 Creating mechanics table...');
    await query(`
      CREATE TABLE IF NOT EXISTS mechanics (
          mechanic_id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          employee_id VARCHAR(50) UNIQUE,
          specializations TEXT[],
          experience_years INTEGER DEFAULT 0,
          hourly_rate DECIMAL(8,2),
          is_active BOOLEAN DEFAULT TRUE,
          email_verified BOOLEAN DEFAULT FALSE,
          phone_verified BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_login TIMESTAMP WITH TIME ZONE
      );
    `);
    
    // Set sequences to start from specific values
    console.log('📋 Setting up ID sequences...');
    await query('ALTER SEQUENCE customers_customer_id_seq RESTART WITH 200');
    await query('ALTER SEQUENCE managers_manager_id_seq RESTART WITH 300');
    await query('ALTER SEQUENCE mechanics_mechanic_id_seq RESTART WITH 400');
    
    // Update vehicles table to reference customers instead of users
    console.log('📋 Updating vehicles table...');
    await query(`
      ALTER TABLE vehicles 
      DROP COLUMN IF EXISTS user_id,
      ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE
    `);
    
    // Update service_requests table
    console.log('📋 Updating service_requests table...');
    await query(`
      ALTER TABLE service_requests 
      DROP COLUMN IF EXISTS user_id,
      ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(customer_id) ON DELETE RESTRICT,
      DROP COLUMN IF EXISTS assigned_mechanic_id,
      ADD COLUMN IF NOT EXISTS assigned_mechanic INTEGER REFERENCES mechanics(mechanic_id) ON DELETE SET NULL
    `);
    
    // Create indexes
    console.log('📋 Creating indexes...');
    await query('CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_managers_email ON managers(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_mechanics_email ON mechanics(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON service_requests(customer_id)');
    
    // Insert default users
    console.log('📋 Inserting default users...');
    
    // Insert managers
    await query(`
      INSERT INTO managers (name, email, phone, password, employee_id, department) 
      VALUES 
        ('Alpha', 'alpha@garage360.com', '+1234567890', 'alpha01', 'MGR001', 'Operations'),
        ('Beta', 'beta@garage360.com', '+1234567891', 'beta02', 'MGR002', 'Customer Service'),
        ('Gamma', 'gamma@garage360.com', '+1234567892', 'gamma03', 'MGR003', 'Administration')
      ON CONFLICT (email) DO NOTHING
    `);
    
    // Insert mechanics
    await query(`
      INSERT INTO mechanics (name, email, phone, password, employee_id, specializations, experience_years, hourly_rate) 
      VALUES 
        ('Mechanic One', 'mech1@garage360.com', '+1234567893', 'mech01', 'MECH001', ARRAY['Engine Repair', 'Oil Change'], 5, 25.00),
        ('Mechanic Two', 'mech2@garage360.com', '+1234567894', 'mech02', 'MECH002', ARRAY['Brake System', 'Suspension'], 7, 30.00)
      ON CONFLICT (email) DO NOTHING
    `);
    
    console.log('✅ Schema updates completed successfully!');
    
    // Check what tables exist now
    console.log('📋 Checking existing tables...');
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Current tables:', result.rows.map(row => row.table_name));
    
    // Check data in new tables
    const customers = await query('SELECT customer_id, name, email FROM customers LIMIT 5');
    const managers = await query('SELECT manager_id, name, email FROM managers LIMIT 5');
    const mechanics = await query('SELECT mechanic_id, name, email FROM mechanics LIMIT 5');
    
    console.log('👥 Customers:', customers.rows);
    console.log('👔 Managers:', managers.rows);
    console.log('🔧 Mechanics:', mechanics.rows);
    
  } catch (error) {
    console.error('❌ Error running schema updates:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

runSchemaUpdates();