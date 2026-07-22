import "dotenv/config";
import type { DataMode } from "@bounty/shared";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: required("MONGODB_URI"),
  dataMode: (process.env.DATA_MODE === "live" ? "live" : "mock") as DataMode,
};
