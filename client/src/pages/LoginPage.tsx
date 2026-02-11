import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getApiBaseUrlForDisplay, setApiBaseUrl } from "../lib/api";
import "../styles/facturacion.css";

export function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiUrl, setApiUrl] = useState(getApiBaseUrlForDisplay());
  const [apiUrlSaved, setApiUrlSaved] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  if (user) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-4 col-md-6">
          <div className="hrs-card p-4">
            <h2 className="hrs-title mb-4 text-center">Iniciar sesión</h2>
            <p className="text-muted small text-center mb-4">Sistema de Facturación HRS</p>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Usuario o correo</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <div className="alert alert-danger py-2 small" role="alert">
                  {error}
                </div>
              )}
              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                {submitting ? "Entrando..." : "Entrar"}
              </button>
              <div className="mt-3 text-center">
                <button
                  type="button"
                  className="btn btn-link btn-sm text-muted p-0"
                  onClick={() => {
                    setShowApiConfig((v) => !v);
                    if (!showApiConfig) setApiUrl(getApiBaseUrlForDisplay());
                  }}
                >
                  {showApiConfig ? "Ocultar" : "No conecta? Configurar URL del backend"}
                </button>
              </div>
              {showApiConfig && (
                <div className="mt-3 p-3 border rounded bg-light">
                  <label className="form-label small fw-bold">URL del backend (ej. https://tu-servicio.onrender.com)</label>
                  <input
                    type="url"
                    className="form-control form-control-sm"
                    placeholder="https://hashrate-api.onrender.com"
                    value={apiUrl.startsWith("(mismo") ? "" : apiUrl}
                    onChange={(e) => { setApiUrl(e.target.value); setApiUrlSaved(false); }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm mt-2"
                    onClick={() => {
                      setApiBaseUrl(apiUrl);
                      setApiUrlSaved(true);
                      setApiUrl(getApiBaseUrlForDisplay());
                    }}
                  >
                    Guardar URL
                  </button>
                  {apiUrlSaved && <span className="ms-2 text-success small">Guardado. Intentá iniciar sesión de nuevo.</span>}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
