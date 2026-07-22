import { Router } from "express";
import type {
  AlbumFolder,
  AlbumItem,
  ChallengeDifficulty,
  CreateFreestyleRequest,
  FreestylePost as FreestylePostDto,
  RateFreestyleRequest,
} from "@bounty/shared";
import { requireAuth } from "../middleware/auth.ts";
import { Party } from "../models/Party.ts";
import { Membership } from "../models/Membership.ts";
import { User } from "../models/User.ts";
import { ChallengeAssignment } from "../models/ChallengeAssignment.ts";
import { FreestylePost } from "../models/FreestylePost.ts";
import { Rating } from "../models/Rating.ts";
import { firstParam } from "../lib/params.ts";

export const albumRouter = Router();

async function requireMembership(groupId: string, userId: string) {
  return Membership.findOne({ group: groupId, user: userId });
}

albumRouter.post("/groups/:groupId/parties/:partyId/freestyle", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const partyId = firstParam(req.params.partyId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  const { photoUrl, caption } = (req.body ?? {}) as CreateFreestyleRequest;
  if (typeof photoUrl !== "string" || !photoUrl.startsWith("https://")) {
    res.status(400).json({ error: "photoUrl debe ser una URL válida" });
    return;
  }

  const party = await Party.findOne({ _id: partyId, group: groupId });
  if (!party || party.status !== "active") {
    res.status(400).json({ error: "La fiesta ya no está activa" });
    return;
  }

  const post = await FreestylePost.create({
    group: groupId,
    party: partyId,
    user: req.userId,
    photoUrl,
    caption: typeof caption === "string" && caption.trim() ? caption.trim().slice(0, 140) : null,
  });

  const body: FreestylePostDto = {
    id: post.id,
    photoUrl: post.photoUrl,
    caption: post.caption ?? null,
    createdAt: post.get("createdAt").toISOString(),
  };
  res.status(201).json(body);
});

albumRouter.get("/groups/:groupId/album", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  const parties = await Party.find({ group: groupId }).sort({ startedAt: -1 });

  const folders: AlbumFolder[] = await Promise.all(
    parties.map(async (party) => {
      const [challengeCount, freestylePosts] = await Promise.all([
        ChallengeAssignment.countDocuments({
          party: party.id,
          status: "approved",
          photoUrl: { $ne: null },
        }),
        FreestylePost.find({ party: party.id }).sort({ createdAt: -1 }).limit(1),
      ]);
      const freestyleCount = await FreestylePost.countDocuments({ party: party.id });

      const coverUrl =
        freestylePosts[0]?.photoUrl ??
        (await ChallengeAssignment.findOne({
          party: party.id,
          status: "approved",
          photoUrl: { $ne: null },
        }).sort({ createdAt: -1 }))?.photoUrl ??
        null;

      return {
        partyId: party.id,
        startedAt: party.startedAt.toISOString(),
        endedAt: party.endedAt ? party.endedAt.toISOString() : null,
        itemCount: challengeCount + freestyleCount,
        coverUrl,
      };
    }),
  );

  res.json(folders.filter((f) => f.itemCount > 0));
});

albumRouter.get("/groups/:groupId/album/:partyId", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const partyId = firstParam(req.params.partyId);
  const membership = await requireMembership(groupId, req.userId!);
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  const [challenges, freestylePosts] = await Promise.all([
    ChallengeAssignment.find({ party: partyId, status: "approved", photoUrl: { $ne: null } }),
    FreestylePost.find({ party: partyId }),
  ]);

  const userIds = [
    ...challenges.map((c) => c.user.toString()),
    ...freestylePosts.map((p) => p.user.toString()),
  ];
  const users = await User.find({ _id: { $in: userIds } });
  const usersById = new Map(users.map((u) => [u.id, u]));

  const ratings = await Rating.find({
    freestylePost: { $in: freestylePosts.map((p) => p.id) },
  });
  const ratingsByPost = new Map<string, { stars: number; user: string }[]>();
  for (const r of ratings) {
    const key = r.freestylePost.toString();
    const list = ratingsByPost.get(key) ?? [];
    list.push({ stars: r.stars, user: r.user.toString() });
    ratingsByPost.set(key, list);
  }

  const challengeItems: AlbumItem[] = challenges.flatMap((c) => {
    const author = usersById.get(c.user.toString());
    if (!author || !c.photoUrl) return [];
    return [
      {
        kind: "challenge" as const,
        id: c.id,
        photoUrl: c.photoUrl,
        createdAt: c.get("createdAt").toISOString(),
        author: {
          userId: author.id,
          displayName: author.displayName,
          avatarEmoji: author.avatarEmoji,
          avatarColor: author.avatarColor,
        },
        difficulty: c.difficulty as ChallengeDifficulty,
        prompt: c.prompt,
      },
    ];
  });

  const freestyleItems: AlbumItem[] = freestylePosts.flatMap((p) => {
    const author = usersById.get(p.user.toString());
    if (!author) return [];
    const postRatings = ratingsByPost.get(p.id) ?? [];
    const mine = postRatings.find((r) => r.user === req.userId);
    const average =
      postRatings.length > 0
        ? postRatings.reduce((sum, r) => sum + r.stars, 0) / postRatings.length
        : null;
    return [
      {
        kind: "freestyle" as const,
        id: p.id,
        photoUrl: p.photoUrl,
        createdAt: p.get("createdAt").toISOString(),
        author: {
          userId: author.id,
          displayName: author.displayName,
          avatarEmoji: author.avatarEmoji,
          avatarColor: author.avatarColor,
        },
        caption: p.caption ?? null,
        averageStars: average,
        ratingCount: postRatings.length,
        myStars: mine?.stars ?? null,
      },
    ];
  });

  const items = [...challengeItems, ...freestyleItems].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  res.json(items);
});

albumRouter.post(
  "/groups/:groupId/album/freestyle/:postId/rate",
  requireAuth,
  async (req, res) => {
    const groupId = firstParam(req.params.groupId);
    const postId = firstParam(req.params.postId);
    const membership = await requireMembership(groupId, req.userId!);
    if (!membership) {
      res.status(403).json({ error: "No perteneces a este grupo" });
      return;
    }

    const { stars } = (req.body ?? {}) as RateFreestyleRequest;
    if (typeof stars !== "number" || stars < 1 || stars > 5) {
      res.status(400).json({ error: "stars debe ser un número entre 1 y 5" });
      return;
    }

    const post = await FreestylePost.findOne({ _id: postId, group: groupId });
    if (!post) {
      res.status(404).json({ error: "Publicación no encontrada" });
      return;
    }

    await Rating.findOneAndUpdate(
      { freestylePost: postId, user: req.userId },
      { $set: { stars } },
      { upsert: true },
    );

    res.status(204).send();
  },
);
