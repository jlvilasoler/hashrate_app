import { jsPDF } from "jspdf";
import type { ComprobanteType, LineItem } from "./types";

/**
 * Modelo de factura HRS: diseño fijo idéntico al PDF de referencia
 * "PRUEBA VSC- VIA CLIENTE" / factura tipo HRS.
 * Todas las posiciones y estilos están definidos aquí.
 */

const HRS_GREEN = { r: 0, g: 166, b: 82 };

const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

function formatDDMMYY(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function formatFechaTexto(d: Date): string {
  return `${MESES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function monthToRange(ym: string): string {
  if (!/^\d{4}-\d{2}$/.test(ym)) return ym;
  const [y, m] = ym.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return `01/${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
}

function formatUSD(n: number): string {
  return `USD ${n.toFixed(2).replace(".", ",")}`;
}

export type FacturaPdfData = {
  number: string;
  type: ComprobanteType;
  clientName: string;
  /** Opcional: teléfono (ej. (+598)092335427) */
  clientPhone?: string;
  /** Opcional: email */
  clientEmail?: string;
  /** Opcional: dirección (ej. Soriano 1525 apto 201) */
  clientAddress?: string;
  /** Opcional: ciudad/país (ej. MONTEVIDEO, URUGUAY) */
  clientCity?: string;
  date: Date;
  items: LineItem[];
  subtotal: number;
  discounts: number;
  total: number;
};

export type FacturaPdfImages = {
  logoBase64?: string;
  fajaBase64?: string;
};

const EMISOR = {
  nombre: "HRS GROUP S.A",
  direccion: "Juan de Salazar 1857",
  ciudad: "Asunción - Paraguay",
  telefono: "Teléfono: (+595) 993 358 387",
  email: "sales@hashrate.space",
  ruc: "RUC EMISOR: 80144251-6",
};

// ---- Plantilla: dimensiones y posiciones (mm) ----
const M = 18;
const PAGE_W = 210;
const PAGE_H = 297;
const LOGO_H = 22;
const FAJA_H = 18;

const COL_DESC = 98;
const COL_PRECIO = 30;
const COL_CANT = 22;
const COL_TOTAL = 37;
const TABLE_W = COL_DESC + COL_PRECIO + COL_CANT + COL_TOTAL;
const ROW_H = 6.5;
const HEAD_H = 7;

export function generateFacturaPdf(data: FacturaPdfData, images?: FacturaPdfImages): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const now = data.date;
  const vencimiento = new Date(now);
  vencimiento.setDate(vencimiento.getDate() + 7);

  let y = 8;

  // 1) Logo (igual que referencia: arriba, ancho completo entre márgenes)
  if (images?.logoBase64) {
    try {
      doc.addImage(images.logoBase64, "PNG", M, y, PAGE_W - 2 * M, LOGO_H);
    } catch {
      //
    }
  }
  y += LOGO_H + 5;

  // 2) Fila: izquierda = emisor | derecha = FACTURA CREDITO, VIA CLIENTE, FECHA, TOTAL, RUC
  const tipoLabel = data.type === "Factura" ? "FACTURA CREDITO" : "RECIBO";
  const rightX = PAGE_W - M;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(HRS_GREEN.r, HRS_GREEN.g, HRS_GREEN.b);
  doc.text(EMISOR.nombre, M, y);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`${tipoLabel} - ${data.number}`, rightX, y, { align: "right" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(EMISOR.direccion, M, y);
  doc.text("VIA CLIENTE", rightX, y, { align: "right" });
  y += 4.5;

  doc.text(EMISOR.ciudad, M, y);
  doc.text("FECHA", rightX, y, { align: "right" });
  y += 4.5;

  doc.text(EMISOR.telefono, M, y);
  doc.text(formatFechaTexto(now), rightX, y, { align: "right" });
  y += 4.5;

  doc.text(EMISOR.email, M, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(HRS_GREEN.r, HRS_GREEN.g, HRS_GREEN.b);
  doc.text(`TOTAL ${formatUSD(data.total)}`, rightX, y, { align: "right" });
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  y += 4.5;

  doc.text(EMISOR.ruc, rightX, y, { align: "right" });
  y += 7;

  // 3) Línea servicio (igual que referencia)
  const firstItem = data.items[0];
  const code = firstItem?.serviceName?.match(/L7|L9|S21/i)?.[0]?.toUpperCase() || "L7";
  const servicioTitulo = firstItem
    ? `Servicio alojamiento y mantenimiento ${code} - ${firstItem.month ? monthToRange(firstItem.month) : ""}`.trim()
    : "Servicio alojamiento y mantenimiento";
  doc.setFontSize(10);
  doc.text(servicioTitulo, M, y);
  y += 7;

  // 4) Tabla: encabezado verde (DESCRIPCION | PRECIO | CANTIDAD | TOTAL)
  const tableTop = y;
  doc.setFillColor(HRS_GREEN.r, HRS_GREEN.g, HRS_GREEN.b);
  doc.rect(M, tableTop, TABLE_W, HEAD_H, "F");
  doc.setDrawColor(HRS_GREEN.r, HRS_GREEN.g, HRS_GREEN.b);
  doc.line(M + COL_DESC, tableTop, M + COL_DESC, tableTop + HEAD_H);
  doc.line(M + COL_DESC + COL_PRECIO, tableTop, M + COL_DESC + COL_PRECIO, tableTop + HEAD_H);
  doc.line(M + COL_DESC + COL_PRECIO + COL_CANT, tableTop, M + COL_DESC + COL_PRECIO + COL_CANT, tableTop + HEAD_H);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("DESCRIPCION", M + 2, tableTop + 4.8);
  doc.text("PRECIO", M + COL_DESC + 2, tableTop + 4.8);
  doc.text("CANTIDAD", M + COL_DESC + COL_PRECIO + 2, tableTop + 4.8);
  doc.text("TOTAL", M + COL_DESC + COL_PRECIO + COL_CANT + 2, tableTop + 4.8);
  doc.setTextColor(0, 0, 0);
  y = tableTop + HEAD_H;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setDrawColor(0, 0, 0);

  // Filas de ítems
  for (const it of data.items) {
    const lineTotal = (it.price - it.discount) * it.quantity;
    const desc = it.month ? `${it.serviceName} - ${it.month}` : it.serviceName;
    doc.rect(M, y, TABLE_W, ROW_H);
    doc.text(desc.substring(0, 55), M + 2, y + 4.2);
    doc.text(formatUSD(it.price), M + COL_DESC + 2, y + 4.2);
    doc.text(String(it.quantity), M + COL_DESC + COL_PRECIO + 2, y + 4.2);
    doc.text(formatUSD(lineTotal), M + COL_DESC + COL_PRECIO + COL_CANT + 2, y + 4.2);
    doc.line(M + COL_DESC, y, M + COL_DESC, y + ROW_H);
    doc.line(M + COL_DESC + COL_PRECIO, y, M + COL_DESC + COL_PRECIO, y + ROW_H);
    doc.line(M + COL_DESC + COL_PRECIO + COL_CANT, y, M + COL_DESC + COL_PRECIO + COL_CANT, y + ROW_H);
    y += ROW_H;
  }

  // Fila descuento (igual que referencia: desc, -USD unit, cantidad, -USD total)
  if (data.discounts > 0) {
    const first = data.items[0];
    const unitDiscount = first ? first.discount : data.discounts;
    const qtyDiscount = first ? first.quantity : 1;
    const descDescuento = first?.month
      ? `Descuento HASHRATE- ${first.serviceName?.match(/L7|L9|S21/i)?.[0] || "L7"} - ${monthToRange(first.month)}`
      : "Descuento HASHRATE";
    doc.rect(M, y, TABLE_W, ROW_H);
    doc.text(descDescuento.substring(0, 55), M + 2, y + 4.2);
    doc.text("- " + formatUSD(unitDiscount), M + COL_DESC + 2, y + 4.2);
    doc.text(String(qtyDiscount), M + COL_DESC + COL_PRECIO + 2, y + 4.2);
    doc.text("- " + formatUSD(data.discounts), M + COL_DESC + COL_PRECIO + COL_CANT + 2, y + 4.2);
    doc.line(M + COL_DESC, y, M + COL_DESC, y + ROW_H);
    doc.line(M + COL_DESC + COL_PRECIO, y, M + COL_DESC + COL_PRECIO, y + ROW_H);
    doc.line(M + COL_DESC + COL_PRECIO + COL_CANT, y, M + COL_DESC + COL_PRECIO + COL_CANT, y + ROW_H);
    y += ROW_H;
  }

  y += 6;

  // 5) Bloque CLIENTE (igual que referencia: nombre, teléfono, email, dirección, ciudad)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(HRS_GREEN.r, HRS_GREEN.g, HRS_GREEN.b);
  doc.text("CLIENTE:", M, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.clientName, M + 20, y);
  y += 5;
  doc.setFontSize(9);
  doc.text(data.clientPhone ?? "-", M, y);
  y += 4.5;
  doc.text(data.clientEmail ?? "-", M, y);
  y += 4.5;
  doc.text(data.clientAddress ?? "-", M, y);
  y += 4.5;
  doc.text((data.clientCity ?? "MONTEVIDEO, URUGUAY").toUpperCase(), M, y);
  y += 8;

  // 6) Fechas emisión y vencimiento (igual que referencia)
  doc.setFontSize(9);
  doc.text(`FECHA DE EMISIÓN: ${formatDDMMYY(now)}`, M, y);
  y += 5;
  doc.text(`FECHA DE VENCIMIENTO: ${formatDDMMYY(vencimiento)}`, M, y);
  y += 10;

  // Total a la derecha (reforzado)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(HRS_GREEN.r, HRS_GREEN.g, HRS_GREEN.b);
  doc.text(`TOTAL ${formatUSD(data.total)}`, rightX, y, { align: "right" });
  doc.setTextColor(0, 0, 0);

  // 7) Faja abajo (igual que referencia)
  if (images?.fajaBase64) {
    try {
      doc.addImage(images.fajaBase64, "PNG", 0, PAGE_H - FAJA_H - 12, PAGE_W, FAJA_H);
    } catch {
      //
    }
  }

  return doc;
}

export function loadImageAsBase64(url: string): Promise<string> {
  return fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
}
