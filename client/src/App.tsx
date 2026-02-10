import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { FacturacionPage } from "./pages/FacturacionPage";
import { HistorialPage } from "./pages/HistorialPage";
import { ClientesPage } from "./pages/ClientesPage";
import { ReportesPage } from "./pages/ReportesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/facturacion" element={<FacturacionPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
