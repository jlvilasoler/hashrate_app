import Database from "better-sqlite3";
import { env } from "./config/env";

export const db = new Database(env.SQLITE_PATH);

// Inicializamos tablas relacionales simples
db.exec(`
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  clientName TEXT NOT NULL,
  date TEXT NOT NULL,
  month TEXT NOT NULL,
  subtotal REAL NOT NULL,
  discounts REAL NOT NULL,
  total REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  service TEXT NOT NULL,
  month TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  discount REAL NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);
`);

