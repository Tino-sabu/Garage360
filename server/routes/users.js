const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get all users (with basic info only for security)
router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT user_id, name, email, phone, role, is_active, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
});

// Get dashboard statistics for manager
router.get('/stats', async (req, res) => {
  try {
    // Get total customers from customers table
    const customersResult = await query(`
      SELECT COUNT(*) as total 
      FROM customers
    `);

    // Get total mechanics from mechanics table
    const mechanicsResult = await query(`
      SELECT COUNT(*) as total 
      FROM mechanics
    `);

    // Get total vehicles (from cartypes table as a proxy for available vehicle services)
    const vehiclesResult = await query(`
      SELECT COUNT(*) as total 
      FROM cartypes
    `);

    const stats = {
      totalCustomers: parseInt(customersResult.rows[0].total),
      totalMechanics: parseInt(mechanicsResult.rows[0].total),
      totalVehicles: parseInt(vehiclesResult.rows[0].total)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT user_id, name, email, phone, role, is_active, email_verified, phone_verified, created_at, last_login
      FROM users 
      WHERE user_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error.message
    });
  }
});

// Get users by role
router.get('/role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['customer', 'admin', 'mechanic', 'manager'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Valid roles: ' + validRoles.join(', ')
      });
    }

    const result = await query(`
      SELECT user_id, name, email, phone, role, is_active, created_at 
      FROM users 
      WHERE role = $1 
      ORDER BY name
    `, [role]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      role: role
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users by role',
      error: error.message
    });
  }
});

module.exports = router;