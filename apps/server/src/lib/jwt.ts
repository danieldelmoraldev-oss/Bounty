import jwt from "jsonwebtoken";
import { env } from "../config/env.ts";

export function signUserToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: "365d" });
}

export function verifyUserToken(token: string): string {
  const payload = jwt.verify(token, env.jwtSecret);
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("Token inválido");
  }
  return payload.sub;
}
