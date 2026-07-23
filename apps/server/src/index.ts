import express from "express";
import cors from "cors";
import { env } from "./config/env.ts";
import { connectDb } from "./config/db.ts";
import { healthRouter } from "./routes/health.ts";
import { authRouter } from "./routes/auth.ts";
import { usersRouter } from "./routes/users.ts";
import { groupsRouter } from "./routes/groups.ts";
import { seasonsRouter } from "./routes/seasons.ts";
import { partiesRouter } from "./routes/parties.ts";
import { albumRouter } from "./routes/album.ts";
import { shopRouter } from "./routes/shop.ts";

async function main() {
  const app = express();
  app.use(cors());
  // Las fotos/vídeos ya se suben directo a Cloudinary desde el móvil; al
  // servidor solo llegan URLs, así que no hace falta un límite grande.
  app.use(express.json({ limit: "1mb" }));
  app.use(healthRouter);
  app.use(authRouter);
  app.use(usersRouter);
  app.use(groupsRouter);
  app.use(seasonsRouter);
  app.use(partiesRouter);
  app.use(albumRouter);
  app.use(shopRouter);

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
