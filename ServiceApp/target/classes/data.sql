-- Insert Property Types Master Data (only if not exists)
INSERT IGNORE INTO property_type_master (type_name, is_active) VALUES
('Apartment', true),
('House', true),
('Studio', true),
('Room', true),
('Shared', true);

-- Insert Amenities Master Data (only if not exists)
INSERT IGNORE INTO amenity_master (amenity_name, is_active) VALUES
('WiFi', true),
('Parking', true),
('Heating', true),
('Washing Machine', true),
('Dishwasher', true),
('Garden', true),
('Balcony', true),
('Pet Friendly', true);
