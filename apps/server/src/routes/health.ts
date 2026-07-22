import { Router } from "express";
import type { HealthResponse } from "@bounty/shared";
import { env } from "../config/env.ts";
import { isDbConnected } from "../config/db.ts";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  const connected = isDbConnected();
  const body: HealthResponse = {
    status: connected ? "ok" : "error",
    dataMode: env.dataMode,
    db: connected ? "connected" : "disconnected",
  };
  res.status(connected ? 200 : 503).json(body);
});
