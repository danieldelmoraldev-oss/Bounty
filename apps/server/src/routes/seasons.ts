import { Router } from "express";
import type { HydratedDocument } from "mongoose";
import type { Season as SeasonDto, SeasonLeaderboard, StartSeasonRequest } from "@bounty/shared";
import { requireAuth } from "../middleware/auth.ts";
import { Season, type SeasonDoc } from "../models/Season.ts";
import { Membership } from "../models/Membership.ts";
import { computeLeaderboard } from "../lib/leaderboard.ts";
import { firstParam } from "../lib/params.ts";

export const seasonsRouter = Router();

function toSeasonDto(season: HydratedDocument<SeasonDoc>): SeasonDto {
  return {
    id: season.id,
    name: season.name,
    status: season.status,
    startedAt: season.startedAt.toISOString(),
    endedAt: season.endedAt ? season.endedAt.toISOString() : null,
  };
}

async function requireMembership(groupId: string, userId: string) {
  return Membership.findOne({ group: groupId, user: userId });
}

seasonsRouter.post("/groups/:groupId/seasons", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }
  if (membership.role !== "admin") {
    res.status(403).json({ error: "Solo el admin puede empezar una temporada" });
    return;
  }

  const existingActive = await Season.findOne({ group: groupId, status: "active" });
  if (existingActive) {
    res.status(409).json({ error: "Ya hay una temporada activa" });
    return;
  }

  const { name } = (req.body ?? {}) as StartSeasonRequest;
  const seasonCount = await Season.countDocuments({ group: groupId });
  const season = await Season.create({
    group: groupId,
    name: typeof name === "string" && name.trim() ? name.trim().slice(0, 40) : `Temporada ${seasonCount + 1}`,
  });

  res.status(201).json(toSeasonDto(season) satisfies SeasonDto);
});

seasonsRouter.post("/groups/:groupId/seasons/:seasonId/end", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const seasonId = firstParam(req.params.seasonId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }
  if (membership.role !== "admin") {
    res.status(403).json({ error: "Solo el admin puede terminar la temporada" });
    return;
  }

  const season = await Season.findOne({ _id: seasonId, group: groupId });
  if (!season || season.status !== "active") {
    res.status(404).json({ error: "No hay una temporada activa con ese id" });
    return;
  }

  season.status = "ended";
  season.endedAt = new Date();
  await season.save();

  res.json(toSeasonDto(season) satisfies SeasonDto);
});

seasonsRouter.get("/groups/:groupId/seasons/active", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  const season = await Season.findOne({ group: groupId, status: "active" });
  if (!season) {
    res.json(null);
    return;
  }

  const entries = await computeLeaderboard(groupId, season.id);
  const body: SeasonLeaderboard = { season: toSeasonDto(season), entries };
  res.json(body);
});

seasonsRouter.get("/groups/:groupId/seasons", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  const seasons = await Season.find({ group: groupId }).sort({ startedAt: -1 });
  res.json(seasons.map((s) => toSeasonDto(s)) satisfies SeasonDto[]);
});

seasonsRouter.get("/groups/:groupId/seasons/:seasonId", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const seasonId = firstParam(req.params.seasonId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  const season = await Season.findOne({ _id: seasonId, group: groupId });
  if (!season) {
    res.status(404).json({ error: "Temporada no encontrada" });
    return;
  }

  const entries = await computeLeaderboard(groupId, season.id);
  const body: SeasonLeaderboard = { season: toSeasonDto(season), entries };
  res.json(body);
});
