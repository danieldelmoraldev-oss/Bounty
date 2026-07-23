import { Schema, model, Types, type InferSchemaType } from "mongoose";

const activeEffectSchema = new Schema(
  {
    party: { type: Types.ObjectId, ref: "Party", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    kind: { type: String, enum: ["point_buff", "camera_broken", "level1_blocked"], required: true },
    multiplier: { type: Number, default: null },
    // null = dura mientras la fiesta esté activa (los buffs de puntos, por
    // ejemplo); si tiene fecha, el efecto también deja de contar al llegar.
    expiresAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

activeEffectSchema.index({ party: 1, user: 1 });

export type ActiveEffectDoc = InferSchemaType<typeof activeEffectSchema>;
export const ActiveEffect = model("ActiveEffect", activeEffectSchema);
