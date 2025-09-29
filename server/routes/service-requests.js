const express = require('express');
const { query } = require('../config/database');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

// Create a new service request
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            vehicle_id,
            service_id,
            scheduled_date,
            customer_notes,
            estimated_cost
        } = req.body;

        // Validate required fields
        if (!vehicle_id || !service_id || !scheduled_date) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle ID, Service ID, and scheduled date are required'
            });
        }

        // Get customer ID from token
        const customer_id = req.user.userId;

        // Verify the vehicle belongs to the customer
        const vehicleCheck = await query(
            'SELECT customer_id FROM vehicles WHERE vehicle_id = $1',
            [vehicle_id]
        );

        if (vehicleCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (vehicleCheck.rows[0].customer_id !== customer_id) {
            return res.status(403).json({
                success: false,
                message: 'You can only book services for your own vehicles'
            });
        }

        // Verify the service exists
        const serviceCheck = await query(
            'SELECT service_id, name, base_price FROM services WHERE service_id = $1',
            [service_id]
        );

        if (serviceCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service not found or inactive'
            });
        }

        // Create the service request
        const result = await query(`
      INSERT INTO service_requests (
        customer_id, 
        vehicle_id, 
        scheduled_date, 
        status, 
        customer_notes, 
        estimated_cost
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING request_id, customer_id, vehicle_id, scheduled_date, status, customer_notes, estimated_cost, created_at
    `, [
            customer_id,
            vehicle_id,
            scheduled_date,
            'pending',
            customer_notes || null,
            estimated_cost || serviceCheck.rows[0].base_price
        ]);

        // Also create an entry in service_request_services table to link the specific service
        await query(`
      INSERT INTO service_request_services (request_id, service_id)
      VALUES ($1, $2)
    `, [result.rows[0].request_id, service_id]);

        res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            data: {
                ...result.rows[0],
                service: serviceCheck.rows[0]
            }
        });

    } catch (error) {
        console.error('Create service request error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create service request',
            error: error.message
        });
    }
});

// Get service requests for a customer
router.get('/customer', authenticateToken, async (req, res) => {
    try {
        const customer_id = req.user.userId;

        const result = await query(`
      SELECT 
        sr.request_id,
        sr.customer_id,
        sr.vehicle_id,
        sr.request_date,
        sr.scheduled_date,
        sr.completion_date,
        sr.status,
        sr.customer_notes,
        sr.mechanic_notes,
        sr.estimated_cost,
        sr.final_cost,
        v.registration_number,
        v.brand,
        v.model,
        v.year,
        c.name as customer_name,
        m.name as mechanic_name,
        s.name as service_name,
        s.description as service_description,
        s.category as service_category
      FROM service_requests sr
      LEFT JOIN vehicles v ON sr.vehicle_id = v.vehicle_id
      LEFT JOIN customers c ON sr.customer_id = c.customer_id
      LEFT JOIN mechanics m ON sr.assigned_mechanic = m.mechanic_id
      LEFT JOIN service_request_services srs ON sr.request_id = srs.request_id
      LEFT JOIN services s ON srs.service_id = s.service_id
      WHERE sr.customer_id = $1
      ORDER BY sr.created_at DESC
    `, [customer_id]);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Get customer service requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve service requests',
            error: error.message
        });
    }
});

// Get all service requests (for managers)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        // Check if user is a manager (you might want to add role-based authentication)
        const result = await query(`
      SELECT 
        sr.request_id,
        sr.customer_id,
        sr.vehicle_id,
        sr.request_date,
        sr.scheduled_date,
        sr.completion_date,
        sr.status,
        sr.customer_notes,
        sr.mechanic_notes,
        sr.estimated_cost,
        sr.final_cost,
        sr.assigned_mechanic,
        v.registration_number,
        v.brand,
        v.model,
        v.year,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        m.name as mechanic_name,
        s.name as service_name,
        s.description as service_description,
        s.category as service_category
      FROM service_requests sr
      LEFT JOIN vehicles v ON sr.vehicle_id = v.vehicle_id
      LEFT JOIN customers c ON sr.customer_id = c.customer_id
      LEFT JOIN mechanics m ON sr.assigned_mechanic = m.mechanic_id
      LEFT JOIN service_request_services srs ON sr.request_id = srs.request_id
      LEFT JOIN services s ON srs.service_id = s.service_id
      ORDER BY sr.created_at DESC
    `);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });

    } catch (error) {
        console.error('Get all service requests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve service requests',
            error: error.message
        });
    }
});

// Assign mechanic to service request (for managers)
router.patch('/:requestId/assign', authenticateToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { mechanic_id } = req.body;

        if (!mechanic_id) {
            return res.status(400).json({
                success: false,
                message: 'Mechanic ID is required'
            });
        }

        // Verify mechanic exists
        const mechanicCheck = await query(
            'SELECT mechanic_id, name FROM mechanics WHERE mechanic_id = $1',
            [mechanic_id]
        );

        if (mechanicCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mechanic not found'
            });
        }

        // Update service request
        const result = await query(`
      UPDATE service_requests 
      SET assigned_mechanic = $1, status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE request_id = $3
      RETURNING request_id, assigned_mechanic, status
    `, [mechanic_id, 'in-progress', requestId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        res.json({
            success: true,
            message: 'Mechanic assigned successfully',
            data: {
                ...result.rows[0],
                mechanic_name: mechanicCheck.rows[0].name
            }
        });

    } catch (error) {
        console.error('Assign mechanic error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign mechanic',
            error: error.message
        });
    }
});

// Update service request status
router.patch('/:requestId/status', authenticateToken, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, mechanic_notes, final_cost } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
        const values = [status];
        let paramCount = 1;

        if (mechanic_notes !== undefined) {
            paramCount++;
            updateFields.push(`mechanic_notes = $${paramCount}`);
            values.push(mechanic_notes);
        }

        if (final_cost !== undefined) {
            paramCount++;
            updateFields.push(`final_cost = $${paramCount}`);
            values.push(final_cost);
        }

        if (status === 'completed') {
            paramCount++;
            updateFields.push(`completion_date = $${paramCount}`);
            values.push(new Date());
        }

        paramCount++;
        values.push(requestId);

        const result = await query(`
      UPDATE service_requests 
      SET ${updateFields.join(', ')}
      WHERE request_id = $${paramCount}
      RETURNING *
    `, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service request not found'
            });
        }

        res.json({
            success: true,
            message: 'Service request updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Update service request status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update service request',
            error: error.message
        });
    }
});

module.exports = router;