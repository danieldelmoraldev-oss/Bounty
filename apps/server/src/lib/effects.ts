import { ActiveEffect } from "../models/ActiveEffect.ts";

export async function getActiveEffects(partyId: string, userId: string) {
  const now = new Date();
  const effects = await ActiveEffect.find({ party: partyId, user: userId });
  return effects.filter((e) => !e.expiresAt || e.expiresAt > now);
}

export async function hasActiveEffect(
  partyId: string,
  userId: string,
  kind: "point_buff" | "camera_broken" | "level1_blocked",
): Promise<boolean> {
  const effects = await getActiveEffects(partyId, userId);
  return effects.some((e) => e.kind === kind);
}

export async function getPointMultiplier(partyId: string, userId: string): Promise<number> {
  const effects = await getActiveEffects(partyId, userId);
  const buff = effects.find((e) => e.kind === "point_buff");
  return buff?.multiplier ?? 1;
}
