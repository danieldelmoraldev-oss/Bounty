import { Router } from "express";
import type { HydratedDocument } from "mongoose";
import type {
  ChallengeCard,
  ChallengeDifficulty,
  Party as PartyDto,
  PartyState,
  ReviewChallengeRequest,
  ReviewQueueItem,
  SubmitChallengeRequest,
} from "@bounty/shared";
import { POINTS_BY_DIFFICULTY } from "@bounty/shared";
import { requireAuth } from "../middleware/auth.ts";
import { Party, type PartyDoc } from "../models/Party.ts";
import { Season } from "../models/Season.ts";
import { Membership } from "../models/Membership.ts";
import { User } from "../models/User.ts";
import {
  ChallengeAssignment,
  type ChallengeAssignmentDoc,
} from "../models/ChallengeAssignment.ts";
import { PointEvent } from "../models/PointEvent.ts";
import { pickRandomTemplate } from "../data/challengeBank.ts";
import { firstParam } from "../lib/params.ts";
import { getUserPoints } from "../lib/points.ts";

export const partiesRouter = Router();

const DIFFICULTIES: ChallengeDifficulty[] = [1, 2, 3, 4, 5];

function toPartyDto(party: HydratedDocument<PartyDoc>): PartyDto {
  return {
    id: party.id,
    status: party.status,
    startedAt: party.startedAt.toISOString(),
    endedAt: party.endedAt ? party.endedAt.toISOString() : null,
  };
}

function toChallengeCard(a: HydratedDocument<ChallengeAssignmentDoc>): ChallengeCard {
  const difficulty = a.difficulty as ChallengeDifficulty;
  return {
    id: a.id,
    difficulty,
    prompt: a.prompt,
    status: a.status,
    points: POINTS_BY_DIFFICULTY[difficulty],
    photoDataUrl: a.photoDataUrl ?? null,
    submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
  };
}

async function requireMembership(groupId: string, userId: string) {
  return Membership.findOne({ group: groupId, user: userId });
}

partiesRouter.post("/groups/:groupId/parties", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }
  if (membership.role !== "admin") {
    res.status(403).json({ error: "Solo el admin puede empezar la noche" });
    return;
  }

  const season = await Season.findOne({ group: groupId, status: "active" });
  if (!season) {
    res.status(400).json({ error: "No hay una temporada activa: empieza una primero" });
    return;
  }

  const existingActive = await Party.findOne({ group: groupId, status: "active" });
  if (existingActive) {
    res.status(409).json({ error: "Ya hay una fiesta activa" });
    return;
  }

  const party = await Party.create({ group: groupId, season: season.id });

  const memberships = await Membership.find({ group: groupId });
  const assignments = memberships.flatMap((m) =>
    DIFFICULTIES.map((difficulty) => {
      const template = pickRandomTemplate(difficulty);
      return {
        party: party.id,
        user: m.user,
        difficulty,
        templateId: template.id,
        prompt: template.prompt,
        status: difficulty === 1 ? "available" : "locked",
      };
    }),
  );
  await ChallengeAssignment.insertMany(assignments);

  res.status(201).json(toPartyDto(party) satisfies PartyDto);
});

partiesRouter.post("/groups/:groupId/parties/:partyId/end", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const partyId = firstParam(req.params.partyId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }
  if (membership.role !== "admin") {
    res.status(403).json({ error: "Solo el admin puede terminar la noche" });
    return;
  }

  const party = await Party.findOne({ _id: partyId, group: groupId });
  if (!party || party.status !== "active") {
    res.status(404).json({ error: "No hay una fiesta activa con ese id" });
    return;
  }

  party.status = "ended";
  party.endedAt = new Date();
  await party.save();

  res.json(toPartyDto(party) satisfies PartyDto);
});

partiesRouter.get("/groups/:groupId/parties/active", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  const party = await Party.findOne({ group: groupId, status: "active" });
  if (!party) {
    res.json(null);
    return;
  }

  const assignments = await ChallengeAssignment.find({ party: party.id, user: req.userId }).sort({
    difficulty: 1,
  });

  const body: PartyState = {
    party: toPartyDto(party),
    challenges: assignments.map(toChallengeCard),
  };
  res.json(body);
});

async function findOwnAssignment(partyId: string, assignmentId: string, userId: string) {
  return ChallengeAssignment.findOne({ _id: assignmentId, party: partyId, user: userId });
}

partiesRouter.post(
  "/groups/:groupId/parties/:partyId/challenges/:assignmentId/reroll",
  requireAuth,
  async (req, res) => {
    const groupId = firstParam(req.params.groupId);
    const partyId = firstParam(req.params.partyId);
    const assignmentId = firstParam(req.params.assignmentId);
    const membership = await requireMembership(groupId, req.userId!);
    if (!membership) {
      res.status(403).json({ error: "No perteneces a este grupo" });
      return;
    }

    const assignment = await findOwnAssignment(partyId, assignmentId, req.userId!);
    if (!assignment) {
      res.status(404).json({ error: "Reto no encontrado" });
      return;
    }
    if (assignment.status !== "available") {
      res.status(400).json({ error: "Solo puedes re-rollear un reto disponible" });
      return;
    }

    const party = await Party.findById(partyId);
    if (!party || party.status !== "active") {
      res.status(400).json({ error: "La fiesta ya no está activa" });
      return;
    }

    const difficulty = assignment.difficulty as ChallengeDifficulty;
    const cost = POINTS_BY_DIFFICULTY[difficulty];
    const balance = await getUserPoints(party.season.toString(), req.userId!);
    if (balance < cost) {
      res.status(400).json({ error: `Necesitas ${cost} puntos para re-rollear este reto` });
      return;
    }

    const newTemplate = pickRandomTemplate(difficulty, assignment.templateId);
    assignment.templateId = newTemplate.id;
    assignment.prompt = newTemplate.prompt;
    await assignment.save();

    await PointEvent.create({
      season: party.season,
      user: req.userId,
      amount: -cost,
      reason: "reroll_cost",
    });

    res.json(toChallengeCard(assignment) satisfies ChallengeCard);
  },
);

const MAX_PHOTO_DATA_URL_LENGTH = 4_000_000; // ~3MB de imagen decodificada

partiesRouter.post(
  "/groups/:groupId/parties/:partyId/challenges/:assignmentId/submit",
  requireAuth,
  async (req, res) => {
    const groupId = firstParam(req.params.groupId);
    const partyId = firstParam(req.params.partyId);
    const assignmentId = firstParam(req.params.assignmentId);
    const membership = await requireMembership(groupId, req.userId!);
    if (!membership) {
      res.status(403).json({ error: "No perteneces a este grupo" });
      return;
    }

    const { photoDataUrl } = (req.body ?? {}) as SubmitChallengeRequest;
    if (typeof photoDataUrl !== "string" || !photoDataUrl.startsWith("data:image/")) {
      res.status(400).json({ error: "photoDataUrl debe ser una imagen válida" });
      return;
    }
    if (photoDataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
      res.status(413).json({ error: "La foto es demasiado grande" });
      return;
    }

    const assignment = await findOwnAssignment(partyId, assignmentId, req.userId!);
    if (!assignment) {
      res.status(404).json({ error: "Reto no encontrado" });
      return;
    }
    if (assignment.status !== "available") {
      res.status(400).json({ error: "Este reto no está disponible para enviar prueba" });
      return;
    }

    const party = await Party.findById(partyId);
    if (!party || party.status !== "active") {
      res.status(400).json({ error: "La fiesta ya no está activa" });
      return;
    }

    assignment.status = "submitted";
    assignment.photoDataUrl = photoDataUrl;
    assignment.submittedAt = new Date();
    await assignment.save();

    res.json(toChallengeCard(assignment) satisfies ChallengeCard);
  },
);

partiesRouter.get(
  "/groups/:groupId/parties/:partyId/review",
  requireAuth,
  async (req, res) => {
    const groupId = firstParam(req.params.groupId);
    const partyId = firstParam(req.params.partyId);
    const membership = await requireMembership(groupId, req.userId!);
    if (!membership) {
      res.status(403).json({ error: "No perteneces a este grupo" });
      return;
    }
    if (membership.role !== "admin") {
      res.status(403).json({ error: "Solo el admin puede revisar envíos" });
      return;
    }

    const submitted = await ChallengeAssignment.find({
      party: partyId,
      status: "submitted",
    }).sort({ submittedAt: 1 });
    const users = await User.find({ _id: { $in: submitted.map((a) => a.user) } });
    const usersById = new Map(users.map((u) => [u.id, u]));

    const items: ReviewQueueItem[] = submitted.flatMap((a) => {
      const user = usersById.get(a.user.toString());
      if (!user) return [];
      return [
        {
          id: a.id,
          difficulty: a.difficulty as ChallengeDifficulty,
          prompt: a.prompt,
          photoDataUrl: a.photoDataUrl ?? null,
          submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
          userId: user.id,
          displayName: user.displayName,
          avatarEmoji: user.avatarEmoji,
          avatarColor: user.avatarColor,
        },
      ];
    });

    res.json(items);
  },
);

partiesRouter.post(
  "/groups/:groupId/parties/:partyId/challenges/:assignmentId/review",
  requireAuth,
  async (req, res) => {
    const groupId = firstParam(req.params.groupId);
    const partyId = firstParam(req.params.partyId);
    const assignmentId = firstParam(req.params.assignmentId);
    const membership = await requireMembership(groupId, req.userId!);
    if (!membership) {
      res.status(403).json({ error: "No perteneces a este grupo" });
      return;
    }
    if (membership.role !== "admin") {
      res.status(403).json({ error: "Solo el admin puede revisar envíos" });
      return;
    }

    const { approve } = (req.body ?? {}) as ReviewChallengeRequest;
    const assignment = await ChallengeAssignment.findOne({ _id: assignmentId, party: partyId });
    if (!assignment || assignment.status !== "submitted") {
      res.status(404).json({ error: "No hay un envío pendiente con ese id" });
      return;
    }

    const party = await Party.findById(partyId);
    if (!party) {
      res.status(404).json({ error: "Fiesta no encontrada" });
      return;
    }

    assignment.status = approve ? "approved" : "rejected";
    assignment.reviewedAt = new Date();
    await assignment.save();

    if (approve) {
      const difficulty = assignment.difficulty as ChallengeDifficulty;
      await PointEvent.create({
        season: party.season,
        user: assignment.user,
        amount: POINTS_BY_DIFFICULTY[difficulty],
        reason: "challenge_completed",
      });

      if (difficulty === 1) {
        await ChallengeAssignment.updateMany(
          { party: partyId, user: assignment.user, status: "locked" },
          { $set: { status: "available" } },
        );
      }
    }

    res.json(toChallengeCard(assignment) satisfies ChallengeCard);
  },
);
