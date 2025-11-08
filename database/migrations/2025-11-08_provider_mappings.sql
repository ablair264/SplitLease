-- Table to persist column mappings per provider for uploads
BEGIN;

CREATE TABLE IF NOT EXISTS provider_mappings (
  id SERIAL PRIMARY KEY,
  provider_name TEXT NOT NULL UNIQUE,
  column_mappings JSONB NOT NULL,
  header_names JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_provider_mappings_updated_at ON provider_mappings;
CREATE TRIGGER trg_provider_mappings_updated_at
BEFORE UPDATE ON provider_mappings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;

