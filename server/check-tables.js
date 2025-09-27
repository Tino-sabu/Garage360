const { query } = require('./config/database');

async function checkTables() {
  try {
    console.log('🔍 Checking all tables in the database...\n');
    
    // Get all tables
    const result = await query(`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📋 All tables found:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
    console.log(`\n📊 Total tables: ${result.rows.length}\n`);
    
    // Check specifically for our user tables
    console.log('👥 Checking user management tables:');
    
    const userTables = ['customers', 'managers', 'mechanics'];
    for (const tableName of userTables) {
      try {
        const tableCheck = await query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_name = $1 AND table_schema = 'public'
        `, [tableName]);
        
        if (tableCheck.rows[0].count > 0) {
          // Table exists, get row count
          const rowCount = await query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`✅ ${tableName}: exists (${rowCount.rows[0].count} rows)`);
          
          // Show sample data
          const sampleData = await query(`SELECT * FROM ${tableName} LIMIT 3`);
          if (sampleData.rows.length > 0) {
            console.log(`   Sample data:`, sampleData.rows[0]);
          }
        } else {
          console.log(`❌ ${tableName}: NOT FOUND`);
        }
      } catch (error) {
        console.log(`❌ ${tableName}: ERROR - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
  
  process.exit(0);
}

checkTables();