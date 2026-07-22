import { Schema, model, Types, type InferSchemaType } from "mongoose";

const freestylePostSchema = new Schema(
  {
    group: { type: Types.ObjectId, ref: "Group", required: true },
    party: { type: Types.ObjectId, ref: "Party", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    photoUrl: { type: String, required: true },
    caption: { type: String, default: null, maxlength: 140 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

freestylePostSchema.index({ party: 1 });

export type FreestylePostDoc = InferSchemaType<typeof freestylePostSchema>;
export const FreestylePost = model("FreestylePost", freestylePostSchema);
