-- Create user profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create a trigger to create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add user_id to onboarding_sessions table
ALTER TABLE public.onboarding_sessions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add missing columns to onboarding_sessions to match repository expectations
ALTER TABLE public.onboarding_sessions
  ADD COLUMN IF NOT EXISTS completed_steps TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS step_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS analytics JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS recovery_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Create index for recovery token lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_recovery_token 
  ON public.onboarding_sessions(recovery_token) 
  WHERE recovery_token IS NOT NULL;

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_sessions_user_id 
  ON public.onboarding_sessions(user_id) 
  WHERE user_id IS NOT NULL;

-- Update RLS policies for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Update RLS policies for onboarding_sessions table
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own onboarding sessions
CREATE POLICY "Users can view own onboarding sessions" ON public.onboarding_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own onboarding sessions
CREATE POLICY "Users can insert own onboarding sessions" ON public.onboarding_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own onboarding sessions
CREATE POLICY "Users can update own onboarding sessions" ON public.onboarding_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on onboarding_sessions table
DROP TRIGGER IF EXISTS update_onboarding_sessions_updated_at ON public.onboarding_sessions;
CREATE TRIGGER update_onboarding_sessions_updated_at
  BEFORE UPDATE ON public.onboarding_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();