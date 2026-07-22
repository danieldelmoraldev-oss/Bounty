import mongoose from "mongoose";
import { env } from "./env.ts";

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri, { dbName: env.dbName });
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
