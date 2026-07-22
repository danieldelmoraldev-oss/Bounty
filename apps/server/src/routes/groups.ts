import { Router } from "express";
import type {
  CreateGroupRequest,
  GroupDetail,
  GroupSummary,
  JoinGroupRequest,
} from "@bounty/shared";
import { requireAuth } from "../middleware/auth.ts";
import { Group } from "../models/Group.ts";
import { Membership } from "../models/Membership.ts";
import { User, type UserDoc } from "../models/User.ts";
import { generateUniqueGroupCode } from "../lib/inviteCode.ts";
import type { HydratedDocument } from "mongoose";

export const groupsRouter = Router();

async function buildGroupDetail(groupId: string): Promise<GroupDetail | null> {
  const group = await Group.findById(groupId);
  if (!group) return null;

  const memberships = await Membership.find({ group: group.id }).sort({ createdAt: 1 });
  const users = await User.find({ _id: { $in: memberships.map((m) => m.user) } });
  const usersById = new Map(users.map((u) => [u.id, u]));

  return {
    id: group.id,
    name: group.name,
    code: group.code,
    createdAt: group.get("createdAt").toISOString(),
    members: memberships.flatMap((membership) => {
      const user = usersById.get(membership.user.toString()) as
        | HydratedDocument<UserDoc>
        | undefined;
      if (!user) return [];
      return [
        {
          userId: user.id,
          displayName: user.displayName,
          avatarEmoji: user.avatarEmoji,
          avatarColor: user.avatarColor,
          role: membership.role as "admin" | "member",
          joinedAt: membership.get("createdAt").toISOString(),
        },
      ];
    }),
  };
}

groupsRouter.post("/groups", requireAuth, async (req, res) => {
  const { name } = (req.body ?? {}) as CreateGroupRequest;

  if (typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ error: "name debe tener al menos 2 caracteres" });
    return;
  }

  const code = await generateUniqueGroupCode();
  const group = await Group.create({
    name: name.trim().slice(0, 40),
    code,
    createdBy: req.userId,
  });
  await Membership.create({ group: group.id, user: req.userId, role: "admin" });

  const detail = await buildGroupDetail(group.id);
  if (!detail) {
    res.status(500).json({ error: "No se pudo crear el grupo" });
    return;
  }
  res.status(201).json(detail satisfies GroupDetail);
});

groupsRouter.post("/groups/join", requireAuth, async (req, res) => {
  const { code } = (req.body ?? {}) as JoinGroupRequest;

  if (typeof code !== "string" || code.trim().length === 0) {
    res.status(400).json({ error: "code es obligatorio" });
    return;
  }

  const group = await Group.findOne({ code: code.trim().toUpperCase() });
  if (!group) {
    res.status(404).json({ error: "No existe ningún grupo con ese código" });
    return;
  }

  const existing = await Membership.findOne({ group: group.id, user: req.userId });
  if (!existing) {
    await Membership.create({ group: group.id, user: req.userId, role: "member" });
  }

  const detail = await buildGroupDetail(group.id);
  if (!detail) {
    res.status(500).json({ error: "No se pudo unir al grupo" });
    return;
  }
  res.status(200).json(detail satisfies GroupDetail);
});

groupsRouter.get("/groups/mine", requireAuth, async (req, res) => {
  const memberships = await Membership.find({ user: req.userId });
  const groups = await Group.find({ _id: { $in: memberships.map((m) => m.group) } });
  const groupsById = new Map(groups.map((g) => [g.id, g]));

  const counts = new Map<string, number>();
  for (const m of await Membership.find({ group: { $in: memberships.map((m) => m.group) } })) {
    const key = m.group.toString();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const summaries: GroupSummary[] = memberships.flatMap((membership) => {
    const group = groupsById.get(membership.group.toString());
    if (!group) return [];
    return [
      {
        id: group.id,
        name: group.name,
        code: group.code,
        memberCount: counts.get(group.id) ?? 1,
        role: membership.role as "admin" | "member",
        createdAt: group.get("createdAt").toISOString(),
      },
    ];
  });

  res.json(summaries);
});

groupsRouter.get("/groups/:id", requireAuth, async (req, res) => {
  const groupId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const membership = await Membership.findOne({ group: groupId, user: req.userId });
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  const detail = await buildGroupDetail(groupId);
  if (!detail) {
    res.status(404).json({ error: "Grupo no encontrado" });
    return;
  }
  res.json(detail);
});

groupsRouter.delete("/groups/:id/membership", requireAuth, async (req, res) => {
  const groupId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const membership = await Membership.findOne({ group: groupId, user: req.userId });
  if (!membership) {
    res.status(403).json({ error: "No perteneces a este grupo" });
    return;
  }

  await membership.deleteOne();

  const remaining = await Membership.find({ group: groupId }).sort({ createdAt: 1 });
  if (remaining.length === 0) {
    await Group.deleteOne({ _id: groupId });
  } else if (membership.role === "admin" && !remaining.some((m) => m.role === "admin")) {
    // El grupo se queda sin admin: se promueve a quien lleve más tiempo dentro.
    remaining[0]!.role = "admin";
    await remaining[0]!.save();
  }

  res.status(204).send();
});
