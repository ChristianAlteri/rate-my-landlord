-- Add unique constraint to prevent duplicate listings
-- Combination of address and postcode should be unique (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_unique_address_postcode 
  ON properties (LOWER(TRIM(address)), LOWER(TRIM(postcode)));
