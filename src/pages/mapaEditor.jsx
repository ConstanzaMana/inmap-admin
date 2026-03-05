import React, { useState, useEffect } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 1. Importamos Destinos para cruzar los nombres
import recintosData from '../assets/recintos.json';
import zonasData from '../assets/obtenerZonas2.json';
import destinosData from '../assets/destinos.json';

// Función auxiliar para extraer arrays sin importar el formato del JSON
const extraerArreglo = (datos) => {
  if (!datos) return [];
  if (Array.isArray(datos)) return datos;
  if (datos.recinto) return datos.recinto;
  if (datos.zona) return datos.zona;
  if (datos.destino) return datos.destino;
  return Object.values(datos).find(Array.isArray) || [];
};

// Traductor adaptado para buscar el nombre en destinos.json
const convertirAGeoJSON = (datos, tipo, datosDestino = []) => {
  const arregloDatos = extraerArreglo(datos);
  const arregloDestinos = extraerArreglo(datosDestino);

  if (arregloDatos.length === 0) return null;

  return {
    type: "FeatureCollection",
    features: arregloDatos.map((item, index) => {

      // Buscamos si hay un destino en destinos.json que le pertenezca a este recinto
      const destinoVinculado = arregloDestinos.find(d =>
        (d.idRecinto && d.idRecinto === item.idRecinto) ||
        (d.recinto && d.recinto.idRecinto === item.idRecinto)
      );

      // Usamos el nombre cruzado, o el que traiga anidado, o vacío
      const nombreFinal = destinoVinculado?.nombreDestino
        || item.destino?.nombreDestino
        || "";

      return {
        type: "Feature",
        properties: {
          id_recinto: item.idRecinto,
          nombre_destino: nombreFinal,
          id_zona: item.idZona,
          bloqueado: item.bloqueado || false,
          bloqueo_permanente: item.bloqueo_permanente || false,
          id_mostrar: item.idRecinto || item.idZona || `${tipo}-${index}`
        },
        geometry: item.geometria
      };
    })
  };
};

export default function MapaEditor() {
  const [seleccionado, setSeleccionado] = useState(null);
  const [geoRecintos, setGeoRecintos] = useState(null);
  const [geoZonas, setGeoZonas] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    // 2. Le pasamos destinosData a los recintos para que haga la unión
    setGeoRecintos(convertirAGeoJSON(recintosData, 'recinto', destinosData));
    setGeoZonas(convertirAGeoJSON(zonasData, 'zona'));
  }, []);

  const alternarBloqueo = () => {
    if (!seleccionado || !seleccionado.id_zona) return;
    if (seleccionado.bloqueo_permanente) {
      alert("Esta zona tiene un bloqueo permanente y no se puede modificar.");
      return;
    }

    const nuevoEstado = !seleccionado.bloqueado;
    setSeleccionado({ ...seleccionado, bloqueado: nuevoEstado });

    const nuevasZonas = { ...geoZonas };
    const feature = nuevasZonas.features.find(f => f.properties.id_zona === seleccionado.id_zona);

    if (feature) feature.properties.bloqueado = nuevoEstado;

    setGeoZonas(nuevasZonas);
    setRenderKey(prev => prev + 1);
  };

  const estiloZonas = (feature) => ({
    fillColor: feature.properties.bloqueado ? '#ef4444' : '#64748b',
    weight: 1,
    opacity: 1,
    color: '#ffffff',
    fillOpacity: 0.7
  });

  const estiloRecintos = {
    fillColor: '#3b82f6',
    weight: 2,
    color: '#1e3a8a',
    fillOpacity: 0.4
  };

  const manejarClic = (feature, layer) => {
    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        setSeleccionado(feature.properties);
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex gap-6 w-full">
      <div className="flex-1 bg-slate-200 rounded-2xl shadow-inner border-2 border-slate-300 overflow-hidden relative">
        <MapContainer
          center={[511.47, 2884.39]}
          zoom={-1}
          minZoom={-5}
          maxZoom={4}
          crs={L.CRS.Simple}
          attributionControl={false} /* 3. ESTO ELIMINA EL TEXTO DE LEAFLET */
          className="h-full w-full z-0"
        >
         {geoRecintos && (
           <GeoJSON key="capa-recintos" data={geoRecintos} style={estiloRecintos} onEachFeature={manejarClic} />
         )}
         {geoZonas && (
           <GeoJSON key={`capa-zonas-${renderKey}`} data={geoZonas} style={estiloZonas} onEachFeature={manejarClic} />
         )}
        </MapContainer>
      </div>

      {seleccionado && (
        <div className="w-80 bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Editor de Espacio</h2>
          <p className="text-sm text-slate-500 mb-6 font-mono flex items-center gap-2">
            ID: <span className="font-bold text-slate-800">{seleccionado.id_mostrar}</span>
            {seleccionado.bloqueado && (
               <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs rounded-full border border-rose-200">Bloqueado</span>
            )}
            {seleccionado.bloqueo_permanente && (
               <span className="px-2 py-0.5 bg-slate-800 text-white text-xs rounded-full border border-slate-900">Fijo</span>
            )}
          </p>

          <div className="space-y-4">
            {seleccionado.id_recinto && (
              <>
                <label className="block text-sm font-medium text-slate-700">Nombre del Destino</label>
                <input
                  key={seleccionado.id_recinto} /* 4. CLAVE PARA QUE REACT REFRESQUE EL INPUT */
                  type="text"
                  defaultValue={seleccionado.nombre_destino}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                  Guardar Nombre
                </button>
              </>
            )}

            {seleccionado.id_zona && (
              <button
                onClick={alternarBloqueo}
                disabled={seleccionado.bloqueo_permanente}
                className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                  seleccionado.bloqueo_permanente ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
                  seleccionado.bloqueado
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                }`}
              >
                {seleccionado.bloqueo_permanente ? 'Bloqueo Permanente' :
                 seleccionado.bloqueado ? '✅ Desbloquear Zona' : '🚧 Bloquear Pasillo'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}