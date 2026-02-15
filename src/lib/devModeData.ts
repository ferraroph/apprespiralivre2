/**
 * Dev Mode - Mock data para testar app sem autenticação
 * Ativado quando VITE_DEV_MODE=true no .env
 */

export const isDevMode = () => import.meta.env.VITE_DEV_MODE === 'true';

export const DEV_USER = {
  id: 'dev-user-00000-00000-00000',
  email: 'dev@respira-livre.com',
  app_metadata: {},
  user_metadata: { full_name: 'Desenvolvedor' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as any;

export const DEV_SESSION = {
  access_token: 'dev-token',
  refresh_token: 'dev-refresh',
  expires_in: 999999,
  token_type: 'bearer',
  user: DEV_USER,
} as any;

export const DEV_PROFILE = {
  id: 'dev-profile-001',
  user_id: DEV_USER.id,
  display_name: 'Desenvolvedor',
  quit_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  cigarettes_per_day: 20,
  pack_price: 15.0,
  cigarettes_per_pack: 20,
  motivation: 'Testar o app',
  created_at: new Date().toISOString(),
};

export const DEV_PROGRESS = {
  id: 'dev-progress-001',
  user_id: DEV_USER.id,
  streak: 30,
  longest_streak: 30,
  respi_coins: 1500,
  gems: 50,
  xp: 3200,
  level: 8,
  health_score: 75,
  money_saved: 450.0,
  cigarettes_avoided: 600,
  days_smoke_free: 30,
  total_checkins: 28,
  last_checkin_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
};
