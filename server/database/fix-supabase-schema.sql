-- Fix Supabase Schema to Match Garage360 Application
-- Run this in Supabase SQL Editor to update the schema

-- Drop the new tables that don't match (in correct order to handle dependencies)
DROP TABLE IF EXISTS service_request_parts CASCADE;
DROP TABLE IF EXISTS service_request_services CASCADE;
DROP TABLE IF EXISTS service_parts CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS parts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS mechanics CASCADE;
DROP TABLE IF EXISTS managers CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS car_types CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create customers table matching the application
CREATE TABLE customers (
  customer_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  address TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create managers table
CREATE TABLE managers (
  manager_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create mechanics table
CREATE TABLE mechanics (
  mechanic_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  experience_years INTEGER,
  specialization VARCHAR(255),
  available BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create vehicles table
CREATE TABLE vehicles (
  vehicle_id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER,
  fuel_type VARCHAR(20),
  color VARCHAR(50),
  mileage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
  service_id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  base_price DECIMAL(10, 2) NOT NULL,
  estimated_duration INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_requests table
CREATE TABLE service_requests (
  request_id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id) ON DELETE CASCADE,
  vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
  assigned_mechanic INTEGER REFERENCES mechanics(mechanic_id),
  request_date DATE DEFAULT CURRENT_DATE,
  scheduled_date DATE,
  completion_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  customer_notes TEXT,
  mechanic_notes TEXT,
  estimated_cost DECIMAL(10, 2),
  final_cost DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parts table
CREATE TABLE parts (
  id SERIAL PRIMARY KEY,
  part_name VARCHAR(255) NOT NULL,
  part_code VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL,
  current_stock INTEGER DEFAULT 0,
  stock_min INTEGER DEFAULT 10,
  supplier VARCHAR(255),
  description TEXT,
  avg_cost DECIMAL(10, 2),
  last_restocked DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_request_services junction table
CREATE TABLE service_request_services (
  request_id INTEGER REFERENCES service_requests(request_id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(service_id) ON DELETE CASCADE,
  PRIMARY KEY (request_id, service_id)
);

-- Create service_request_parts junction table
CREATE TABLE service_request_parts (
  request_id INTEGER REFERENCES service_requests(request_id) ON DELETE CASCADE,
  part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
  quantity_used INTEGER DEFAULT 1,
  part_cost DECIMAL(10, 2),
  PRIMARY KEY (request_id, part_id)
);

-- Create indexes for performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_managers_email ON managers(email);
CREATE INDEX idx_mechanics_email ON mechanics(email);
CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_service_requests_customer_id ON service_requests(customer_id);
CREATE INDEX idx_service_requests_vehicle_id ON service_requests(vehicle_id);
CREATE INDEX idx_service_requests_mechanic_id ON service_requests(assigned_mechanic);
CREATE INDEX idx_service_requests_status ON service_requests(status);

-- Insert sample services
INSERT INTO services (name, description, category, base_price, estimated_duration, active) VALUES
('Oil Change', 'Standard engine oil change with filter replacement', 'maintenance', 800.00, 30, true),
('Brake Service', 'Complete brake inspection and service', 'maintenance', 2500.00, 90, true),
('AC Service', 'Air conditioning system service and gas refill', 'maintenance', 1500.00, 60, true),
('Full Service', 'Comprehensive vehicle service including all fluids', 'maintenance', 3500.00, 180, true),
('Engine Repair', 'Engine diagnostics and repair', 'repair', 5000.00, 240, true),
('Car Wash', 'Complete exterior and interior cleaning', 'cleaning', 500.00, 45, true),
('Wheel Alignment', 'Computerized wheel alignment', 'maintenance', 1000.00, 45, true),
('Battery Replacement', 'Battery testing and replacement', 'maintenance', 3000.00, 30, true)
ON CONFLICT DO NOTHING;

-- Insert sample parts
INSERT INTO parts (part_name, part_code, category, price, current_stock, stock_min, avg_cost) VALUES
('Engine Oil 5W-30', 'EO-5W30-001', 'Fluids', 450.00, 50, 10, 400.00),
('Air Filter', 'AF-STD-001', 'Filters', 350.00, 30, 5, 300.00),
('Brake Pads', 'BP-FRT-001', 'Brakes', 1800.00, 20, 5, 1600.00),
('Wiper Blades', 'WB-STD-001', 'Accessories', 250.00, 40, 10, 200.00),
('Spark Plugs', 'SP-STD-001', 'Engine', 180.00, 60, 15, 150.00),
('Car Battery', 'BAT-12V-001', 'Electrical', 4500.00, 15, 3, 4000.00)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Schema updated successfully! You can now register and login.' as message;
