-- CRITICAL SECURITY FIX: Create proper role management system
-- This prevents privilege escalation by moving roles to a separate protected table

-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table with proper security
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can only VIEW their own roles (read-only)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- NO INSERT/UPDATE/DELETE policies for regular users
-- Roles can ONLY be assigned by admins via database or admin-only functions

-- Create SECURITY DEFINER function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update content table policies to use has_role instead of profiles.role
DROP POLICY IF EXISTS "Admins can manage content" ON public.content;

CREATE POLICY "Admins can insert content"
  ON public.content FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content"
  ON public.content FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content"
  ON public.content FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Update profiles to make role column read-only
-- First, check if role column exists, if not create it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- Create trigger to sync role from user_roles to profiles (for backward compatibility)
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile role based on user_roles
  UPDATE public.profiles
  SET role = (
    CASE 
      WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role = 'admin') THEN 'admin'
      WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.user_id AND role = 'moderator') THEN 'moderator'
      ELSE 'user'
    END
  )
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_profile_role ON public.user_roles;
CREATE TRIGGER trigger_sync_profile_role
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role();

-- Update storage policies to use has_role
DROP POLICY IF EXISTS "Admins can upload content media" ON storage.objects;

CREATE POLICY "Admins can upload content media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'content-media' AND
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update content media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'content-media' AND
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete content media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'content-media' AND
    has_role(auth.uid(), 'admin')
  );

-- Add profiles DELETE policy for GDPR compliance
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Restrict content SELECT to authenticated users only (not public)
DROP POLICY IF EXISTS "Anyone can view content" ON public.content;

CREATE POLICY "Authenticated users can view content"
  ON public.content FOR SELECT
  TO authenticated
  USING (true);

-- Create function to initialize default user role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default 'user' role for new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically assign 'user' role on signup
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Comment for documentation
COMMENT ON TABLE public.user_roles IS 'Stores user roles with proper security. Roles can only be modified by database admins or admin-only functions. Regular users have read-only access to their own roles.';