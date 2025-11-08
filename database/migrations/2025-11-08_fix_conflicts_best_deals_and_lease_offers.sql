-- Fix ON CONFLICT targets by ensuring matching UNIQUE constraints
-- - best_deals_cache: ON CONFLICT (vehicle_id)
-- - lease_offers:    ON CONFLICT (vehicle_id, provider_id, monthly_rental, term_months, annual_mileage, upfront_payment)

BEGIN;

-- 1) BEST DEALS CACHE -------------------------------------------------------
LOCK TABLE best_deals_cache IN ROW EXCLUSIVE MODE;

-- Deduplicate by vehicle_id, keep the newest row (last_updated desc, then id desc)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY vehicle_id
           ORDER BY last_updated DESC NULLS LAST, id DESC
         ) AS rn
  FROM best_deals_cache
)
DELETE FROM best_deals_cache b
USING ranked r
WHERE b.id = r.id
  AND r.rn > 1;

-- Add UNIQUE(vehicle_id) if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'best_deals_cache'::regclass
      AND conname  = 'best_deals_cache_vehicle_unique'
  ) THEN
    ALTER TABLE best_deals_cache
      ADD CONSTRAINT best_deals_cache_vehicle_unique UNIQUE (vehicle_id);
  END IF;
END$$;

-- 2) LEASE OFFERS -----------------------------------------------------------
LOCK TABLE lease_offers IN ROW EXCLUSIVE MODE;

-- Remove exact duplicates for the natural key used by ON CONFLICT
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY vehicle_id, provider_id, monthly_rental, term_months, annual_mileage, upfront_payment
           ORDER BY id
         ) AS rn
  FROM lease_offers
)
DELETE FROM lease_offers lo
USING ranked r
WHERE lo.id = r.id
  AND r.rn > 1;

-- Add UNIQUE(...) if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'lease_offers'::regclass
      AND conname  = 'lease_offers_natural_key'
  ) THEN
    ALTER TABLE lease_offers
      ADD CONSTRAINT lease_offers_natural_key
      UNIQUE (vehicle_id, provider_id, monthly_rental, term_months, annual_mileage, upfront_payment);
  END IF;
END$$;

COMMIT;

-- Optional validation (run separately):
-- SELECT vehicle_id, COUNT(*) FROM best_deals_cache GROUP BY 1 HAVING COUNT(*) > 1;
-- SELECT vehicle_id, provider_id, monthly_rental, term_months, annual_mileage, upfront_payment, COUNT(*)
-- FROM lease_offers GROUP BY 1,2,3,4,5,6 HAVING COUNT(*) > 1;

