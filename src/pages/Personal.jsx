import React, { useState, useEffect } from 'react';
import { personalService } from '../api/personalService.js';
import destinosData from '../assets/destinos.json'; // Importamos los destinos para las oficinas
import { Plus, Edit2, Trash2, Users, IdCard, MapPin } from 'lucide-react';

export default function Personal() {
  const [personal, setPersonal] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Lista para el autocompletado de oficinas
  const [listaDestinos, setListaDestinos] = useState([]);
  const [focoOficina, setFocoOficina] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);

  const estadoInicial = {
    nombrePersonal: '',
    apellidoPersonal: '',
    cargoLaboral: 'Profesor con dedicación simple',
    dni: '',
    oficina: '' // Nuevo campo para guardar la oficina asociada
  };
  const [formData, setFormData] = useState(estadoInicial);

  const cargarDatos = async () => {
    setCargando(true);
    const data = await personalService.getAll();

    // Extraemos los nombres de los destinos (aulas/oficinas)
    const nombresAulas = destinosData
      .map(d => d.nombreDestino?.trim() || d.idDestino) // Si no tiene nombre, usamos el ID (como D14)
      .filter(Boolean);

    setListaDestinos([...new Set(nombresAulas)]);
    setPersonal(data);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    if (editando) {
      await personalService.update(editando.id || editando.idPersonal, formData);
    } else {
      await personalService.create(formData);
    }

    // Acá en el futuro simularemos la petición POST a /asociados
    // enviando el idPersonal y el idDestino correspondiente.

    setMostrarModal(false);
    setEditando(null);
    setFormData(estadoInicial);
    cargarDatos();
  };

  const abrirEdicion = (persona) => {
    setEditando(persona);
    setFormData({ ...persona, oficina: persona.oficina || '' });
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar a este miembro del personal?')) {
      setCargando(true);
      await personalService.delete(id);
      cargarDatos();
    }
  };

  const getBadgeColor = (cargo) => {
    if (!cargo) return 'bg-slate-100 text-slate-700';
    const c = cargo.toLowerCase();
    if (c.includes('profesor')) return 'bg-indigo-100 text-indigo-700';
    if (c.includes('jtp')) return 'bg-emerald-100 text-emerald-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-indigo-600" /> Gestión de Personal
          </h1>
          <p className="text-slate-500">Administra el cuerpo docente y staff de la facultad.</p>
        </div>
        <button
          onClick={() => {
            setEditando(null);
            setFormData(estadoInicial);
            setMostrarModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} /> Agregar Personal
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
        {cargando ? (
          <div className="p-8 text-center text-slate-500 font-medium">Cargando personal...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-600">Nombre Completo</th>
                  <th className="p-4 font-semibold text-slate-600">Cargo Laboral</th>
                  <th className="p-4 font-semibold text-slate-600">DNI</th>
                  <th className="p-4 font-semibold text-slate-600">Oficina / Lab</th>
                  <th className="p-4 font-semibold text-slate-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {personal.map((p) => (
                  <tr key={p.id || p.idPersonal} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">
                      {p.apellidoPersonal}, {p.nombrePersonal}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getBadgeColor(p.cargoLaboral)}`}>
                        {p.cargoLaboral}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 flex items-center gap-2 font-mono text-sm">
                      <IdCard size={16} className="text-slate-400" />
                      {p.dni ? Number(p.dni).toLocaleString('es-AR') : '-'}
                    </td>
                    <td className="p-4 text-slate-600">
                      {/* Mostramos la oficina si la tiene */}
                      {p.oficina ? (
                        <span className="flex items-center gap-1 text-sm bg-slate-100 px-2 py-1 rounded-md w-fit">
                          <MapPin size={14} className="text-slate-500" /> {p.oficina}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => abrirEdicion(p)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors inline-block">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleEliminar(p.id || p.idPersonal)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors inline-block">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {personal.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">No hay personal registrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              {editando ? <Edit2 className="text-indigo-500"/> : <Plus className="text-indigo-500"/>}
              {editando ? 'Editar Personal' : 'Nuevo Miembro del Personal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text" required value={formData.nombrePersonal}
                    onChange={e => setFormData({...formData, nombrePersonal: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ej: Joaquín"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text" required value={formData.apellidoPersonal}
                    onChange={e => setFormData({...formData, apellidoPersonal: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ej: Lucero"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">DNI</label>
                  <input
                    type="number" required value={formData.dni}
                    onChange={e => setFormData({...formData, dni: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    placeholder="Sin puntos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Cargo Laboral</label>
                  <input
                    type="text" required value={formData.cargoLaboral}
                    onChange={e => setFormData({...formData, cargoLaboral: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ej: JTP"
                    list="cargos-sugeridos"
                  />
                  <datalist id="cargos-sugeridos">
                    <option value="Profesor con dedicación simple" />
                    <option value="Profesor titular" />
                    <option value="JTP" />
                    <option value="Ayudante" />
                  </datalist>
                </div>
              </div>

              {/* NUEVO CAMPO: AUTOCOMPLETADO DE OFICINA */}
              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-1">Oficina / Laboratorio (Opcional)</label>
                <input
                  type="text" autoComplete="off"
                  value={formData.oficina}
                  onChange={e => setFormData({...formData, oficina: e.target.value})}
                  onFocus={() => setFocoOficina(true)}
                  onBlur={() => setTimeout(() => setFocoOficina(false), 200)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Ej: D14 o Aula 210"
                />
                {focoOficina && (
                  <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden">
                    {listaDestinos
                      .filter(d => d.toLowerCase().includes(formData.oficina.toLowerCase()))
                      .map((destino, i) => (
                        <li
                          key={i}
                          onMouseDown={() => setFormData({...formData, oficina: destino})}
                          className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-slate-700 font-medium text-sm transition-colors"
                        >
                          {destino}
                        </li>
                    ))}
                    {listaDestinos.filter(d => d.toLowerCase().includes(formData.oficina.toLowerCase())).length === 0 && (
                      <li className="px-4 py-2 text-slate-500 text-sm">No se encontraron oficinas...</li>
                    )}
                  </ul>
                )}
                <p className="text-xs text-slate-400 mt-1">Lugar físico asignado al personal (Tabla /asociados)</p>
              </div>

              <div className="flex gap-3 pt-6 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setMostrarModal(false)} className="flex-1 px-4 py-2.5 text-slate-600 font-bold bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}