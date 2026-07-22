import { Router } from "express";
import type { AuthResponse } from "@bounty/shared";
import { User } from "../models/User.ts";
import { signUserToken } from "../lib/jwt.ts";
import { toUserProfile } from "../lib/serialize.ts";

export const authRouter = Router();

// Alta "sin fricción": no hay email ni contraseña. El dispositivo pide un
// usuario nuevo dando ya el nombre y avatar elegidos en el onboarding, y el
// servidor le devuelve un token de larga duración que el cliente guarda.
authRouter.post("/auth/anonymous", async (req, res) => {
  const { displayName, avatarEmoji, avatarColor } = req.body ?? {};

  if (typeof displayName !== "string" || displayName.trim().length < 2) {
    res.status(400).json({ error: "displayName debe tener al menos 2 caracteres" });
    return;
  }

  const user = await User.create({
    displayName: displayName.trim().slice(0, 24),
    avatarEmoji: typeof avatarEmoji === "string" && avatarEmoji ? avatarEmoji : undefined,
    avatarColor: typeof avatarColor === "string" && avatarColor ? avatarColor : undefined,
  });

  const body: AuthResponse = {
    token: signUserToken(user.id),
    user: toUserProfile(user),
  };
  res.status(201).json(body);
});
