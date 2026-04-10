-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================================
-- BLOG POSTS (website blog managed via CMS)
-- ============================================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  body_html TEXT,
  cover_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published posts" ON blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can manage posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- CONTENT (articles from marea-app)
-- ============================================================
CREATE TABLE IF NOT EXISTS content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,
  tags TEXT[],
  read_time INTEGER DEFAULT 5,
  is_premium BOOLEAN DEFAULT false,
  author TEXT,
  body TEXT,
  cover_url TEXT,
  published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published content" ON content
  FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can manage content" ON content
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- USER PROFILES (extended from auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'member')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  articles_read TEXT[] DEFAULT '{}',
  assessment_stage TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ARTICLE READS (track which articles users have read)
-- ============================================================
CREATE TABLE IF NOT EXISTS article_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_slug TEXT NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, article_slug)
);

ALTER TABLE article_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own article reads" ON article_reads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own article reads" ON article_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all article reads" ON article_reads
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- ANALYTICS EVENTS (lightweight event tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can insert events" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read events" ON analytics_events
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-assets');

CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'public-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'public-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'public-assets' AND auth.role() = 'authenticated');
