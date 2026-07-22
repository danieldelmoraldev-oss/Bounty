import { Router } from "express";
import type { UpdateProfileRequest, UserProfile } from "@bounty/shared";
import { requireAuth } from "../middleware/auth.ts";
import { User } from "../models/User.ts";
import { toUserProfile } from "../lib/serialize.ts";

export const usersRouter = Router();

usersRouter.get("/users/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  const body: UserProfile = toUserProfile(user);
  res.json(body);
});

usersRouter.patch("/users/me", requireAuth, async (req, res) => {
  const { displayName, avatarEmoji, avatarColor } = (req.body ?? {}) as UpdateProfileRequest;

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  if (typeof displayName === "string") {
    if (displayName.trim().length < 2) {
      res.status(400).json({ error: "displayName debe tener al menos 2 caracteres" });
      return;
    }
    user.displayName = displayName.trim().slice(0, 24);
  }
  if (typeof avatarEmoji === "string" && avatarEmoji) user.avatarEmoji = avatarEmoji;
  if (typeof avatarColor === "string" && avatarColor) user.avatarColor = avatarColor;

  await user.save();
  const body: UserProfile = toUserProfile(user);
  res.json(body);
});
