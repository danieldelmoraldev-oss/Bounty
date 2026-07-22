import { Schema, model, Types } from "mongoose";

const ratingSchema = new Schema(
  {
    freestylePost: { type: Types.ObjectId, ref: "FreestylePost", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

ratingSchema.index({ freestylePost: 1, user: 1 }, { unique: true });

export const Rating = model("Rating", ratingSchema);
