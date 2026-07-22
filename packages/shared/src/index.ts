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
