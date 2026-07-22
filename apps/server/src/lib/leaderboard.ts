import { Types } from "mongoose";
import type { LeaderboardEntry } from "@bounty/shared";
import { Membership } from "../models/Membership.ts";
import { User } from "../models/User.ts";
import { PointEvent } from "../models/PointEvent.ts";

export async function computeLeaderboard(
  groupId: string,
  seasonId: string,
): Promise<LeaderboardEntry[]> {
  const memberships = await Membership.find({ group: groupId }).sort({ createdAt: 1 });
  const users = await User.find({ _id: { $in: memberships.map((m) => m.user) } });
  const usersById = new Map(users.map((u) => [u.id, u]));

  const totals = await PointEvent.aggregate<{ _id: string; points: number }>([
    { $match: { season: new Types.ObjectId(seasonId) } },
    { $group: { _id: "$user", points: { $sum: "$amount" } } },
  ]);
  const pointsByUser = new Map(totals.map((t) => [t._id.toString(), t.points]));

  const unranked = memberships.flatMap((membership) => {
    const user = usersById.get(membership.user.toString());
    if (!user) return [];
    return [
      {
        userId: user.id,
        displayName: user.displayName,
        avatarEmoji: user.avatarEmoji,
        avatarColor: user.avatarColor,
        points: pointsByUser.get(user.id) ?? 0,
        joinedAt: membership.get("createdAt") as Date,
      },
    ];
  });

  unranked.sort((a, b) => b.points - a.points || a.joinedAt.getTime() - b.joinedAt.getTime());

  return unranked.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    displayName: entry.displayName,
    avatarEmoji: entry.avatarEmoji,
    avatarColor: entry.avatarColor,
    points: entry.points,
    isLeader: index === 0,
    isLoser: index === unranked.length - 1 && unranked.length > 1,
  }));
}
