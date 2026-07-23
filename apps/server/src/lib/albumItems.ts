import type { AlbumItem, ChallengeDifficulty } from "@bounty/shared";
import { ChallengeAssignment } from "../models/ChallengeAssignment.ts";
import { FreestylePost } from "../models/FreestylePost.ts";
import { Rating } from "../models/Rating.ts";
import { User } from "../models/User.ts";

export async function buildAlbumItems(partyId: string, viewerUserId: string): Promise<AlbumItem[]> {
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
    const mine = postRatings.find((r) => r.user === viewerUserId);
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

  return [...challengeItems, ...freestyleItems];
}
