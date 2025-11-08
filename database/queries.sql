-- Lease Analysis Database Queries
-- Best deals retrieval and data management queries

-- =============================================
-- BEST DEALS QUERIES
-- =============================================

-- Get best deals with filtering and pagination
CREATE OR REPLACE FUNCTION get_best_deals(
    p_manufacturer TEXT DEFAULT NULL,
    p_fuel_type TEXT DEFAULT NULL,
    p_max_monthly DECIMAL DEFAULT NULL,
    p_min_score DECIMAL DEFAULT NULL,
    p_body_style TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE (
    vehicle_id INTEGER,
    cap_code VARCHAR(20),
    manufacturer VARCHAR(50),
    model VARCHAR(100),
    variant VARCHAR(200),
    best_monthly_rental DECIMAL(8,2),
    best_upfront_payment DECIMAL(10,2),
    best_provider_name VARCHAR(100),
    best_term_months INTEGER,
    best_annual_mileage INTEGER,
    best_total_cost DECIMAL(10,2),
    best_deal_score DECIMAL(5,2),
    p11d_price DECIMAL(10,2),
    fuel_type fuel_type,
    mpg DECIMAL(6,2),
    co2_emissions INTEGER,
    electric_range INTEGER,
    insurance_group INTEGER,
    body_style body_style,
    total_offers_count INTEGER,
    price_range_low DECIMAL(8,2),
    price_range_high DECIMAL(8,2),
    last_updated TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bdc.vehicle_id,
        bdc.cap_code,
        bdc.manufacturer,
        bdc.model,
        bdc.variant,
        bdc.best_monthly_rental,
        bdc.best_upfront_payment,
        bdc.best_provider_name,
        bdc.best_term_months,
        bdc.best_annual_mileage,
        bdc.best_total_cost,
        bdc.best_deal_score,
        bdc.p11d_price,
        bdc.fuel_type,
        bdc.mpg,
        bdc.co2_emissions,
        bdc.electric_range,
        bdc.insurance_group,
        bdc.body_style,
        bdc.total_offers_count,
        bdc.price_range_low,
        bdc.price_range_high,
        bdc.last_updated
    FROM best_deals_cache bdc
    WHERE (p_manufacturer IS NULL OR lower(bdc.manufacturer) LIKE lower('%' || p_manufacturer || '%'))
      AND (p_fuel_type IS NULL OR bdc.fuel_type::text = lower(p_fuel_type))
      AND (p_max_monthly IS NULL OR bdc.best_monthly_rental <= p_max_monthly)
      AND (p_min_score IS NULL OR bdc.best_deal_score >= p_min_score)
      AND (p_body_style IS NULL OR bdc.body_style::text = lower(p_body_style))
    ORDER BY bdc.best_deal_score DESC NULLS LAST, bdc.best_monthly_rental ASC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Get best deals by specific terms (month/mileage)
CREATE OR REPLACE FUNCTION get_best_deals_by_terms(
    p_term_months INTEGER DEFAULT 36,
    p_annual_mileage INTEGER DEFAULT 10000,
    p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
    vehicle_id INTEGER,
    cap_code VARCHAR(20),
    manufacturer VARCHAR(50),
    model VARCHAR(100),
    variant VARCHAR(200),
    monthly_rental DECIMAL(8,2),
    upfront_payment DECIMAL(10,2),
    provider_name VARCHAR(100),
    total_cost DECIMAL(10,2),
    deal_score DECIMAL(5,2),
    p11d_price DECIMAL(10,2),
    fuel_type fuel_type,
    co2_emissions INTEGER,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id as vehicle_id,
        v.cap_code,
        v.manufacturer,
        v.model,
        v.variant,
        lo.monthly_rental,
        lo.upfront_payment,
        p.display_name as provider_name,
        lo.total_cost,
        lo.deal_score,
        v.p11d_price,
        v.fuel_type,
        v.co2_emissions,
        lo.created_at
    FROM lease_offers lo
    JOIN vehicles v ON lo.vehicle_id = v.id
    JOIN providers p ON lo.provider_id = p.id
    WHERE lo.term_months = p_term_months
      AND lo.annual_mileage = p_annual_mileage
      AND lo.is_active = true
    ORDER BY lo.deal_score DESC NULLS LAST, lo.monthly_rental ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get detailed vehicle offers comparison
CREATE OR REPLACE FUNCTION get_vehicle_offers_comparison(p_vehicle_id INTEGER)
RETURNS TABLE (
    offer_id INTEGER,
    provider_name VARCHAR(100),
    monthly_rental DECIMAL(8,2),
    upfront_payment DECIMAL(10,2),
    term_months INTEGER,
    annual_mileage INTEGER,
    total_cost DECIMAL(10,2),
    cost_per_mile DECIMAL(8,4),
    deal_score DECIMAL(5,2),
    maintenance_included BOOLEAN,
    admin_fee DECIMAL(6,2),
    offer_valid_until DATE,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lo.id as offer_id,
        p.display_name as provider_name,
        lo.monthly_rental,
        lo.upfront_payment,
        lo.term_months,
        lo.annual_mileage,
        lo.total_cost,
        lo.cost_per_mile,
        lo.deal_score,
        lo.maintenance_included,
        lo.admin_fee,
        lo.offer_valid_until,
        lo.created_at
    FROM lease_offers lo
    JOIN providers p ON lo.provider_id = p.id
    WHERE lo.vehicle_id = p_vehicle_id
      AND lo.is_active = true
    ORDER BY lo.monthly_rental ASC, lo.upfront_payment ASC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DATA INSERTION QUERIES
-- =============================================

-- Insert lease offer with automatic vehicle matching
CREATE OR REPLACE FUNCTION insert_lease_offer(
    p_provider_name TEXT,
    p_upload_session_id INTEGER,
    -- Vehicle identification (required params first)
    p_manufacturer TEXT,
    p_model TEXT,
    p_monthly_rental DECIMAL,
    p_term_months INTEGER,
    p_annual_mileage INTEGER,
    -- Vehicle identification (optional params)
    p_cap_code TEXT DEFAULT NULL,
    p_variant TEXT DEFAULT NULL,
    p_p11d_price DECIMAL DEFAULT NULL,
    -- Vehicle details
    p_fuel_type TEXT DEFAULT NULL,
    p_mpg DECIMAL DEFAULT NULL,
    p_co2_emissions INTEGER DEFAULT NULL,
    p_electric_range INTEGER DEFAULT NULL,
    p_insurance_group INTEGER DEFAULT NULL,
    p_body_style TEXT DEFAULT NULL,
    p_transmission TEXT DEFAULT NULL,
    -- Lease terms (optional)
    p_upfront_payment DECIMAL DEFAULT 0,
    p_maintenance_included BOOLEAN DEFAULT false,
    p_admin_fee DECIMAL DEFAULT 0,
    p_offer_valid_until DATE DEFAULT NULL,
    p_special_conditions TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_provider_id INTEGER;
    v_vehicle_id INTEGER;
    v_offer_id INTEGER;
    v_deal_score DECIMAL;
BEGIN
    -- Get or create provider
    SELECT id INTO v_provider_id FROM providers WHERE name = lower(p_provider_name);
    IF NOT FOUND THEN
        INSERT INTO providers (name, display_name) 
        VALUES (lower(p_provider_name), p_provider_name) 
        RETURNING id INTO v_provider_id;
    END IF;
    
    -- Find or create vehicle
    SELECT find_or_create_vehicle(
        p_manufacturer, p_model, p_cap_code, p_variant, p_p11d_price,
        p_fuel_type, p_mpg, p_co2_emissions, p_electric_range,
        p_insurance_group, p_body_style, p_transmission
    ) INTO v_vehicle_id;
    
    -- Calculate deal score (simplified version - you can expand this)
    v_deal_score := CASE 
        WHEN p_p11d_price > 0 THEN
            GREATEST(0, LEAST(100, 
                100 - (((p_monthly_rental * p_term_months + p_upfront_payment) / p_p11d_price) * 100 - 30) * 2
            ))
        ELSE 75 -- Default score when no P11D available
    END;
    
    -- Insert lease offer
    INSERT INTO lease_offers (
        vehicle_id, provider_id, upload_session_id,
        monthly_rental, upfront_payment, term_months, annual_mileage,
        maintenance_included, admin_fee, deal_score,
        offer_valid_until, special_conditions
    ) VALUES (
        v_vehicle_id, v_provider_id, p_upload_session_id,
        p_monthly_rental, p_upfront_payment, p_term_months, p_annual_mileage,
        p_maintenance_included, p_admin_fee, v_deal_score,
        p_offer_valid_until, p_special_conditions
    ) 
    ON CONFLICT (vehicle_id, provider_id, monthly_rental, term_months, annual_mileage, upfront_payment) 
    DO UPDATE SET
        deal_score = EXCLUDED.deal_score,
        updated_at = CURRENT_TIMESTAMP,
        is_active = true
    RETURNING id INTO v_offer_id;
    
    RETURN v_offer_id;
END;
$$ LANGUAGE plpgsql;

-- Batch refresh best deals cache
CREATE OR REPLACE FUNCTION refresh_all_best_deals()
RETURNS INTEGER AS $$
DECLARE
    v_processed INTEGER := 0;
    v_vehicle_record RECORD;
BEGIN
    -- Process all vehicles that have active offers
    FOR v_vehicle_record IN 
        SELECT DISTINCT vehicle_id 
        FROM lease_offers 
        WHERE is_active = true
    LOOP
        PERFORM refresh_best_deal_for_vehicle(v_vehicle_record.vehicle_id);
        v_processed := v_processed + 1;
    END LOOP;
    
    -- Clean up cache entries for vehicles with no active offers
    DELETE FROM best_deals_cache 
    WHERE vehicle_id NOT IN (
        SELECT DISTINCT vehicle_id 
        FROM lease_offers 
        WHERE is_active = true
    );
    
    RETURN v_processed;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ANALYTICS QUERIES
-- =============================================

-- Get market statistics
CREATE OR REPLACE FUNCTION get_market_stats()
RETURNS TABLE (
    total_vehicles INTEGER,
    total_active_offers INTEGER,
    total_providers INTEGER,
    avg_monthly_payment DECIMAL,
    avg_deal_score DECIMAL,
    top_manufacturer TEXT,
    latest_upload TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(DISTINCT vehicle_id) FROM lease_offers WHERE is_active = true)::INTEGER,
        (SELECT COUNT(*) FROM lease_offers WHERE is_active = true)::INTEGER,
        (SELECT COUNT(*) FROM providers WHERE active = true)::INTEGER,
        (SELECT AVG(monthly_rental) FROM lease_offers WHERE is_active = true)::DECIMAL,
        (SELECT AVG(deal_score) FROM lease_offers WHERE is_active = true AND deal_score IS NOT NULL)::DECIMAL,
        (SELECT manufacturer FROM best_deals_cache GROUP BY manufacturer ORDER BY COUNT(*) DESC LIMIT 1)::TEXT,
        (SELECT MAX(created_at) FROM lease_offers)::TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Get provider performance comparison
CREATE OR REPLACE FUNCTION get_provider_performance()
RETURNS TABLE (
    provider_name VARCHAR(100),
    total_offers INTEGER,
    avg_monthly_rental DECIMAL,
    avg_deal_score DECIMAL,
    best_deals_count INTEGER,
    market_share_percent DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH provider_stats AS (
        SELECT 
            p.display_name,
            COUNT(lo.id) as offer_count,
            AVG(lo.monthly_rental) as avg_rental,
            AVG(lo.deal_score) as avg_score,
            COUNT(bdc.id) as best_count
        FROM providers p
        LEFT JOIN lease_offers lo ON p.id = lo.provider_id AND lo.is_active = true
        LEFT JOIN best_deals_cache bdc ON p.id = bdc.best_provider_id
        WHERE p.active = true
        GROUP BY p.id, p.display_name
    ),
    total_offers AS (
        SELECT COUNT(*) as total FROM lease_offers WHERE is_active = true
    )
    SELECT 
        ps.display_name,
        ps.offer_count::INTEGER,
        ps.avg_rental::DECIMAL,
        ps.avg_score::DECIMAL,
        ps.best_count::INTEGER,
        CASE 
            WHEN t.total > 0 THEN (ps.offer_count::DECIMAL / t.total * 100)
            ELSE 0
        END::DECIMAL as market_share
    FROM provider_stats ps
    CROSS JOIN total_offers t
    ORDER BY ps.offer_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SAMPLE DATA POPULATION
-- =============================================

-- Function to populate sample best deals data
CREATE OR REPLACE FUNCTION populate_sample_data()
RETURNS VOID AS $$
DECLARE
    v_session_id INTEGER;
BEGIN
    -- Create sample upload session
    INSERT INTO upload_sessions (provider_id, filename, file_format, total_rows, status)
    SELECT id, 'sample_data.csv', 'csv', 100, 'completed'
    FROM providers WHERE name = 'lex_autolease'
    LIMIT 1
    RETURNING id INTO v_session_id;
    
    -- Insert sample lease offers
    PERFORM insert_lease_offer('lex_autolease', v_session_id, 'BMW001', 'BMW', '3 Series', '320i M Sport', 35000, 'petrol', 45.2, 145, NULL, 15, 'saloon', 'automatic', 299, 0, 36, 10000, false, 199);
    PERFORM insert_lease_offer('arval', v_session_id, 'AUD001', 'AUDI', 'A4', 'Sport 35 TFSI', 37000, 'petrol', 42.8, 155, NULL, 18, 'saloon', 'automatic', 325, 500, 36, 10000, false, 150);
    PERFORM insert_lease_offer('leaseplan', v_session_id, 'MER001', 'MERCEDES', 'C-Class', 'C220d AMG Line', 42000, 'diesel', 58.9, 118, NULL, 22, 'saloon', 'automatic', 389, 1000, 36, 10000, true, 175);
    PERFORM insert_lease_offer('octopus_ev', v_session_id, 'TES001', 'TESLA', 'Model 3', 'Standard Range Plus', 45000, 'electric', NULL, 0, 267, NULL, 'saloon', 'automatic', 449, 0, 36, 10000, false, 99);
    PERFORM insert_lease_offer('novuna', v_session_id, 'VW001', 'VOLKSWAGEN', 'Golf', '1.5 TSI Life', 28000, 'petrol', 50.4, 127, NULL, 12, 'hatchback', 'manual', 245, 250, 36, 8000, false, 125);
    
    -- Add more competitive offers for the same vehicles
    PERFORM insert_lease_offer('arval', v_session_id, 'BMW001', 'BMW', '3 Series', '320i M Sport', 35000, 'petrol', 45.2, 145, NULL, 15, 'saloon', 'automatic', 289, 300, 36, 10000, false, 175);
    PERFORM insert_lease_offer('leaseplan', v_session_id, 'AUD001', 'AUDI', 'A4', 'Sport 35 TFSI', 37000, 'petrol', 42.8, 155, NULL, 18, 'saloon', 'automatic', 315, 0, 36, 10000, true, 199);
    PERFORM insert_lease_offer('novuna', v_session_id, 'TES001', 'TESLA', 'Model 3', 'Standard Range Plus', 45000, 'electric', NULL, 0, 267, NULL, 'saloon', 'automatic', 425, 500, 36, 10000, false, 149);
    
    -- Add some different term offers
    PERFORM insert_lease_offer('lex_autolease', v_session_id, 'BMW001', 'BMW', '3 Series', '320i M Sport', 35000, 'petrol', 45.2, 145, NULL, 15, 'saloon', 'automatic', 275, 0, 48, 10000, false, 199);
    PERFORM insert_lease_offer('arval', v_session_id, 'VW001', 'VOLKSWAGEN', 'Golf', '1.5 TSI Life', 28000, 'petrol', 50.4, 127, NULL, 12, 'hatchback', 'manual', 225, 0, 48, 12000, false, 125);
    
    -- Update upload session
    UPDATE upload_sessions SET 
        processed_rows = 10, 
        matched_vehicles = 5, 
        processing_completed_at = CURRENT_TIMESTAMP 
    WHERE id = v_session_id;
    
    -- Refresh all best deals
    PERFORM refresh_all_best_deals();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- EXAMPLE USAGE QUERIES
-- =============================================

/*
-- Get top 50 best deals
SELECT * FROM get_best_deals() LIMIT 50;

-- Get best BMW deals under £400/month
SELECT * FROM get_best_deals('BMW', NULL, 400, NULL) LIMIT 20;

-- Get best electric vehicle deals
SELECT * FROM get_best_deals(NULL, 'electric', NULL, 80) LIMIT 30;

-- Get all offers for a specific vehicle
SELECT * FROM get_vehicle_offers_comparison(1);

-- Get market statistics
SELECT * FROM get_market_stats();

-- Get provider performance
SELECT * FROM get_provider_performance();

-- Populate sample data
SELECT populate_sample_data();

-- Refresh best deals cache
SELECT refresh_all_best_deals();
*/