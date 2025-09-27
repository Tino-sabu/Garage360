-- Sample seed data for Garage360 system
-- Run this after the main schema is created

-- Additional test users (passwords are hashed versions of 'password123')
INSERT INTO users (name, email, phone, role, password_hash, is_active, email_verified) VALUES
('John Doe', 'john.doe@email.com', '+1234567891', 'customer', 
 '$2b$10$rQfZg7.kF9K8NfRvN8xEH.L5Q6L4H8Q6K8xJrN9F7K8Q6L4H8xEH', true, true),
('Jane Smith', 'jane.smith@email.com', '+1234567892', 'customer', 
 '$2b$10$rQfZg7.kF9K8NfRvN8xEH.L5Q6L4H8Q6K8xJrN9F7K8Q6L4H8xEH', true, true),
('Mike Johnson', 'mike.johnson@garage360.com', '+1234567893', 'mechanic', 
 '$2b$10$rQfZg7.kF9K8NfRvN8xEH.L5Q6L4H8Q6K8xJrN9F7K8Q6L4H8xEH', true, true),
('Sarah Wilson', 'sarah.wilson@garage360.com', '+1234567894', 'manager', 
 '$2b$10$rQfZg7.kF9K8NfRvN8xEH.L5Q6L4H8Q6K8xJrN9F7K8Q6L4H8xEH', true, true);

-- Sample vehicles for test customers
INSERT INTO vehicles (user_id, registration_number, brand, model, year, color, fuel_type) VALUES
((SELECT user_id FROM users WHERE email = 'john.doe@email.com'), 'ABC-123', 'Toyota', 'Camry', 2020, 'White', 'petrol'),
((SELECT user_id FROM users WHERE email = 'john.doe@email.com'), 'DEF-456', 'Honda', 'Civic', 2019, 'Blue', 'petrol'),
((SELECT user_id FROM users WHERE email = 'jane.smith@email.com'), 'GHI-789', 'BMW', 'X5', 2021, 'Black', 'diesel'),
((SELECT user_id FROM users WHERE email = 'jane.smith@email.com'), 'JKL-012', 'Ford', 'F-150', 2018, 'Red', 'petrol');

-- Sample service requests
INSERT INTO service_requests (user_id, vehicle_id, scheduled_date, status, assigned_mechanic, customer_notes, estimated_cost) VALUES
(
    (SELECT user_id FROM users WHERE email = 'john.doe@email.com'),
    (SELECT vehicle_id FROM vehicles WHERE registration_number = 'ABC-123'),
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    'pending',
    (SELECT user_id FROM users WHERE email = 'mike.johnson@garage360.com'),
    'Need urgent oil change before long trip',
    75.00
),
(
    (SELECT user_id FROM users WHERE email = 'jane.smith@email.com'),
    (SELECT vehicle_id FROM vehicles WHERE registration_number = 'GHI-789'),
    CURRENT_TIMESTAMP + INTERVAL '1 week',
    'scheduled',
    (SELECT user_id FROM users WHERE email = 'mike.johnson@garage360.com'),
    'Brake pads feel soft, please check',
    200.00
);

-- Sample service request details
INSERT INTO service_request_details (request_id, service_id, quantity, unit_price) VALUES
(
    (SELECT request_id FROM service_requests WHERE estimated_cost = 75.00 LIMIT 1),
    (SELECT service_id FROM services WHERE name = 'Oil Change'),
    1,
    45.00
),
(
    (SELECT request_id FROM service_requests WHERE estimated_cost = 75.00 LIMIT 1),
    (SELECT service_id FROM services WHERE name = 'Battery Check'),
    1,
    20.00
),
(
    (SELECT request_id FROM service_requests WHERE estimated_cost = 200.00 LIMIT 1),
    (SELECT service_id FROM services WHERE name = 'Brake Inspection'),
    1,
    60.00
),
(
    (SELECT request_id FROM service_requests WHERE estimated_cost = 200.00 LIMIT 1),
    (SELECT service_id FROM services WHERE name = 'Full Service'),
    1,
    150.00
);

-- Additional parts inventory
INSERT INTO parts (name, part_number, category, brand, stock_qty, unit_price, cost_price, minimum_stock_level) VALUES
('Brake Fluid (DOT 4)', 'BF-DOT4-1L', 'brake', 'Castrol', 30, 18.00, 12.00, 8),
('Coolant (Green)', 'CL-GREEN-5L', 'engine', 'Prestone', 20, 22.00, 16.00, 5),
('Transmission Fluid', 'TF-ATF-4L', 'transmission', 'Valvoline', 15, 35.00, 25.00, 3),
('Windshield Wipers', 'WW-24INCH', 'exterior', 'Bosch', 25, 28.00, 20.00, 6),
('Headlight Bulb (H7)', 'HB-H7', 'electrical', 'Philips', 18, 15.00, 10.00, 5),
('Cabin Air Filter', 'CAF-STANDARD', 'interior', 'Mann Filter', 22, 20.00, 14.00, 4);

-- Sample completed service (for testing financial reports)
INSERT INTO service_requests (user_id, vehicle_id, request_date, scheduled_date, completion_date, status, assigned_mechanic, final_cost) VALUES
(
    (SELECT user_id FROM users WHERE email = 'john.doe@email.com'),
    (SELECT vehicle_id FROM vehicles WHERE registration_number = 'DEF-456'),
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'completed',
    (SELECT user_id FROM users WHERE email = 'mike.johnson@garage360.com'),
    95.00
);

-- Create invoice for completed service
INSERT INTO invoices (request_id, subtotal, tax_rate, discount_amount, payment_status, due_date) VALUES
(
    (SELECT request_id FROM service_requests WHERE final_cost = 95.00),
    95.00,
    8.5,
    0.00,
    'paid',
    CURRENT_DATE + INTERVAL '30 days'
);

-- Create payment record
INSERT INTO payments (invoice_id, amount, payment_method, transaction_reference, status, payment_date) VALUES
(
    (SELECT invoice_id FROM invoices WHERE subtotal = 95.00),
    103.08, -- Including tax
    'card',
    'TXN-' || EXTRACT(epoch FROM CURRENT_TIMESTAMP)::text,
    'paid',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
);