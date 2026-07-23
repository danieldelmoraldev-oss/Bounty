import { Schema, model, Types } from "mongoose";

const pointEventSchema = new Schema(
  {
    season: { type: Types.ObjectId, ref: "Season", required: true },
    // Opcional: solo lo rellenan los eventos de la Fase 3 en adelante. Sirve
    // para desglosar puntos "de esta fiesta concreta" (recaps) sin tener que
    // recalcularlo a partir de los retos.
    party: { type: Types.ObjectId, ref: "Party", default: null },
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
