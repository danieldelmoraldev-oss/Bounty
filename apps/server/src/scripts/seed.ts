import { connectDb } from "../config/db.js";
import { env } from "../config/env.js";

/**
 * Puebla la base de datos con datos de demo (falsos pero reales, guardados en
 * Mongo) cuando DATA_MODE=mock. Los modelos y la lógica de siembra se añaden
 * en la Fase 1, cuando existan los esquemas de Grupo/Usuario/Reto.
 */
async function seed() {
  if (env.dataMode !== "mock") {
    console.log("[seed] DATA_MODE es 'live', no se siembran datos de demo.");
    process.exit(0);
  }

  await connectDb();
  console.log("[seed] conectado. Sin modelos que sembrar todavía (Fase 0).");
  process.exit(0);
}

seed();
