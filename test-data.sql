-- Test data for Garage360 Service Tracking Demo
-- This script adds sample customers, vehicles, mechanics, services, and service requests

-- Add test customer
INSERT INTO customers (name, email, phone, password, email_verified, created_at) 
VALUES ('John Doe', 'john@example.com', '9876543210', '$2b$10$k7C2L5Cr8yJXFp1Uu7uIEOJxAy.b9sTD5xtZ8aG0aQBHDwNbCEImO', true, NOW()) 
ON CONFLICT (email) DO NOTHING;

-- Add test vehicle
INSERT INTO vehicles (customer_id, registration_number, brand, model, year, fuel_type, created_at)
VALUES (
  (SELECT customer_id FROM customers WHERE email = 'john@example.com' LIMIT 1),
  'MH01AB1234', 'Toyota', 'Camry', 2020, 'Petrol', NOW()
) ON CONFLICT (registration_number) DO NOTHING;

-- Add test mechanic
INSERT INTO mechanics (name, email, phone, experience_years, specialization, created_at)
VALUES ('Mike Wilson', 'mike@garage360.com', '9876543211', 5, 'Engine Specialist', NOW())
ON CONFLICT (email) DO NOTHING;

-- Add test services
INSERT INTO services (name, description, category, base_price, estimated_duration, created_at)
VALUES 
  ('Oil Change', 'Complete engine oil change with filter replacement', 'Maintenance', 1500, 60, NOW()),
  ('Brake Service', 'Brake pad replacement and brake system check', 'Repair', 3500, 120, NOW()),
  ('Engine Diagnostic', 'Complete engine diagnostic and troubleshooting', 'Diagnostic', 2000, 90, NOW())
ON CONFLICT (name) DO NOTHING;

-- Add test service requests
INSERT INTO service_requests (
  customer_id, 
  vehicle_id, 
  assigned_mechanic,
  request_date,
  scheduled_date, 
  completion_date,
  status, 
  customer_notes, 
  mechanic_notes,
  estimated_cost,
  final_cost,
  created_at
) VALUES 
-- Completed service with mechanic notes and final cost
(
  (SELECT customer_id FROM customers WHERE email = 'john@example.com' LIMIT 1),
  (SELECT vehicle_id FROM vehicles WHERE registration_number = 'MH01AB1234' LIMIT 1),
  (SELECT mechanic_id FROM mechanics WHERE email = 'mike@garage360.com' LIMIT 1),
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days',
  'completed',
  'Car making strange noise from engine area',
  'Replaced engine oil filter and changed oil. Engine noise was due to old oil. Checked all fluid levels. Vehicle is running smoothly now. Recommended next service in 6 months.',
  1500,
  1650,
  NOW() - INTERVAL '5 days'
),
-- In progress service
(
  (SELECT customer_id FROM customers WHERE email = 'john@example.com' LIMIT 1),
  (SELECT vehicle_id FROM vehicles WHERE registration_number = 'MH01AB1234' LIMIT 1),
  (SELECT mechanic_id FROM mechanics WHERE email = 'mike@garage360.com' LIMIT 1),
  NOW() - INTERVAL '1 day',
  NOW(),
  NULL,
  'in_progress',
  'Brake pedal feels spongy. Need brake check.',
  'Started brake inspection. Found brake pads are worn. Ordering new brake pads. Will complete service tomorrow.',
  3500,
  NULL,
  NOW() - INTERVAL '1 day'
),
-- Pending service
(
  (SELECT customer_id FROM customers WHERE email = 'john@example.com' LIMIT 1),
  (SELECT vehicle_id FROM vehicles WHERE registration_number = 'MH01AB1234' LIMIT 1),
  NULL,
  NOW(),
  NOW() + INTERVAL '2 days',
  NULL,
  'pending',
  'Regular service check and engine diagnostic',
  NULL,
  2000,
  NULL,
  NOW()
)
ON CONFLICT DO NOTHING;

-- Link services to service requests
INSERT INTO service_request_services (request_id, service_id)
SELECT sr.request_id, s.service_id
FROM service_requests sr, services s
WHERE s.name = 'Oil Change' 
  AND sr.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM service_request_services srs 
    WHERE srs.request_id = sr.request_id AND srs.service_id = s.service_id
  )
LIMIT 1;

INSERT INTO service_request_services (request_id, service_id)
SELECT sr.request_id, s.service_id
FROM service_requests sr, services s
WHERE s.name = 'Brake Service' 
  AND sr.status = 'in_progress'
  AND NOT EXISTS (
    SELECT 1 FROM service_request_services srs 
    WHERE srs.request_id = sr.request_id AND srs.service_id = s.service_id
  )
LIMIT 1;

INSERT INTO service_request_services (request_id, service_id)
SELECT sr.request_id, s.service_id
FROM service_requests sr, services s
WHERE s.name = 'Engine Diagnostic' 
  AND sr.status = 'pending'
  AND NOT EXISTS (
    SELECT 1 FROM service_request_services srs 
    WHERE srs.request_id = sr.request_id AND srs.service_id = s.service_id
  )
LIMIT 1;

-- Display the test data
SELECT 'Test Data Summary:' as info;
SELECT COUNT(*) as total_customers FROM customers WHERE email = 'john@example.com';
SELECT COUNT(*) as total_vehicles FROM vehicles WHERE registration_number = 'MH01AB1234';
SELECT COUNT(*) as total_mechanics FROM mechanics WHERE email = 'mike@garage360.com';
SELECT COUNT(*) as total_services FROM services;
SELECT COUNT(*) as total_service_requests FROM service_requests 
  WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'john@example.com' LIMIT 1);