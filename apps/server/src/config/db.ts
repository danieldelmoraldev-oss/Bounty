import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
