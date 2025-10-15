-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create storage bucket for songs
INSERT INTO storage.buckets (id, name, public)
VALUES ('songs', 'songs', true);

-- Storage policies for songs bucket
CREATE POLICY "Anyone can view songs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'songs');

CREATE POLICY "Admins can upload songs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'songs' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete songs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'songs' AND
  public.has_role(auth.uid(), 'admin')
);

-- Update songs table RLS policies for admin access
CREATE POLICY "Admins can insert songs"
ON public.songs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update songs"
ON public.songs
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete songs"
ON public.songs
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Update artists table for admin access
CREATE POLICY "Admins can insert artists"
ON public.artists
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update artists"
ON public.artists
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete artists"
ON public.artists
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Update lyrics table for admin access
CREATE POLICY "Admins can insert lyrics"
ON public.lyrics
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lyrics"
ON public.lyrics
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lyrics"
ON public.lyrics
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to assign default user role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();