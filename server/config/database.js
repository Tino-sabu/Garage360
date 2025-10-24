const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use service role key for backend
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Initialize Supabase client (for authentication and realtime features)
const supabase = supabaseUrl && (supabaseServiceKey || supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  })
  : null;

// PostgreSQL connection configuration for Supabase
const dbConfig = {
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  maxUses: 7500,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, current_database() as database');
    console.log('✅ Database connected successfully!');
    console.log(`📅 Current time: ${result.rows[0].current_time}`);
    console.log(`🗄️  Connected to database: ${result.rows[0].database}`);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    return false;
  }
};

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', { text, error: error.message });
    throw error;
  }
};

// Transaction helper function
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Check if tables exist
const checkTablesExist = async () => {
  try {
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('customers', 'managers', 'mechanics', 'vehicles', 'services', 'service_requests')
    `);

    const tableNames = result.rows.map(row => row.table_name);
    console.log('📋 Existing tables:', tableNames);

    if (tableNames.length < 6) {
      console.log('⚠️  Some tables are missing. Run database setup first.');
      console.log('💡 Run: node update-schema.js to create missing tables');
    }

    return tableNames.length >= 6;
  } catch (error) {
    console.error('Error checking tables:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  checkTablesExist,
  supabase // Export Supabase client for auth and realtime features
};