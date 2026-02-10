import type { Client } from "./types";

export const defaultClients: Client[] = [
  { code: "INDICAR", name: "INDICAR CLIENTE" },
  { code: "C01", name: "PIROTTO, PABLO" },
  { code: "C02", name: "CHABERT, SANTIAGO" },
  { code: "C03", name: "IRIGOYEN, MARTIN" },
  { code: "C04", name: "HAM, MATIAS" },
  { code: "C05", name: "CROSTA, MATIAS" },
  { code: "C06", name: "CABRERA, LEONARDO" },
  { code: "C07", name: "RIVERO, CLAUDIO" },
  { code: "C08", name: "PIROTTO, ANA LUCIA" },
  { code: "C09", name: "DAMASCO, MARCELO" },
  { code: "C10", name: "BAUER, ALEJANDRO" },
  { code: "C11", name: "MATIAS HAM Y GUILLERMO VILA" },
  { code: "C12", name: "VALDEZ, JOSE" },
  { code: "C13", name: "GANADERA CHIVILCOY" },
  { code: "C14", name: "LAZARO, AGUSTIN" },
  { code: "C15", name: "SOLER HOWARD, MARIA" },
  { code: "C105", name: "VILA SOLER, JOSE LUIS" }
];

export const serviceCatalog = {
  A: { name: "Bitmain Antminer L7 mhs", price: 100 },
  B: { name: "Bitmain Antminer L9 mhs", price: 250 },
  C: { name: "Bitmain Antminer S21 ths", price: 500 }
} as const;

