import { Schema, model, Types } from "mongoose";
import type { GroupRole } from "@bounty/shared";

const membershipSchema = new Schema(
  {
    group: { type: Types.ObjectId, ref: "Group", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "member"], required: true, default: "member" },
    ownedFrames: { type: [String], default: [] },
    ownedTitles: { type: [String], default: [] },
    equippedFrame: { type: String, default: null },
    equippedTitle: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

membershipSchema.index({ group: 1, user: 1 }, { unique: true });

export type MembershipRole = GroupRole;
export const Membership = model("Membership", membershipSchema);
