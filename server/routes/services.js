const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT service_id, name, description, category, estimated_time, base_price, created_at
      FROM services 
      ORDER BY category, name
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve services',
      error: error.message
    });
  }
});

// Get services by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const result = await query(`
      SELECT service_id, name, description, category, estimated_time, base_price
      FROM services 
      WHERE category = $1
      ORDER BY name
    `, [category]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      category: category
    });
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve services by category',
      error: error.message
    });
  }
});

// Get service categories
router.get('/categories/list', async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT category, COUNT(*) as service_count
      FROM services 
      GROUP BY category
      ORDER BY category
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve service categories',
      error: error.message
    });
  }
});

module.exports = router;