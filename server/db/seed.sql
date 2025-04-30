-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  picture TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  event_type VARCHAR(50),
  address VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  capacity INT NOT NULL CHECK (capacity > 0),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL CHECK (end_time > start_time),
  picture TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_booking UNIQUE(user_id, event_id)
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  text_review TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_review UNIQUE(user_id, event_id)
);

-- Favorites Table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_favorite UNIQUE(user_id, event_id)
);

-- Seed Users
INSERT INTO users (id, name, username, password, location) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Alice Johnson', 'alicej', 'password123', 'New York, NY'),
  ('00000000-0000-0000-0000-000000000002', 'Bob Smith', 'bobsmith', 'password123', 'Los Angeles, CA'),
  ('00000000-0000-0000-0000-000000000003', 'Charlie Brown', 'charlieb', 'password123', 'Chicago, IL');

-- Seed Events
INSERT INTO events (
  user_id, event_name, description, event_type, address, price,
  capacity, date, start_time, end_time, picture
) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Tech Conference', 'Annual tech conference with industry leaders', 'Conference', '123 Tech St, San Francisco, CA', 99.99, 200, '2025-06-15', '09:00', '17:00', 'tech_conf.jpg'),
  ('00000000-0000-0000-0000-000000000002', 'Music Festival', 'Outdoor music festival with live bands', 'Festival', '456 Music Rd, Austin, TX', 49.99, 500, '2025-07-20', '14:00', '23:00', 'music_fest.jpg'),
  ('00000000-0000-0000-0000-000000000001', 'Tech & Brunch Meetup', 'A networking event for tech professionals over brunch.', 'Networking', '123 Tech Street, San Francisco, CA', 20, 50, '2025-04-15', '10:00', '13:00', NULL),
  ('00000000-0000-0000-0000-000000000001', 'Yoga in the Park', 'Relax and unwind with a guided yoga session in the park.', 'Wellness', 'Central Park, New York, NY', 10, 30, '2025-04-20', '07:00', '08:30', NULL),
  ('00000000-0000-0000-0000-000000000001', 'Coding Bootcamp for Beginners', 'A hands-on workshop introducing coding fundamentals.', 'Education', '456 Code Lane, Austin, TX', 50, 40, '2025-05-10', '09:00', '16:00', NULL),
  ('00000000-0000-0000-0000-000000000002', 'Art & Wine Evening', 'Sip wine and paint with local artists.', 'Entertainment', '789 Art District, Los Angeles, CA', 35, 25, '2025-04-25', '18:00', '21:00', NULL),
  ('00000000-0000-0000-0000-000000000002', 'Live Jazz Night', 'Enjoy live jazz performances by emerging artists.', 'Music', 'Jazz Club, Chicago, IL', 25, 100, '2025-05-01', '20:00', '23:00', NULL),
  ('00000000-0000-0000-0000-000000000002', 'Startup Pitch Competition', 'Watch startups pitch their ideas to investors.', 'Business', '500 Innovation Blvd, San Jose, CA', 15, 200, '2025-05-15', '14:00', '18:00', NULL),
  ('00000000-0000-0000-0000-000000000002', 'Cultural Food Festival', 'A festival celebrating international cuisine and culture.', 'Food & Drink', 'City Center Plaza, Miami, FL', 5, 500, '2025-05-20', '12:00', '20:00', NULL),
  ('00000000-0000-0000-0000-000000000003', 'Photography Walk & Workshop', 'Learn photography skills on a guided city walk.', 'Education', 'Downtown District, Seattle, WA', 30, 15, '2025-06-05', '15:00', '18:00', NULL),
  ('00000000-0000-0000-0000-000000000003', 'Self-Care & Wellness Retreat', 'A weekend retreat focused on mindfulness and self-care.', 'Wellness', 'Retreat Center, Sedona, AZ', 150, 20, '2025-06-15', '08:00', '17:00', NULL),
  ('00000000-0000-0000-0000-000000000003', 'Outdoor Movie Night', 'Enjoy a classic movie under the stars.', 'Entertainment', 'Community Park, Denver, CO', 10, 80, '2025-06-25', '20:00', '22:30', NULL);