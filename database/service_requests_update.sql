-- Add service_request_services junction table to link service requests with specific services
CREATE TABLE IF NOT EXISTS service_request_services (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES service_requests(request_id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(service_id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure a service can only be added once per request
    UNIQUE(request_id, service_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_request_services_request_id ON service_request_services(request_id);
CREATE INDEX IF NOT EXISTS idx_service_request_services_service_id ON service_request_services(service_id);

-- Remove priority column from service_requests if it exists
ALTER TABLE service_requests DROP COLUMN IF EXISTS priority;