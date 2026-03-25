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

-- Insert County Data (only if not exists)
INSERT INTO county (code, name) VALUES
('C', 'Cork'),
('CE', 'Clare'),
('CN', 'Cavan'),
('CW', 'Carlow'),
('D', 'Dublin'),
('DL', 'Donegal'),
('G', 'Galway'),
('KE', 'Kildare'),
('KK', 'Kilkenny'),
('KY', 'Kerry'),
('L', 'Limerick'),
('LD', 'Longford'),
('LH', 'Louth'),
('LK', 'Limerick'),
('LM', 'Leitrim'),
('LS', 'Laois'),
('MH', 'Meath'),
('MN', 'Monaghan'),
('MO', 'Mayo'),
('OY', 'Offaly'),
('RN', 'Roscommon'),
('SO', 'Sligo'),
('TA', 'Tipperary'),
('WD', 'Waterford'),
('WH', 'Westmeath'),
('WX', 'Wexford'),
('WW', 'Wicklow');
