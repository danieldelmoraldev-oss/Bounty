import { Schema, model, Types, type InferSchemaType } from "mongoose";

const partySchema = new Schema({
  group: { type: Types.ObjectId, ref: "Group", required: true },
  season: { type: Types.ObjectId, ref: "Season", required: true },
  status: { type: String, enum: ["active", "ended"], required: true, default: "active" },
  startedAt: { type: Date, required: true, default: () => new Date() },
  endedAt: { type: Date, default: null },
});

partySchema.index({ group: 1, status: 1 });

export type PartyDoc = InferSchemaType<typeof partySchema>;
export const Party = model("Party", partySchema);
