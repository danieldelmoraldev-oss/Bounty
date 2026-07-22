import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "bounty_token";
const ACTIVE_GROUP_KEY = "bounty_active_group_id";

// expo-secure-store no tiene una implementación real en web. Usamos
// localStorage solo ahí (previsualización en navegador); el móvil real
// siempre pasa por SecureStore.
const isWeb = Platform.OS === "web";

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export function setToken(token: string): Promise<void> {
  return setItem(TOKEN_KEY, token);
}

export function clearToken(): Promise<void> {
  return deleteItem(TOKEN_KEY);
}

export function getActiveGroupId(): Promise<string | null> {
  return getItem(ACTIVE_GROUP_KEY);
}

export function setActiveGroupId(groupId: string): Promise<void> {
  return setItem(ACTIVE_GROUP_KEY, groupId);
}

export function clearActiveGroupId(): Promise<void> {
  return deleteItem(ACTIVE_GROUP_KEY);
}
