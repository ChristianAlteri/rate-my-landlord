-- Seed some London properties for testing
INSERT INTO properties (address, postcode, landlord_name, borough) VALUES
('42 Brick Lane', 'E1 6RF', 'Tower Estates Ltd', 'Tower Hamlets'),
('15 Camden High Street', 'NW1 7JE', 'North London Properties', 'Camden'),
('88 Brixton Road', 'SW9 7AA', 'Southside Lettings', 'Lambeth'),
('23 Shoreditch High Street', 'E1 6JE', 'Hoxton Homes', 'Hackney'),
('156 Lewisham Way', 'SE14 6NW', 'Deptford Dwellings', 'Lewisham'),
('7 Peckham Rye', 'SE15 3NX', 'SE Living Ltd', 'Southwark'),
('31 Dalston Lane', 'E8 3DF', 'Hackney Housing Co', 'Hackney'),
('45 Mile End Road', 'E1 4TT', 'East End Estates', 'Tower Hamlets'),
('12 Streatham High Road', 'SW16 1DB', 'South London Lets', 'Lambeth'),
('78 Holloway Road', 'N7 8JG', 'Islington Investments', 'Islington'),
('33 Green Lanes', 'N16 9BS', 'Stoke Newington Homes', 'Hackney'),
('91 Finsbury Park Road', 'N4 2JY', 'Manor House Lettings', 'Haringey'),
('55 Whitechapel Road', 'E1 1DU', 'Aldgate Properties', 'Tower Hamlets'),
('200 New Cross Road', 'SE14 5BA', 'Goldsmiths Rentals', 'Lewisham'),
('17 Bethnal Green Road', 'E2 6AA', 'Globe Town Estates', 'Tower Hamlets')
ON CONFLICT DO NOTHING;

-- Add some sample reviews
INSERT INTO reviews (property_id, username, rating, title, content, pros, cons, would_recommend, rent_amount) 
SELECT 
  p.id,
  'tenant_' || floor(random() * 1000)::text,
  floor(random() * 3 + 3)::integer,
  'Decent flat, responsive landlord',
  'Lived here for 2 years. The landlord was generally responsive and the flat was in good condition. Had some issues with heating in winter but they were addressed within a week.',
  'Good location, responsive landlord, nice neighbours',
  'Heating issues in winter, thin walls',
  true,
  1450
FROM properties p
WHERE p.address = '42 Brick Lane'
LIMIT 1;

INSERT INTO reviews (property_id, username, rating, title, content, pros, cons, would_recommend, rent_amount)
SELECT 
  p.id,
  'LondonRenter2024',
  2,
  'Avoid this landlord!',
  'Terrible experience. The landlord ignored maintenance requests for months. Damp issues were never properly addressed. They tried to withhold our entire deposit for normal wear and tear.',
  'Central location',
  'Unresponsive landlord, damp issues, deposit disputes',
  false,
  1650
FROM properties p
WHERE p.address = '15 Camden High Street'
LIMIT 1;

INSERT INTO reviews (property_id, username, rating, title, content, pros, cons, would_recommend, rent_amount)
SELECT 
  p.id,
  'BrixtonTenant',
  5,
  'Best landlord in London!',
  'Cannot recommend highly enough. Fair rent, all repairs done same day, and they even reduced rent during COVID. A rare gem in the London rental market.',
  'Amazing landlord, fair rent, quick repairs, great communication',
  'Bit noisy from the road',
  true,
  1200
FROM properties p
WHERE p.address = '88 Brixton Road'
LIMIT 1;

INSERT INTO reviews (property_id, username, rating, title, content, pros, cons, would_recommend, rent_amount)
SELECT 
  p.id,
  'HackneyHousing',
  3,
  'Average experience',
  'Nothing special but nothing terrible either. Landlord was fine, flat was okay. Standard London rental experience.',
  'Location, transport links',
  'Could be better maintained',
  true,
  1550
FROM properties p
WHERE p.address = '23 Shoreditch High Street'
LIMIT 1;

INSERT INTO reviews (property_id, username, rating, title, content, pros, cons, would_recommend, rent_amount)
SELECT 
  p.id,
  'Anonymous_Renter',
  1,
  'NIGHTMARE LANDLORD',
  'This was the worst rental experience of my life. Landlord entered the property without notice multiple times. Refused to fix the boiler for 3 months during winter. Tried to illegally evict us.',
  'None',
  'Everything - illegal behavior, harassment, no repairs',
  false,
  1400
FROM properties p
WHERE p.address = '156 Lewisham Way'
LIMIT 1;
