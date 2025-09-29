const express = require('express');
const db = require('../config/database');
const router = express.Router();

// GET /api/customers - Get all customers
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
      SELECT customer_id, name, email, phone, address, 
             email_verified, phone_verified, created_at, last_login
      FROM customers 
      WHERE 1=1
    `;
        const queryParams = [];
        let paramCount = 1;

        // Search filter
        if (search) {
            query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.pool.query(query, queryParams);

        // Transform data to match frontend expectations
        const transformedData = result.rows.map(customer => ({
            ...customer,
            id: customer.customer_id
        }));

        res.json({
            success: true,
            data: transformedData,
            total: transformedData.length
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message
        });
    }
});

// GET /api/customers/:id - Get single customer
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.pool.query(`
      SELECT customer_id, name, email, phone, address, is_active, 
             email_verified, phone_verified, created_at, last_login
      FROM customers 
      WHERE customer_id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer',
            error: error.message
        });
    }
});

// PUT /api/customers/:id/status - Update customer status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const result = await db.pool.query(`
      UPDATE customers 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $2 
      RETURNING customer_id, name, is_active
    `, [is_active, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            message: 'Customer status updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating customer status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating customer status',
            error: error.message
        });
    }
});

// GET /api/customers/stats - Get customer statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const statsQuery = `
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_customers,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_customers,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_this_month
      FROM customers
    `;

        const result = await db.pool.query(statsQuery);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer statistics',
            error: error.message
        });
    }
});

module.exports = router;