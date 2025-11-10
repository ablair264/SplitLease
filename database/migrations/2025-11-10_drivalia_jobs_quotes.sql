-- ========================================
-- DRIVALIA JOBS AND QUOTES TABLES
-- Migration: 2025-11-10
-- ========================================

-- Table 1: drivalia_jobs - Track automation jobs
CREATE TABLE IF NOT EXISTS drivalia_jobs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    vehicles JSONB NOT NULL,        -- Array of vehicle objects: [{id, manufacturer, model, variant, codes}, ...]
    config JSONB NOT NULL,          -- Job configuration: {terms, mileages, maintenance, deposit}
    vehicle_count INTEGER NOT NULL,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT valid_vehicle_count CHECK (vehicle_count > 0),
    CONSTRAINT valid_success_count CHECK (success_count >= 0 AND success_count <= vehicle_count),
    CONSTRAINT valid_failure_count CHECK (failure_count >= 0 AND failure_count <= vehicle_count)
);

-- Indexes for drivalia_jobs
CREATE INDEX idx_drivalia_jobs_user_id ON drivalia_jobs(user_id);
CREATE INDEX idx_drivalia_jobs_status ON drivalia_jobs(status);
CREATE INDEX idx_drivalia_jobs_created_at ON drivalia_jobs(created_at DESC);
CREATE INDEX idx_drivalia_jobs_user_status ON drivalia_jobs(user_id, status);

-- Table 2: drivalia_quotes - Store quote results
CREATE TABLE IF NOT EXISTS drivalia_quotes (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT REFERENCES drivalia_jobs(id) ON DELETE CASCADE,
    vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
    manufacturer TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT NOT NULL,
    term INTEGER NOT NULL,
    mileage INTEGER NOT NULL,
    monthly_rental DECIMAL(10,2),
    initial_payment DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    maintenance_included BOOLEAN DEFAULT FALSE,
    supplier_name TEXT,
    quote_reference TEXT,
    additional_info JSONB,      -- For any extra data from the API
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_term CHECK (term > 0),
    CONSTRAINT valid_mileage CHECK (mileage > 0),
    CONSTRAINT valid_prices CHECK (
        (monthly_rental IS NULL OR monthly_rental >= 0) AND
        (initial_payment IS NULL OR initial_payment >= 0) AND
        (total_cost IS NULL OR total_cost >= 0)
    )
);

-- Indexes for drivalia_quotes
CREATE INDEX idx_drivalia_quotes_job_id ON drivalia_quotes(job_id);
CREATE INDEX idx_drivalia_quotes_vehicle_id ON drivalia_quotes(vehicle_id);
CREATE INDEX idx_drivalia_quotes_manufacturer ON drivalia_quotes(manufacturer);
CREATE INDEX idx_drivalia_quotes_fetched_at ON drivalia_quotes(fetched_at DESC);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on both tables
ALTER TABLE drivalia_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivalia_quotes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own jobs
CREATE POLICY "Users can view own jobs"
    ON drivalia_jobs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy 2: Users can create their own jobs
CREATE POLICY "Users can create own jobs"
    ON drivalia_jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own jobs
CREATE POLICY "Users can update own jobs"
    ON drivalia_jobs
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can view quotes for their jobs
CREATE POLICY "Users can view own job quotes"
    ON drivalia_quotes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM drivalia_jobs
            WHERE drivalia_jobs.id = drivalia_quotes.job_id
            AND drivalia_jobs.user_id = auth.uid()
        )
    );

-- Policy 5: System/service can insert quotes (using service role)
-- This will be handled by the backend worker using service role key

-- Policy 6: Allow anon users to create jobs (optional - remove if you want auth only)
CREATE POLICY "Anon users can create jobs"
    ON drivalia_jobs
    FOR INSERT
    TO anon
    WITH CHECK (user_id IS NULL);

-- Policy 7: Anon users can view their jobs by session (if user_id is null)
-- Note: This is a simplified approach. For production, use proper auth.
CREATE POLICY "Anon users can view jobs without user_id"
    ON drivalia_jobs
    FOR SELECT
    TO anon
    USING (user_id IS NULL);

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to update job status and counts
CREATE OR REPLACE FUNCTION update_drivalia_job_status(
    p_job_id BIGINT,
    p_status TEXT,
    p_success_count INTEGER DEFAULT NULL,
    p_failure_count INTEGER DEFAULT NULL,
    p_duration_seconds INTEGER DEFAULT NULL,
    p_error_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    UPDATE drivalia_jobs
    SET
        status = p_status,
        success_count = COALESCE(p_success_count, success_count),
        failure_count = COALESCE(p_failure_count, failure_count),
        duration_seconds = COALESCE(p_duration_seconds, duration_seconds),
        error_details = COALESCE(p_error_details, error_details),
        started_at = CASE WHEN p_status = 'processing' AND started_at IS NULL THEN NOW() ELSE started_at END,
        completed_at = CASE WHEN p_status IN ('completed', 'failed') THEN NOW() ELSE completed_at END
    WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get job summary with quote counts
CREATE OR REPLACE FUNCTION get_drivalia_job_summary(p_job_id BIGINT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'job', row_to_json(j.*),
        'quote_count', (SELECT COUNT(*) FROM drivalia_quotes WHERE job_id = p_job_id),
        'unique_vehicles', (SELECT COUNT(DISTINCT vehicle_id) FROM drivalia_quotes WHERE job_id = p_job_id)
    )
    INTO result
    FROM drivalia_jobs j
    WHERE j.id = p_job_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMMENTS FOR DOCUMENTATION
-- ========================================

COMMENT ON TABLE drivalia_jobs IS 'Tracks Drivalia automation jobs submitted by users';
COMMENT ON TABLE drivalia_quotes IS 'Stores quote results from Drivalia API for each job';
COMMENT ON COLUMN drivalia_jobs.vehicles IS 'JSONB array of vehicle objects to quote';
COMMENT ON COLUMN drivalia_jobs.config IS 'JSONB object with job configuration (terms, mileages, etc)';
COMMENT ON COLUMN drivalia_quotes.additional_info IS 'JSONB for any extra API response data';
