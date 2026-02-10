import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-5 col-md-7 col-sm-10">
          <div className="hrs-card p-5 text-center">
            <h1 className="hrs-title mb-2">HRS GROUP S.A</h1>
            <p className="hrs-subtitle mb-5">Sistema de Gestión Interna</p>

            <div className="row g-3 justify-content-center">
              <div className="col-6">
                <Link to="/facturacion" className="btn-menu w-100">
                  Facturación
                </Link>
              </div>
              <div className="col-6">
                <Link to="/historial" className="btn-menu w-100">
                  Historial
                </Link>
              </div>
              <div className="col-6">
                <Link to="/clientes" className="btn-menu w-100">
                  Clientes
                </Link>
              </div>
              <div className="col-6">
                <Link to="/reportes" className="btn-menu w-100">
                  Reportes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

