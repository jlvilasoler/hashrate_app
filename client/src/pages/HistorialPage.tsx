import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Chart from "chart.js/auto";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { loadInvoices, saveInvoices } from "../lib/storage";
import type { ComprobanteType, Invoice } from "../lib/types";

export function HistorialPage() {
  const [all, setAll] = useState<Invoice[]>(() => loadInvoices());
  const [qClient, setQClient] = useState("");
  const [qType, setQType] = useState<"" | ComprobanteType>("");
  const [qMonth, setQMonth] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  const filtered = useMemo(() => {
    const client = qClient.trim().toLowerCase();
    return all.filter((inv) => {
      const okClient = !client || inv.clientName.toLowerCase().includes(client);
      const okType = !qType || inv.type === qType;
      const okMonth = !qMonth || inv.month.startsWith(qMonth);
      return okClient && okType && okMonth;
    });
  }, [all, qClient, qType, qMonth]);

  const stats = useMemo(() => {
    const facturas = all.filter((i) => i.type === "Factura").length;
    const recibos = all.filter((i) => i.type === "Recibo").length;
    const total = all.reduce((s, i) => s + (Number(i.total) || 0), 0);
    return { facturas, recibos, total, registros: all.length };
  }, [all]);

  useEffect(() => {
    const byMonth = new Map<string, number>();
    all.forEach((inv) => {
      byMonth.set(inv.month, (byMonth.get(inv.month) ?? 0) + inv.total);
    });
    const labels = Array.from(byMonth.keys()).sort();
    const values = labels.map((m) => byMonth.get(m) ?? 0);

    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: "Total facturado ($)", data: values, borderWidth: 1 }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [all]);

  function exportExcel() {
    if (all.length === 0) return;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Historial");

    ws.columns = [
      { header: "Número", key: "number", width: 14 },
      { header: "Tipo", key: "type", width: 10 },
      { header: "Cliente", key: "clientName", width: 30 },
      { header: "Fecha", key: "date", width: 14 },
      { header: "Mes", key: "month", width: 10 },
      { header: "Total", key: "total", width: 12 }
    ];

    all.forEach((inv) => {
      ws.addRow({
        number: inv.number,
        type: inv.type,
        clientName: inv.clientName,
        date: inv.date,
        month: inv.month,
        total: inv.total
      });
    });
    ws.getRow(1).font = { bold: true };

    wb.xlsx.writeBuffer().then((buf) => {
      saveAs(new Blob([buf]), "Historial_Facturas.xlsx");
    });
  }

  function removeOne(id: string) {
    const next = all.filter((i) => i.id !== id);
    setAll(next);
    saveInvoices(next);
  }

  function clearAll() {
    if (!confirm("¿Borrar todo el historial? Esta acción no se puede deshacer.")) return;
    setAll([]);
    saveInvoices([]);
  }

  return (
    <div className="container py-5">
      <div className="hrs-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">Historial</h2>
          <Link to="/" className="btn btn-outline-secondary btn-sm">
            ← Volver
          </Link>
        </div>

        <div className="card p-3 mb-3">
          <h6 className="fw-bold mb-3 border-bottom pb-2">🔍 Filtros</h6>
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label small fw-bold">Cliente</label>
              <input
                className="form-control form-control-sm"
                placeholder="Buscar cliente..."
                value={qClient}
                onChange={(e) => setQClient(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Tipo</label>
              <select
                className="form-select form-select-sm"
                value={qType}
                onChange={(e) => setQType(e.target.value as "" | ComprobanteType)}
              >
                <option value="">Todos</option>
                <option value="Factura">Factura</option>
                <option value="Recibo">Recibo</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold">Mes</label>
              <input
                type="month"
                className="form-control form-control-sm"
                value={qMonth}
                onChange={(e) => setQMonth(e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={() => {
                  setQClient("");
                  setQType("");
                  setQMonth("");
                }}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <div className="card p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold m-0">📄 Listado</h6>
            <div className="d-flex gap-2">
              <button className="btn btn-success btn-sm" onClick={exportExcel}>
                📊 Excel
              </button>
              <button className="btn btn-danger btn-sm" onClick={clearAll}>
                🗑️ Limpiar todo
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-sm align-middle" style={{ fontSize: "0.85rem" }}>
              <thead className="table-dark">
                <tr>
                  <th>N°</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Mes</th>
                  <th>Total</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      <small>No hay facturas registradas</small>
                    </td>
                  </tr>
                ) : (
                  filtered.map((inv) => (
                    <tr key={inv.id}>
                      <td className="fw-bold">{inv.number}</td>
                      <td>{inv.type}</td>
                      <td>{inv.clientName}</td>
                      <td>{inv.date}</td>
                      <td>{inv.month}</td>
                      <td className="fw-bold">$ {inv.total.toFixed(2)}</td>
                      <td className="text-center">
                        <button className="btn btn-danger btn-sm" onClick={() => removeOne(inv.id)}>
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="row mt-4 g-3">
          <div className="col-md-3">
            <div className="card p-3 text-center">
              <h6 className="text-muted small">TOTAL FACTURAS</h6>
              <h3 className="fw-bold text-primary m-0">{stats.facturas}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 text-center">
              <h6 className="text-muted small">TOTAL RECIBOS</h6>
              <h3 className="fw-bold text-success m-0">{stats.recibos}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 text-center">
              <h6 className="text-muted small">MONTO TOTAL</h6>
              <h3 className="fw-bold m-0">$ {stats.total.toFixed(2)}</h3>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card p-3 text-center">
              <h6 className="text-muted small">REGISTROS</h6>
              <h3 className="fw-bold text-info m-0">{stats.registros}</h3>
            </div>
          </div>
        </div>

        <div className="card mt-4 p-4">
          <h5 className="fw-bold mb-3">📊 Facturación Total por Mes</h5>
          <canvas ref={canvasRef} height={120} />
        </div>
      </div>
    </div>
  );
}

