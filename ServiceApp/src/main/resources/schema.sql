-- Accommodation Service Database Schema

-- Users Table
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(200),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Properties Table
CREATE TABLE properties (
    property_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type ENUM('APARTMENT', 'HOUSE', 'ROOM') NOT NULL,
    address VARCHAR(255) NOT NULL,
    eircode VARCHAR(20),
    city VARCHAR(100) NOT NULL,
    county VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Ireland',
    furnish_type ENUM('FURNISHED', 'UNFURNISHED', 'PART_FURNISHED'),
    price DECIMAL(10, 2) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    size_sqft INT,
    available_from DATE,
    lease_type ENUM('LONG_TERM', 'SHORT_TERM') DEFAULT 'LONG_TERM',
    listing_status ENUM('AVAILABLE', 'RENTED', 'PENDING', 'INACTIVE') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Property Amenities Table
CREATE TABLE property_amenities (
    amenity_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    amenity_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

-- Property Media Table
CREATE TABLE property_media (
    media_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    media_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    s3_key VARCHAR(500),
    thumbnail_s3_key VARCHAR(500),
    media_type ENUM('IMAGE', 'VIDEO') NOT NULL,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE reviews (
    review_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating DECIMAL(2, 1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bookings/Applications Table
CREATE TABLE bookings (
    booking_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    booking_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') DEFAULT 'PENDING',
    move_in_date DATE NOT NULL,
    lease_duration_months INT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE messages (
    message_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    property_id BIGINT,
    subject VARCHAR(255),
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE SET NULL
);

-- Favorites/Saved Properties Table
CREATE TABLE favorites (
    favorite_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(property_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, property_id)
);

-- Indexes for better query performance
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_type ON properties(property_type);
CREATE INDEX idx_properties_status ON properties(listing_status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_reviews_property ON reviews(property_id);

-- Master Data Tables
CREATE TABLE property_type_master (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE amenity_master (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    amenity_name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE county (
    code VARCHAR(5) PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- Insert Property Types Master Data
INSERT INTO property_type_master (type_name, is_active) VALUES
('Apartment', true),
('House', true),
('Studio', true),
('Room', true),
('Shared', true);

-- Insert Amenities Master Data
INSERT INTO amenity_master (amenity_name, is_active) VALUES
('WiFi', true),
('Parking', true),
('Heating', true),
('Washing Machine', true),
('Dishwasher', true),
('Garden', true),
('Balcony', true),
('Pet Friendly', true);

-- Insert County Data
IINSERT INTO county (code, name) VALUES
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

