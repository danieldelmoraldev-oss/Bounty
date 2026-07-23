import { Router } from "express";
import type {
  ActiveEffectView,
  EquipCosmeticRequest,
  PurchaseRequest,
  ShopState,
} from "@bounty/shared";
import { SHOP_CATALOG } from "@bounty/shared";
import { requireAuth } from "../middleware/auth.ts";
import { Party } from "../models/Party.ts";
import { Season } from "../models/Season.ts";
import { Membership } from "../models/Membership.ts";
import { ActiveEffect } from "../models/ActiveEffect.ts";
import { PointEvent } from "../models/PointEvent.ts";
import { getUserPoints } from "../lib/points.ts";
import { getActiveEffects } from "../lib/effects.ts";
import { firstParam } from "../lib/params.ts";

export const shopRouter = Router();

async function requireMembership(groupId: string, userId: string) {
  return Membership.findOne({ group: groupId, user: userId });
}

async function buildShopState(groupId: string, userId: string): Promise<ShopState> {
  const membership = await Membership.findOne({ group: groupId, user: userId });
  const season = await Season.findOne({ group: groupId, status: "active" });
  const party = await Party.findOne({ group: groupId, status: "active" });

  const balance = season ? await getUserPoints(season.id, userId) : 0;
  const effects = party ? await getActiveEffects(party.id, userId) : [];

  const activeEffects: ActiveEffectView[] = effects.map((e) => ({
    kind: e.kind,
    expiresAt: e.expiresAt ? e.expiresAt.toISOString() : null,
    multiplier: e.multiplier ?? undefined,
  }));

  return {
    balance,
    hasActiveParty: !!party,
    activeEffects,
    ownedFrames: membership?.ownedFrames ?? [],
    ownedTitles: membership?.ownedTitles ?? [],
    equippedFrame: membership?.equippedFrame ?? null,
    equippedTitle: membership?.equippedTitle ?? null,
  };
}

shopRouter.get("/groups/:groupId/shop", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  res.json(await buildShopState(groupId, req.userId!));
});

shopRouter.post("/groups/:groupId/shop/purchase", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  const { itemId, targetUserId } = (req.body ?? {}) as PurchaseRequest;
  const item = SHOP_CATALOG.find((i) => i.id === itemId);
  if (!item) {
    res.status(404).json({ error: "Artículo no encontrado" });
    return;
  }

  const season = await Season.findOne({ group: groupId, status: "active" });
  if (!season) {
    res.status(400).json({ error: "No hay una temporada activa" });
    return;
  }

  const balance = await getUserPoints(season.id, req.userId!);
  if (balance < item.cost) {
    res.status(400).json({ error: `Necesitas ${item.cost} puntos para esto` });
    return;
  }

  const needsParty = item.kind === "point_buff" || item.kind === "camera_broken" || item.kind === "level1_blocked";
  const party = await Party.findOne({ group: groupId, status: "active" });
  if (needsParty && !party) {
    res.status(400).json({ error: "Esto solo se puede comprar durante el Modo Fiesta" });
    return;
  }

  if (item.requiresTarget) {
    if (typeof targetUserId !== "string" || targetUserId === req.userId) {
      res.status(400).json({ error: "Elige a otro miembro del grupo como objetivo" });
      return;
    }
    const targetMembership = await Membership.findOne({ group: groupId, user: targetUserId });
    if (!targetMembership) {
      res.status(404).json({ error: "Ese usuario no está en el grupo" });
      return;
    }
  }

  if (item.kind === "point_buff") {
    const already = await getActiveEffects(party!.id, req.userId!);
    if (already.some((e) => e.kind === "point_buff")) {
      res.status(409).json({ error: "Ya tienes un buff de puntos activo esta noche" });
      return;
    }
    await ActiveEffect.create({
      party: party!.id,
      user: req.userId,
      kind: "point_buff",
      multiplier: item.multiplier,
      expiresAt: null,
    });
  } else if (item.kind === "camera_broken" || item.kind === "level1_blocked") {
    const expiresAt = new Date(Date.now() + (item.durationMinutes ?? 15) * 60_000);
    await ActiveEffect.create({
      party: party!.id,
      user: targetUserId,
      kind: item.kind,
      expiresAt,
    });
  } else if (item.kind === "cosmetic_frame") {
    if (membership.ownedFrames.includes(item.value!)) {
      res.status(409).json({ error: "Ya tienes ese marco" });
      return;
    }
    membership.ownedFrames.push(item.value!);
    await membership.save();
  } else if (item.kind === "cosmetic_title") {
    if (membership.ownedTitles.includes(item.value!)) {
      res.status(409).json({ error: "Ya tienes ese título" });
      return;
    }
    membership.ownedTitles.push(item.value!);
    await membership.save();
  }

  await PointEvent.create({
    season: season.id,
    user: req.userId,
    amount: -item.cost,
    reason: "shop_purchase",
  });

  res.status(201).json(await buildShopState(groupId, req.userId!));
});

shopRouter.post("/groups/:groupId/shop/equip", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  const { frame, title } = (req.body ?? {}) as EquipCosmeticRequest;

  if (frame !== undefined) {
    if (frame !== null && !membership.ownedFrames.includes(frame)) {
      res.status(400).json({ error: "No tienes ese marco" });
      return;
    }
    membership.equippedFrame = frame;
  }

  if (title !== undefined) {
    if (title !== null && !membership.ownedTitles.includes(title)) {
      res.status(400).json({ error: "No tienes ese título" });
      return;
    }
    membership.equippedTitle = title;
  }

  await membership.save();
  res.json(await buildShopState(groupId, req.userId!));
});
