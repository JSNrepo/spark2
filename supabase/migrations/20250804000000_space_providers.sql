-- Migration: Update users table for space providers
-- Date: 2025-08-04

-- Update users table to support space providers
ALTER TABLE users 
DROP CONSTRAINT users_role_check;

ALTER TABLE users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('customer', 'space_provider', 'admin'));

-- Add space provider specific fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS organizationName text,
ADD COLUMN IF NOT EXISTS organizationType text CHECK (organizationType IN ('individual', 'business', 'government', 'nonprofit')),
ADD COLUMN IF NOT EXISTS businessLicense text,
ADD COLUMN IF NOT EXISTS taxId text;

-- Update existing 'owner' role to 'space_provider'
UPDATE users SET role = 'space_provider' WHERE role = 'owner';

-- Update foreign key reference in parking_lots (rename ownerId to providerId for clarity)
ALTER TABLE parking_lots 
RENAME COLUMN ownerId TO providerId;

-- Add index for space provider lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_parking_lots_provider ON parking_lots(providerId);

-- Update RLS policies for space providers
DROP POLICY IF EXISTS "Owners can manage their parking lots" ON parking_lots;
DROP POLICY IF EXISTS "Owners can insert parking lots" ON parking_lots;

CREATE POLICY "Space providers can manage their parking lots"
  ON parking_lots
  FOR ALL
  TO authenticated
  USING (providerId = auth.uid());

CREATE POLICY "Space providers can insert parking lots"
  ON parking_lots
  FOR INSERT
  TO authenticated
  WITH CHECK (providerId = auth.uid());

-- Update booking policies for space provider access
CREATE POLICY "Space providers can read bookings for their lots"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    parkingLotId IN (
      SELECT id FROM parking_lots WHERE providerId = auth.uid()
    )
  );

-- Function to automatically set user role based on registration type
CREATE OR REPLACE FUNCTION public.handle_user_role_assignment()
RETURNS trigger AS $$
BEGIN
  -- Set role based on user metadata
  IF NEW.raw_user_meta_data->>'userType' = 'space_provider' THEN
    UPDATE public.users 
    SET 
      role = 'space_provider',
      organizationName = COALESCE(NEW.raw_user_meta_data->>'organizationName', ''),
      organizationType = COALESCE(NEW.raw_user_meta_data->>'organizationType', 'individual')
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to assign role on user creation
DROP TRIGGER IF EXISTS on_auth_user_role_assignment ON auth.users;
CREATE TRIGGER on_auth_user_role_assignment
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_role_assignment();
