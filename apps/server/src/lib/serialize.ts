import type { UserProfile } from "@bounty/shared";
import type { UserDoc } from "../models/User.ts";
import type { HydratedDocument } from "mongoose";

export function toUserProfile(user: HydratedDocument<UserDoc>): UserProfile {
  return {
    id: user.id,
    displayName: user.displayName,
    avatarEmoji: user.avatarEmoji,
    avatarColor: user.avatarColor,
    createdAt: user.get("createdAt").toISOString(),
  };
}
