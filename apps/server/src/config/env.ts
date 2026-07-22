import "dotenv/config";
import type { DataMode } from "@bounty/shared";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const dataMode = (process.env.DATA_MODE === "live" ? "live" : "mock") as DataMode;

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: required("MONGODB_URI"),
  dataMode,
  dbName: dataMode === "live" ? "bounty_live" : "bounty_mock",
  jwtSecret: required("JWT_SECRET"),
  openaiApiKey: process.env.OPENAI_API_KEY,
};
