/**
 * Dev Mode - Dados de simulação completos para testar ALL gamification systems
 * Ativado SOMENTE quando VITE_DEV_MODE=true no .env
 * Em produção (VITE_DEV_MODE=false ou não definido) NENHUM dado fake é usado
 */

import type { Boss, BossEncounter } from "@/hooks/useBosses";
import type { UserChest, ChestType } from "@/hooks/useChests";
import type { ShopItem } from "@/hooks/useShop";
import type { Mission, UserMission } from "@/hooks/useMissions";

export const isDevMode = () => import.meta.env.VITE_DEV_MODE === 'true';

// ==========================================
// AUTH & PROFILE (mock user básico)
// ==========================================

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
  quit_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
  current_streak: 30,
  longest_streak: 30,
  respi_coins: 1500,
  gems: 50,
  xp: 3200,
  level: 8,
  health_score: 75,
  health_crystals: 5,
  money_saved: 450.0,
  cigarettes_avoided: 600,
  days_smoke_free: 30,
  total_checkins: 28,
  last_checkin_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  league: 'ouro',
};

// ==========================================
// LEAGUES (sistema completo com ranking)
// ==========================================

export interface DevLeague {
  id: string;
  name: string;
  tier: number;
  min_xp: number;
  icon: string;
  color: string;
}

export const DEV_LEAGUES: DevLeague[] = [
  { id: 'league-1', name: 'Bronze', tier: 1, min_xp: 0, icon: '🥉', color: '#CD7F32' },
  { id: 'league-2', name: 'Prata', tier: 2, min_xp: 500, icon: '🥈', color: '#C0C0C0' },
  { id: 'league-3', name: 'Ouro', tier: 3, min_xp: 1500, icon: '🥇', color: '#FFD700' },
  { id: 'league-4', name: 'Diamante', tier: 4, min_xp: 5000, icon: '💎', color: '#00BFFF' },
  { id: 'league-5', name: 'Mestre', tier: 5, min_xp: 10000, icon: '👑', color: '#FF4500' },
  { id: 'league-6', name: 'Lenda', tier: 6, min_xp: 25000, icon: '🏆', color: '#9400D3' },
];

export interface DevLeagueParticipant {
  id: string;
  user_id: string;
  league_id: string;
  week_xp: number;
  position: number;
  display_name: string;
}

// Gera participantes simulados para o ranking
export function getDevLeagueParticipants(leagueId: string): DevLeagueParticipant[] {
  const names = [
    'Ana Clara', 'Bruno Silva', 'Carlos Mendes', 'Daniela Porto',
    'Eduardo Lima', 'Fernanda Costa', 'Gabriel Santos', 'Helena Ramos',
    'Igor Almeida', 'Juliana Ferreira', 'Kevin Oliveira', 'Larissa Moura',
    'Marcos Pereira', 'Natália Souza', 'Otávio Ribeiro',
  ];
  
  const participants: DevLeagueParticipant[] = names.map((name, i) => ({
    id: `participant-${i}`,
    user_id: i === 2 ? DEV_USER.id : `fake-user-${i}`, // Position 3 is the dev user
    league_id: leagueId,
    week_xp: Math.floor(800 - (i * 45) + Math.random() * 20),
    position: i + 1,
    display_name: i === 2 ? 'Você (Dev)' : name,
  }));

  return participants.sort((a, b) => b.week_xp - a.week_xp);
}

// ==========================================
// MISSIONS (diárias e semanais com vários estados)
// ==========================================

const DEV_MISSION_TEMPLATES: Mission[] = [
  // Diárias
  {
    id: 'mission-d1',
    type: 'daily',
    name: 'Check-in Diário',
    description: 'Faça seu check-in do dia',
    icon: '✅',
    target_value: 1,
    xp_reward: 50,
    coins_reward: 25,
    gems_reward: 0,
    category: 'checkin',
  },
  {
    id: 'mission-d2',
    type: 'daily',
    name: 'Respiração Profunda',
    description: 'Pratique 3 exercícios de respiração',
    icon: '🌬️',
    target_value: 3,
    xp_reward: 75,
    coins_reward: 30,
    gems_reward: 1,
    category: 'breathing',
  },
  {
    id: 'mission-d3',
    type: 'daily',
    name: 'Diário de Progresso',
    description: 'Escreva sobre seu dia sem cigarros',
    icon: '📝',
    target_value: 1,
    xp_reward: 40,
    coins_reward: 20,
    gems_reward: 0,
    category: 'journal',
  },
  {
    id: 'mission-d4',
    type: 'daily',
    name: 'Hidratação',
    description: 'Beba 8 copos de água',
    icon: '💧',
    target_value: 8,
    xp_reward: 30,
    coins_reward: 15,
    gems_reward: 0,
    category: 'health',
  },
  // Semanais
  {
    id: 'mission-w1',
    type: 'weekly',
    name: 'Streak de 7 dias',
    description: 'Mantenha streak por 7 dias consecutivos',
    icon: '🔥',
    target_value: 7,
    xp_reward: 300,
    coins_reward: 150,
    gems_reward: 5,
    category: 'streak',
  },
  {
    id: 'mission-w2',
    type: 'weekly',
    name: 'Derrotar 3 Bosses',
    description: 'Derrote 3 bosses durante a semana',
    icon: '⚔️',
    target_value: 3,
    xp_reward: 250,
    coins_reward: 100,
    gems_reward: 3,
    category: 'boss',
  },
  {
    id: 'mission-w3',
    type: 'weekly',
    name: 'Economista',
    description: 'Economize R$50 não fumando',
    icon: '💰',
    target_value: 50,
    xp_reward: 200,
    coins_reward: 80,
    gems_reward: 2,
    category: 'savings',
  },
];

export function getDevMissions(): UserMission[] {
  return DEV_MISSION_TEMPLATES.map((mission, i) => {
    // Simular diferentes estados: completada+resgatada, completada+não-resgatada, em progresso, não iniciada
    let current_progress: number;
    let completed: boolean;
    let claimed: boolean;

    if (i === 0) {
      // Completada e resgatada
      current_progress = mission.target_value;
      completed = true;
      claimed = true;
    } else if (i === 1) {
      // Completada mas NÃO resgatada (botão "Resgatar" deve aparecer)
      current_progress = mission.target_value;
      completed = true;
      claimed = false;
    } else if (i === 3 || i === 4) {
      // Em progresso parcial
      current_progress = Math.floor(mission.target_value * 0.6);
      completed = false;
      claimed = false;
    } else {
      // Algum progresso
      current_progress = Math.floor(mission.target_value * 0.3);
      completed = false;
      claimed = false;
    }

    return {
      id: `user-mission-${i}`,
      mission_id: mission.id,
      current_progress,
      completed,
      claimed,
      mission,
    };
  });
}

// ==========================================
// BOSSES (com fases de combate)
// ==========================================

export const DEV_BOSSES: Boss[] = [
  {
    id: 'boss-daily-1',
    name: 'Dragão da Ansiedade',
    description: 'Um boss que representa a ansiedade que surge quando bate a vontade de fumar',
    icon: '🐉',
    difficulty: 'daily',
    max_health: 100,
    phases: [
      { name: 'Respiração Controlada', type: 'breathing', duration: 30 },
      { name: 'Foco Mental', type: 'focus', duration: 20 },
      { name: 'Golpe Final', type: 'power', duration: 15 },
    ],
  },
  {
    id: 'boss-weekly-1',
    name: 'Hidra do Estresse',
    description: 'Um boss semanal poderoso - cada cabeça representa um gatilho diferente',
    icon: '🐍',
    difficulty: 'weekly',
    max_health: 500,
    phases: [
      { name: 'Identificar Gatilhos', type: 'awareness', duration: 45 },
      { name: 'Técnica de Relaxamento', type: 'relax', duration: 40 },
      { name: 'Meditação Guiada', type: 'meditation', duration: 60 },
      { name: 'Combate Final', type: 'power', duration: 30 },
    ],
  },
];

export const DEV_TODAY_ENCOUNTER: BossEncounter | null = null; // null = pode lutar hoje

// ==========================================
// CHESTS (vários tipos e estados)
// ==========================================

const DEV_CHEST_TYPES: ChestType[] = [
  {
    id: 'ct-bronze',
    name: 'Baú de Bronze',
    rarity: 'bronze',
    icon: '📦',
    min_xp: 10, max_xp: 50,
    min_coins: 5, max_coins: 25,
    min_gems: 0, max_gems: 1,
    gem_chance: 10,
  },
  {
    id: 'ct-silver',
    name: 'Baú de Prata',
    rarity: 'silver',
    icon: '🗃️',
    min_xp: 30, max_xp: 100,
    min_coins: 15, max_coins: 60,
    min_gems: 0, max_gems: 3,
    gem_chance: 30,
  },
  {
    id: 'ct-gold',
    name: 'Baú de Ouro',
    rarity: 'gold',
    icon: '✨',
    min_xp: 80, max_xp: 250,
    min_coins: 40, max_coins: 120,
    min_gems: 1, max_gems: 5,
    gem_chance: 60,
  },
  {
    id: 'ct-diamond',
    name: 'Baú Diamante',
    rarity: 'diamond',
    icon: '💎',
    min_xp: 200, max_xp: 500,
    min_coins: 100, max_coins: 300,
    min_gems: 3, max_gems: 10,
    gem_chance: 100,
  },
];

export function getDevChests(): UserChest[] {
  return [
    // Baú de bronze NÃO ABERTO
    {
      id: 'chest-1',
      user_id: DEV_USER.id,
      chest_type_id: 'ct-bronze',
      opened: false,
      rewards: {},
      earned_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      chest_type: DEV_CHEST_TYPES[0],
    },
    // Baú de prata NÃO ABERTO
    {
      id: 'chest-2',
      user_id: DEV_USER.id,
      chest_type_id: 'ct-silver',
      opened: false,
      rewards: {},
      earned_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      chest_type: DEV_CHEST_TYPES[1],
    },
    // Baú de ouro NÃO ABERTO
    {
      id: 'chest-3',
      user_id: DEV_USER.id,
      chest_type_id: 'ct-gold',
      opened: false,
      rewards: {},
      earned_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      chest_type: DEV_CHEST_TYPES[2],
    },
    // Baú diamante ABERTO (com rewards)
    {
      id: 'chest-4',
      user_id: DEV_USER.id,
      chest_type_id: 'ct-diamond',
      opened: true,
      rewards: { xp: 350, coins: 200, gems: 7 },
      earned_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      opened_at: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(),
      chest_type: DEV_CHEST_TYPES[3],
    },
    // Baú bronze ABERTO
    {
      id: 'chest-5',
      user_id: DEV_USER.id,
      chest_type_id: 'ct-bronze',
      opened: true,
      rewards: { xp: 25, coins: 10, gems: 0 },
      earned_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      opened_at: new Date(Date.now() - 71 * 60 * 60 * 1000).toISOString(),
      chest_type: DEV_CHEST_TYPES[0],
    },
  ];
}

// ==========================================
// SHOP (itens com preços variados)
// ==========================================

export const DEV_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'shop-1',
    name: 'Escudo Anti-Craving',
    description: 'Bloqueia o próximo impulso de fumar por 2 horas. Ativa automaticamente quando detecta momento de fraqueza.',
    type: 'powerup',
    icon: '🛡️',
    price_coins: 100,
    price_gems: 0,
    duration_hours: 2,
    effect: { type: 'craving_shield', multiplier: 1 },
    is_active: true,
  },
  {
    id: 'shop-2',
    name: 'XP Boost 2x',
    description: 'Duplica todos os XP ganhos durante 4 horas. Perfeito para dias de muitas missões.',
    type: 'powerup',
    icon: '⚡',
    price_coins: 250,
    price_gems: 2,
    duration_hours: 4,
    effect: { type: 'xp_multiplier', multiplier: 2 },
    is_active: true,
  },
  {
    id: 'shop-3',
    name: 'Protetor de Streak',
    description: 'Protege seu streak por 1 dia caso você esqueça de fazer check-in. Essencial para não perder progresso.',
    type: 'powerup',
    icon: '🔥',
    price_coins: 500,
    price_gems: 5,
    duration_hours: 24,
    effect: { type: 'streak_freeze', multiplier: 1 },
    is_active: true,
  },
  {
    id: 'shop-4',
    name: 'Avatar Premium: Guerreiro',
    description: 'Avatar exclusivo de guerreiro da saúde para seu perfil.',
    type: 'cosmetic',
    icon: '⚔️',
    price_coins: 800,
    price_gems: 0,
    effect: { type: 'avatar', value: 'warrior' },
    is_active: true,
  },
  {
    id: 'shop-5',
    name: 'Baú Surpresa',
    description: 'Compre um baú aleatório. Pode ser bronze, prata, ouro ou até diamante!',
    type: 'powerup',
    icon: '🎁',
    price_coins: 300,
    price_gems: 3,
    effect: { type: 'random_chest', multiplier: 1 },
    is_active: true,
  },
  {
    id: 'shop-6',
    name: 'Medalha de Honra',
    description: 'Badge exclusiva exibida no seu perfil. Mostra que você apoia o app.',
    type: 'cosmetic',
    icon: '🎖️',
    price_coins: 1200,
    price_gems: 10,
    effect: { type: 'badge', value: 'honor' },
    is_active: true,
  },
];

// ==========================================
// SQUADS
// ==========================================

export interface DevSquad {
  id: string;
  name: string;
  description: string;
  max_members: number;
  squad_streak: number;
  created_at: string;
  member_count: number;
}

export const DEV_SQUADS: DevSquad[] = [
  {
    id: 'squad-1',
    name: 'Guerreiros da Saúde',
    description: 'Um grupo de pessoas comprometidas em parar de fumar juntas.',
    max_members: 10,
    squad_streak: 45,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    member_count: 8,
  },
  {
    id: 'squad-2',
    name: 'Pulmões Livres',
    description: 'Respiramos livremente! Apoio mútuo e dicas diárias.',
    max_members: 15,
    squad_streak: 22,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    member_count: 12,
  },
  {
    id: 'squad-3',
    name: 'Time Anti-Tabaco',
    description: 'Competição saudável para ver quem mantém o streak mais longo.',
    max_members: 8,
    squad_streak: 67,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    member_count: 8, // Cheio
  },
  {
    id: 'squad-4',
    name: 'Novatos Unidos',
    description: 'Para quem está começando a jornada. Todos são bem-vindos!',
    max_members: 20,
    squad_streak: 5,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    member_count: 3,
  },
];
