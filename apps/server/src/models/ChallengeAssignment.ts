import { Schema, model, Types, type InferSchemaType } from "mongoose";

const challengeAssignmentSchema = new Schema(
  {
    party: { type: Types.ObjectId, ref: "Party", required: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    difficulty: { type: Number, required: true, min: 1, max: 5 },
    templateId: { type: String, required: true },
    prompt: { type: String, required: true },
    status: {
      type: String,
      enum: ["locked", "available", "submitted", "approved", "rejected"],
      required: true,
      default: "locked",
    },
    photoDataUrl: { type: String, default: null },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

challengeAssignmentSchema.index({ party: 1, user: 1, difficulty: 1 }, { unique: true });
challengeAssignmentSchema.index({ party: 1, status: 1 });

export type ChallengeAssignmentDoc = InferSchemaType<typeof challengeAssignmentSchema>;
export const ChallengeAssignment = model("ChallengeAssignment", challengeAssignmentSchema);
