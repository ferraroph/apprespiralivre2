-- ============================================
-- GAMIFICATION SYSTEM MIGRATION
-- Sistema completo de gamificação avançada
-- ============================================

-- Add gems and health_crystals to progress table
ALTER TABLE public.progress 
ADD COLUMN IF NOT EXISTS gems integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS health_crystals integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS last_crystal_regen timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS elo_rating integer DEFAULT 1000;

-- ============================================
-- LEAGUES SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.leagues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  tier integer NOT NULL,
  min_xp integer NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.league_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  week_xp integer DEFAULT 0,
  position integer DEFAULT 0,
  week_start date NOT NULL,
  week_end date NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default leagues
INSERT INTO public.leagues (name, tier, min_xp, color, icon) VALUES
('Liga Iniciante', 1, 0, 'hsl(30, 100%, 50%)', '🥉'),
('Liga Desafiante', 2, 500, 'hsl(0, 0%, 75%)', '🥈'),
('Liga Guerreiro', 3, 2000, 'hsl(48, 100%, 55%)', '🥇'),
('Liga Campeão', 4, 5000, 'hsl(200, 50%, 70%)', '💎'),
('Liga Mestre', 5, 10000, 'hsl(270, 60%, 65%)', '👑'),
('Liga Lendário', 6, 20000, 'hsl(120, 100%, 50%)', '🏆');

-- ============================================
-- MISSIONS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.missions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('daily', 'weekly')),
  name text NOT NULL,
  description text,
  icon text NOT NULL,
  target_value integer NOT NULL,
  xp_reward integer DEFAULT 0,
  coins_reward integer DEFAULT 0,
  gems_reward integer DEFAULT 0,
  category text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_missions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  current_progress integer DEFAULT 0,
  completed boolean DEFAULT false,
  claimed boolean DEFAULT false,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, mission_id, date)
);

-- Insert default daily missions
INSERT INTO public.missions (type, name, description, icon, target_value, xp_reward, coins_reward, category) VALUES
('daily', 'Check-in Triplo', 'Fazer 3 check-ins no dia', '✅', 3, 100, 50, 'checkin'),
('daily', 'Conversa com Coach IA', 'Conversar por 5 minutos', '🤖', 1, 50, 25, 'coach'),
('daily', 'Ajuda no Squad', 'Enviar 1 mensagem motivacional', '🤝', 1, 75, 35, 'social'),
('daily', 'Derrotar Boss', 'Vencer desafio contra boss', '⚔️', 1, 150, 100, 'boss'),
('weekly', 'Streak de Ferro', 'Manter streak por 7 dias', '🔥', 7, 500, 300, 'streak'),
('weekly', 'Subir na Liga', 'Terminar no top 10', '📈', 3, 300, 200, 'league');

-- ============================================
-- BOSS BATTLES SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.boss_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  icon text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('daily', 'weekly')),
  max_health integer NOT NULL,
  phases jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.boss_encounters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  boss_id uuid NOT NULL REFERENCES public.boss_types(id) ON DELETE CASCADE,
  damage_dealt integer DEFAULT 0,
  completed boolean DEFAULT false,
  victory boolean DEFAULT false,
  rewards jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert default bosses
INSERT INTO public.boss_types (name, description, icon, difficulty, max_health, phases) VALUES
('Senhor da Tentação', 'Boss diário que testa sua resistência', '👹', 'daily', 1000, 
'[
  {"name": "Identificação de Gatilhos", "type": "quiz", "duration": 30},
  {"name": "Respiração Consciente", "type": "breathing", "duration": 60},
  {"name": "Substituição Mental", "type": "drag_drop", "duration": 90},
  {"name": "Confronto Mental", "type": "tap_game", "duration": 30}
]'::jsonb),
('Demônio da Recaída', 'Boss semanal cooperativo do squad', '😈', 'weekly', 5000,
'[
  {"name": "Desafio Coletivo", "type": "cooperative", "duration": 300},
  {"name": "Força do Grupo", "type": "team_effort", "duration": 300}
]'::jsonb);

-- ============================================
-- CHEST SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.chest_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  icon text NOT NULL,
  min_coins integer DEFAULT 0,
  max_coins integer DEFAULT 0,
  min_xp integer DEFAULT 0,
  max_xp integer DEFAULT 0,
  gem_chance integer DEFAULT 0,
  min_gems integer DEFAULT 0,
  max_gems integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_chests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  chest_type_id uuid NOT NULL REFERENCES public.chest_types(id) ON DELETE CASCADE,
  opened boolean DEFAULT false,
  rewards jsonb,
  earned_at timestamp with time zone DEFAULT now(),
  opened_at timestamp with time zone
);

-- Insert chest types
INSERT INTO public.chest_types (name, rarity, icon, min_coins, max_coins, min_xp, max_xp, gem_chance, min_gems, max_gems) VALUES
('Baú Bronze', 'common', '🎁', 30, 50, 10, 20, 5, 1, 1),
('Baú Prata', 'rare', '🎁', 100, 150, 50, 80, 20, 2, 3),
('Baú Ouro', 'epic', '💎', 200, 300, 100, 150, 50, 1, 3),
('Baú Diamante', 'legendary', '💎', 500, 800, 300, 500, 100, 5, 10);

-- ============================================
-- ACHIEVEMENTS SYSTEM (Enhanced)
-- ============================================

CREATE TABLE IF NOT EXISTS public.achievement_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Add columns to existing achievements table
ALTER TABLE public.achievements 
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.achievement_categories(id),
ADD COLUMN IF NOT EXISTS rarity text DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS xp_reward integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS coins_reward integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS gems_reward integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_secret boolean DEFAULT false;

-- Insert achievement categories
INSERT INTO public.achievement_categories (name, icon, color) VALUES
('Primeiros Passos', '🚀', 'hsl(200, 100%, 50%)'),
('Batalhas', '⚔️', 'hsl(0, 100%, 50%)'),
('Social', '🤝', 'hsl(270, 100%, 60%)'),
('Progresso', '📈', 'hsl(120, 100%, 50%)');

-- ============================================
-- SHOP SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.shop_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('powerup', 'customization')),
  price_gems integer DEFAULT 0,
  price_coins integer DEFAULT 0,
  duration_hours integer,
  effect jsonb,
  icon text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_id uuid NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  active boolean DEFAULT false,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert shop items
INSERT INTO public.shop_items (name, description, type, price_gems, price_coins, duration_hours, effect, icon) VALUES
('Streak Freeze', 'Protege seu streak por 24h', 'powerup', 10, 200, 24, '{"type": "streak_protection"}'::jsonb, '🧊'),
('Double XP Boost', '2x XP por 24h', 'powerup', 5, 150, 24, '{"type": "xp_multiplier", "value": 2}'::jsonb, '⚡'),
('Health Crystal Refill', 'Restaura todos os 5 cristais', 'powerup', 3, 100, NULL, '{"type": "crystal_refill", "value": 5}'::jsonb, '❤️'),
('Boss Radar', 'Mostra fraquezas do boss por 7 dias', 'powerup', 8, NULL, 168, '{"type": "boss_weakness"}'::jsonb, '🎯');

-- ============================================
-- DUELS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS public.duels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id uuid NOT NULL,
  opponent_id uuid NOT NULL,
  bet_amount integer NOT NULL,
  duel_type text NOT NULL CHECK (duel_type IN ('xp', 'missions', 'bosses')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  challenger_score integer DEFAULT 0,
  opponent_score integer DEFAULT 0,
  winner_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Leagues policies
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view leagues" ON public.leagues FOR SELECT USING (true);

ALTER TABLE public.league_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view league participants" ON public.league_participants FOR SELECT USING (true);
CREATE POLICY "Users can manage their league participation" ON public.league_participants FOR ALL USING (auth.uid() = user_id);

-- Missions policies
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active missions" ON public.missions FOR SELECT USING (is_active = true);

ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their missions" ON public.user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their missions" ON public.user_missions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their missions" ON public.user_missions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Boss battles policies
ALTER TABLE public.boss_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view boss types" ON public.boss_types FOR SELECT USING (true);

ALTER TABLE public.boss_encounters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their boss encounters" ON public.boss_encounters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their boss encounters" ON public.boss_encounters FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chests policies
ALTER TABLE public.chest_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view chest types" ON public.chest_types FOR SELECT USING (true);

ALTER TABLE public.user_chests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their chests" ON public.user_chests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their chests" ON public.user_chests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their chests" ON public.user_chests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievement categories policies
ALTER TABLE public.achievement_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view achievement categories" ON public.achievement_categories FOR SELECT USING (true);

-- Shop policies
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active shop items" ON public.shop_items FOR SELECT USING (is_active = true);

ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their inventory" ON public.user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their inventory" ON public.user_inventory FOR ALL USING (auth.uid() = user_id);

-- Duels policies
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their duels" ON public.duels FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
CREATE POLICY "Users can create duels" ON public.duels FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Participants can update duels" ON public.duels FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get user's current league
CREATE OR REPLACE FUNCTION public.get_user_league(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp integer;
  v_league_id uuid;
BEGIN
  -- Get user XP
  SELECT xp INTO v_xp FROM public.progress WHERE user_id = p_user_id;
  
  -- Get appropriate league
  SELECT id INTO v_league_id 
  FROM public.leagues 
  WHERE min_xp <= v_xp 
  ORDER BY min_xp DESC 
  LIMIT 1;
  
  RETURN v_league_id;
END;
$$;

-- Function to update league positions
CREATE OR REPLACE FUNCTION public.update_league_positions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update positions based on week_xp
  UPDATE public.league_participants lp
  SET position = ranked.row_num
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY league_id ORDER BY week_xp DESC) as row_num
    FROM public.league_participants
    WHERE week_end >= CURRENT_DATE
  ) ranked
  WHERE lp.id = ranked.id;
END;
$$;

-- Function to create chest after checkin
CREATE OR REPLACE FUNCTION public.create_daily_chest(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bronze_chest_id uuid;
BEGIN
  -- Get bronze chest type
  SELECT id INTO v_bronze_chest_id 
  FROM public.chest_types 
  WHERE name = 'Baú Bronze' 
  LIMIT 1;
  
  -- Create chest for user
  INSERT INTO public.user_chests (user_id, chest_type_id)
  VALUES (p_user_id, v_bronze_chest_id);
END;
$$;

-- Trigger to create chest after checkin
CREATE OR REPLACE FUNCTION public.trigger_create_checkin_chest()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.create_daily_chest(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_checkin_create_chest ON public.checkins;
CREATE TRIGGER on_checkin_create_chest
AFTER INSERT ON public.checkins
FOR EACH ROW
EXECUTE FUNCTION public.trigger_create_checkin_chest();