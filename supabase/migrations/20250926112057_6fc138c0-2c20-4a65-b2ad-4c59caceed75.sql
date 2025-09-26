-- Create user roles system for admin access
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"  
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin policies for all tables
CREATE POLICY "Admins can manage personal_info"
  ON public.personal_info FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL  
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage skills"
  ON public.skills FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage work_experience"
  ON public.work_experience FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage project_skills"
  ON public.project_skills FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view contact_inquiries"
  ON public.contact_inquiries FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'your-admin-email@example.com' THEN 'admin'::user_role
      ELSE 'user'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();