-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  archetype TEXT CHECK (archetype IN ('guerreiro', 'estrategista', 'inspirador', 'resiliente')),
  cigarettes_per_day INTEGER DEFAULT 0,
  price_per_pack DECIMAL(10,2) DEFAULT 0,
  quit_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create progress table for gamification
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  respi_coins INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  league TEXT DEFAULT 'iniciante' CHECK (league IN ('iniciante', 'bronze', 'prata', 'ouro', 'platina', 'diamante')),
  cigarettes_avoided INTEGER DEFAULT 0,
  money_saved DECIMAL(10,2) DEFAULT 0,
  health_score INTEGER DEFAULT 0,
  streak_freezes INTEGER DEFAULT 0,
  last_checkin_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create checkins table
CREATE TABLE public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  checkin_date DATE NOT NULL,
  mood TEXT,
  notes TEXT,
  respi_coins_earned INTEGER DEFAULT 10,
  xp_earned INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, checkin_date)
);

-- Create content table
CREATE TABLE public.content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('meditation', 'breathing', 'lesson')),
  duration_minutes INTEGER,
  media_url TEXT,
  thumbnail_url TEXT,
  xp_reward INTEGER DEFAULT 5,
  coins_reward INTEGER DEFAULT 10,
  order_index INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for progress
CREATE POLICY "Users can view their own progress"
  ON public.progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for checkins
CREATE POLICY "Users can view their own checkins"
  ON public.checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own checkins"
  ON public.checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for content (public read)
CREATE POLICY "Anyone can view content"
  ON public.content FOR SELECT
  USING (true);

-- RLS Policies for achievements
CREATE POLICY "Users can view their own achievements"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON public.progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate daily progress
CREATE OR REPLACE FUNCTION public.calculate_daily_progress(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_progress public.progress%ROWTYPE;
  v_days_since_quit INTEGER;
  v_cigarettes_per_day INTEGER;
  v_price_per_pack DECIMAL(10,2);
BEGIN
  -- Get user profile
  SELECT * INTO v_profile FROM public.profiles WHERE user_id = p_user_id;
  SELECT * INTO v_progress FROM public.progress WHERE user_id = p_user_id;
  
  -- Calculate days since quit
  v_days_since_quit := EXTRACT(DAY FROM (now() - v_profile.quit_date));
  
  -- Calculate cigarettes avoided
  v_cigarettes_per_day := COALESCE(v_profile.cigarettes_per_day, 20);
  v_price_per_pack := COALESCE(v_profile.price_per_pack, 15.00);
  
  -- Update progress
  UPDATE public.progress
  SET
    cigarettes_avoided = v_days_since_quit * v_cigarettes_per_day,
    money_saved = (v_days_since_quit * v_cigarettes_per_day * v_price_per_pack) / 20,
    health_score = LEAST(100, (v_days_since_quit * 2))
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Insert sample content
INSERT INTO public.content (title, description, type, duration_minutes, xp_reward, coins_reward, order_index) VALUES
('Meditação de Libertação', 'Liberte-se dos pensamentos negativos', 'meditation', 10, 10, 20, 1),
('Respiração 4-7-8', 'Técnica poderosa para controlar ansiedade', 'breathing', 5, 5, 10, 1),
('Por que paramos?', 'Entenda a ciência por trás do vício', 'lesson', 15, 15, 30, 1),
('Meditação da Força Interior', 'Conecte-se com seu guerreiro interior', 'meditation', 15, 10, 20, 2),
('Respiração Box', 'Técnica usada por Navy SEALs', 'breathing', 8, 5, 10, 2),
('O que acontece no seu corpo', 'Timeline de recuperação', 'lesson', 20, 15, 30, 2);