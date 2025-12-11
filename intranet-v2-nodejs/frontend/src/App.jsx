// frontend/src/App.jsx

import { Routes, Route } from "react-router-dom";

import LoginOTP from "./components/LoginOTP";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Routes>
      {/* Ruta principal: Login / OTP */}
      <Route path="/" element={<LoginOTP />} />

      {/* Dashboard se encarga de todas las subrutas (/dashboard, /dashboard/herramientas, etc.) */}
      <Route path="/dashboard/*" element={<Dashboard />} />

      {/* Ruta para capturar errores 404 reales */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

export default App;

