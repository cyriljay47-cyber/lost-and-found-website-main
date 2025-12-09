-- Create lost_and_found database schema
CREATE DATABASE IF NOT EXISTS lost_and_found;
USE lost_and_found;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
);

-- Items table to store lost and found items
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('lost', 'found') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  date_reported DATE NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  status ENUM('active', 'claimed', 'returned') DEFAULT 'active',
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_date_reported (date_reported)
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@lostnfound.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvQOm', 'admin');

-- Insert sample data
INSERT INTO items (type, title, description, category, location, date_reported, contact_name, contact_email, contact_phone, status) VALUES
('lost', 'Black Leather Wallet', 'Black leather wallet containing IDs and credit cards. Lost near the main entrance.', 'Wallet', 'Main Entrance, Building A', '2025-01-05', 'John Smith', 'john.smith@email.com', '555-0101', 'active'),
('found', 'Blue Backpack', 'Blue JanSport backpack found in the cafeteria. Contains textbooks and a laptop.', 'Bag', 'Cafeteria, 2nd Floor', '2025-01-06', 'Sarah Johnson', 'sarah.j@email.com', '555-0102', 'active'),
('lost', 'iPhone 14 Pro', 'Space Gray iPhone 14 Pro with a clear case. Lost in parking lot.', 'Electronics', 'Parking Lot C', '2025-01-04', 'Mike Davis', 'mike.d@email.com', '555-0103', 'active'),
('found', 'Silver Watch', 'Silver Casio watch found near the gym entrance.', 'Accessories', 'Gym Entrance', '2025-01-07', 'Emily Chen', 'emily.chen@email.com', '555-0104', 'active'),
('lost', 'Red Umbrella', 'Large red umbrella with wooden handle. Lost in lecture hall.', 'Other', 'Lecture Hall 205', '2025-01-03', 'David Wilson', 'david.w@email.com', '555-0105', 'active'),
('found', 'Set of Keys', 'Set of keys with Toyota keychain found in library.', 'Keys', 'Library, 3rd Floor', '2025-01-08', 'Lisa Brown', 'lisa.brown@email.com', '555-0106', 'active');
