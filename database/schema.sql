-- Garage360 Database Schema
-- Vehicle Service Management System
-- PostgreSQL Database Schema
-- Target Database: garage360

-- Connect to garage360 database (make sure you're connected to the right database)
-- \c garage360;

-- Enable required PostgreSQL extensions
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- Removed: Using integer IDs instead of UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For password hashing
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- Create custom ENUM types
CREATE TYPE service_status AS ENUM ('pending', 'in-progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'upi', 'online', 'cheque');

-- =============================================================================
-- USER MANAGEMENT TABLES
-- =============================================================================

-- Customers table - Customer information
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Managers table - Manager/Admin information
CREATE TABLE managers (
    manager_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Mechanics table - Mechanic information
CREATE TABLE mechanics (
    mechanic_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    specialization VARCHAR(100),
    experience_years INTEGER DEFAULT 0,
    hourly_rate DECIMAL(8,2),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Set sequences to start from 200
ALTER SEQUENCE customers_customer_id_seq RESTART WITH 200;
ALTER SEQUENCE managers_manager_id_seq RESTART WITH 300;
ALTER SEQUENCE mechanics_mechanic_id_seq RESTART WITH 400;

-- Create indexes for performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_managers_email ON managers(email);
CREATE INDEX idx_managers_employee_id ON managers(employee_id);
CREATE INDEX idx_mechanics_email ON mechanics(email);
CREATE INDEX idx_mechanics_employee_id ON mechanics(employee_id);
CREATE INDEX idx_mechanics_specialization ON mechanics(specialization);

-- =============================================================================
-- VEHICLE MANAGEMENT TABLES
-- =============================================================================

-- Vehicles table - Vehicle information
CREATE TABLE vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(year FROM CURRENT_DATE) + 1),
    vin VARCHAR(17), -- Vehicle Identification Number (optional)
    color VARCHAR(30),
    engine_number VARCHAR(50),
    chassis_number VARCHAR(50),
    fuel_type VARCHAR(20) DEFAULT 'petrol',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_vehicles_brand_model ON vehicles(brand, model);

-- Car Types table - Available car types and models
CREATE TABLE cartypes (
    cartype_id SERIAL PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    body_type VARCHAR(30) CHECK (body_type IN ('sedan', 'hatchback', 'suv', 'crossover', 'coupe', 'convertible', 'wagon', 'pickup', 'van', 'truck')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint on brand and model combination
    UNIQUE(brand, model)
);

-- Create indexes for cartypes
CREATE INDEX idx_cartypes_brand ON cartypes(brand);
CREATE INDEX idx_cartypes_body_type ON cartypes(body_type);

-- =============================================================================
-- SERVICE MANAGEMENT TABLES
-- =============================================================================

-- Services table - Catalog of available services
CREATE TABLE services (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- e.g., 'maintenance', 'repair', 'inspection'
    estimated_time INTEGER NOT NULL, -- in minutes
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);

-- Service Requests table - When a customer books a service
CREATE TABLE service_requests (
    request_id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(customer_id) ON DELETE RESTRICT,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE RESTRICT,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    status service_status NOT NULL DEFAULT 'pending',
    assigned_mechanic INTEGER REFERENCES mechanics(mechanic_id) ON DELETE SET NULL,
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5), -- 1 = low, 5 = urgent
    customer_notes TEXT,
    mechanic_notes TEXT,
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_service_requests_customer_id ON service_requests(customer_id);
CREATE INDEX idx_service_requests_vehicle_id ON service_requests(vehicle_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_assigned_mechanic ON service_requests(assigned_mechanic);
CREATE INDEX idx_service_requests_scheduled_date ON service_requests(scheduled_date);

-- Service Request Details table - Services requested for each booking
CREATE TABLE service_request_details (
    detail_id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES service_requests(request_id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(service_id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_service_request_details_request_id ON service_request_details(request_id);
CREATE INDEX idx_service_request_details_service_id ON service_request_details(service_id);

-- =============================================================================
-- =============================================================================
-- INVENTORY MANAGEMENT TABLES
-- =============================================================================

-- Updated parts table with comprehensive car parts data and stock management
DROP TABLE IF EXISTS parts CASCADE;

CREATE TABLE parts (
    id SERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    part_name VARCHAR(200) NOT NULL,
    part_code VARCHAR(50) UNIQUE NOT NULL,
    avg_cost INTEGER NOT NULL, -- Cost in rupees
    current_stock INTEGER DEFAULT 0,
    normal_stock_holdings INTEGER NOT NULL, -- Standard stock level to maintain
    stock_min INTEGER NOT NULL, -- Minimum threshold
    stock_max INTEGER NOT NULL, -- Maximum capacity
    stock_unit VARCHAR(50) DEFAULT 'pieces',
    supplier VARCHAR(200),
    location VARCHAR(100),
    last_restocked DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for parts table
CREATE INDEX idx_parts_category ON parts(category);
CREATE INDEX idx_parts_current_stock ON parts(current_stock);
CREATE INDEX idx_parts_part_code ON parts(part_code);
CREATE INDEX idx_parts_part_name ON parts(part_name);

-- Service Parts table - Link between service requests and parts used
CREATE TABLE service_parts (
    service_part_id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES service_requests(request_id) ON DELETE CASCADE,
    part_id INTEGER NOT NULL REFERENCES parts(id) ON DELETE RESTRICT,
    quantity_used INTEGER NOT NULL CHECK (quantity_used > 0),
    unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
    total_price INTEGER GENERATED ALWAYS AS (quantity_used * unit_price) STORED,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for service_parts
CREATE INDEX idx_service_parts_request_id ON service_parts(request_id);
CREATE INDEX idx_service_parts_part_id ON service_parts(part_id);

-- Insert comprehensive car parts data
INSERT INTO parts (category, part_name, part_code, avg_cost, current_stock, normal_stock_holdings, stock_min, stock_max, stock_unit, supplier, location) VALUES
-- Engine & Related
('Engine & Related', 'Oil filter', 'OF001', 250, 10, 20, 5, 30, 'pieces', 'AutoParts Ltd', 'Shelf A1'),
('Engine & Related', 'Air filter', 'AF001', 400, 10, 15, 5, 25, 'pieces', 'AutoParts Ltd', 'Shelf A2'),
('Engine & Related', 'Timing belt', 'TB001', 2000, 2, 5, 1, 8, 'pieces', 'BeltCorp', 'Shelf A3'),
('Engine & Related', 'Spark plugs', 'SP001', 150, 20, 50, 10, 80, 'pieces', 'SparkMax', 'Shelf A4'),

-- Transmission
('Transmission', 'Clutch plates (set)', 'CP001', 3000, 2, 3, 1, 5, 'sets', 'TransParts', 'Shelf B1'),
('Transmission', 'Gear oil (per L)', 'GO001', 500, 30, 50, 15, 80, 'liters', 'OilSupply Co', 'Storage C1'),

-- Cooling System
('Cooling System', 'Radiator hoses & clamps', 'RH001', 300, 10, 20, 5, 35, 'pieces', 'CoolParts', 'Shelf D1'),
('Cooling System', 'Thermostat', 'TH001', 600, 5, 10, 2, 15, 'pieces', 'CoolParts', 'Shelf D2'),
('Cooling System', 'Coolant (per L)', 'CL001', 400, 50, 100, 25, 150, 'liters', 'CoolMax', 'Storage C2'),
('Cooling System', 'Radiator fan', 'RF001', 5000, 1, 3, 1, 5, 'pieces', 'FanTech', 'Shelf D3'),

-- Electrical System
('Electrical System', 'Battery', 'BAT001', 5000, 5, 10, 3, 15, 'pieces', 'PowerCell', 'Storage E1'),
('Electrical System', 'Fuses', 'FU001', 50, 50, 100, 25, 150, 'pieces', 'ElectroCorp', 'Drawer E1'),
('Electrical System', 'Alternator', 'ALT001', 8000, 1, 2, 1, 3, 'pieces', 'PowerGen', 'Shelf E2'),
('Electrical System', 'Starter motor', 'SM001', 6000, 1, 2, 1, 3, 'pieces', 'StartTech', 'Shelf E3'),
('Electrical System', 'Bulbs/Relays/Connectors', 'BRC001', 200, 50, 100, 25, 150, 'pieces', 'LightParts', 'Drawer E2'),

-- Fuel System
('Fuel System', 'Fuel filter', 'FF001', 400, 10, 20, 5, 30, 'pieces', 'FuelTech', 'Shelf F1'),
('Fuel System', 'Fuel pump', 'FP001', 3000, 1, 3, 1, 5, 'pieces', 'PumpMax', 'Shelf F2'),

-- Exhaust System
('Exhaust System', 'Gaskets, clamps', 'GC001', 200, 20, 50, 10, 75, 'pieces', 'ExhaustParts', 'Shelf G1'),

-- Brake System
('Brake System', 'Brake pads & shoes (set)', 'BPS001', 1500, 5, 10, 3, 15, 'sets', 'BrakeTech', 'Shelf H1'),
('Brake System', 'Brake discs & drums', 'BDD001', 3000, 2, 5, 1, 8, 'pieces', 'DiscBrake Co', 'Shelf H2'),
('Brake System', 'Brake fluid (per L)', 'BF001', 300, 20, 50, 10, 80, 'liters', 'FluidMax', 'Storage C3'),
('Brake System', 'Master cyl. & calipers', 'MCC001', 4000, 1, 2, 1, 3, 'pieces', 'HydraulicParts', 'Shelf H3'),

-- Steering & Suspension
('Steering & Suspension', 'Tie rods', 'TR001', 800, 5, 10, 2, 15, 'pieces', 'SteerParts', 'Shelf I1'),
('Steering & Suspension', 'Ball joints', 'BJ001', 600, 5, 10, 2, 15, 'pieces', 'JointTech', 'Shelf I2'),
('Steering & Suspension', 'Shock absorbers & struts', 'SAS001', 4000, 2, 4, 1, 6, 'pieces', 'ShockMax', 'Shelf I3'),
('Steering & Suspension', 'Springs', 'SPR001', 2000, 2, 4, 1, 6, 'pieces', 'SpringCorp', 'Shelf I4'),

-- Body & Interior
('Body & Interior', 'Clips/Handles/Mirrors/Wipers', 'CHMW001', 500, 50, 100, 25, 150, 'assorted', 'InteriorParts', 'Shelf J1'),

-- Wheels & Tyres
('Wheels & Tyres', 'Tyres (each)', 'TY001', 6000, 10, 20, 5, 30, 'pieces', 'TyreCorp', 'Storage K1'),
('Wheels & Tyres', 'Wheel bearings', 'WB001', 2000, 5, 10, 2, 15, 'pieces', 'BearingTech', 'Shelf K1'),
('Wheels & Tyres', 'Wheel nuts', 'WN001', 100, 50, 100, 25, 150, 'pieces', 'FastenerCorp', 'Drawer K1'),

-- Lighting
('Lighting', 'Headlight assembly', 'HL001', 6000, 1, 2, 1, 3, 'pieces', 'LightAssembly Co', 'Shelf L1'),
('Lighting', 'Tail light assembly', 'TL001', 3000, 1, 2, 1, 3, 'pieces', 'TailLight Corp', 'Shelf L2'),
('Lighting', 'Indicators/Fog bulbs', 'IFB001', 300, 20, 30, 10, 45, 'pieces', 'BulbMax', 'Drawer L1'),

-- Others
('Others', 'Pistons/Crankshaft/Camshaft/Head', 'PCCH001', 20000, 0, 0, 0, 1, 'pieces', 'EngineRecon Ltd', 'Special Storage'),
('Others', 'Complete gearbox / transmission', 'CGT001', 50000, 0, 0, 0, 1, 'pieces', 'TransRecon Corp', 'Special Storage'),
('Others', 'Differential', 'DIFF001', 30000, 0, 0, 0, 1, 'pieces', 'DiffTech', 'Special Storage'),
('Others', 'Radiator (full unit)', 'RAD001', 8000, 1, 2, 1, 3, 'pieces', 'RadiatorMax', 'Storage D1'),
('Others', 'Catalytic converter / muffler', 'CCM001', 15000, 0, 1, 0, 2, 'pieces', 'ExhaustTech', 'Special Storage'),
('Others', 'Seats/Windshields/Panels', 'SWP001', 20000, 0, 1, 0, 2, 'pieces', 'BodyParts Ltd', 'Special Storage');

-- =============================================================================
-- BILLING AND PAYMENT TABLES
-- =============================================================================

-- Invoices table - Billing information
CREATE TABLE invoices (
    invoice_id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    request_id INTEGER NOT NULL REFERENCES service_requests(request_id) ON DELETE RESTRICT,
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    tax_rate DECIMAL(5,2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
    tax_amount DECIMAL(10,2) GENERATED ALWAYS AS (subtotal * tax_rate / 100) STORED,
    discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (subtotal + (subtotal * tax_rate / 100) - discount_amount) STORED,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_invoices_request_id ON invoices(request_id);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Payments table - Payment tracking
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(invoice_id) ON DELETE RESTRICT,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method payment_method NOT NULL,
    transaction_reference VARCHAR(100), -- Reference from payment gateway
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status payment_status NOT NULL DEFAULT 'pending',
    gateway_response JSONB, -- Store payment gateway response
    notes TEXT,
    processed_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_transaction_reference ON payments(transaction_reference);

-- =============================================================================
-- AUDIT AND LOGGING TABLES
-- =============================================================================

-- Activity log table for audit trail
CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_table_name ON activity_logs(table_name);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || 
                             LPAD(NEXTVAL('invoice_sequence')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_sequence START 1;

-- Create trigger for invoice number generation
CREATE TRIGGER generate_invoice_number_trigger 
    BEFORE INSERT ON invoices 
    FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- Function to update part stock when parts are used
CREATE OR REPLACE FUNCTION update_part_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE parts 
        SET stock_qty = stock_qty - NEW.quantity_used 
        WHERE part_id = NEW.part_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE parts 
        SET stock_qty = stock_qty + OLD.quantity_used - NEW.quantity_used 
        WHERE part_id = NEW.part_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE parts 
        SET stock_qty = stock_qty + OLD.quantity_used 
        WHERE part_id = OLD.part_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for part stock updates
CREATE TRIGGER update_part_stock_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON service_parts 
    FOR EACH ROW EXECUTE FUNCTION update_part_stock();

-- =============================================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View for complete service request information
CREATE VIEW service_request_summary AS
SELECT 
    sr.request_id,
    sr.request_date,
    sr.scheduled_date,
    sr.completion_date,
    sr.status,
    sr.priority,
    u.name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    v.registration_number,
    v.brand,
    v.model,
    v.year,
    m.name AS mechanic_name,
    sr.estimated_cost,
    sr.final_cost,
    i.invoice_number,
    i.total_amount AS invoice_total,
    i.payment_status
FROM service_requests sr
LEFT JOIN users u ON sr.user_id = u.user_id
LEFT JOIN vehicles v ON sr.vehicle_id = v.vehicle_id
LEFT JOIN users m ON sr.assigned_mechanic = m.user_id
LEFT JOIN invoices i ON sr.request_id = i.request_id;

-- View for inventory status
CREATE VIEW inventory_status AS
SELECT 
    p.part_id,
    p.name,
    p.part_number,
    p.category,
    p.brand,
    p.stock_qty,
    p.minimum_stock_level,
    p.unit_price,
    CASE 
        WHEN p.stock_qty <= p.minimum_stock_level THEN 'LOW_STOCK'
        WHEN p.stock_qty = 0 THEN 'OUT_OF_STOCK'
        ELSE 'IN_STOCK'
    END AS stock_status
FROM parts p
WHERE p.is_active = true;

-- View for financial summary
CREATE VIEW financial_summary AS
SELECT 
    DATE_TRUNC('month', sr.completion_date) AS month,
    COUNT(sr.request_id) AS total_services,
    SUM(sr.final_cost) AS total_revenue,
    AVG(sr.final_cost) AS average_service_cost,
    COUNT(CASE WHEN i.payment_status = 'paid' THEN 1 END) AS paid_invoices,
    COUNT(CASE WHEN i.payment_status = 'pending' THEN 1 END) AS pending_invoices
FROM service_requests sr
LEFT JOIN invoices i ON sr.request_id = i.request_id
WHERE sr.status = 'completed'
GROUP BY DATE_TRUNC('month', sr.completion_date)
ORDER BY month DESC;

-- =============================================================================
-- INITIAL DATA SETUP
-- =============================================================================

-- Insert default managers (admin users)
INSERT INTO managers (name, email, phone, employee_id, department, password_hash, is_active, email_verified) VALUES
('alpha', 'admin1@garage360.com', '+1234567891', 'MGR001', 'Administration', 'alpha01', true, true),
('beta', 'admin2@garage360.com', '+1234567892', 'MGR002', 'Operations', 'beta02', true, true),
('gamma', 'admin3@garage360.com', '+1234567893', 'MGR003', 'Management', 'gamma03', true, true);

-- Insert sample car types data
INSERT INTO cartypes (brand, model, body_type) VALUES
-- Toyota Models
('Toyota', 'Corolla', 'sedan'),
('Toyota', 'Camry', 'sedan'),
('Toyota', 'Innova Crysta', 'suv'),
('Toyota', 'Fortuner', 'suv'),
('Toyota', 'Prius', 'hatchback'),

-- Honda Models  
('Honda', 'City', 'sedan'),
('Honda', 'Civic', 'sedan'),
('Honda', 'CR-V', 'suv'),
('Honda', 'Amaze', 'sedan'),

-- Hyundai Models
('Hyundai', 'i20', 'hatchback'),
('Hyundai', 'Verna', 'sedan'),
('Hyundai', 'Creta', 'suv'),
('Hyundai', 'Tucson', 'suv'),

-- Maruti Suzuki Models
('Maruti Suzuki', 'Swift', 'hatchback'),
('Maruti Suzuki', 'Baleno', 'hatchback'),
('Maruti Suzuki', 'Dzire', 'sedan'),
('Maruti Suzuki', 'Ertiga', 'suv'),

-- Mahindra Models
('Mahindra', 'XUV700', 'suv'),
('Mahindra', 'Scorpio', 'suv'),
('Mahindra', 'Thar', 'suv'),

-- Tata Models
('Tata', 'Nexon', 'suv'),
('Tata', 'Harrier', 'suv'),
('Tata', 'Safari', 'suv'),

-- Kia Models
('Kia', 'Seltos', 'suv'),
('Kia', 'Sonet', 'suv'),

-- Luxury Brands
('BMW', '3 Series', 'sedan'),
('Mercedes-Benz', 'C-Class', 'sedan'),
('Audi', 'A4', 'sedan'),

-- Electric Vehicles
('Tesla', 'Model 3', 'sedan'),
('Tata', 'Nexon EV', 'suv'),
('MG', 'ZS EV', 'suv');


COMMENT ON DATABASE garage360 IS 'Garage360 - Vehicle Service Management System Database - PostgreSQL';