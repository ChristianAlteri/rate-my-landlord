-- CockroachDB / Postgres-compatible schema for Rate My Landlord
-- Run in Cockroach SQL shell or SQL editor after creating a database.

CREATE TABLE IF NOT EXISTS properties (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  landlord_name TEXT,
  borough TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_unique_address_postcode
  ON properties (lower(trim(address)), lower(trim(postcode)));

CREATE INDEX IF NOT EXISTS idx_properties_created ON properties (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews (property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews (rating);
