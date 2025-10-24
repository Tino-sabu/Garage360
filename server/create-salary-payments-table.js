console.log('\n=== SQL Commands to Create salary_payments Table ===\n');
console.log('Copy and paste these commands into your Supabase SQL Editor:\n');
console.log('-----------------------------------------------------\n');

const sql = `
-- Create salary_payments table to track payment history
CREATE TABLE IF NOT EXISTS salary_payments (
    payment_id SERIAL PRIMARY KEY,
    mechanic_id INTEGER NOT NULL REFERENCES mechanics(mechanic_id) ON DELETE CASCADE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_based_pay DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    bonus_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    jobs_included INTEGER[] NOT NULL DEFAULT '{}',
    paid_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comment to table
COMMENT ON TABLE salary_payments IS 'Tracks salary payment history for mechanics';

-- Add comments to columns
COMMENT ON COLUMN salary_payments.payment_id IS 'Unique identifier for each payment';
COMMENT ON COLUMN salary_payments.mechanic_id IS 'Reference to the mechanic receiving payment';
COMMENT ON COLUMN salary_payments.payment_date IS 'Date and time when payment was processed';
COMMENT ON COLUMN salary_payments.time_based_pay IS 'Payment calculated from time-based work (hours × hourly_rate)';
COMMENT ON COLUMN salary_payments.bonus_amount IS 'Bonus amount (3% of job costs)';
COMMENT ON COLUMN salary_payments.total_amount IS 'Total payment amount (time_based_pay + bonus_amount)';
COMMENT ON COLUMN salary_payments.jobs_included IS 'Array of service_request IDs included in this payment';
COMMENT ON COLUMN salary_payments.paid_by IS 'Manager who processed the payment';
COMMENT ON COLUMN salary_payments.notes IS 'Optional notes about the payment';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_salary_payments_mechanic ON salary_payments(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_date ON salary_payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_salary_payments_paid_by ON salary_payments(paid_by);

-- Create a composite index for mechanic payment history queries
CREATE INDEX IF NOT EXISTS idx_salary_payments_mechanic_date ON salary_payments(mechanic_id, payment_date DESC);
`;

console.log(sql);
console.log('\n-----------------------------------------------------');
console.log('After running these commands:');
console.log('1. The salary_payments table will be created');
console.log('2. Indexes will be added for query performance');
console.log('3. Payment history will be automatically tracked');
console.log('=============================================\n');
