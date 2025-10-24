-- =====================================================
-- Garage360 - Supabase Database Schema
-- =====================================================
-- Run this in Supabase SQL Editor to set up your database
-- Dashboard -> SQL Editor -> New Query -> Paste and Run

-- =====================================================
-- 1. ENABLE UUID EXTENSION
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Users table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'mechanic', 'manager', 'admin')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mechanics table
CREATE TABLE IF NOT EXISTS mechanics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  specialization VARCHAR(255),
  experience_years INTEGER,
  certification VARCHAR(255),
  hourly_rate DECIMAL(10, 2),
  availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_jobs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Managers table
CREATE TABLE IF NOT EXISTS managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  department VARCHAR(100),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Car Types table
CREATE TABLE IF NOT EXISTS car_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) CHECK (category IN ('sedan', 'suv', 'hatchback', 'luxury', 'sports', 'ev')),
  description TEXT,
  image_url VARCHAR(500),
  base_service_rate DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  car_type_id UUID REFERENCES car_types(id),
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  vin VARCHAR(50) UNIQUE,
  color VARCHAR(50),
  fuel_type VARCHAR(20) CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid', 'cng')),
  mileage INTEGER,
  last_service_date DATE,
  next_service_date DATE,
  insurance_expiry DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) CHECK (category IN ('maintenance', 'repair', 'inspection', 'cleaning', 'custom')),
  base_price DECIMAL(10, 2) NOT NULL,
  estimated_duration INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  requirements JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  mechanic_id UUID REFERENCES mechanics(id),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  estimated_cost DECIMAL(10, 2),
  final_cost DECIMAL(10, 2),
  notes TEXT,
  customer_notes TEXT,
  mechanic_notes TEXT,
  parts_used JSONB DEFAULT '[]',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parts table
CREATE TABLE IF NOT EXISTS parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  part_number VARCHAR(100) UNIQUE,
  category VARCHAR(100),
  description TEXT,
  manufacturer VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 10,
  compatible_vehicles JSONB DEFAULT '[]',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Parts junction table
CREATE TABLE IF NOT EXISTS service_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_request_id UUID REFERENCES service_requests(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_id ON users(auth_user_id);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_mechanics_user_id ON mechanics(user_id);
CREATE INDEX idx_managers_user_id ON managers(user_id);

CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);

CREATE INDEX idx_service_requests_customer_id ON service_requests(customer_id);
CREATE INDEX idx_service_requests_vehicle_id ON service_requests(vehicle_id);
CREATE INDEX idx_service_requests_mechanic_id ON service_requests(mechanic_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_scheduled_date ON service_requests(scheduled_date);

CREATE INDEX idx_parts_part_number ON parts(part_number);
CREATE INDEX idx_parts_category ON parts(category);

-- =====================================================
-- 4. CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mechanics_updated_at BEFORE UPDATE ON mechanics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_managers_updated_at BEFORE UPDATE ON managers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Service role can do everything (for backend API)
CREATE POLICY "Service role has full access" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access" ON customers
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access" ON mechanics
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access" ON managers
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access" ON vehicles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access" ON services
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access" ON service_requests
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access" ON parts
    FOR ALL USING (auth.role() = 'service_role');

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Customers can read their own data
CREATE POLICY "Customers can read own data" ON customers
    FOR SELECT USING (
        auth.uid() IN (
            SELECT auth_user_id FROM users WHERE id = customers.user_id
        )
    );

-- Customers can read their own vehicles
CREATE POLICY "Customers can read own vehicles" ON vehicles
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE user_id IN (
                SELECT id FROM users WHERE auth_user_id = auth.uid()
            )
        )
    );

-- Everyone can read services (public)
CREATE POLICY "Services are publicly readable" ON services
    FOR SELECT USING (is_active = true);

-- Everyone can read car types (public)
CREATE POLICY "Car types are publicly readable" ON car_types
    FOR SELECT USING (true);

-- =====================================================
-- 7. INSERT SAMPLE DATA (Optional)
-- =====================================================

-- Sample Car Types
INSERT INTO car_types (name, category, description, base_service_rate) VALUES
('Toyota Corolla', 'sedan', 'Popular sedan with excellent reliability', 1500.00),
('Honda CR-V', 'suv', 'Versatile compact SUV', 1800.00),
('Maruti Swift', 'hatchback', 'Fuel-efficient hatchback', 1200.00),
('BMW 3 Series', 'luxury', 'Premium luxury sedan', 3000.00),
('Tesla Model 3', 'ev', 'Electric vehicle with advanced features', 2500.00)
ON CONFLICT DO NOTHING;

-- Sample Services
INSERT INTO services (name, description, category, base_price, estimated_duration, is_active) VALUES
('Oil Change', 'Standard engine oil change with filter replacement', 'maintenance', 800.00, 30, true),
('Brake Service', 'Complete brake inspection and service', 'maintenance', 2500.00, 90, true),
('AC Service', 'Air conditioning system service and gas refill', 'maintenance', 1500.00, 60, true),
('Full Service', 'Comprehensive vehicle service including all fluids', 'maintenance', 3500.00, 180, true),
('Engine Repair', 'Engine diagnostics and repair', 'repair', 5000.00, 240, true),
('Car Wash', 'Complete exterior and interior cleaning', 'cleaning', 500.00, 45, true),
('Wheel Alignment', 'Computerized wheel alignment', 'maintenance', 1000.00, 45, true),
('Battery Replacement', 'Battery testing and replacement', 'maintenance', 3000.00, 30, true)
ON CONFLICT DO NOTHING;

-- Sample Parts
INSERT INTO parts (name, part_number, category, manufacturer, price, stock_quantity, min_stock_level) VALUES
('Engine Oil 5W-30', 'EO-5W30-001', 'Fluids', 'Castrol', 450.00, 50, 10),
('Air Filter', 'AF-STD-001', 'Filters', 'Bosch', 350.00, 30, 5),
('Brake Pads', 'BP-FRT-001', 'Brakes', 'Brembo', 1800.00, 20, 5),
('Wiper Blades', 'WB-STD-001', 'Accessories', 'Bosch', 250.00, 40, 10),
('Spark Plugs', 'SP-STD-001', 'Engine', 'NGK', 180.00, 60, 15),
('Car Battery', 'BAT-12V-001', 'Electrical', 'Amaron', 4500.00, 15, 3)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. CREATE VIEWS FOR COMMON QUERIES (Optional)
-- =====================================================

-- View for customer with user details
CREATE OR REPLACE VIEW customer_details AS
SELECT 
    c.id,
    u.full_name,
    u.email,
    u.phone,
    c.address,
    c.city,
    c.state,
    c.pincode,
    u.created_at
FROM customers c
JOIN users u ON c.user_id = u.id;

-- View for mechanic with user details
CREATE OR REPLACE VIEW mechanic_details AS
SELECT 
    m.id,
    u.full_name,
    u.email,
    u.phone,
    m.specialization,
    m.experience_years,
    m.hourly_rate,
    m.availability_status,
    m.rating,
    m.total_jobs
FROM mechanics m
JOIN users u ON m.user_id = u.id;

-- View for service requests with full details
CREATE OR REPLACE VIEW service_request_details AS
SELECT 
    sr.id,
    sr.status,
    sr.priority,
    sr.scheduled_date,
    cu.full_name as customer_name,
    v.make || ' ' || v.model as vehicle,
    v.registration_number,
    s.name as service_name,
    mu.full_name as mechanic_name,
    sr.estimated_cost,
    sr.final_cost,
    sr.created_at
FROM service_requests sr
LEFT JOIN customers c ON sr.customer_id = c.id
LEFT JOIN users cu ON c.user_id = cu.id
LEFT JOIN vehicles v ON sr.vehicle_id = v.id
LEFT JOIN services s ON sr.service_id = s.id
LEFT JOIN mechanics m ON sr.mechanic_id = m.id
LEFT JOIN users mu ON m.user_id = mu.id;

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- Your database is now ready for Garage360!
-- 
-- Next steps:
-- 1. Test the connection from your backend
-- 2. Set up additional RLS policies as needed
-- 3. Configure Supabase Auth for user registration/login
-- 4. Set up real-time subscriptions if needed
-- 
-- Run in your terminal:
-- npm run dev
-- 
-- Check health endpoint:
-- http://localhost:5000/api/health
