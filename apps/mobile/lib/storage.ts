import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "bounty_token";
const ACTIVE_GROUP_KEY = "bounty_active_group_id";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getActiveGroupId(): Promise<string | null> {
  return SecureStore.getItemAsync(ACTIVE_GROUP_KEY);
}

export async function setActiveGroupId(groupId: string): Promise<void> {
  await SecureStore.setItemAsync(ACTIVE_GROUP_KEY, groupId);
}

export async function clearActiveGroupId(): Promise<void> {
  await SecureStore.deleteItemAsync(ACTIVE_GROUP_KEY);
}
