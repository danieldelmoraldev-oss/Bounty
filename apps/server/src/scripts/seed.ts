import { connectDb } from "../config/db.ts";
import { env } from "../config/env.ts";
import { User } from "../models/User.ts";
import { Group } from "../models/Group.ts";
import { Membership } from "../models/Membership.ts";
import { generateUniqueGroupCode } from "../lib/inviteCode.ts";

const DEMO_USERS = [
  { displayName: "Dani", avatarEmoji: "🦝", avatarColor: "#B7F700" },
  { displayName: "Lucía", avatarEmoji: "🐺", avatarColor: "#C86BFF" },
  { displayName: "Marcos", avatarEmoji: "🦊", avatarColor: "#3FE0E8" },
  { displayName: "Elena", avatarEmoji: "🐍", avatarColor: "#FFD65C" },
];

async function seed() {
  if (env.dataMode !== "mock") {
    console.log("[seed] DATA_MODE es 'live', no se siembran datos de demo.");
    process.exit(0);
  }

  await connectDb();

  await Promise.all([User.deleteMany({}), Group.deleteMany({}), Membership.deleteMany({})]);

  const users = await User.create(DEMO_USERS);
  const code = await generateUniqueGroupCode();
  const group = await Group.create({
    name: "Fiesta Demo",
    code,
    createdBy: users[0]!.id,
  });

  await Membership.create([
    { group: group.id, user: users[0]!.id, role: "admin" },
    ...users.slice(1).map((u) => ({ group: group.id, user: u.id, role: "member" as const })),
  ]);

  console.log(`[seed] listo. Grupo "${group.name}" con código ${group.code}.`);
  console.log(`[seed] usuarios: ${users.map((u) => u.displayName).join(", ")}`);
  process.exit(0);
}

seed();
