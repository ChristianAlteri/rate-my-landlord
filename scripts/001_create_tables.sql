-- Properties table for London addresses/landlords
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  landlord_name TEXT,
  borough TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table - simple username auth, no email required
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pros TEXT,
  cons TEXT,
  would_recommend BOOLEAN DEFAULT false,
  rent_amount INTEGER,
  tenancy_start DATE,
  tenancy_end DATE,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_properties_postcode ON properties(postcode);
CREATE INDEX IF NOT EXISTS idx_properties_borough ON properties(borough);
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_name);
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read properties
CREATE POLICY "Anyone can view properties" ON properties
  FOR SELECT USING (true);

-- Allow anyone to insert properties (for adding new addresses)
CREATE POLICY "Anyone can add properties" ON properties
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

-- Allow anyone to insert reviews (anonymous username-based)
CREATE POLICY "Anyone can add reviews" ON reviews
  FOR INSERT WITH CHECK (true);
