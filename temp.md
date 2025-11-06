query: "-- Seed achievement categories
INSERT INTO public.achievement_categories (name, icon, color) VALUES
('Streak', '🔥', '#FF6B6B'),
('Social', '👥', '#4ECDC4'),
('Challenge', '⚔️', '#FFE66D'),
('Secret', '🔒', '#A8DADC')
ON CONFLICT DO NOTHING;

-- Seed leagues
INSERT INTO public.leagues (name, tier, min_xp, icon, color) VALUES
('Iniciante', 0, 0, '🥉', '#9CA3AF'),
('Bronze', 1, 100, '🥉', '#CD7F32'),
('Prata', 2, 500, '🥈', '#C0C0C0'),
('Ouro', 3, 1500, '🥇', '#FFD700'),
('Platina', 4, 3000, '💎', '#00CED1'),
('Diamante', 5, 5000, '💎', '#4169E1'),
('Mestre', 6, 10000, '👑', '#9370DB'),
('Lendário', 7, 20000, '⭐', '#FF1493')
ON CONFLICT DO NOTHING;"
