import { Types } from "mongoose";
import { PointEvent } from "../models/PointEvent.ts";

export async function getUserPoints(seasonId: string, userId: string): Promise<number> {
  const result = await PointEvent.aggregate<{ total: number }>([
    { $match: { season: new Types.ObjectId(seasonId), user: new Types.ObjectId(userId) } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result[0]?.total ?? 0;
}
