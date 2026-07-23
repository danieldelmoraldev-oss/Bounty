export type DataMode = "mock" | "live";

export interface HealthResponse {
  status: "ok" | "error";
  dataMode: DataMode;
  db: "connected" | "disconnected";
}

export type GroupRole = "admin" | "member";

export interface UserProfile {
  id: string;
  displayName: string;
  avatarEmoji: string;
  avatarColor: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface GroupSummary {
  id: string;
  name: string;
  code: string;
  memberCount: number;
  role: GroupRole;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  avatarEmoji: string;
  avatarColor: string;
  role: GroupRole;
  joinedAt: string;
  equippedFrame: string | null;
  equippedTitle: string | null;
}

export interface GroupDetail {
  id: string;
  name: string;
  code: string;
  createdAt: string;
  members: GroupMember[];
}

export interface CreateGroupRequest {
  name: string;
}

export interface JoinGroupRequest {
  code: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatarEmoji?: string;
  avatarColor?: string;
}

export interface ApiErrorBody {
  error: string;
}

export type SeasonStatus = "active" | "ended";

export interface Season {
  id: string;
  name: string;
  status: SeasonStatus;
  startedAt: string;
  endedAt: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarEmoji: string;
  avatarColor: string;
  points: number;
  isLeader: boolean;
  isLoser: boolean;
}

export interface SeasonLeaderboard {
  season: Season;
  entries: LeaderboardEntry[];
}

export interface StartSeasonRequest {
  name?: string;
}

export type ChallengeDifficulty = 1 | 2 | 3 | 4 | 5;

export const POINTS_BY_DIFFICULTY: Record<ChallengeDifficulty, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 7,
  5: 10,
};

export type ChallengeStatus = "locked" | "available" | "submitted" | "approved" | "rejected";

export type PartyStatus = "active" | "ended";

export interface Party {
  id: string;
  status: PartyStatus;
  startedAt: string;
  endedAt: string | null;
}

export interface ChallengeCard {
  id: string;
  difficulty: ChallengeDifficulty;
  prompt: string;
  status: ChallengeStatus;
  points: number;
  photoUrl: string | null;
  submittedAt: string | null;
}

export interface PartyState {
  party: Party;
  challenges: ChallengeCard[];
}

export interface SubmitChallengeRequest {
  photoUrl: string;
}

export interface ReviewChallengeRequest {
  approve: boolean;
}

export interface ReviewQueueItem {
  id: string;
  difficulty: ChallengeDifficulty;
  prompt: string;
  photoUrl: string | null;
  submittedAt: string | null;
  userId: string;
  displayName: string;
  avatarEmoji: string;
  avatarColor: string;
}

export interface FreestylePost {
  id: string;
  photoUrl: string;
  caption: string | null;
  createdAt: string;
}

export interface CreateFreestyleRequest {
  photoUrl: string;
  caption?: string;
}

export interface RateFreestyleRequest {
  stars: 1 | 2 | 3 | 4 | 5;
}

export interface AlbumAuthor {
  userId: string;
  displayName: string;
  avatarEmoji: string;
  avatarColor: string;
}

export interface AlbumChallengeItem {
  kind: "challenge";
  id: string;
  photoUrl: string;
  createdAt: string;
  author: AlbumAuthor;
  difficulty: ChallengeDifficulty;
  prompt: string;
}

export interface AlbumFreestyleItem {
  kind: "freestyle";
  id: string;
  photoUrl: string;
  createdAt: string;
  author: AlbumAuthor;
  caption: string | null;
  averageStars: number | null;
  ratingCount: number;
  myStars: number | null;
}

export type AlbumItem = AlbumChallengeItem | AlbumFreestyleItem;

export interface AlbumFolder {
  partyId: string;
  startedAt: string;
  endedAt: string | null;
  itemCount: number;
  coverUrl: string | null;
}

export type ShopItemKind =
  | "point_buff"
  | "camera_broken"
  | "level1_blocked"
  | "cosmetic_frame"
  | "cosmetic_title";

export interface ShopItem {
  id: string;
  kind: ShopItemKind;
  name: string;
  description: string;
  cost: number;
  requiresTarget?: boolean;
  multiplier?: number;
  durationMinutes?: number;
  value?: string;
}

export const SHOP_CATALOG: ShopItem[] = [
  {
    id: "buff_x15",
    kind: "point_buff",
    name: "Buff x1.5",
    description: "Multiplica x1.5 los puntos que ganes el resto de esta noche.",
    cost: 5,
    multiplier: 1.5,
  },
  {
    id: "buff_x2",
    kind: "point_buff",
    name: "Buff x2",
    description: "Multiplica x2 los puntos que ganes el resto de esta noche.",
    cost: 10,
    multiplier: 2,
  },
  {
    id: "sabotage_camera",
    kind: "camera_broken",
    name: "Cámara Rota",
    description: "Tu objetivo no puede enviar pruebas durante 15 minutos.",
    cost: 6,
    requiresTarget: true,
    durationMinutes: 15,
  },
  {
    id: "sabotage_block1",
    kind: "level1_blocked",
    name: "Bloqueo Nivel 1",
    description: "Tu objetivo no puede enviar el reto de nivel 1 durante 15 minutos.",
    cost: 4,
    requiresTarget: true,
    durationMinutes: 15,
  },
  {
    id: "cosmetic_frame_gold",
    kind: "cosmetic_frame",
    name: "Marco Dorado",
    description: "Un marco dorado para tu avatar, para siempre.",
    cost: 8,
    value: "#FFD65C",
  },
  {
    id: "cosmetic_frame_purple",
    kind: "cosmetic_frame",
    name: "Marco Púrpura",
    description: "Un marco morado para tu avatar, para siempre.",
    cost: 8,
    value: "#C86BFF",
  },
  {
    id: "cosmetic_title_legend",
    kind: "cosmetic_title",
    name: "Título: Leyenda",
    description: 'Muestra "Leyenda" junto a tu nombre en el grupo.',
    cost: 10,
    value: "Leyenda",
  },
  {
    id: "cosmetic_title_menace",
    kind: "cosmetic_title",
    name: "Título: Amenaza",
    description: 'Muestra "Amenaza" junto a tu nombre en el grupo.',
    cost: 10,
    value: "Amenaza",
  },
];

export interface ActiveEffectView {
  kind: ShopItemKind;
  expiresAt: string | null;
  multiplier?: number;
}

export interface ShopState {
  balance: number;
  hasActiveParty: boolean;
  activeEffects: ActiveEffectView[];
  ownedFrames: string[];
  ownedTitles: string[];
  equippedFrame: string | null;
  equippedTitle: string | null;
}

export interface PurchaseRequest {
  itemId: string;
  targetUserId?: string;
}

export interface EquipCosmeticRequest {
  frame?: string | null;
  title?: string | null;
}
