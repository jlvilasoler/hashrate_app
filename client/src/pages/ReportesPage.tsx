import { Link } from "react-router-dom";

export function ReportesPage() {
  return (
    <div className="container py-5">
      <div className="hrs-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">Reportes</h2>
          <Link to="/" className="btn btn-outline-secondary btn-sm">
            ← Volver
          </Link>
        </div>

        <p className="text-muted m-0">
          Esta sección se va a alimentar desde Mongo (totales por mes, por
          cliente, y exportaciones). La base ya está lista.
        </p>
      </div>
    </div>
  );
}

