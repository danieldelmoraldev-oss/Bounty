import type {
  AlbumFolder,
  AlbumItem,
  AuthResponse,
  ChallengeCard,
  FreestylePost,
  GroupDetail,
  GroupSummary,
  HealthResponse,
  Party,
  PartyState,
  ReviewQueueItem,
  Season,
  SeasonLeaderboard,
  UpdateProfileRequest,
  UserProfile,
} from "@bounty/shared";
import { getToken } from "./storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL no está definida");
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth) {
    const token = await getToken();
    if (!token) throw new ApiError("No hay sesión activa", 401);
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.error ?? `Error ${response.status}`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

export function registerAnonymous(profile: {
  displayName: string;
  avatarEmoji: string;
  avatarColor: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/anonymous", { method: "POST", body: profile });
}

export function fetchMyProfile(): Promise<UserProfile> {
  return request<UserProfile>("/users/me", { auth: true });
}

export function updateProfile(patch: UpdateProfileRequest): Promise<UserProfile> {
  return request<UserProfile>("/users/me", { method: "PATCH", body: patch, auth: true });
}

export function createGroup(name: string): Promise<GroupDetail> {
  return request<GroupDetail>("/groups", { method: "POST", body: { name }, auth: true });
}

export function joinGroup(code: string): Promise<GroupDetail> {
  return request<GroupDetail>("/groups/join", { method: "POST", body: { code }, auth: true });
}

export function fetchMyGroups(): Promise<GroupSummary[]> {
  return request<GroupSummary[]>("/groups/mine", { auth: true });
}

export function fetchGroup(groupId: string): Promise<GroupDetail> {
  return request<GroupDetail>(`/groups/${groupId}`, { auth: true });
}

export function leaveGroup(groupId: string): Promise<void> {
  return request<void>(`/groups/${groupId}/membership`, { method: "DELETE", auth: true });
}

export function fetchActiveSeason(groupId: string): Promise<SeasonLeaderboard | null> {
  return request<SeasonLeaderboard | null>(`/groups/${groupId}/seasons/active`, { auth: true });
}

export function fetchSeasonHistory(groupId: string): Promise<Season[]> {
  return request<Season[]>(`/groups/${groupId}/seasons`, { auth: true });
}

export function startSeason(groupId: string, name?: string): Promise<Season> {
  return request<Season>(`/groups/${groupId}/seasons`, {
    method: "POST",
    body: { name },
    auth: true,
  });
}

export function endSeason(groupId: string, seasonId: string): Promise<Season> {
  return request<Season>(`/groups/${groupId}/seasons/${seasonId}/end`, {
    method: "POST",
    auth: true,
  });
}

export function fetchActiveParty(groupId: string): Promise<PartyState | null> {
  return request<PartyState | null>(`/groups/${groupId}/parties/active`, { auth: true });
}

export function startParty(groupId: string): Promise<Party> {
  return request<Party>(`/groups/${groupId}/parties`, { method: "POST", auth: true });
}

export function endParty(groupId: string, partyId: string): Promise<Party> {
  return request<Party>(`/groups/${groupId}/parties/${partyId}/end`, {
    method: "POST",
    auth: true,
  });
}

export function rerollChallenge(
  groupId: string,
  partyId: string,
  assignmentId: string,
): Promise<ChallengeCard> {
  return request<ChallengeCard>(
    `/groups/${groupId}/parties/${partyId}/challenges/${assignmentId}/reroll`,
    { method: "POST", auth: true },
  );
}

export function submitChallenge(
  groupId: string,
  partyId: string,
  assignmentId: string,
  photoUrl: string,
): Promise<ChallengeCard> {
  return request<ChallengeCard>(
    `/groups/${groupId}/parties/${partyId}/challenges/${assignmentId}/submit`,
    { method: "POST", body: { photoUrl }, auth: true },
  );
}

export function fetchReviewQueue(groupId: string, partyId: string): Promise<ReviewQueueItem[]> {
  return request<ReviewQueueItem[]>(`/groups/${groupId}/parties/${partyId}/review`, {
    auth: true,
  });
}

export function reviewChallenge(
  groupId: string,
  partyId: string,
  assignmentId: string,
  approve: boolean,
): Promise<ChallengeCard> {
  return request<ChallengeCard>(
    `/groups/${groupId}/parties/${partyId}/challenges/${assignmentId}/review`,
    { method: "POST", body: { approve }, auth: true },
  );
}

export function postFreestyle(
  groupId: string,
  partyId: string,
  photoUrl: string,
  caption?: string,
): Promise<FreestylePost> {
  return request<FreestylePost>(`/groups/${groupId}/parties/${partyId}/freestyle`, {
    method: "POST",
    body: { photoUrl, caption },
    auth: true,
  });
}

export function fetchAlbumFolders(groupId: string): Promise<AlbumFolder[]> {
  return request<AlbumFolder[]>(`/groups/${groupId}/album`, { auth: true });
}

export function fetchAlbumDetail(groupId: string, partyId: string): Promise<AlbumItem[]> {
  return request<AlbumItem[]>(`/groups/${groupId}/album/${partyId}`, { auth: true });
}

export function rateFreestyle(groupId: string, postId: string, stars: number): Promise<void> {
  return request<void>(`/groups/${groupId}/album/freestyle/${postId}/rate`, {
    method: "POST",
    body: { stars },
    auth: true,
  });
}
