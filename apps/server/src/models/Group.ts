import { Schema, model, Types } from "mongoose";

const groupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    code: { type: String, required: true, unique: true, uppercase: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const Group = model("Group", groupSchema);
