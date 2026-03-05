
import React, { useState, useEffect } from 'react';
// Asegurate de importar Users para los iconitos de profesores
import { Plus, Edit2, Trash2, Clock, Calendar, MapPin, Users } from 'lucide-react';

import { horariosService } from '../api/horariosService.js';
import { materiasService } from '../api/materiaService';
import destinosData from '../assets/destinos.json';
import { personalService } from '../api/personalService.js'; // Importamos a los profes

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function Horarios() {
  const [horarios, setHorarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [listaMaterias, setListaMaterias] = useState([]);
  const [listaDestinos, setListaDestinos] = useState([]);
  const [listaPersonal, setListaPersonal] = useState([]); // Guardamos la lista de profes

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const [focoMateria, setFocoMateria] = useState(false);
  const [focoDestino, setFocoDestino] = useState(false);
  const [focoDocente, setFocoDocente] = useState(false);
  const [busquedaDocente, setBusquedaDocente] = useState(''); // Lo que escribís en el buscador de profes

  const [formData, setFormData] = useState({
    nombreMateria: '',
    nombreDestino: '',
    dia: 'Lunes',
    horaInicio: '08:00',
    horaFin: '10:00',
    docentes: [] // Arreglo para guardar los profes seleccionados
  });

  const cargarDatos = async () => {
    setCargando(true);
    const dataHorarios = await horariosService.getAll();
    const dataMaterias = await materiasService.getAll();
    const dataPersonal = await personalService.getAll(); // Traemos el personal

    const nombresAulas = destinosData
      .map(d => d.nombreDestino?.trim())
      .filter(Boolean);

    setHorarios(dataHorarios);
    setListaMaterias(dataMaterias);
    setListaPersonal(dataPersonal);
    setListaDestinos([...new Set(nombresAulas)]);

    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.horaInicio >= formData.horaFin) {
      alert("La hora de inicio debe ser menor a la hora de fin.");
      return;
    }
    setCargando(true);

    const datosParaBackend = {
      ...formData,
      horaInicio: `${formData.horaInicio}:00`,
      horaFin: `${formData.horaFin}:00`
    };

    if (editando) {
      await horariosService.update(editando.id, datosParaBackend);
    } else {
      await horariosService.create(datosParaBackend);
    }
    setMostrarModal(false);
    setEditando(null);
    cargarDatos();
  };

  const abrirEdicion = (horario) => {
    setEditando(horario);
    setFormData({
      ...horario,
      horaInicio: horario.horaInicio.substring(0, 5),
      horaFin: horario.horaFin.substring(0, 5),
      docentes: horario.docentes || [] // Nos aseguramos de que el arreglo exista
    });
    setBusquedaDocente('');
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este horario?')) {
      setCargando(true);
      await horariosService.delete(id);
      cargarDatos();
    }
  };

  // --- FUNCIONES PARA AGREGAR Y QUITAR PROFESORES ---
  const agregarDocente = (profesor) => {
    const doc = {
      id: profesor.id || profesor.idPersonal,
      nombrePersonal: profesor.nombrePersonal,
      apellidoPersonal: profesor.apellidoPersonal
    };
    setFormData({ ...formData, docentes: [...formData.docentes, doc] });
    setBusquedaDocente(''); // Limpiamos el buscador
    setFocoDocente(false);  // Cerramos el menú
  };

  const removerDocente = (idDocente) => {
    setFormData({
      ...formData,
      docentes: formData.docentes.filter(d => d.id !== idDocente)
    });
  };

  const clasesDelDia = (dia) => horarios.filter(h => h.dia === dia).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  const formatoHoraMuestra = (horaString) => horaString.substring(0, 5);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="text-indigo-600" /> Calendario Semanal
          </h1>
          <p className="text-slate-500">Grilla visual de materias, aulas y profesores asignados.</p>
        </div>
        <button
          onClick={() => {
            setEditando(null);
            setFormData({ nombreMateria: '', nombreDestino: '', dia: 'Lunes', horaInicio: '08:00', horaFin: '10:00', docentes: [] });
            setBusquedaDocente('');
            setMostrarModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} /> Asignar Clase
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-x-auto">
        {cargando ? (
          <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Actualizando calendario...</div>
        ) : (
          <div className="min-w-[1000px] grid grid-cols-6 divide-x divide-slate-200">
            {DIAS_SEMANA.map(dia => {
              const clases = clasesDelDia(dia);
              return (
                <div key={dia} className="flex flex-col bg-slate-50/50 min-h-[60vh]">
                  <div className="bg-slate-100 py-3 text-center border-b border-slate-200">
                    <h3 className="font-bold text-slate-700 uppercase tracking-wide text-sm">{dia}</h3>
                    <span className="text-xs text-slate-500">{clases.length} clases</span>
                  </div>

                  <div className="p-3 flex flex-col gap-3">
                    {clases.map(clase => (
                      <div key={clase.id} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm border-l-4 border-l-indigo-500 hover:shadow-md hover:-translate-y-0.5 transition-all group relative">
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-100">
                          <button onClick={() => abrirEdicion(clase)} className="p-1 text-slate-400 hover:text-indigo-600 rounded bg-white"><Edit2 size={14} /></button>
                          <button onClick={() => handleEliminar(clase.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded bg-white"><Trash2 size={14} /></button>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-2 py-0.5 rounded flex items-center gap-1">
                            <Clock size={12} />
                            {formatoHoraMuestra(clase.horaInicio)} - {formatoHoraMuestra(clase.horaFin)}
                          </span>

                          <h4 className="font-bold text-slate-800 leading-tight pr-8">{clase.nombreMateria}</h4>

                          <span className="text-xs font-medium text-slate-500 flex items-center gap-1 bg-slate-100 w-fit px-2 py-1 rounded-md">
                            <MapPin size={12} /> {clase.nombreDestino}
                          </span>

                          {/* MOSTRAR PROFESORES EN LA TARJETA */}
                          {clase.docentes && clase.docentes.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              <Users size={12} className="text-slate-400" />
                              {clase.docentes.map(doc => (
                                <span key={doc.id} className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-full">
                                  {doc.apellidoPersonal}, {doc.nombrePersonal.charAt(0)}.
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {clases.length === 0 && (
                      <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium">Día libre</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              {editando ? <Edit2 className="text-indigo-500"/> : <Plus className="text-indigo-500"/>}
              {editando ? 'Editar Clase' : 'Agendar Nueva Clase'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-1">Materia</label>
                <input
                  type="text" required autoComplete="off"
                  value={formData.nombreMateria}
                  onChange={e => setFormData({...formData, nombreMateria: e.target.value})}
                  onFocus={() => setFocoMateria(true)}
                  onBlur={() => setTimeout(() => setFocoMateria(false), 200)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Escribí para buscar..."
                />
                {focoMateria && (
                  <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden">
                    {listaMaterias
                      .filter(m => m.nombre.toLowerCase().includes(formData.nombreMateria.toLowerCase()))
                      .map(m => (
                        <li key={m.id} onMouseDown={() => setFormData({...formData, nombreMateria: m.nombre})} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-slate-700 font-medium text-sm">
                          {m.nombre}
                        </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-1">Aula / Laboratorio</label>
                <input
                  type="text" required autoComplete="off"
                  value={formData.nombreDestino}
                  onChange={e => setFormData({...formData, nombreDestino: e.target.value})}
                  onFocus={() => setFocoDestino(true)}
                  onBlur={() => setTimeout(() => setFocoDestino(false), 200)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: Aula 210"
                />
                {focoDestino && (
                  <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden">
                    {listaDestinos
                      .filter(d => d.toLowerCase().includes(formData.nombreDestino.toLowerCase()))
                      .map((destino, i) => (
                        <li key={i} onMouseDown={() => setFormData({...formData, nombreDestino: destino})} className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-slate-700 font-medium text-sm">
                          {destino}
                        </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* NUEVA SECCIÓN: DOCENTES A CARGO */}
              <div className="relative border-t border-slate-200 pt-4 mt-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Users size={16} className="text-indigo-500" /> Docentes asignados
                </label>

                {/* Listado de docentes ya agregados (Badges) */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.docentes.map(doc => (
                    <span key={doc.id} className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 border border-indigo-200 shadow-sm">
                      {doc.nombrePersonal} {doc.apellidoPersonal}
                      <button type="button" onClick={() => removerDocente(doc.id)} className="hover:text-rose-600 bg-indigo-200/50 rounded-full w-4 h-4 flex items-center justify-center transition-colors">×</button>
                    </span>
                  ))}
                  {formData.docentes.length === 0 && (
                     <span className="text-xs text-slate-400 italic mb-1">Ningún docente asignado aún.</span>
                  )}
                </div>

                {/* Input buscador de docentes */}
                <input
                  type="text" autoComplete="off"
                  value={busquedaDocente}
                  onChange={e => setBusquedaDocente(e.target.value)}
                  onFocus={() => setFocoDocente(true)}
                  onBlur={() => setTimeout(() => setFocoDocente(false), 200)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  placeholder="Escribí para buscar y agregar profesor..."
                />

                {/* Dropdown de profesores */}
                {focoDocente && (
                  <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden">
                    {listaPersonal
                      // Filtramos para no mostrar a los que ya están agregados
                      .filter(p => !formData.docentes.find(d => d.id === (p.id || p.idPersonal)))
                      // Filtramos por lo que está escribiendo el usuario
                      .filter(p => `${p.nombrePersonal} ${p.apellidoPersonal}`.toLowerCase().includes(busquedaDocente.toLowerCase()))
                      .map(p => (
                        <li
                          key={p.id || p.idPersonal}
                          onMouseDown={() => agregarDocente(p)}
                          className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-slate-700 text-sm flex justify-between items-center"
                        >
                          <span className="font-medium">{p.apellidoPersonal}, {p.nombrePersonal}</span>
                          <span className="text-xs text-slate-400">{p.cargoLaboral}</span>
                        </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 mt-2">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Día</label>
                  <select
                    value={formData.dia}
                    onChange={e => setFormData({...formData, dia: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
                  >
                    {DIAS_SEMANA.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Inicio</label>
                  <input type="time" required value={formData.horaInicio} onChange={e => setFormData({...formData, horaInicio: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Fin</label>
                  <input type="time" required value={formData.horaFin} onChange={e => setFormData({...formData, horaFin: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" />
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setMostrarModal(false)} className="flex-1 px-4 py-2.5 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">Guardar Horario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}