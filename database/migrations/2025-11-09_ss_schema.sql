-- Salary Sacrifice schema (customers + enquiries)
BEGIN;

CREATE TABLE IF NOT EXISTS ss_customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  email TEXT,
  phone TEXT,
  vehicles_ordered INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ss_customers_name ON ss_customers (lower(name));
CREATE INDEX IF NOT EXISTS idx_ss_customers_email ON ss_customers (lower(email));

CREATE TABLE IF NOT EXISTS ss_enquiries (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES ss_customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  primary_contact_name TEXT,
  primary_contact_phone TEXT,
  primary_contact_email TEXT,
  salesperson TEXT,
  referrer TEXT,
  status TEXT DEFAULT 'Draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ss_enquiries_salesperson ON ss_enquiries (salesperson);
CREATE INDEX IF NOT EXISTS idx_ss_enquiries_status ON ss_enquiries (status);
CREATE INDEX IF NOT EXISTS idx_ss_enquiries_customer_name ON ss_enquiries (lower(customer_name));

COMMIT;

