import type { Invoice } from "./types";

const KEY = "facturas_hrs";

export function loadInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Invoice[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveInvoices(invoices: Invoice[]) {
  localStorage.setItem(KEY, JSON.stringify(invoices));
}

