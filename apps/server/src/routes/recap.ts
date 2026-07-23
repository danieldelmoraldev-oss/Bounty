import { Router } from "express";
import { Types } from "mongoose";
import type { AlbumItem, RecapSlide, RecapStatsEntry } from "@bounty/shared";
import { requireAuth } from "../middleware/auth.ts";
import { Party } from "../models/Party.ts";
import { Membership } from "../models/Membership.ts";
import { User } from "../models/User.ts";
import { PointEvent } from "../models/PointEvent.ts";
import { FreestylePost } from "../models/FreestylePost.ts";
import { ChallengeAssignment } from "../models/ChallengeAssignment.ts";
import { buildAlbumItems } from "../lib/albumItems.ts";
import { firstParam } from "../lib/params.ts";

export const recapRouter = Router();

const MAX_SLIDES = 15;

function highlightScore(item: AlbumItem): number {
  if (item.kind === "freestyle") return (item.averageStars ?? 0) * 10 + item.ratingCount;
  return item.difficulty * 5;
}

recapRouter.get("/groups/:groupId/parties/:partyId/recap", requireAuth, async (req, res) => {
  const groupId = firstParam(req.params.groupId);
  const partyId = firstParam(req.params.partyId);
  const membership = await Membership.findOne({ group: groupId, user: req.userId });
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  const party = await Party.findOne({ _id: partyId, group: groupId });
  if (!party) {
    res.status(404).json({ error: "Fiesta no encontrada" });
    return;
  }

  const [totals, totalFreestyle] = await Promise.all([
    PointEvent.aggregate<{ _id: string; points: number }>([
      { $match: { party: new Types.ObjectId(partyId) } },
      { $group: { _id: "$user", points: { $sum: "$amount" } } },
      { $sort: { points: -1 } },
      { $limit: 3 },
    ]),
    FreestylePost.countDocuments({ party: partyId }),
  ]);
  const totalChallenges = await ChallengeAssignment.countDocuments({
    party: partyId,
    status: "approved",
  });

  const topUsers = await User.find({ _id: { $in: totals.map((t) => t._id) } });
  const topUsersById = new Map(topUsers.map((u) => [u.id, u]));

  const topEntries: RecapStatsEntry[] = totals.flatMap((t) => {
    const user = topUsersById.get(t._id.toString());
    if (!user) return [];
    return [
      {
        displayName: user.displayName,
        avatarEmoji: user.avatarEmoji,
        avatarColor: user.avatarColor,
        points: t.points,
      },
    ];
  });

  const statsSlide: RecapSlide = {
    kind: "stats",
    totalChallenges,
    totalFreestyle,
    topEntries,
  };

  const items = await buildAlbumItems(partyId, req.userId!);
  items.sort((a, b) => highlightScore(b) - highlightScore(a));

  const slides: RecapSlide[] = [statsSlide, ...items.slice(0, MAX_SLIDES)];
  res.json(slides);
});
