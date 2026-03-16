import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard.jsx';
import MapaEditor from './pages/mapaEditor.jsx';
import Materias from './pages/Materias.jsx';
import Horarios from './pages/Horarios';
import Personal from './pages/Personal.jsx';
import Login from './pages/Login.jsx';
import Configuracion from './pages/Configuracion';

/**
 * Componente guardián para proteger rutas privadas.
 * Verifica la existencia de un token de sesión; si no existe, redirige al login.
 */
const RutaPrivada = ({ children }) => {
  const token = localStorage.getItem('adminToken');

  if (!token) {
    // Si no hay token, se redirige automáticamente a la pantalla de inicio de sesión
    return <Navigate to="/login" replace />;
  }

  // Si hay token, se permite el acceso al componente hijo
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA: Fuera del MainLayout para que no se vea la barra lateral */}
        <Route path="/login" element={<Login />} />

        {/* RUTAS PRIVADAS: Envueltas por el guardián y el Layout principal */}
        <Route
          path="/*"
          element={
            <RutaPrivada>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/mapa" element={<MapaEditor />} />
                  <Route path="/materias" element={<Materias />} />
                  <Route path="/horarios" element={<Horarios />} />
                  <Route path="/personal" element={<Personal />} />
                  <Route path="/config" element={<Configuracion />} />
                </Routes>
              </MainLayout>
            </RutaPrivada>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
