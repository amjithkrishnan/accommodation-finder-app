-- Insert Property Types
INSERT INTO property_type_master (type_name, is_active) VALUES
('Apartment', true),
('House', true),
('Studio', true),
('Room', true),
('Shared', true);

-- Insert Amenities
INSERT INTO amenity_master (amenity_name, is_active) VALUES
('WiFi', true),
('Parking', true),
('Heating', true),
('Washing Machine', true),
('Dishwasher', true),
('Garden', true),
('Balcony', true),
('Pet Friendly', true);
