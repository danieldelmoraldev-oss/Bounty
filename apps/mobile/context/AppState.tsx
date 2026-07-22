import type { GroupDetail, UserProfile } from "@bounty/shared";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as api from "@/lib/api";
import {
  clearActiveGroupId,
  clearToken,
  getActiveGroupId,
  getToken,
  setActiveGroupId,
  setToken,
} from "@/lib/storage";

type Status = "loading" | "needs-profile" | "needs-group" | "ready";

type AppState = {
  status: Status;
  user: UserProfile | null;
  group: GroupDetail | null;
  error: string | null;
  completeProfile: (input: {
    displayName: string;
    avatarEmoji: string;
    avatarColor: string;
  }) => Promise<void>;
  createNewGroup: (name: string) => Promise<GroupDetail>;
  activateGroup: (detail: GroupDetail) => Promise<void>;
  joinExistingGroup: (code: string) => Promise<void>;
  refreshGroup: () => Promise<void>;
  leaveCurrentGroup: () => Promise<void>;
  updateMyProfile: (patch: {
    displayName?: string;
    avatarEmoji?: string;
    avatarColor?: string;
  }) => Promise<void>;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    const token = await getToken();
    if (!token) {
      setStatus("needs-profile");
      return;
    }

    try {
      const me = await api.fetchMyProfile();
      setUser(me);
    } catch {
      await clearToken();
      setStatus("needs-profile");
      return;
    }

    const groupId = await getActiveGroupId();
    if (!groupId) {
      setStatus("needs-group");
      return;
    }

    try {
      const detail = await api.fetchGroup(groupId);
      setGroup(detail);
      setStatus("ready");
    } catch {
      await clearActiveGroupId();
      setStatus("needs-group");
    }
  }

  const completeProfile = useCallback<AppState["completeProfile"]>(async (input) => {
    setError(null);
    try {
      const { token, user: newUser } = await api.registerAnonymous(input);
      await setToken(token);
      setUser(newUser);
      setStatus("needs-group");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el perfil");
      throw err;
    }
  }, []);

  // No activa el grupo todavía: create.tsx primero muestra el código/QR y
  // solo pasa a "ready" cuando el usuario confirma con activateGroup.
  const createNewGroup = useCallback<AppState["createNewGroup"]>(async (name) => {
    setError(null);
    try {
      return await api.createGroup(name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el grupo");
      throw err;
    }
  }, []);

  const activateGroup = useCallback<AppState["activateGroup"]>(async (detail) => {
    await setActiveGroupId(detail.id);
    setGroup(detail);
    setStatus("ready");
  }, []);

  const joinExistingGroup = useCallback<AppState["joinExistingGroup"]>(async (code) => {
    setError(null);
    try {
      const detail = await api.joinGroup(code);
      await setActiveGroupId(detail.id);
      setGroup(detail);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo unir al grupo");
      throw err;
    }
  }, []);

  const refreshGroup = useCallback<AppState["refreshGroup"]>(async () => {
    if (!group) return;
    const detail = await api.fetchGroup(group.id);
    setGroup(detail);
  }, [group]);

  const leaveCurrentGroup = useCallback<AppState["leaveCurrentGroup"]>(async () => {
    if (!group) return;
    await api.leaveGroup(group.id);
    await clearActiveGroupId();
    setGroup(null);
    setStatus("needs-group");
  }, [group]);

  const updateMyProfile = useCallback<AppState["updateMyProfile"]>(async (patch) => {
    const updated = await api.updateProfile(patch);
    setUser(updated);
  }, []);

  const value = useMemo<AppState>(
    () => ({
      status,
      user,
      group,
      error,
      completeProfile,
      createNewGroup,
      activateGroup,
      joinExistingGroup,
      refreshGroup,
      leaveCurrentGroup,
      updateMyProfile,
    }),
    [
      status,
      user,
      group,
      error,
      completeProfile,
      createNewGroup,
      activateGroup,
      joinExistingGroup,
      refreshGroup,
      leaveCurrentGroup,
      updateMyProfile,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState debe usarse dentro de AppStateProvider");
  return ctx;
}
