-- Create SECURITY DEFINER function to check if super admin exists
-- This bypasses RLS so unauthenticated users can check bootstrap status
CREATE OR REPLACE FUNCTION public.check_super_admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE role = 'super_admin'
  )
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.check_super_admin_exists() TO anon;
GRANT EXECUTE ON FUNCTION public.check_super_admin_exists() TO authenticated;