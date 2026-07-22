import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    displayName: { type: String, required: true, trim: true, maxlength: 24 },
    avatarEmoji: { type: String, required: true, default: "🦝" },
    avatarColor: { type: String, required: true, default: "#B7F700" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);
