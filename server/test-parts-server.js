const express = require('express');
const { Pool } = require('pg');

// Create a test server to verify parts API
const app = express();
app.use(express.json());

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'garage360',
  password: 'admin',
  port: 5432,
});

// Test parts endpoint
app.get('/test-parts', async (req, res) => {
  try {
    console.log('🧪 Testing parts API...');
    
    // Get parts count
    const countResult = await pool.query('SELECT COUNT(*) as total FROM parts');
    const total = parseInt(countResult.rows[0].total);
    
    // Get sample parts
    const partsResult = await pool.query(`
      SELECT id, part_name, part_code, category, current_stock, stock_min, avg_cost, stock_unit
      FROM parts 
      ORDER BY category, part_name 
      LIMIT 10
    `);
    
    // Get low stock items
    const lowStockResult = await pool.query(`
      SELECT COUNT(*) as count FROM parts WHERE current_stock <= stock_min
    `);
    
    const response = {
      success: true,
      total: total,
      sampleData: partsResult.rows,
      lowStockCount: parseInt(lowStockResult.rows[0].count)
    };
    
    console.log('✅ Parts API Test Results:');
    console.log('📦 Total Parts:', total);
    console.log('⚠️  Low Stock Items:', response.lowStockCount);
    console.log('📋 Sample Parts (First 3):');
    partsResult.rows.slice(0, 3).forEach(part => {
      console.log(`  - ${part.part_name} (${part.part_code}): ${part.current_stock} ${part.stock_unit}`);
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Error testing parts API:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test stock update
app.put('/test-stock-update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { current_stock, action } = req.body;
    
    console.log(`🧪 Testing stock update for part ${id}: ${action} ${current_stock}`);
    
    let query;
    let queryParams;
    
    if (action === 'set') {
      query = `
        UPDATE parts 
        SET current_stock = $1, 
            updated_at = CURRENT_TIMESTAMP,
            last_restocked = CASE WHEN $1 > current_stock THEN CURRENT_DATE ELSE last_restocked END
        WHERE id = $2 
        RETURNING id, part_name, current_stock, stock_min
      `;
      queryParams = [current_stock, id];
    } else if (action === 'add') {
      query = `
        UPDATE parts 
        SET current_stock = current_stock + $1, 
            updated_at = CURRENT_TIMESTAMP,
            last_restocked = CASE WHEN $1 > 0 THEN CURRENT_DATE ELSE last_restocked END
        WHERE id = $2 
        RETURNING id, part_name, current_stock, stock_min
      `;
      queryParams = [current_stock, id];
    } else if (action === 'subtract') {
      query = `
        UPDATE parts 
        SET current_stock = GREATEST(current_stock - $1, 0), 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 
        RETURNING id, part_name, current_stock, stock_min
      `;
      queryParams = [current_stock, id];
    }
    
    const result = await pool.query(query, queryParams);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Part not found'
      });
    }
    
    const updatedPart = result.rows[0];
    console.log('✅ Stock Updated Successfully:');
    console.log(`  - Part: ${updatedPart.part_name}`);
    console.log(`  - New Stock: ${updatedPart.current_stock}`);
    console.log(`  - Min Stock: ${updatedPart.stock_min}`);
    console.log(`  - Status: ${updatedPart.current_stock <= updatedPart.stock_min ? 'LOW STOCK ⚠️' : 'IN STOCK ✅'}`);
    
    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: updatedPart
    });
    
  } catch (error) {
    console.error('❌ Error updating stock:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`🧪 Parts API Test Server running on http://localhost:${PORT}`);
  console.log(`📋 Test parts data: GET http://localhost:${PORT}/test-parts`);
  console.log(`🔄 Test stock update: PUT http://localhost:${PORT}/test-stock-update/1`);
  console.log('   Body: {"current_stock": 15, "action": "set"}');
});