import { Schema, model, Types } from "mongoose";

const pointEventSchema = new Schema(
  {
    season: { type: Types.ObjectId, ref: "Season", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    reason: {
      type: String,
      enum: ["challenge_completed", "reroll_cost", "shop_purchase"],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

pointEventSchema.index({ season: 1, user: 1 });

export const PointEvent = model("PointEvent", pointEventSchema);
