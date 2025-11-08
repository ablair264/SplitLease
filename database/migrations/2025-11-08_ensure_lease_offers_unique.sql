-- Ensure unique constraint for lease_offers to match insert_lease_offer's ON CONFLICT
-- This script de-duplicates existing rows and adds the constraint if missing.

-- Preview duplicates (optional):
-- SELECT vehicle_id, provider_id, monthly_rental, term_months, annual_mileage, upfront_payment, COUNT(*) AS cnt
-- FROM lease_offers
-- GROUP BY 1,2,3,4,5,6
-- HAVING COUNT(*) > 1
-- ORDER BY cnt DESC;

BEGIN;

-- Lock table for the duration of the maintenance to avoid concurrent inserts
LOCK TABLE lease_offers IN ROW EXCLUSIVE MODE;

-- Remove exact duplicates, keeping the smallest id per natural key
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

-- Add the unique constraint if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'lease_offers_natural_key'
      AND conrelid = 'lease_offers'::regclass
  ) THEN
    ALTER TABLE lease_offers
      ADD CONSTRAINT lease_offers_natural_key
      UNIQUE (vehicle_id, provider_id, monthly_rental, term_months, annual_mileage, upfront_payment);
  END IF;
END
$$;

COMMIT;

-- Validation (optional): should return zero rows after the above
-- SELECT vehicle_id, provider_id, monthly_rental, term_months, annual_mileage, upfront_payment, COUNT(*) AS cnt
-- FROM lease_offers
-- GROUP BY 1,2,3,4,5,6
-- HAVING COUNT(*) > 1;

