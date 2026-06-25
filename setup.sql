-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'customer')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  addresses jsonb DEFAULT '[]'::jsonb,
  password text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  brand text NOT NULL,
  strain_type text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  thc_percent numeric NOT NULL,
  cbd_percent numeric NOT NULL,
  stock integer NOT NULL,
  rating numeric DEFAULT 5.0,
  reviews_count integer DEFAULT 0,
  image text NOT NULL,
  effects jsonb DEFAULT '[]'::jsonb,
  description text NOT NULL,
  lab_results_doc text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  items jsonb NOT NULL,
  total numeric NOT NULL,
  status text NOT NULL CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered')),
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  address text NOT NULL,
  delivery_option text NOT NULL CHECK (delivery_option IN ('pickup', 'delivery')),
  promo_applied text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  rating numeric NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
  id text PRIMARY KEY,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('Education', 'Responsible Use', 'Strain Science')),
  read_time text NOT NULL,
  content text NOT NULL,
  date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  author text NOT NULL,
  image text NOT NULL
);

-- Create cms_settings table
CREATE TABLE IF NOT EXISTS public.cms_settings (
  id text PRIMARY KEY DEFAULT 'banner',
  banner text NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert initial admin user if not exists
INSERT INTO public.users (id, email, name, role, status, addresses, password, created_at)
VALUES (
  'user-admin',
  'admin@greenleaf.com',
  'Grace Leaf (Admin)',
  'admin',
  'active',
  '["420 High St, San Francisco, CA"]'::jsonb,
  'admin123',
  timezone('utc'::text, now())
) ON CONFLICT (email) DO NOTHING;

-- Insert initial cms banner setting if not exists
INSERT INTO public.cms_settings (id, banner, updated_at)
VALUES (
  'banner',
  '🌟 INTRODUCING BLUE DREAM HYBRID • POTENCY TESTED 18.5% THC • 10% OFF WITH COUPON "WELCOME10"',
  timezone('utc'::text, now())
) ON CONFLICT (id) DO NOTHING;
