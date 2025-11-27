/*
  # Create Parking System Database Schema

  1. New Tables
    - `users` - User profiles linked to Supabase Auth
    - `parking_lots` - Parking facility information
    - `bookings` - Parking reservations
    - `reviews` - User reviews for parking lots

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Proper foreign key relationships

  3. Features
    - UUID primary keys
    - Timestamps for audit trail
    - Proper data types and constraints
    - JSON fields for flexible data
*/

-- Create users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  firstName text,
  lastName text,
  phone text,
  role text DEFAULT 'customer' NOT NULL CHECK (role IN ('customer', 'owner', 'admin')),
  avatar text,
  isVerified boolean DEFAULT false,
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create parking_lots table
CREATE TABLE IF NOT EXISTS parking_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zipCode text NOT NULL,
  latitude double precision,
  longitude double precision,
  totalSpaces integer NOT NULL DEFAULT 0,
  availableSpaces integer NOT NULL DEFAULT 0,
  carSpaces integer NOT NULL DEFAULT 0,
  bikeSpaces integer NOT NULL DEFAULT 0,
  hourlyRate numeric NOT NULL DEFAULT 0,
  dailyRate numeric DEFAULT 0,
  monthlyRate numeric DEFAULT 0,
  images text[] DEFAULT '{}',
  amenities text[] DEFAULT '{}',
  operatingHours jsonb DEFAULT '{"open": "06:00", "close": "22:00"}',
  ownerId uuid REFERENCES users(id),
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviewCount integer DEFAULT 0,
  isActive boolean DEFAULT true,
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

ALTER TABLE parking_lots ENABLE ROW LEVEL SECURITY;

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userId uuid NOT NULL REFERENCES users(id),
  parkingLotId uuid NOT NULL REFERENCES parking_lots(id),
  vehicleType text NOT NULL CHECK (vehicleType IN ('car', 'bike')),
  vehiclePlate text NOT NULL,
  startTime timestamptz NOT NULL,
  endTime timestamptz NOT NULL,
  totalHours integer NOT NULL DEFAULT 0,
  totalAmount numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  paymentStatus text DEFAULT 'pending' CHECK (paymentStatus IN ('pending', 'paid', 'failed', 'refunded')),
  paymentId text,
  qrCode text,
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userId uuid NOT NULL REFERENCES users(id),
  parkingLotId uuid NOT NULL REFERENCES parking_lots(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parking_lots_city ON parking_lots(city);
CREATE INDEX IF NOT EXISTS idx_parking_lots_owner ON parking_lots(ownerId);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(userId);
CREATE INDEX IF NOT EXISTS idx_bookings_parking_lot ON bookings(parkingLotId);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_parking_lot ON reviews(parkingLotId);

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for parking_lots table
CREATE POLICY "Anyone can read active parking lots"
  ON parking_lots
  FOR SELECT
  TO authenticated
  USING (isActive = true);

CREATE POLICY "Owners can manage their parking lots"
  ON parking_lots
  FOR ALL
  TO authenticated
  USING (ownerId = auth.uid());

CREATE POLICY "Owners can insert parking lots"
  ON parking_lots
  FOR INSERT
  TO authenticated
  WITH CHECK (ownerId = auth.uid());

-- RLS Policies for bookings table
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (userId = auth.uid());

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (userId = auth.uid());

CREATE POLICY "Parking lot owners can read bookings for their lots"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    parkingLotId IN (
      SELECT id FROM parking_lots WHERE ownerId = auth.uid()
    )
  );

-- RLS Policies for reviews table
CREATE POLICY "Anyone can read reviews"
  ON reviews
  FOR SELECT
  TO authenticated;

CREATE POLICY "Users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (userId = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (userId = auth.uid());

CREATE POLICY "Users can delete own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (userId = auth.uid());

-- Insert sample parking lots data
INSERT INTO parking_lots (
  name, description, address, city, state, zipCode, 
  latitude, longitude, totalSpaces, availableSpaces, 
  carSpaces, bikeSpaces, hourlyRate, dailyRate, monthlyRate,
  images, amenities, rating, reviewCount
) VALUES 
(
  'Downtown Plaza Parking',
  'Premium covered parking facility in the heart of downtown with 24/7 security and EV charging stations.',
  '123 Main Street',
  'San Francisco',
  'CA',
  '94105',
  37.7749,
  -122.4194,
  200,
  45,
  180,
  20,
  8.00,
  45.00,
  250.00,
  ARRAY['https://images.pexels.com/photos/753876/pexels-photo-753876.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'],
  ARRAY['Covered', 'Security', 'EV Charging', 'Accessible'],
  4.8,
  124
),
(
  'Airport Long-term Parking',
  'Secure long-term parking near the airport with shuttle service every 15 minutes.',
  '456 Airport Blvd',
  'San Francisco',
  'CA',
  '94128',
  37.6213,
  -122.3790,
  500,
  120,
  450,
  50,
  6.00,
  35.00,
  180.00,
  ARRAY['https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'],
  ARRAY['Shuttle Service', 'Security', 'Long-term', 'Covered'],
  4.5,
  89
),
(
  'City Center Garage',
  'Multi-level parking garage in the business district with easy access to shopping and dining.',
  '789 Business Ave',
  'San Francisco',
  'CA',
  '94111',
  37.7849,
  -122.4094,
  300,
  75,
  270,
  30,
  10.00,
  55.00,
  300.00,
  ARRAY['https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'],
  ARRAY['Multi-level', 'Shopping Access', 'Restaurants Nearby', 'Valet Available'],
  4.2,
  67
),
(
  'Waterfront Parking',
  'Scenic parking with beautiful bay views, perfect for tourists and locals alike.',
  '321 Bay Street',
  'San Francisco',
  'CA',
  '94133',
  37.8049,
  -122.4194,
  150,
  30,
  120,
  30,
  12.00,
  65.00,
  350.00,
  ARRAY['https://images.pexels.com/photos/2882234/pexels-photo-2882234.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'],
  ARRAY['Bay Views', 'Tourist Area', 'Walking Distance to Pier', 'Photo Opportunities'],
  4.6,
  156
),
(
  'University District Parking',
  'Affordable parking for students and faculty with monthly discount rates.',
  '654 College Way',
  'Berkeley',
  'CA',
  '94720',
  37.8719,
  -122.2585,
  250,
  85,
  200,
  50,
  5.00,
  25.00,
  120.00,
  ARRAY['https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'],
  ARRAY['Student Discounts', 'Faculty Rates', 'Bike Racks', 'Study Areas'],
  4.3,
  92
),
(
  'Shopping Mall Parking',
  'Free parking for the first 2 hours, then affordable hourly rates. Perfect for shopping trips.',
  '987 Mall Drive',
  'San Jose',
  'CA',
  '95128',
  37.3382,
  -121.8863,
  800,
  200,
  700,
  100,
  4.00,
  20.00,
  150.00,
  ARRAY['https://images.pexels.com/photos/753876/pexels-photo-753876.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'],
  ARRAY['Free 2 Hours', 'Shopping Mall', 'Food Court Access', 'Family Friendly'],
  4.1,
  203
);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, firstName, lastName)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'firstName', ''),
    COALESCE(new.raw_user_meta_data->>'lastName', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update parking lot rating when reviews change
CREATE OR REPLACE FUNCTION update_parking_lot_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE parking_lots
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE parkingLotId = COALESCE(NEW.parkingLotId, OLD.parkingLotId)
    ),
    reviewCount = (
      SELECT COUNT(*)
      FROM reviews
      WHERE parkingLotId = COALESCE(NEW.parkingLotId, OLD.parkingLotId)
    ),
    updatedAt = now()
  WHERE id = COALESCE(NEW.parkingLotId, OLD.parkingLotId);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update ratings
DROP TRIGGER IF EXISTS update_rating_on_review_insert ON reviews;
CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_parking_lot_rating();

DROP TRIGGER IF EXISTS update_rating_on_review_update ON reviews;
CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_parking_lot_rating();

DROP TRIGGER IF EXISTS update_rating_on_review_delete ON reviews;
CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_parking_lot_rating();