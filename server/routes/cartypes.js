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

// GET /api/cartypes - Get all car types
router.get('/', async (req, res) => {
    try {
        const { brand, body_type, search } = req.query;
        let query = `
            SELECT cartype_id, brand, model, body_type, 
                   created_at, updated_at
            FROM cartypes 
            WHERE 1=1
        `;
        const queryParams = [];
        let paramCount = 1;

        // Filter by brand
        if (brand) {
            query += ` AND brand = $${paramCount}`;
            queryParams.push(brand);
            paramCount++;
        }

        // Filter by body type
        if (body_type) {
            query += ` AND body_type = $${paramCount}`;
            queryParams.push(body_type);
            paramCount++;
        }

        // Search filter
        if (search) {
            query += ` AND (brand ILIKE $${paramCount} OR model ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
            paramCount++;
        }

        query += ' ORDER BY brand, model';

        const result = await pool.query(query, queryParams);

        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching car types:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching car types',
            error: error.message
        });
    }
});

// GET /api/cartypes/brands - Get unique brands
router.get('/brands', async (req, res) => {
    try {
        const query = 'SELECT DISTINCT brand FROM cartypes ORDER BY brand';
        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows.map(row => row.brand)
        });
    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching brands',
            error: error.message
        });
    }
});

// GET /api/cartypes/body-types - Get unique body types
router.get('/body-types', async (req, res) => {
    try {
        const query = 'SELECT DISTINCT body_type FROM cartypes ORDER BY body_type';
        const result = await pool.query(query);

        res.json({
            success: true,
            data: result.rows.map(row => row.body_type)
        });
    } catch (error) {
        console.error('Error fetching body types:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching body types',
            error: error.message
        });
    }
});

// GET /api/cartypes/:id - Get specific car type
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM cartypes WHERE cartype_id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Car type not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching car type:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching car type',
            error: error.message
        });
    }
});

module.exports = router;