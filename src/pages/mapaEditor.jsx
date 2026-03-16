import React, { useState, useEffect } from 'react';
import { MapContainer, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Save, Lock, Unlock, AlertCircle, X } from 'lucide-react';
import Swal from 'sweetalert2';

import { mapaService } from '../api/mapaService.js';

// --- COMPONENTE PARA DETECTAR CLICS EN EL FONDO DEL MAPA ---
// --- COMPONENTE PARA DETECTAR CLICS Y ARREGLAR RENDERIZADO DEL MAPA ---
function EventosMapa({ onMapClick }) {
  const mapa = useMapEvents({
    click: () => onMapClick()
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      mapa.invalidateSize();
    }, 400);

    return () => clearTimeout(timer); // Limpiamos la memoria por las dudas
  }, [mapa]);

  return null;
}

// --- FUNCIONES AUXILIARES ---
const extraerArreglo = (datos) => {
  if (!datos) return [];
  if (Array.isArray(datos)) return datos;
  if (datos.recinto) return datos.recinto;
  if (datos.zona) return datos.zona;
  if (datos.destino) return datos.destino;
  return Object.values(datos).find(Array.isArray) || [];
};

const convertirAGeoJSON = (datos, tipo, datosDestino = []) => {
  const arregloDatos = extraerArreglo(datos);
  const arregloDestinos = extraerArreglo(datosDestino);

  if (arregloDatos.length === 0) return null;

  return {
    type: "FeatureCollection",
    features: arregloDatos.map((item, index) => {
      const destinoVinculado = arregloDestinos.find(d =>
        (d.idRecinto && d.idRecinto === item.idRecinto) ||
        (d.recinto && d.recinto.idRecinto === item.idRecinto)
      );

      const nombreFinal = destinoVinculado?.nombreDestino || item.destino?.nombreDestino || "";

      return {
        type: "Feature",
        properties: {
          id_recinto: item.idRecinto,
          id_destino: destinoVinculado?.idDestino || item.destino?.idDestino,
          nombre_destino: nombreFinal,

          // 👇 AGREGAMOS ESTA LÍNEA PARA GUARDAR EL PUNTO DEL DESTINO 👇
          geometria_destino: destinoVinculado?.geometria || item.destino?.geometria || null,

          id_zona: item.idZona,
          bloqueado: item.bloqueado || false,
          bloqueo_permanente: item.bloqueo_permanente || false,
          id_mostrar: item.idRecinto || item.idZona || `${tipo}-${index}`,
          geometria: item.geometria
        },
        geometry: item.geometria
      };
    })
  };
};

export default function MapaEditor() {
  const [recintoSeleccionado, setRecintoSeleccionado] = useState(null);
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState([]);

  const [geoRecintos, setGeoRecintos] = useState(null);
  const [geoZonas, setGeoZonas] = useState(null);

  const [renderKey, setRenderKey] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [nombreEdit, setNombreEdit] = useState("");

  const cargarDatosDelMapa = async () => {
    setCargando(true);
    try {
      const [recintos, zonas, destinos] = await Promise.all([
        mapaService.getRecintos(),
        mapaService.getZonas(),
        mapaService.getDestinos()
      ]);
      setGeoRecintos(convertirAGeoJSON(recintos, 'recinto', destinos));
      setGeoZonas(convertirAGeoJSON(zonas, 'zona'));
    } catch (error) {
      console.error("Error al cargar mapa:", error);
    }
    setCargando(false);
  };

  useEffect(() => { cargarDatosDelMapa(); }, []);

  // --- ESTILOS DEL MAPA ---
  const estiloRecintos = (feature) => {
    const esSeleccionado = recintoSeleccionado && recintoSeleccionado.id_mostrar === feature.properties.id_mostrar;
    const estaBloqueado = feature.properties.bloqueado;

    return {
      fillColor: esSeleccionado ? '#facc15' : (estaBloqueado ? '#f87171' : '#3b82f6'),
      weight: esSeleccionado ? 3 : 1,
      color: esSeleccionado ? '#ca8a04' : (estaBloqueado ? '#b91c1c' : '#1e3a8a'),
      fillOpacity: esSeleccionado ? 0.7 : (estaBloqueado ? 0.8 : 0.4)
    };
  };

  const estiloZonas = (feature) => {
      const esSeleccionado = zonasSeleccionadas.some(z => z.id_zona === feature.properties.id_zona);
      const bloqueado = feature.properties.bloqueado;
      return {
        fillColor: bloqueado ? '#ef4444' : (esSeleccionado ? '#facc15' : '#94a3b8'),
        // Engordamos el borde y le ponemos el color del fondo para que los cuadritos se vean más chicos y separados
        weight: esSeleccionado ? 2.5 : 1.5,
        color: '#e2e8f0',
        fillOpacity: bloqueado ? 0.8 : (esSeleccionado ? 0.8 : 0.4)
      };
    };

  const manejarClic = (feature, layer) => {
    layer.on({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        const props = feature.properties;

        if (props.id_recinto) {
          setZonasSeleccionadas([]);
          setRecintoSeleccionado(props);
          setNombreEdit(props.nombre_destino || "");
        } else if (props.id_zona) {
          if (props.bloqueo_permanente) {
             Swal.fire({ toast: true, position: 'bottom-end', icon: 'info', title: 'Zona Fija (No editable)', showConfirmButton: false, timer: 2000 });
             return;
          }
          setRecintoSeleccionado(null);
          setZonasSeleccionadas(prev => {
             const existe = prev.find(z => z.id_zona === props.id_zona);
             if (existe) {
               return prev.filter(z => z.id_zona !== props.id_zona);
             } else {
               return [...prev, props];
             }
          });
        }
      }
    });
  };

  const limpiarSeleccion = () => {
    setRecintoSeleccionado(null);
    setZonasSeleccionadas([]);
  };

  // --- LÓGICA DE NEGOCIO ---
  const alternarBloqueoRecinto = async () => {
    if (!recintoSeleccionado) return;
    const nuevoEstado = !recintoSeleccionado.bloqueado;
    try {
      await mapaService.updateEstadoRecinto(recintoSeleccionado.id_recinto, nuevoEstado);
      setRecintoSeleccionado({ ...recintoSeleccionado, bloqueado: nuevoEstado });
      cargarDatosDelMapa();
    } catch (e) {
      Swal.fire('Error', 'No se pudo cambiar el estado.', 'error');
    }
  };

 const procesarZonasMasivo = async (zonasAProcesar, bloquear) => {
     const cantidad = zonasAProcesar.length;
     if (cantidad === 0) return;

     setCargando(true);
     try {
       const idsZonas = zonasAProcesar.map(zona => zona.id_zona);

       // 1. Mandamos la orden al servidor
       await mapaService.updateEstadosZonas(idsZonas, bloquear);

       // 2. Pintamos el mapa localmente al instante
       setGeoZonas(prev => {
          const nuevasZonas = { ...prev };
          nuevasZonas.features = nuevasZonas.features.map(f => {
             if (idsZonas.includes(f.properties.id_zona)) {
                f.properties.bloqueado = bloquear;
             }
             return f;
          });
          return nuevasZonas;
       });

       // 3. Actualizamos las zonas seleccionadas para que salten de una lista a la otra automáticamente
       setZonasSeleccionadas(prev => prev.map(z => {
          if (idsZonas.includes(z.id_zona)) {
             return { ...z, bloqueado: bloquear };
          }
          return z;
       }));

       // 4. Cartel dinámico
        const accion = bloquear ? 'bloqueada' : 'desbloqueada';
            Swal.fire({
              toast: true,
              position: 'bottom-end',
              icon: 'success',
              title: cantidad === 1 ? `Zona ${accion}.` : `${cantidad} zonas ${accion}s.`,
              showConfirmButton: false,
              timer: 2000
        });

       // Nota: Sacamos limpiarSeleccion() para que el panel no se cierre y puedas seguir trabajando con las otras zonas.

     } catch (e) {
       console.error("Error al actualizar zonas:", e);
       Swal.fire('Error', 'El servidor rechazó la peticion.', 'error');
     } finally {
       setCargando(false);
     }
   };

  const guardarNombre = async () => {
      if (nombreEdit.trim().length <= 2) {
        Swal.fire('Atención', 'El nombre debe tener más de 2 caracteres.', 'warning');
        return;
      }
      try {
        const idDestinoFinal = recintoSeleccionado.id_destino || recintoSeleccionado.id_recinto.replace('R', 'D');

        // 👇 CAMBIAMOS QUÉ GEOMETRÍA LE MANDAMOS AL BACKEND 👇
        const payload = {
          idDestino: idDestinoFinal,
          nombreDestino: nombreEdit.trim(),
          geometria: recintoSeleccionado.geometria_destino // Usamos el PUNTO, no el Polígono
        };

        // Control de seguridad por si el aula no tenía un destino (Punto) asignado previamente
        if (!payload.geometria) {
           Swal.fire('Error', 'Esta aula aún no tiene un punto de Destino asignado en la Base de Datos.', 'error');
           return;
        }

        await mapaService.updateDestino(idDestinoFinal, payload);
        Swal.fire('Éxito', 'Nombre del destino actualizado', 'success');
        cargarDatosDelMapa();
      } catch (e) {
        Swal.fire('Error', 'Hubo un problema al guardar.', 'error');
      }
    };

  if (cargando && !geoZonas) {
    return (
      <div className="h-[80vh] flex items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <div className="text-center font-bold text-slate-500 animate-pulse">Armando infraestructura del mapa...</div>
      </div>
    );
  }

  const isRecinto = !!recintoSeleccionado;
  const isZonas = zonasSeleccionadas.length > 0;
  const todasBloqueadas = isZonas && zonasSeleccionadas.every(z => z.bloqueado);

  return (
    <div className="min-h-[80vh] flex gap-6 w-full">
      {/* MAPA PRINCIPAL */}
      <div className="flex-1 bg-slate-200 rounded-3xl shadow-inner border-2 border-slate-300 overflow-hidden relative transition-all duration-300">

        {cargando && geoZonas && (
           <div className="absolute top-4 left-4 z-[1000] bg-white/90 px-4 py-1.5 rounded-full text-xs font-bold text-indigo-600 shadow-sm border border-indigo-100 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></div>
             Sincronizando
           </div>
        )}

        {/* CUADRO FLOTANTE SUPERIOR DERECHO PARA ZONAS */}
        {/* CUADRO FLOTANTE SUPERIOR DERECHO PARA ZONAS */}
                {isZonas && (() => {
                  // Dividimos la selección en dos grupos
                  const zonasBloqueadas = zonasSeleccionadas.filter(z => z.bloqueado);
                  const zonasLibres = zonasSeleccionadas.filter(z => !z.bloqueado);

                  return (
                    <div className="absolute top-4 right-4 z-[1000] w-72 bg-white/95 backdrop-blur-md shadow-2xl border border-slate-200 rounded-2xl p-5 animate-in slide-in-from-top-4">

                      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                        <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Gestión de Pasillos</h2>
                        <button onClick={limpiarSeleccion} className="text-slate-400 hover:text-rose-500 transition-colors p-1 bg-slate-100 hover:bg-rose-50 rounded-full">
                          <X size={16} />
                        </button>
                      </div>

                      <div className="space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">

                        {/* SECCIÓN 1: ZONAS LIBRES (Para Bloquear) */}
                        {zonasLibres.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
                               Zonas Libres <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{zonasLibres.length}</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {zonasLibres.map(z => (
                                 <span key={z.id_zona} className="px-2 py-1 bg-slate-50 text-slate-600 font-mono text-xs font-bold rounded-lg flex items-center gap-1 border border-slate-200 shadow-sm">
                                   {z.id_zona}
                                   <X size={12} className="cursor-pointer hover:text-rose-500 ml-1" onClick={() => setZonasSeleccionadas(prev => prev.filter(item => item.id_zona !== z.id_zona))} />
                                 </span>
                              ))}
                            </div>
                            <button
                              onClick={() => procesarZonasMasivo(zonasLibres, true)}
                              className="w-full py-2.5 bg-rose-50 text-rose-700 border-2 border-rose-200 rounded-xl font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                            >
                              <Lock size={16} /> {zonasLibres.length === 1 ? 'Bloquear esta zona' : 'Bloquear todas'}
                            </button>
                          </div>
                        )}

                        {/* DIVISOR (Si hay de los dos tipos) */}
                        {zonasLibres.length > 0 && zonasBloqueadas.length > 0 && (
                           <div className="border-t-2 border-dashed border-slate-100"></div>
                        )}

                        {/* SECCIÓN 2: ZONAS BLOQUEADAS (Para Liberar) */}
                        {zonasBloqueadas.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="text-[10px] font-black text-rose-400 uppercase tracking-widest flex justify-between items-center">
                               Restringidas <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100">{zonasBloqueadas.length}</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {zonasBloqueadas.map(z => (
                                 <span key={z.id_zona} className="px-2 py-1 bg-rose-50 text-rose-700 font-mono text-xs font-bold rounded-lg flex items-center gap-1 border border-rose-200 shadow-sm">
                                   {z.id_zona}
                                   <X size={12} className="cursor-pointer hover:text-rose-900 ml-1" onClick={() => setZonasSeleccionadas(prev => prev.filter(item => item.id_zona !== z.id_zona))} />
                                 </span>
                              ))}
                            </div>
                            <button
                              onClick={() => procesarZonasMasivo(zonasBloqueadas, false)}
                              className="w-full py-2.5 bg-emerald-50 text-emerald-700 border-2 border-emerald-200 rounded-xl font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                            >
                              <Unlock size={16} /> {zonasBloqueadas.length === 1 ? 'Desbloquear esta zona' : 'Desbloquear todas'}
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })()}


        <MapContainer
          center={[519, 2874]}
          zoom={3}
          minZoom={-5}
          maxZoom={4}
          crs={L.CRS.Simple}
          attributionControl={false}
          className="h-full w-full z-0"
        >
          <EventosMapa onMapClick={limpiarSeleccion} />

          {geoZonas && (
                      <GeoJSON
                        // Sincronizamos las keys para que ambas capas se actualicen juntas y respeten el orden
                        key={`zonas-${renderKey}-${zonasSeleccionadas.length}-${recintoSeleccionado?.id_mostrar}`}
                        data={geoZonas}
                        style={estiloZonas}
                        onEachFeature={manejarClic}
                      />
                    )}
                    {geoRecintos && (
                      <GeoJSON
                        // La misma key sincronizada
                        key={`recintos-${renderKey}-${zonasSeleccionadas.length}-${recintoSeleccionado?.id_mostrar}`}
                        data={geoRecintos}
                        style={estiloRecintos}
                        onEachFeature={manejarClic}
                      />
                    )}
        </MapContainer>
      </div>

      {/* PANEL LATERAL SOLO PARA RECINTOS (Aulas/Lab) */}
      {isRecinto && (
        <div className="w-80 shrink-0 bg-white p-6 rounded-3xl shadow-xl border border-slate-200 animate-in slide-in-from-right flex flex-col">

          <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Editor de Aula
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1 font-mono">
                {recintoSeleccionado.id_mostrar}
              </p>
            </div>
            <button onClick={limpiarSeleccion} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 space-y-3">
              <label className="block text-xs font-black text-indigo-800 uppercase tracking-widest">
                Destino
              </label>
              <input
                type="text"
                value={nombreEdit}
                onChange={(e) => setNombreEdit(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                placeholder="Ej: Aula 210"
              />
              <button
                onClick={guardarNombre}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all flex justify-center gap-2 items-center text-sm"
              >
                <Save size={16} /> Guardar Nombre
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={alternarBloqueoRecinto}
                className={`w-full p-4 rounded-2xl font-bold transition-all flex flex-col items-center gap-2 border-2 ${
                  recintoSeleccionado.bloqueado
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {recintoSeleccionado.bloqueado ? <Lock size={24} /> : <Unlock size={24} />}
                <span>{recintoSeleccionado.bloqueado ? 'Desbloquear Aula' : 'Bloquear Aula'}</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-6 leading-tight px-2">
              La geometría y los identificadores (IDs) son controlados por el sistema central y no son modificables.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
