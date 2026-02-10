import { Router } from "express";
import { z } from "zod";
import { db } from "../db";

export const clientsRouter = Router();

const ClientCreateSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200)
});

clientsRouter.get("/clients", (_req, res) => {
  const rows = db
    .prepare("SELECT id, code, name FROM clients ORDER BY code ASC")
    .all();
  res.json({ clients: rows });
});

clientsRouter.post("/clients", (req, res) => {
  const parsed = ClientCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: { message: "Invalid body", details: parsed.error.flatten() } });
  }

  const stmt = db.prepare("INSERT INTO clients (code, name) VALUES (?, ?)");
  try {
    const info = stmt.run(parsed.data.code, parsed.data.name);
    const client = db
      .prepare("SELECT id, code, name FROM clients WHERE id = ?")
      .get(info.lastInsertRowid as number);
    res.status(201).json({ client });
  } catch (e: any) {
    if (e && typeof e.code === "string" && e.code.includes("SQLITE_CONSTRAINT")) {
      return res.status(409).json({ error: { message: "Client code already exists" } });
    }
    throw e;
  }
});

