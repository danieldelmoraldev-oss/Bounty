import { Schema, model, Types, type InferSchemaType } from "mongoose";

const seasonSchema = new Schema({
  group: { type: Types.ObjectId, ref: "Group", required: true },
  name: { type: String, required: true, trim: true, maxlength: 40 },
  status: { type: String, enum: ["active", "ended"], required: true, default: "active" },
  startedAt: { type: Date, required: true, default: () => new Date() },
  endedAt: { type: Date, default: null },
});

seasonSchema.index({ group: 1, status: 1 });

export type SeasonDoc = InferSchemaType<typeof seasonSchema>;
export const Season = model("Season", seasonSchema);
