import express from "express";
import cors from "cors";
import { env } from "./config/env.ts";
import { connectDb } from "./config/db.ts";
import { healthRouter } from "./routes/health.ts";
import { authRouter } from "./routes/auth.ts";
import { usersRouter } from "./routes/users.ts";
import { groupsRouter } from "./routes/groups.ts";

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(healthRouter);
  app.use(authRouter);
  app.use(usersRouter);
  app.use(groupsRouter);

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
