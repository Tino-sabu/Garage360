-- Create cartypes table in Supabase

CREATE TABLE IF NOT EXISTS public.cartypes (
    cartype_id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    body_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cartypes_brand ON public.cartypes(brand);
CREATE INDEX IF NOT EXISTS idx_cartypes_model ON public.cartypes(model);

-- Enable Row Level Security
ALTER TABLE public.cartypes ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Car types are publicly readable" ON public.cartypes
    FOR SELECT
    USING (true);

-- Create policy for authenticated users to insert
CREATE POLICY "Authenticated users can insert car types" ON public.cartypes
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

COMMENT ON TABLE public.cartypes IS 'Table storing different car types/models available';
