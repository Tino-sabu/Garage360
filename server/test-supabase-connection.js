/**
 * Supabase Connection Test Script
 * Run this to verify your Supabase setup is working correctly
 * Usage: node test-supabase-connection.js
 */

require('dotenv').config();
const { pool, testConnection, checkTablesExist, supabase } = require('./config/database');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

async function testSupabaseConnection() {
    log('\n========================================', colors.cyan);
    log('🔧 Garage360 - Supabase Connection Test', colors.bright);
    log('========================================\n', colors.cyan);

    // Check environment variables
    log('1️⃣  Checking Environment Variables...', colors.bright);

    const requiredVars = {
        'SUPABASE_URL': process.env.SUPABASE_URL,
        'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
        'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY,
        'SUPABASE_DB_URL': process.env.SUPABASE_DB_URL,
    };

    let allVarsPresent = true;
    for (const [key, value] of Object.entries(requiredVars)) {
        if (value) {
            log(`   ✅ ${key}: Set`, colors.green);
        } else {
            log(`   ❌ ${key}: Missing`, colors.red);
            allVarsPresent = false;
        }
    }

    if (!allVarsPresent) {
        log('\n⚠️  Warning: Some Supabase environment variables are missing.', colors.yellow);
        log('   You can still use local PostgreSQL, but Supabase features won\'t work.', colors.yellow);
        log('   See SUPABASE_SETUP.md for configuration instructions.\n', colors.yellow);
    }

    // Test Supabase client
    log('\n2️⃣  Testing Supabase Client...', colors.bright);
    if (supabase) {
        log('   ✅ Supabase client initialized', colors.green);
        log('   ✅ Ready for authentication and realtime features', colors.green);
    } else {
        log('   ❌ Supabase client not initialized', colors.red);
        log('   → Check your SUPABASE_URL and API keys', colors.yellow);
    }    // Test database connection
    log('\n3️⃣  Testing Database Connection...', colors.bright);
    const dbConnected = await testConnection();

    if (!dbConnected) {
        log('\n❌ Database connection failed!', colors.red);
        log('   Please check your database credentials and ensure:', colors.yellow);
        log('   1. Supabase project is active and accessible', colors.yellow);
        log('   2. SUPABASE_DB_URL is correct', colors.yellow);
        log('   3. Database password is correct (check for special characters)', colors.yellow);
        log('   4. Your IP is allowed in Supabase network restrictions\n', colors.yellow);
        process.exit(1);
    }

    // Check tables
    log('\n4️⃣  Checking Database Tables...', colors.bright);
    const tablesExist = await checkTablesExist();

    if (!tablesExist) {
        log('\n⚠️  Some tables are missing!', colors.yellow);
        log('   Please run the SQL schema in Supabase SQL Editor:', colors.yellow);
        log('   → Open: server/database/supabase-schema.sql', colors.cyan);
        log('   → Go to: Supabase Dashboard > SQL Editor', colors.cyan);
        log('   → Paste and run the entire SQL file\n', colors.cyan);
    }

    // Test a simple query
    log('\n5️⃣  Testing Database Query...', colors.bright);
    try {
        const result = await pool.query(`
      SELECT 
        schemaname,
        tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

        if (result.rows.length > 0) {
            log(`   ✅ Found ${result.rows.length} tables in public schema:`, colors.green);
            result.rows.forEach(row => {
                log(`      • ${row.tablename}`, colors.cyan);
            });
        } else {
            log('   ⚠️  No tables found in public schema', colors.yellow);
        }
    } catch (err) {
        log(`   ❌ Query test failed: ${err.message}`, colors.red);
    }

    // Summary
    log('\n========================================', colors.cyan);
    log('📊 Connection Test Summary', colors.bright);
    log('========================================', colors.cyan);

    if (dbConnected && tablesExist) {
        log('✅ All checks passed! Your Supabase setup is ready.', colors.green);
        log('\nYou can now start the server:', colors.cyan);
        log('   npm run dev\n', colors.bright);
    } else if (dbConnected) {
        log('⚠️  Database connected but tables missing.', colors.yellow);
        log('   Run the SQL schema in Supabase SQL Editor.\n', colors.yellow);
    } else {
        log('❌ Connection test failed.', colors.red);
        log('   Check your configuration and try again.\n', colors.red);
    }

    // Close pool
    await pool.end();
}

// Run the test
testSupabaseConnection().catch(err => {
    log(`\n❌ Fatal error: ${err.message}`, colors.red);
    console.error(err);
    process.exit(1);
});
