import type { NextFunction, Request, Response } from "express";
import { verifyUserToken } from "../lib/jwt.ts";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ error: "Falta el token de autenticación" });
    return;
  }

  try {
    req.userId = verifyUserToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o caducado" });
  }
}
