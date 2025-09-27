const fs = require('fs');
const path = require('path');
const { query } = require('./config/database');

async function runSchema() {
  try {
    console.log('📋 Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🗄️  Executing schema...');
    await query(schema);
    
    console.log('✅ Schema executed successfully!');
    
    // Check what tables exist now
    console.log('📋 Checking existing tables...');
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 Current tables:', result.rows.map(row => row.table_name));
    
  } catch (error) {
    console.error('❌ Error running schema:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

runSchema();