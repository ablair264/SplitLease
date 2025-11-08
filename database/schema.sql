-- Lease Analysis Database Schema
-- Handles multiple data sources with intelligent vehicle matching and best price determination

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS lease_offers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS upload_sessions CASCADE;
DROP TABLE IF EXISTS best_deals_cache CASCADE;

-- Create ENUM types
CREATE TYPE upload_status AS ENUM ('processing', 'completed', 'failed');
CREATE TYPE fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'plugin_hybrid', 'mild_hybrid', 'other');
CREATE TYPE body_style AS ENUM ('hatchback', 'saloon', 'estate', 'suv', 'coupe', 'convertible', 'mpv', 'van', 'pickup', 'other');
CREATE TYPE transmission_type AS ENUM ('manual', 'automatic', 'cvt', 'dual_clutch', 'other');

-- Providers table - stores lease providers/funders
CREATE TABLE providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    active BOOLEAN DEFAULT true,
    contact_email VARCHAR(255),
    api_endpoint VARCHAR(500),
    last_update_received TIMESTAMP,
    total_vehicles_offered INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles master table - canonical vehicle definitions
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    cap_code VARCHAR(20) UNIQUE, -- Primary matching field
    manufacturer VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    variant VARCHAR(200),
    p11d_price DECIMAL(10,2), -- List price for fallback matching
    otr_price DECIMAL(10,2),
    fuel_type fuel_type,
    engine_size DECIMAL(4,1), -- e.g., 2.0
    body_style body_style,
    transmission transmission_type,
    doors INTEGER,
    seats INTEGER,
    mpg DECIMAL(6,2), -- Combined fuel economy
    co2_emissions INTEGER, -- g/km
    electric_range INTEGER, -- miles for EVs/PHEVs
    euro_standard VARCHAR(10), -- Euro 6d etc
    insurance_group INTEGER,
    weight_kg INTEGER,
    length_mm INTEGER,
    width_mm INTEGER,
    height_mm INTEGER,
    boot_capacity_litres INTEGER,
    -- Fuzzy matching helper fields
    make_model_variant_normalized TEXT, -- Normalized for fuzzy matching
    search_vector tsvector, -- Full-text search
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT vehicles_cap_code_check CHECK (cap_code IS NULL OR length(cap_code) >= 3),
    CONSTRAINT vehicles_p11d_check CHECK (p11d_price IS NULL OR p11d_price > 0),
    CONSTRAINT vehicles_mpg_check CHECK (mpg IS NULL OR mpg > 0),
    CONSTRAINT vehicles_co2_check CHECK (co2_emissions IS NULL OR co2_emissions >= 0)
);

-- Upload sessions - tracks file uploads and processing
CREATE TABLE upload_sessions (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES providers(id),
    filename VARCHAR(255) NOT NULL,
    file_format VARCHAR(10), -- csv, xlsx
    total_rows INTEGER,
    processed_rows INTEGER DEFAULT 0,
    matched_vehicles INTEGER DEFAULT 0,
    new_vehicles INTEGER DEFAULT 0,
    status upload_status DEFAULT 'processing',
    error_message TEXT,
    field_mappings JSONB, -- Store the column mappings used
    upload_metadata JSONB, -- Store additional upload info
    processing_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_completed_at TIMESTAMP,
    uploaded_by VARCHAR(100), -- User identifier
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lease offers - individual pricing offers from providers
CREATE TABLE lease_offers (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
    upload_session_id INTEGER REFERENCES upload_sessions(id) ON DELETE CASCADE,
    
    -- Pricing details
    monthly_rental DECIMAL(8,2) NOT NULL,
    upfront_payment DECIMAL(10,2) DEFAULT 0,
    term_months INTEGER NOT NULL,
    annual_mileage INTEGER NOT NULL,
    maintenance_included BOOLEAN DEFAULT false,
    insurance_included BOOLEAN DEFAULT false,
    
    -- Additional costs
    admin_fee DECIMAL(6,2) DEFAULT 0,
    documentation_fee DECIMAL(6,2) DEFAULT 0,
    
    -- Lease terms
    excess_mileage_charge DECIMAL(4,2), -- per mile
    damage_charges_info TEXT,
    early_termination_fee DECIMAL(8,2),
    
    -- Calculated fields
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (
        (monthly_rental * term_months) + upfront_payment + COALESCE(admin_fee, 0) + COALESCE(documentation_fee, 0)
    ) STORED,
    
    cost_per_mile DECIMAL(8,4) GENERATED ALWAYS AS (
        CASE 
            WHEN annual_mileage > 0 THEN 
                ((monthly_rental * term_months) + upfront_payment) / (annual_mileage * (term_months / 12.0))
            ELSE NULL 
        END
    ) STORED,
    
    -- Scoring
    deal_score DECIMAL(5,2), -- 0-100 score
    score_breakdown JSONB, -- Detailed score calculation
    price_rank INTEGER, -- Rank among similar offers
    
    -- Metadata
    offer_valid_until DATE,
    special_conditions TEXT,
    offer_reference VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT lease_offers_pricing_check CHECK (monthly_rental > 0),
    CONSTRAINT lease_offers_term_check CHECK (term_months BETWEEN 6 AND 60),
    CONSTRAINT lease_offers_mileage_check CHECK (annual_mileage BETWEEN 1000 AND 100000),
    CONSTRAINT lease_offers_score_check CHECK (deal_score IS NULL OR deal_score BETWEEN 0 AND 100),
    
    -- Unique constraint to prevent duplicate offers
    UNIQUE(vehicle_id, provider_id, monthly_rental, term_months, annual_mileage, upfront_payment)
);

-- Best deals materialized view cache - for fast best deals queries
CREATE TABLE best_deals_cache (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    cap_code VARCHAR(20),
    manufacturer VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    variant VARCHAR(200),
    
    -- Best offer details
    best_provider_id INTEGER REFERENCES providers(id),
    best_provider_name VARCHAR(100),
    best_monthly_rental DECIMAL(8,2) NOT NULL,
    best_upfront_payment DECIMAL(10,2) DEFAULT 0,
    best_term_months INTEGER NOT NULL,
    best_annual_mileage INTEGER NOT NULL,
    best_total_cost DECIMAL(10,2) NOT NULL,
    best_deal_score DECIMAL(5,2),
    best_offer_id INTEGER REFERENCES lease_offers(id),
    
    -- Vehicle details (denormalized for performance)
    p11d_price DECIMAL(10,2),
    fuel_type fuel_type,
    mpg DECIMAL(6,2),
    co2_emissions INTEGER,
    electric_range INTEGER,
    insurance_group INTEGER,
    body_style body_style,
    
    -- Offer statistics
    total_offers_count INTEGER DEFAULT 1,
    price_range_low DECIMAL(8,2),
    price_range_high DECIMAL(8,2),
    avg_monthly_price DECIMAL(8,2),
    
    -- Metadata
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_refresh_due TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '1 hour',
    
    CONSTRAINT best_deals_cache_pricing_check CHECK (best_monthly_rental > 0)
);

-- Indexes for performance
CREATE INDEX idx_vehicles_cap_code ON vehicles(cap_code) WHERE cap_code IS NOT NULL;
CREATE INDEX idx_vehicles_p11d ON vehicles(p11d_price) WHERE p11d_price IS NOT NULL;
CREATE INDEX idx_vehicles_make_model ON vehicles(manufacturer, model);
CREATE INDEX idx_vehicles_search_vector ON vehicles USING gin(search_vector);
CREATE INDEX idx_vehicles_normalized_name ON vehicles(make_model_variant_normalized);

CREATE INDEX idx_lease_offers_vehicle ON lease_offers(vehicle_id);
CREATE INDEX idx_lease_offers_provider ON lease_offers(provider_id);
CREATE INDEX idx_lease_offers_monthly_rental ON lease_offers(monthly_rental);
CREATE INDEX idx_lease_offers_deal_score ON lease_offers(deal_score DESC NULLS LAST);
CREATE INDEX idx_lease_offers_active ON lease_offers(is_active) WHERE is_active = true;
CREATE INDEX idx_lease_offers_term_mileage ON lease_offers(term_months, annual_mileage);

CREATE INDEX idx_best_deals_cache_score ON best_deals_cache(best_deal_score DESC);
CREATE INDEX idx_best_deals_cache_monthly ON best_deals_cache(best_monthly_rental);
CREATE INDEX idx_best_deals_cache_manufacturer ON best_deals_cache(manufacturer);
CREATE INDEX idx_best_deals_cache_fuel_type ON best_deals_cache(fuel_type);
CREATE INDEX idx_best_deals_cache_refresh ON best_deals_cache(next_refresh_due);

-- Trigger to update search vector and normalized fields
CREATE OR REPLACE FUNCTION update_vehicle_search_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Update normalized search field for fuzzy matching
    NEW.make_model_variant_normalized := lower(
        regexp_replace(
            CONCAT(
                COALESCE(NEW.manufacturer, ''), ' ',
                COALESCE(NEW.model, ''), ' ',
                COALESCE(NEW.variant, '')
            ),
            '[^a-zA-Z0-9\s]', '', 'g'
        )
    );
    
    -- Update full-text search vector
    NEW.search_vector := to_tsvector('english', 
        CONCAT(
            COALESCE(NEW.manufacturer, ''), ' ',
            COALESCE(NEW.model, ''), ' ',
            COALESCE(NEW.variant, ''), ' ',
            COALESCE(NEW.fuel_type::text, ''), ' ',
            COALESCE(NEW.body_style::text, '')
        )
    );
    
    NEW.last_updated := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vehicle_search_fields
    BEFORE INSERT OR UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_vehicle_search_fields();

-- Function to find or create vehicle with intelligent matching
CREATE OR REPLACE FUNCTION find_or_create_vehicle(
    p_manufacturer VARCHAR(50),
    p_model VARCHAR(100),
    p_cap_code VARCHAR(20) DEFAULT NULL,
    p_variant VARCHAR(200) DEFAULT NULL,
    p_p11d_price DECIMAL(10,2) DEFAULT NULL,
    p_fuel_type TEXT DEFAULT NULL,
    p_mpg DECIMAL(6,2) DEFAULT NULL,
    p_co2_emissions INTEGER DEFAULT NULL,
    p_electric_range INTEGER DEFAULT NULL,
    p_insurance_group INTEGER DEFAULT NULL,
    p_body_style TEXT DEFAULT NULL,
    p_transmission TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_vehicle_id INTEGER;
    v_fuel_type_enum fuel_type;
    v_body_style_enum body_style;
    v_transmission_enum transmission_type;
    v_search_text TEXT;
    v_similarity_threshold FLOAT := 0.7;
BEGIN
    -- Convert text values to enums safely
    BEGIN
        v_fuel_type_enum := p_fuel_type::fuel_type;
    EXCEPTION WHEN invalid_text_representation THEN
        v_fuel_type_enum := 'other';
    END;
    
    BEGIN
        v_body_style_enum := p_body_style::body_style;
    EXCEPTION WHEN invalid_text_representation THEN
        v_body_style_enum := 'other';
    END;
    
    BEGIN
        v_transmission_enum := p_transmission::transmission_type;
    EXCEPTION WHEN invalid_text_representation THEN
        v_transmission_enum := 'other';
    END;

    -- 1. Try exact CAP code match first
    IF p_cap_code IS NOT NULL THEN
        SELECT id INTO v_vehicle_id 
        FROM vehicles 
        WHERE cap_code = p_cap_code;
        
        IF FOUND THEN
            RETURN v_vehicle_id;
        END IF;
    END IF;
    
    -- 2. Try P11D price matching (within 1% tolerance) + make/model
    IF p_p11d_price IS NOT NULL THEN
        SELECT id INTO v_vehicle_id
        FROM vehicles v
        WHERE lower(v.manufacturer) = lower(p_manufacturer)
          AND lower(v.model) = lower(p_model)
          AND v.p11d_price IS NOT NULL
          AND ABS(v.p11d_price - p_p11d_price) / v.p11d_price < 0.01 -- 1% tolerance
        ORDER BY ABS(v.p11d_price - p_p11d_price)
        LIMIT 1;
        
        IF FOUND THEN
            RETURN v_vehicle_id;
        END IF;
    END IF;
    
    -- 3. Fuzzy match on manufacturer, model, variant
    v_search_text := lower(regexp_replace(
        CONCAT(p_manufacturer, ' ', p_model, ' ', COALESCE(p_variant, '')),
        '[^a-zA-Z0-9\s]', '', 'g'
    ));
    
    SELECT id INTO v_vehicle_id
    FROM vehicles v
    WHERE similarity(v.make_model_variant_normalized, v_search_text) > v_similarity_threshold
    ORDER BY similarity(v.make_model_variant_normalized, v_search_text) DESC
    LIMIT 1;
    
    IF FOUND THEN
        RETURN v_vehicle_id;
    END IF;
    
    -- 4. No match found, create new vehicle
    INSERT INTO vehicles (
        cap_code, manufacturer, model, variant, p11d_price,
        fuel_type, mpg, co2_emissions, electric_range, 
        insurance_group, body_style, transmission
    ) VALUES (
        p_cap_code, p_manufacturer, p_model, p_variant, p_p11d_price,
        v_fuel_type_enum, p_mpg, p_co2_emissions, p_electric_range,
        p_insurance_group, v_body_style_enum, v_transmission_enum
    ) RETURNING id INTO v_vehicle_id;
    
    RETURN v_vehicle_id;
END;
$$ LANGUAGE plpgsql;

-- Function to refresh best deals cache for a specific vehicle
CREATE OR REPLACE FUNCTION refresh_best_deal_for_vehicle(p_vehicle_id INTEGER)
RETURNS VOID AS $$
DECLARE
    v_best_offer RECORD;
    v_stats RECORD;
BEGIN
    -- Find the best offer for this vehicle (lowest monthly cost for standard 36mo/10k terms)
    SELECT 
        lo.id as offer_id,
        lo.vehicle_id,
        lo.provider_id,
        p.name as provider_name,
        lo.monthly_rental,
        lo.upfront_payment,
        lo.term_months,
        lo.annual_mileage,
        lo.total_cost,
        lo.deal_score,
        v.cap_code,
        v.manufacturer,
        v.model,
        v.variant,
        v.p11d_price,
        v.fuel_type,
        v.mpg,
        v.co2_emissions,
        v.electric_range,
        v.insurance_group,
        v.body_style
    INTO v_best_offer
    FROM lease_offers lo
    JOIN vehicles v ON lo.vehicle_id = v.id
    JOIN providers p ON lo.provider_id = p.id
    WHERE lo.vehicle_id = p_vehicle_id
      AND lo.is_active = true
      AND lo.term_months = 36  -- Standard term
      AND lo.annual_mileage = 10000  -- Standard mileage
    ORDER BY lo.monthly_rental + (lo.upfront_payment / lo.term_months) ASC  -- Total monthly equivalent
    LIMIT 1;
    
    -- If no standard terms available, get best overall deal
    IF NOT FOUND THEN
        SELECT 
            lo.id as offer_id,
            lo.vehicle_id,
            lo.provider_id,
            p.name as provider_name,
            lo.monthly_rental,
            lo.upfront_payment,
            lo.term_months,
            lo.annual_mileage,
            lo.total_cost,
            lo.deal_score,
            v.cap_code,
            v.manufacturer,
            v.model,
            v.variant,
            v.p11d_price,
            v.fuel_type,
            v.mpg,
            v.co2_emissions,
            v.electric_range,
            v.insurance_group,
            v.body_style
        INTO v_best_offer
        FROM lease_offers lo
        JOIN vehicles v ON lo.vehicle_id = v.id
        JOIN providers p ON lo.provider_id = p.id
        WHERE lo.vehicle_id = p_vehicle_id
          AND lo.is_active = true
        ORDER BY lo.cost_per_mile ASC
        LIMIT 1;
    END IF;
    
    -- Get statistics for this vehicle
    SELECT 
        COUNT(*) as total_offers,
        MIN(monthly_rental) as price_low,
        MAX(monthly_rental) as price_high,
        AVG(monthly_rental) as price_avg
    INTO v_stats
    FROM lease_offers lo
    WHERE lo.vehicle_id = p_vehicle_id
      AND lo.is_active = true;
    
    -- Update or insert into best deals cache
    INSERT INTO best_deals_cache (
        vehicle_id, cap_code, manufacturer, model, variant,
        best_provider_id, best_provider_name,
        best_monthly_rental, best_upfront_payment,
        best_term_months, best_annual_mileage, best_total_cost,
        best_deal_score, best_offer_id,
        p11d_price, fuel_type, mpg, co2_emissions, electric_range,
        insurance_group, body_style,
        total_offers_count, price_range_low, price_range_high, avg_monthly_price,
        last_updated, next_refresh_due
    ) VALUES (
        v_best_offer.vehicle_id, v_best_offer.cap_code, 
        v_best_offer.manufacturer, v_best_offer.model, v_best_offer.variant,
        v_best_offer.provider_id, v_best_offer.provider_name,
        v_best_offer.monthly_rental, v_best_offer.upfront_payment,
        v_best_offer.term_months, v_best_offer.annual_mileage, v_best_offer.total_cost,
        v_best_offer.deal_score, v_best_offer.offer_id,
        v_best_offer.p11d_price, v_best_offer.fuel_type, v_best_offer.mpg, 
        v_best_offer.co2_emissions, v_best_offer.electric_range,
        v_best_offer.insurance_group, v_best_offer.body_style,
        v_stats.total_offers, v_stats.price_low, v_stats.price_high, v_stats.price_avg,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 hour'
    )
    ON CONFLICT (vehicle_id) DO UPDATE SET
        best_provider_id = EXCLUDED.best_provider_id,
        best_provider_name = EXCLUDED.best_provider_name,
        best_monthly_rental = EXCLUDED.best_monthly_rental,
        best_upfront_payment = EXCLUDED.best_upfront_payment,
        best_term_months = EXCLUDED.best_term_months,
        best_annual_mileage = EXCLUDED.best_annual_mileage,
        best_total_cost = EXCLUDED.best_total_cost,
        best_deal_score = EXCLUDED.best_deal_score,
        best_offer_id = EXCLUDED.best_offer_id,
        total_offers_count = EXCLUDED.total_offers_count,
        price_range_low = EXCLUDED.price_range_low,
        price_range_high = EXCLUDED.price_range_high,
        avg_monthly_price = EXCLUDED.avg_monthly_price,
        last_updated = CURRENT_TIMESTAMP,
        next_refresh_due = CURRENT_TIMESTAMP + INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh best deals when lease offers change
CREATE OR REPLACE FUNCTION trigger_refresh_best_deals()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh best deals for the affected vehicle
    IF TG_OP = 'DELETE' THEN
        PERFORM refresh_best_deal_for_vehicle(OLD.vehicle_id);
        RETURN OLD;
    ELSE
        PERFORM refresh_best_deal_for_vehicle(NEW.vehicle_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lease_offers_refresh_best_deals
    AFTER INSERT OR UPDATE OR DELETE ON lease_offers
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_best_deals();

-- Sample data
INSERT INTO providers (name, display_name, active) VALUES
('lex_autolease', 'Lex Autolease', true),
('arval', 'Arval', true),
('leaseplan', 'LeasePlan', true),
('novuna', 'Novuna Vehicle Solutions', true),
('octopus_ev', 'Octopus Electric Vehicles', true);

-- Enable pg_trgm extension for fuzzy string matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;