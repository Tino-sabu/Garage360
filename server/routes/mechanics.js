const express = require('express');
const db = require('../config/database');
const router = express.Router();

// GET /api/mechanics - Get all mechanics
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let query = `
      SELECT mechanic_id, name, email, phone, employee_id, specializations, 
             experience_years, hourly_rate, email_verified, phone_verified, 
             created_at, last_login
      FROM mechanics 
      WHERE 1=1
    `;
        const queryParams = [];
        let paramCount = 1;

        // Search filter
        if (search) {
            query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR phone ILIKE $${paramCount} OR employee_id ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.pool.query(query, queryParams);

        // Transform data to match frontend expectations
        const transformedData = result.rows.map(mechanic => ({
            ...mechanic,
            id: mechanic.mechanic_id,
            specialization: mechanic.specializations, // Also map specializations to specialization for consistency
            hire_date: mechanic.created_at
        }));

        res.json({
            success: true,
            data: transformedData,
            total: transformedData.length
        });
    } catch (error) {
        console.error('Error fetching mechanics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mechanics',
            error: error.message
        });
    }
});

// GET /api/mechanics/:id - Get single mechanic
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.pool.query(`
      SELECT mechanic_id, name, email, phone, employee_id, specializations, 
             experience_years, is_active, email_verified, phone_verified, 
             created_at, last_login
      FROM mechanics 
      WHERE mechanic_id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mechanic not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching mechanic:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mechanic',
            error: error.message
        });
    }
});

// PUT /api/mechanics/:id/status - Update mechanic status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const result = await db.pool.query(`
      UPDATE mechanics 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE mechanic_id = $2 
      RETURNING mechanic_id, name, is_active
    `, [is_active, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mechanic not found'
            });
        }

        res.json({
            success: true,
            message: 'Mechanic status updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating mechanic status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating mechanic status',
            error: error.message
        });
    }
});

// GET /api/mechanics/stats - Get mechanic statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const statsQuery = `
      SELECT 
        COUNT(*) as total_mechanics,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_mechanics,
        AVG(experience_years) as avg_experience,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_this_month
      FROM mechanics
    `;

        const result = await db.pool.query(statsQuery);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching mechanic stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching mechanic statistics',
            error: error.message
        });
    }
});

module.exports = router;