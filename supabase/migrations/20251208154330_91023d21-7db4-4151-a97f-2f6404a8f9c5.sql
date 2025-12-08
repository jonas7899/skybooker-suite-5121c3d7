-- Create a security definer function to create the first super admin
CREATE OR REPLACE FUNCTION public.create_first_super_admin(
  _user_id uuid,
  _full_name text,
  _phone text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _existing_admins int;
BEGIN
  -- Check if there are any existing super admins
  SELECT COUNT(*) INTO _existing_admins
  FROM user_roles
  WHERE role = 'super_admin';
  
  -- If super admins already exist, don't allow creating another one this way
  IF _existing_admins > 0 THEN
    RETURN false;
  END IF;
  
  -- Create profile with active status
  INSERT INTO profiles (id, full_name, phone, status, is_bootstrap)
  VALUES (_user_id, _full_name, _phone, 'active', false)
  ON CONFLICT (id) DO UPDATE SET
    full_name = _full_name,
    phone = _phone,
    status = 'active',
    is_bootstrap = false;
  
  -- Create super_admin role
  INSERT INTO user_roles (user_id, role, approved_at)
  VALUES (_user_id, 'super_admin', NOW())
  ON CONFLICT DO NOTHING;
  
  -- Deactivate any bootstrap profiles
  UPDATE profiles
  SET status = 'inactive'
  WHERE is_bootstrap = true AND status = 'bootstrap';
  
  RETURN true;
END;
$$;

-- Allow super admins to manage user_roles
CREATE POLICY "Super admins can insert user roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update user roles"
  ON user_roles
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete user roles"
  ON user_roles
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'super_admin'));