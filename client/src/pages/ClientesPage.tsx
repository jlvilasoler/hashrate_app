import { Link } from "react-router-dom";

export function ClientesPage() {
  return (
    <div className="container py-5">
      <div className="hrs-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">Clientes</h2>
          <Link to="/" className="btn btn-outline-secondary btn-sm">
            ← Volver
          </Link>
        </div>

        <p className="text-muted m-0">
          Aquí voy a mover la lista fija de clientes a Mongo (`/api/clients`) y
          agregar ABM (alta/edición/baja) con validaciones.
        </p>
      </div>
    </div>
  );
}

