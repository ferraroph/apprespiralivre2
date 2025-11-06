-- ============================================
-- GAMIFICATION SYSTEM SEED DATA
-- Dados iniciais para o sistema de gamificação
-- ============================================

-- Seed achievement categories
INSERT INTO public.achievement_categories (name, icon, color) VALUES
('Streak', '🔥', '#FF6B6B'),
('Social', '👥', '#4ECDC4'),
('Challenge', '⚔️', '#FFE66D'),
('Secret', '🔒', '#A8DADC')
ON CONFLICT DO NOTHING;

-- Seed leagues (updated data to match temp.md)
INSERT INTO public.leagues (name, tier, min_xp, icon, color) VALUES
('Iniciante', 0, 0, '🥉', '#9CA3AF'),
('Bronze', 1, 100, '🥉', '#CD7F32'),
('Prata', 2, 500, '🥈', '#C0C0C0'),
('Ouro', 3, 1500, '🥇', '#FFD700'),
('Platina', 4, 3000, '💎', '#00CED1'),
('Diamante', 5, 5000, '💎', '#4169E1'),
('Mestre', 6, 10000, '👑', '#9370DB'),
('Lendário', 7, 20000, '⭐', '#FF1493')
ON CONFLICT DO NOTHING;

-- Seed daily missions
INSERT INTO public.missions (type, name, description, icon, target_value, xp_reward, coins_reward, gems_reward, category) VALUES
-- Daily missions
('daily', 'Check-in Matinal', 'Fazer seu primeiro check-in do dia', '🌅', 1, 50, 25, 0, 'checkin'),
('daily', 'Triplo Check-in', 'Fazer 3 check-ins no mesmo dia', '✅', 3, 100, 50, 1, 'checkin'),
('daily', 'Conversa com IA', 'Conversar 5 minutos com o Coach IA', '🤖', 300, 75, 35, 0, 'coach'),
('daily', 'Ajuda no Squad', 'Enviar mensagem motivacional no squad', '🤝', 1, 60, 30, 0, 'social'),
('daily', 'Derrotar Boss Diário', 'Vencer o desafio contra o boss do dia', '⚔️', 1, 150, 100, 2, 'boss'),
('daily', 'Respiração Focada', 'Completar 10 minutos de respiração', '🫁', 600, 80, 40, 0, 'breathing'),

-- Weekly missions
('weekly', 'Streak de Ferro', 'Manter streak por 7 dias consecutivos', '🔥', 7, 500, 300, 5, 'streak'),
('weekly', 'Social Butterfly', 'Enviar 10 mensagens no squad', '🦋', 10, 300, 200, 3, 'social'),
('weekly', 'Subir na Liga', 'Terminar no top 10 da sua liga', '📈', 1, 400, 250, 4, 'league'),
('weekly', 'Conquistador', 'Derrotar 5 bosses na semana', '👑', 5, 600, 400, 8, 'boss'),
('weekly', 'Mestre da Respiração', 'Acumular 60 minutos de respiração', '🧘', 3600, 350, 225, 3, 'breathing'),
('weekly', 'Coach Companion', 'Conversar 30 minutos com IA na semana', '🎓', 1800, 250, 150, 2, 'coach')
ON CONFLICT DO NOTHING;

-- Seed boss types (complementar aos existentes)
INSERT INTO public.boss_types (name, description, icon, difficulty, max_health, phases) VALUES
('Ansiedade Matinal', 'Boss que aparece logo cedo testando sua rotina', '😰', 'daily', 800, 
'[
  {"name": "Reconhecimento", "type": "breathing", "duration": 45},
  {"name": "Controle Mental", "type": "tap_calm", "duration": 60},
  {"name": "Vitória Matinal", "type": "affirmation", "duration": 30}
]'::jsonb),

('Estresse Noturno', 'Boss que ataca antes de dormir', '🌙', 'daily', 900, 
'[
  {"name": "Relaxamento", "type": "breathing", "duration": 90},
  {"name": "Pensamentos Positivos", "type": "meditation", "duration": 120},
  {"name": "Paz Mental", "type": "visualization", "duration": 60}
]'::jsonb),

('Dragão da Recaída', 'Boss semanal épico do squad', '🐉', 'weekly', 8000,
'[
  {"name": "Resistência Coletiva", "type": "cooperative", "duration": 180},
  {"name": "Força Unida", "type": "team_effort", "duration": 240},
  {"name": "Vitória Final", "type": "celebration", "duration": 120}
]'::jsonb)
ON CONFLICT DO NOTHING;

-- Seed additional chest types
INSERT INTO public.chest_types (name, rarity, icon, min_coins, max_coins, min_xp, max_xp, gem_chance, min_gems, max_gems) VALUES
('Baú Mistério', 'rare', '🎭', 75, 125, 30, 60, 30, 1, 2),
('Baú Épico', 'epic', '⭐', 250, 400, 150, 250, 75, 3, 7),
('Baú Lendário', 'legendary', '🏆', 600, 1000, 400, 700, 100, 8, 15),
('Baú do Boss', 'epic', '⚔️', 300, 500, 200, 300, 90, 5, 10)
ON CONFLICT DO NOTHING;

-- Seed shop items (power-ups e customizações)
INSERT INTO public.shop_items (name, description, type, price_gems, price_coins, duration_hours, effect, icon) VALUES
-- Power-ups
('Escudo Dourado', 'Protege de perder streak por 48h', 'powerup', 15, 300, 48, '{"type": "streak_protection", "duration": 48}'::jsonb, '🛡️'),
('Multiplicador XP', 'Triplica XP ganho por 12h', 'powerup', 12, 250, 12, '{"type": "xp_multiplier", "value": 3}'::jsonb, '⚡'),
('Cristais Infinitos', 'Cristais ilimitados por 6h', 'powerup', 20, 400, 6, '{"type": "unlimited_crystals"}'::jsonb, '💎'),
('Força do Dragão', 'Dobra dano contra bosses por 24h', 'powerup', 18, 350, 24, '{"type": "boss_damage", "multiplier": 2}'::jsonb, '🐲'),
('Radar Premium', 'Mostra todas as fraquezas por 14 dias', 'powerup', 25, 500, 336, '{"type": "boss_weakness_premium"}'::jsonb, '🎯'),

-- Customizações
('Avatar Guerreiro', 'Visual épico de guerreiro', 'customization', 50, 1000, NULL, '{"type": "avatar", "theme": "warrior"}'::jsonb, '⚔️'),
('Avatar Mago', 'Visual místico de mago', 'customization', 50, 1000, NULL, '{"type": "avatar", "theme": "mage"}'::jsonb, '🧙'),
('Avatar Dragão', 'Visual lendário de dragão', 'customization', 100, 2000, NULL, '{"type": "avatar", "theme": "dragon"}'::jsonb, '🐉'),
('Tema Noite', 'Interface tema escuro premium', 'customization', 30, 600, NULL, '{"type": "theme", "name": "night"}'::jsonb, '🌙'),
('Tema Ouro', 'Interface dourada luxuosa', 'customization', 75, 1500, NULL, '{"type": "theme", "name": "gold"}'::jsonb, '👑')
ON CONFLICT DO NOTHING;

-- Seed initial achievements
INSERT INTO public.achievements (title, description, icon, category_id, rarity, xp_reward, coins_reward, gems_reward, is_secret) 
SELECT 
  title, description, icon, cat.id, rarity, xp_reward, coins_reward, gems_reward, is_secret
FROM (VALUES
  -- Streak achievements
  ('Primeiro Passo', 'Faça seu primeiro check-in', '👶', 'Streak', 'bronze', 50, 25, 0, false),
  ('Começando Bem', 'Mantenha streak por 3 dias', '🔥', 'Streak', 'bronze', 100, 50, 1, false),
  ('Semana Forte', 'Mantenha streak por 7 dias', '💪', 'Streak', 'silver', 200, 100, 2, false),
  ('Mês Imparável', 'Mantenha streak por 30 dias', '🚀', 'Streak', 'gold', 500, 300, 5, false),
  ('Lenda Viva', 'Mantenha streak por 100 dias', '👑', 'Streak', 'legendary', 1000, 500, 15, false),
  
  -- Social achievements
  ('Primeira Conversa', 'Envie sua primeira mensagem no squad', '💬', 'Social', 'bronze', 50, 25, 0, false),
  ('Motivador', 'Envie 10 mensagens motivacionais', '🤝', 'Social', 'silver', 150, 75, 2, false),
  ('Líder Nato', 'Seja o mais ativo do squad por uma semana', '👑', 'Social', 'gold', 300, 200, 5, false),
  ('Inspiração', 'Receba 50 reações positivas', '⭐', 'Social', 'gold', 250, 150, 3, false),
  
  -- Challenge achievements
  ('Primeira Vitória', 'Derrote seu primeiro boss', '⚔️', 'Challenge', 'bronze', 100, 50, 1, false),
  ('Caçador', 'Derrote 10 bosses', '🏹', 'Challenge', 'silver', 200, 100, 3, false),
  ('Exterminador', 'Derrote 50 bosses', '💀', 'Challenge', 'gold', 500, 300, 8, false),
  ('Boss Slayer', 'Derrote boss sem perder cristal', '💎', 'Challenge', 'epic', 400, 250, 6, false),
  ('Dragão Slayer', 'Derrote o Dragão da Recaída', '🐉', 'Challenge', 'legendary', 800, 500, 12, false),
  
  -- Secret achievements
  ('Madrugador Secreto', 'Faça check-in às 5h da manhã', '🌅', 'Secret', 'epic', 300, 200, 5, true),
  ('Noite Adentro', 'Faça check-in após meia-noite', '🌙', 'Secret', 'epic', 300, 200, 5, true),
  ('Lucky Seven', 'Abra 7 baús no mesmo dia', '🍀', 'Secret', 'rare', 200, 150, 3, true),
  ('Perfeccionista', 'Complete todas as missões diárias por uma semana', '✨', 'Secret', 'legendary', 600, 400, 10, true),
  ('O Escolhido', 'Atinja exatamente 1337 XP', '🎯', 'Secret', 'legendary', 1337, 777, 20, true)
) AS v(title, description, icon, category_name, rarity, xp_reward, coins_reward, gems_reward, is_secret)
JOIN public.achievement_categories cat ON cat.name = v.category_name
ON CONFLICT DO NOTHING;

-- ============================================
-- INITIAL DATA SETUP FUNCTIONS
-- ============================================

-- Function to setup initial user gamification data
CREATE OR REPLACE FUNCTION public.setup_user_gamification(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bronze_chest_id uuid;
  v_daily_missions cursor FOR 
    SELECT id FROM public.missions WHERE type = 'daily' AND is_active = true LIMIT 3;
BEGIN
  -- Give welcome chest
  SELECT id INTO v_bronze_chest_id 
  FROM public.chest_types 
  WHERE name = 'Baú Bronze' 
  LIMIT 1;
  
  IF v_bronze_chest_id IS NOT NULL THEN
    INSERT INTO public.user_chests (user_id, chest_type_id)
    VALUES (p_user_id, v_bronze_chest_id);
  END IF;
  
  -- Assign daily missions for today
  FOR mission IN v_daily_missions LOOP
    INSERT INTO public.user_missions (user_id, mission_id, date)
    VALUES (p_user_id, mission.id, CURRENT_DATE)
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Initialize league participation for current week
  INSERT INTO public.league_participants (
    league_id, 
    user_id, 
    week_start, 
    week_end
  )
  SELECT 
    public.get_user_league(p_user_id),
    p_user_id,
    date_trunc('week', CURRENT_DATE)::date,
    (date_trunc('week', CURRENT_DATE) + interval '6 days')::date
  ON CONFLICT DO NOTHING;
END;
$$;

-- Trigger to setup gamification for new users
CREATE OR REPLACE FUNCTION public.trigger_setup_user_gamification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Setup gamification data for new user
  PERFORM public.setup_user_gamification(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Create trigger on progress table (when user is first created)
DROP TRIGGER IF EXISTS on_user_created_setup_gamification ON public.progress;
CREATE TRIGGER on_user_created_setup_gamification
AFTER INSERT ON public.progress
FOR EACH ROW
EXECUTE FUNCTION public.trigger_setup_user_gamification();

-- ============================================
-- MISSION PROGRESS FUNCTIONS
-- ============================================

-- Function to update mission progress
CREATE OR REPLACE FUNCTION public.update_mission_progress(
  p_user_id uuid,
  p_category text,
  p_value integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mission record;
BEGIN
  -- Update daily missions
  FOR v_mission IN 
    SELECT um.id, um.current_progress, m.target_value
    FROM public.user_missions um
    JOIN public.missions m ON m.id = um.mission_id
    WHERE um.user_id = p_user_id
      AND m.category = p_category
      AND m.type = 'daily'
      AND um.date = CURRENT_DATE
      AND um.completed = false
  LOOP
    UPDATE public.user_missions
    SET current_progress = LEAST(v_mission.current_progress + p_value, v_mission.target_value),
        completed = (v_mission.current_progress + p_value >= v_mission.target_value)
    WHERE id = v_mission.id;
  END LOOP;
  
  -- Update weekly missions
  FOR v_mission IN 
    SELECT um.id, um.current_progress, m.target_value
    FROM public.user_missions um
    JOIN public.missions m ON m.id = um.mission_id
    WHERE um.user_id = p_user_id
      AND m.category = p_category
      AND m.type = 'weekly'
      AND um.date >= date_trunc('week', CURRENT_DATE)::date
      AND um.completed = false
  LOOP
    UPDATE public.user_missions
    SET current_progress = LEAST(v_mission.current_progress + p_value, v_mission.target_value),
        completed = (v_mission.current_progress + p_value >= v_mission.target_value)
    WHERE id = v_mission.id;
  END LOOP;
END;
$$;

-- ============================================
-- NOTIFICATION MESSAGES
-- ============================================

-- Insert notification messages for gamification events
INSERT INTO public.notification_messages (title, body, action_url, category) VALUES
('🎉 Missão Concluída!', 'Parabéns! Você completou uma missão e ganhou recompensas incríveis!', '/missions', 'mission'),
('⚔️ Boss Derrotado!', 'Vitória épica! Você derrotou um boss e provou sua força!', '/boss-battles', 'boss'),
('🏆 Nova Conquista!', 'Incrível! Você desbloqueou uma nova conquista!', '/achievements', 'achievement'),
('📈 Subiu de Liga!', 'Parabéns! Seu desempenho te levou para uma liga superior!', '/leagues', 'league'),
('🎁 Baú Disponível!', 'Você ganhou um novo baú! Abra agora para descobrir os tesouros!', '/chests', 'chest'),
('🔥 Streak em Chamas!', 'Sua sequência está pegando fogo! Continue assim!', '/progress', 'streak'),
('💎 Gemas Recebidas!', 'Você ganhou gemas preciosas! Use-as na loja para itens especiais!', '/shop', 'gems'),
('⚡ Power-up Ativo!', 'Seu power-up está ativo! Aproveite os benefícios especiais!', '/inventory', 'powerup')
ON CONFLICT DO NOTHING;