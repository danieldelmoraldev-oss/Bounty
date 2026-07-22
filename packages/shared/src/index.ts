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
