import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard.jsx';
import MapaEditor from './pages/mapaEditor.jsx';
import Materias from './pages/Materias.jsx';
import Horarios from './pages/Horarios';
import Personal from './pages/Personal.jsx';


export default function App() {
  return (
    <BrowserRouter>
      {/* Ahora el MainLayout y su Sidebar están DENTRO del Router */}
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mapa" element={<MapaEditor />} />
          <Route path="/materias" element={<Materias />} />
          <Route path="/horarios" element={<Horarios />} />
          <Route path="/personal" element={<Personal />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}