import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const usersRouter = Router();

const CreateUserSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(6).max(100),
  role: z.enum(["admin", "operador", "lector"])
});

const UpdateUserSchema = z.object({
  email: z.string().email().max(200).optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(["admin", "operador", "lector"]).optional()
});

/** Listar usuarios (solo admin) - devuelve id, email, role, created_at (sin password) */
usersRouter.get("/users", requireAuth, requireRole("admin"), (req, res) => {
  const rows = db.prepare("SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC").all() as Array<{
    id: number;
    username: string;
    email: string | null;
    role: string;
    created_at: string;
  }>;
  const users = rows.map((r) => ({
    id: r.id,
    email: r.email ?? r.username,
    role: r.role,
    created_at: r.created_at
  }));
  res.json({ users });
});

/** Crear usuario (solo admin) */
usersRouter.post("/users", requireAuth, requireRole("admin"), (req, res) => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Datos inválidos", details: parsed.error.flatten() } });
  }
  const { email, password, role } = parsed.data;
  const emailNorm = email.trim().toLowerCase();
  const hash = bcrypt.hashSync(password, 10);
  try {
    db.prepare("INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)").run(emailNorm, emailNorm, hash, role);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err?.code && String(err.code).includes("SQLITE_CONSTRAINT")) {
      return res.status(409).json({ error: { message: "Ya existe un usuario con ese correo" } });
    }
    throw e;
  }
  const row = db.prepare("SELECT id, email, role, created_at FROM users WHERE email = ?").get(emailNorm) as { id: number; email: string; role: string; created_at: string };
  res.status(201).json({ user: { id: row.id, email: row.email, role: row.role, created_at: row.created_at } });
});

/** Actualizar usuario (solo admin); no puede quitarse su propio rol admin */
usersRouter.put("/users/:id", requireAuth, requireRole("admin"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: { message: "ID inválido" } });
  }
  const parsed = UpdateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { message: "Datos inválidos", details: parsed.error.flatten() } });
  }
  const existing = db.prepare("SELECT id, email, role FROM users WHERE id = ?").get(id) as { id: number; email: string; role: string } | undefined;
  if (!existing) {
    return res.status(404).json({ error: { message: "Usuario no encontrado" } });
  }
  const updates: string[] = [];
  const values: unknown[] = [];
  if (parsed.data.email !== undefined) {
    const emailNorm = parsed.data.email.trim().toLowerCase();
    updates.push("email = ?", "username = ?");
    values.push(emailNorm, emailNorm);
  }
  if (parsed.data.password !== undefined) {
    updates.push("password_hash = ?");
    values.push(bcrypt.hashSync(parsed.data.password, 10));
  }
  if (parsed.data.role !== undefined) {
    if (req.user!.id === id && parsed.data.role !== "admin") {
      return res.status(400).json({ error: { message: "No puede quitarse su propio rol de administrador" } });
    }
    updates.push("role = ?");
    values.push(parsed.data.role);
  }
  if (updates.length === 0) {
    const row = db.prepare("SELECT id, username, email, role, created_at FROM users WHERE id = ?").get(id) as { id: number; username: string; email: string | null; role: string; created_at: string };
    return res.json({ user: { id: row.id, email: row.email ?? row.username, role: row.role, created_at: row.created_at } });
  }
  values.push(id);
  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);
  const row = db.prepare("SELECT id, username, email, role, created_at FROM users WHERE id = ?").get(id) as { id: number; username: string; email: string | null; role: string; created_at: string };
  res.json({ user: { id: row.id, email: row.email ?? row.username, role: row.role, created_at: row.created_at } });
});

/** Listar actividad de usuarios (solo admin): entradas/salidas, horarios, tiempo conectado, IP */
usersRouter.get("/users/activity", requireAuth, requireRole("admin"), (req, res) => {
  const limit = Math.min(Math.max(1, Number(req.query.limit) || 100), 500);
  const rows = db
    .prepare(
      `SELECT a.id, a.user_id, a.event, a.created_at, a.ip_address, a.user_agent, a.duration_seconds,
              u.email, u.username
       FROM user_activity a
       JOIN users u ON u.id = a.user_id
       ORDER BY a.created_at DESC
       LIMIT ?`
    )
    .all(limit) as Array<{
    id: number;
    user_id: number;
    event: string;
    created_at: string;
    ip_address: string | null;
    user_agent: string | null;
    duration_seconds: number | null;
    email: string | null;
    username: string;
  }>;
  const activity = rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    user_email: r.email ?? r.username,
    event: r.event,
    created_at: r.created_at,
    ip_address: r.ip_address ?? undefined,
    user_agent: r.user_agent ?? undefined,
    duration_seconds: r.duration_seconds ?? undefined
  }));
  res.json({ activity });
});

/** Eliminar usuario (solo admin); no puede eliminarse a sí mismo */
usersRouter.delete("/users/:id", requireAuth, requireRole("admin"), (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: { message: "ID inválido" } });
  }
  if (req.user!.id === id) {
    return res.status(400).json({ error: { message: "No puede eliminarse a sí mismo" } });
  }
  const info = db.prepare("DELETE FROM users WHERE id = ?").run(id);
  if (info.changes === 0) {
    return res.status(404).json({ error: { message: "Usuario no encontrado" } });
  }
  res.status(204).send();
});
