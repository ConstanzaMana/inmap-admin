/**
 * Panel de control (dashboard)
 * Resumen cuantitativo del sistema y acceso directo a las distintas partes del sistema
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Map, Users, BookOpen, Calendar,
  ArrowRight
} from 'lucide-react';

import { MapContainer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { materiasService } from '../api/materiaService.js';
import { personalService } from '../api/personalService.js';
import { horariosService } from '../api/horariosService.js';
import { mapaService } from '../api/mapaService.js';

// normaliza los datos recibidos de la api
const extraerArreglo = (datos) => {
  if (!datos) return [];
  if (Array.isArray(datos)) return datos;
  if (datos.recinto) return datos.recinto;
  if (datos.zona) return datos.zona;
  return Object.values(datos).find(Array.isArray) || [];
};

// transforma los datos planos en un formato geojson compatible con el mapa
const convertirParaFondo = (datos) => {
  const arreglo = extraerArreglo(datos);
  if (arreglo.length === 0) return null;
  return {
    type: "FeatureCollection",
    features: arreglo.map(item => ({
      type: "Feature",
      properties: { bloqueado: item.bloqueado || false },
      geometry: item.geometria
    }))
  };
};

export default function Dashboard() {
  const [conteos, setConteos] = useState({ materias: 0, personal: 0, clases: 0 });
  const [cargando, setCargando] = useState(true);
  const [geoRecintos, setGeoRecintos] = useState(null);
  const [geoZonas, setGeoZonas] = useState(null);
  const navigate = useNavigate();

  // sincronización inicial de métricas y datos geográficos del sistema
  useEffect(() => {
    const cargarDatosYMapa = async () => {
      setCargando(true);

      const [dataMaterias, dataPersonal, dataClases, recintos, zonas] = await Promise.all([
        materiasService.getAll(),
        personalService.getAll(),
        horariosService.getAll(),
        mapaService.getRecintos(),
        mapaService.getZonas()
      ]);

      setConteos({
        materias: dataMaterias.length,
        personal: dataPersonal.length,
        clases: dataClases.length
      });

      setGeoRecintos(convertirParaFondo(recintos));
      setGeoZonas(convertirParaFondo(zonas));
      setCargando(false);
    };

    cargarDatosYMapa();
  }, []);
return (
  <div className="space-y-8 h-full flex flex-col">

    {/* encabezado de bienvenida */}
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Hola 👋</h1>
      <p className="text-slate-500 mt-1">Resumen general del sistema de posicionamiento y gestión.</p>
    </div>

    {/* sección de tarjetas con acceso directo */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* acceso a la gestión de asignaturas */}
      <Link to="/materias" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-indigo-300 transition-all group cursor-pointer">
        <div className="p-4 rounded-xl bg-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform">
          <BookOpen size={28} strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">Materias Activas</p>
          <p className="text-3xl font-black text-700">
            {cargando ? <span className="text-slate-300 text-2xl">...</span> : conteos.materias}
          </p>
        </div>
        <ArrowRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
      </Link>

      {/* acceso a la gestión de personal */}
      <Link to="/personal" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-emerald-300 transition-all group cursor-pointer">
        <div className="p-4 rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
          <Users size={28} strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Personal Registrado</p>
          <p className="text-3xl font-black text-slate-800">
            {cargando ? <span className="text-slate-300 text-2xl">...</span> : conteos.personal}
          </p>
        </div>
        <ArrowRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
      </Link>

      {/* acceso a seccion de horarios*/}
      <Link to="/horarios" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-purple-300 transition-all group cursor-pointer">
        <div className="p-4 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
          <Calendar size={28} strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider group-hover:text-purple-600 transition-colors">Clases Programadas</p>
          <p className="text-3xl font-black text-slate-800">
            {cargando ? <span className="text-slate-300 text-2xl">...</span> : conteos.clases}
          </p>
        </div>
        <ArrowRight className="text-slate-300 group-hover:text-purple-500 transition-colors" />
      </Link>
    </div>

    {/* Previsualización del mapa */}
    <div
      onClick={() => navigate('/mapa')}
      className="relative bg-slate-50 rounded-3xl overflow-hidden shadow-sm flex-1 min-h-[400px] group cursor-pointer hover:shadow-md transition-all duration-300 border border-slate-200"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 h-full relative z-10">

        <div className="relative p-8 md:p-12 flex flex-col justify-center items-start z-10 h-full bg-slate-900">
          <div className="relative">
            <div className="bg-slate-800 w-fit p-3.5 rounded-2xl mb-6 border border-slate-700 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Map className="text-blue-400" size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
              Editor del plano <br/>
              <span className="text-blue-400">del Campus</span>
            </h2>
            <p className="text-slate-400 font-medium mb-8 max-w-md text-base md:text-lg leading-relaxed">
              Ingresá al plano interactivo para gestionar las aulas en tiempo real y bloquear zonas.
            </p>
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors hover:bg-blue-500">
              Abrir Editor de Mapa <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {/* visualización gráfica simplificada de los recintos y zonas */}
        <div className="relative h-64 md:h-full overflow-hidden bg-slate-50">
          <div className="absolute inset-y-0 left-0 w-30 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent z-10 pointer-events-none hidden md:block" />
          <div className="absolute inset-0 z-0 pointer-events-none transition-transform duration-1000 group-hover:scale-105">
            {geoRecintos && (
              <MapContainer
                center={[519, 2874]}
                zoom={2}
                crs={L.CRS.Simple}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                keyboard={false}
                attributionControl={false}
                className="w-full h-full"
                style={{ background: 'transparent' }}
              >
                <GeoJSON
                  data={geoRecintos}
                  style={{ fillColor: '#94a3b8', weight: 1.5, color: '#3b82f6', fillOpacity: 0.1 }}
                />
                {geoZonas && (
                  <GeoJSON
                    data={geoZonas}
                    style={(f) => ({
                      fillColor: f.properties.bloqueado ? '#ef4444' : '#e2e8f0',
                      weight: 1.2,
                      color: '#94a3b8',
                      fillOpacity: f.properties.bloqueado ? 0.5 : 0.4
                    })}
                  />
                )}
              </MapContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  </div>
);
}