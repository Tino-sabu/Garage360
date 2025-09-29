const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'garage360',
  password: 'Astra1512',
  port: 5432,
});

// GET /api/parts - Get all parts with optional filtering
router.get('/', async (req, res) => {
  try {
    const { category, search, low_stock } = req.query;
    let query = 'SELECT * FROM parts WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    // Filter by category
    if (category) {
      query += ` AND category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    // Search by part name or part code
    if (search) {
      query += ` AND (part_name ILIKE $${paramCount} OR part_code ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    // Filter for low stock items
    if (low_stock === 'true') {
      query += ` AND current_stock <= stock_min`;
    }

    query += ' ORDER BY category, part_name';

    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching parts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parts data',
      error: error.message
    });
  }
});

// GET /api/parts/categories - Get all unique categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM parts ORDER BY category');

    res.json({
      success: true,
      data: result.rows.map(row => row.category)
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// GET /api/parts/low-stock - Get parts with low stock
router.get('/low-stock', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM parts 
      WHERE current_stock <= stock_min 
      ORDER BY current_stock ASC, category, part_name
    `);

    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching low stock parts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock parts',
      error: error.message
    });
  }
});

// GET /api/parts/:id - Get single part by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM parts WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Part not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching part:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching part data',
      error: error.message
    });
  }
});

// PUT /api/parts/:id/stock - Update stock levels (for managers)
router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { current_stock, action } = req.body;

    let query;
    let queryParams;

    if (action === 'set') {
      // Set absolute stock level
      query = `
        UPDATE parts 
        SET current_stock = $1, 
            updated_at = CURRENT_TIMESTAMP,
            last_restocked = CASE WHEN $1 > current_stock THEN CURRENT_DATE ELSE last_restocked END
        WHERE id = $2 
        RETURNING *
      `;
      queryParams = [current_stock, id];
    } else if (action === 'add') {
      // Add to current stock
      query = `
        UPDATE parts 
        SET current_stock = current_stock + $1, 
            updated_at = CURRENT_TIMESTAMP,
            last_restocked = CASE WHEN $1 > 0 THEN CURRENT_DATE ELSE last_restocked END
        WHERE id = $2 
        RETURNING *
      `;
      queryParams = [current_stock, id];
    } else if (action === 'subtract') {
      // Subtract from current stock
      query = `
        UPDATE parts 
        SET current_stock = GREATEST(current_stock - $1, 0), 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 
        RETURNING *
      `;
      queryParams = [current_stock, id];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "set", "add", or "subtract"'
      });
    }

    const result = await pool.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Part not found'
      });
    }

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: error.message
    });
  }
});

// GET /api/parts/stats/overview - Get parts statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_parts,
        COUNT(*) FILTER (WHERE current_stock <= stock_min) as low_stock_count,
        COUNT(*) FILTER (WHERE current_stock = 0) as out_of_stock_count,
        COUNT(DISTINCT category) as total_categories,
        SUM(current_stock * avg_cost) as total_inventory_value
      FROM parts
    `);

    const categoryStats = await pool.query(`
      SELECT 
        category,
        COUNT(*) as part_count,
        SUM(current_stock * avg_cost) as category_value
      FROM parts 
      GROUP BY category 
      ORDER BY category_value DESC
    `);

    res.json({
      success: true,
      data: {
        overview: stats.rows[0],
        by_category: categoryStats.rows
      }
    });
  } catch (error) {
    console.error('Error fetching parts stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parts statistics',
      error: error.message
    });
  }
});

module.exports = router;