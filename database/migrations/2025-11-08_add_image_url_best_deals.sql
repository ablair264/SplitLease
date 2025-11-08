-- Add image_url to best_deals_cache and expose it via get_best_deals
BEGIN;

ALTER TABLE best_deals_cache
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Replace function to include image_url column in the return set
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
    image_url TEXT,
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
        bdc.image_url,
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

COMMIT;

