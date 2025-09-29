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