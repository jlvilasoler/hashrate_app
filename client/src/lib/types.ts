export type ComprobanteType = "Factura" | "Recibo";

export type Client = {
  code: string;
  name: string;
};

export type LineItem = {
  serviceKey: "A" | "B" | "C";
  serviceName: string;
  month: string; // YYYY-MM
  quantity: number;
  price: number;
  discount: number;
};

export type Invoice = {
  id: string;
  number: string; // FC-1001 / RC-1001
  type: ComprobanteType;
  clientName: string;
  date: string;
  month: string;
  subtotal: number;
  discounts: number;
  total: number;
  items: LineItem[];
};

