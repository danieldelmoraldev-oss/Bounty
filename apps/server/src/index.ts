import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { healthRouter } from "./routes/health.js";

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(healthRouter);

  try {
    await connectDb();
    console.log(`[db] connected (mode: ${env.dataMode})`);
  } catch (err) {
    console.error("[db] connection failed", err);
  }

  app.listen(env.port, () => {
    console.log(`[server] listening on port ${env.port}`);
  });
}

main();
