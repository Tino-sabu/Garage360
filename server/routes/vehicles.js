const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Get all brands from cartypes
router.get('/brands', async (req, res) => {
    try {
        const result = await query(`
      SELECT DISTINCT brand 
      FROM cartypes 
      ORDER BY brand
    `);

        res.json({
            success: true,
            data: result.rows.map(row => row.brand)
        });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve brands',
            error: error.message
        });
    }
});

// Get models by brand from cartypes
router.get('/brands/:brand/models', async (req, res) => {
    try {
        const { brand } = req.params;
        const result = await query(`
      SELECT model 
      FROM cartypes 
      WHERE brand = $1 
      ORDER BY model
    `, [brand]);

        res.json({
            success: true,
            data: result.rows.map(row => row.model)
        });
    } catch (error) {
        console.error('Get models error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve models',
            error: error.message
        });
    }
});

// Get all vehicles for a customer
router.get('/customer/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const result = await query(`
      SELECT 
        vehicle_id, 
        registration_number, 
        brand, 
        model, 
        year, 
        color, 
        fuel_type,
        vin,
        engine_number,
        chassis_number,
        km_driven,
        last_oil_change,
        created_at
      FROM vehicles 
      WHERE customer_id = $1 
      ORDER BY created_at DESC
    `, [customerId]);

        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Get customer vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve vehicles',
            error: error.message
        });
    }
});

// Add a new vehicle
router.post('/', async (req, res) => {
    try {
        const {
            customer_id,
            registration_number,
            brand,
            model,
            year,
            color,
            fuel_type,
            vin,
            engine_number,
            chassis_number,
            km_driven,
            last_oil_change
        } = req.body;

        // Validate required fields
        if (!customer_id || !registration_number || !brand || !model || !year) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customer_id, registration_number, brand, model, year'
            });
        }

        // Check if registration number already exists
        const existingVehicle = await query(`
      SELECT vehicle_id FROM vehicles WHERE registration_number = $1
    `, [registration_number]);

        if (existingVehicle.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Registration number already exists'
            });
        }

        // Insert new vehicle
        const result = await query(`
      INSERT INTO vehicles (
        customer_id, registration_number, brand, model, year, 
        color, fuel_type, vin, engine_number, chassis_number, km_driven, last_oil_change
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING vehicle_id, registration_number, brand, model, year, color, fuel_type, km_driven, last_oil_change, created_at
    `, [
            customer_id, registration_number, brand, model, year,
            color || null, fuel_type || 'petrol', vin || null,
            engine_number || null, chassis_number || null,
            km_driven ? parseInt(km_driven) : 0, last_oil_change || null
        ]);

        res.status(201).json({
            success: true,
            message: 'Vehicle added successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Add vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add vehicle',
            error: error.message
        });
    }
});

// Update vehicle
router.put('/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const {
            registration_number,
            brand,
            model,
            year,
            color,
            fuel_type,
            vin,
            engine_number,
            chassis_number
        } = req.body;

        // Check if vehicle exists and belongs to the customer
        const existingVehicle = await query(`
      SELECT vehicle_id FROM vehicles WHERE vehicle_id = $1
    `, [vehicleId]);

        if (existingVehicle.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Update vehicle
        const result = await query(`
      UPDATE vehicles 
      SET 
        registration_number = COALESCE($2, registration_number),
        brand = COALESCE($3, brand),
        model = COALESCE($4, model),
        year = COALESCE($5, year),
        color = COALESCE($6, color),
        fuel_type = COALESCE($7, fuel_type),
        vin = COALESCE($8, vin),
        engine_number = COALESCE($9, engine_number),
        chassis_number = COALESCE($10, chassis_number),
        updated_at = CURRENT_TIMESTAMP
      WHERE vehicle_id = $1
      RETURNING vehicle_id, registration_number, brand, model, year, color, fuel_type, updated_at
    `, [
            vehicleId, registration_number, brand, model, year,
            color, fuel_type, vin, engine_number, chassis_number
        ]);

        res.json({
            success: true,
            message: 'Vehicle updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vehicle',
            error: error.message
        });
    }
});

// Delete vehicle
router.delete('/:vehicleId', async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const result = await query(`
      DELETE FROM vehicles 
      WHERE vehicle_id = $1
      RETURNING vehicle_id, registration_number
    `, [vehicleId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.json({
            success: true,
            message: 'Vehicle deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete vehicle',
            error: error.message
        });
    }
});

module.exports = router;