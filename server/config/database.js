const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection configuration for garage360 database
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'garage360',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Astra1512', // You'll need to set this in .env file
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
  ssl: false, // Set to true if you need SSL connection
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
  checkTablesExist
};