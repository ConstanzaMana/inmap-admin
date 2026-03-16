import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Hash, Search } from 'lucide-react'; // Sumamos Search
import { materiasService } from '../api/materiaService.js';
import Swal from 'sweetalert2';

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState(''); // Estado para el filtro

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [errorCodigo, setErrorCodigo] = useState('');
  const [errorNombre, setErrorNombre] = useState('');

  const estadoInicial = { codMateria: '', nombreMateria: '' };
  const [formData, setFormData] = useState(estadoInicial);

  const cargarDatos = async () => {
    setCargando(true);
    const data = await materiasService.getAll();
    setMaterias(data);
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  // LÓGICA DE FILTRADO: Buscamos coincidencia en nombre o código
  const materiasFiltradas = materias.filter(m =>
    m.nombreMateria.toLowerCase().includes(busqueda.toLowerCase()) ||
    m.codMateria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const manejarCambioCodigo = (e) => {
    const valor = e.target.value;
    setFormData({ ...formData, codMateria: valor });
    if (!editando) {
      const existe = materias.some(m => String(m.codMateria).toLowerCase() === String(valor).toLowerCase());
      setErrorCodigo(existe ? 'Este código ya está en uso por otra materia.' : '');
    }
  };

  const manejarCambioNombre = (e) => {
    const valor = e.target.value;
    setFormData({ ...formData, nombreMateria: valor });
    setErrorNombre(valor.length > 0 && valor.trim().length < 3 ? 'El nombre debe tener al menos 3 caracteres.' : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errorCodigo || errorNombre || formData.nombreMateria.trim().length < 3) return;

    setCargando(true);
    try {
      if (editando) {
        await materiasService.update(editando.codMateria, { nombreMateria: formData.nombreMateria });
      } else {
        await materiasService.create(formData);
      }

      Swal.fire({
        title: '¡Éxito!',
        text: `La materia se ha ${editando ? 'actualizado' : 'guardado'} correctamente.`,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000
      });

      setMostrarModal(false);
      setEditando(null);
      setFormData(estadoInicial);
      cargarDatos();
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo conectar con el servidor. Revisá el túnel.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
      setCargando(false);
    }
  };

  const handleEliminar = async (codMateria) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        setCargando(true);
        try {
          await materiasService.delete(codMateria);
          Swal.fire({
            title: 'Eliminado',
            text: 'La materia ha sido borrada.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          cargarDatos();
        } catch (error) {
          Swal.fire('Error', 'Hubo un fallo al intentar eliminar.', 'error');
          setCargando(false);
        }
      }
    });
  };

  const abrirEdicion = (materia) => {
    setEditando(materia);
    setFormData({ ...materia });
    setErrorCodigo('');
    setErrorNombre('');
    setMostrarModal(true);
  };

  return (
      <div className="space-y-6 h-full flex flex-col p-2">
        {/* 1. TÍTULO Y BOTÓN DE ACCIÓN */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="text-indigo-600" /> Gestión de Materias
            </h1>
          </div>
          <button
            onClick={() => { setEditando(null); setFormData(estadoInicial); setErrorCodigo(''); setErrorNombre(''); setMostrarModal(true); }}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-md shadow-indigo-100 font-medium"
          >
            <Plus size={20} /> Nueva Materia
          </button>
        </div>

        {/* 2. BUSCADOR EN FILA PROPIA (ENTRE TÍTULO Y TABLA) */}
        <div className="flex justify-start"> {/* Contenedor para controlar la alineación */}
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200 shadow-sm w-full max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar materia por nombre o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* 3. TABLA DE RESULTADOS */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
          {cargando ? (
            <div className="p-12 text-center text-slate-500 font-medium italic animate-pulse">Cargando lista de materias...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="p-4 font-bold text-slate-600 w-40 uppercase text-xs tracking-wider text-center">Código</th>
                    <th className="p-4 font-bold text-slate-600 uppercase text-xs tracking-wider">Nombre de la Materia</th>
                    <th className="p-4 font-bold text-slate-600 uppercase text-xs tracking-wider text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {materiasFiltradas.map((m) => (
                    <tr key={m.codMateria} className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors group">
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-mono text-sm font-bold group-hover:bg-white transition-colors">
                          <Hash size={14} className="text-slate-400" /> {m.codMateria}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800 text-lg">
                        {m.nombreMateria}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => abrirEdicion(m)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Editar">
                            <Edit2 size={20} />
                          </button>
                          <button onClick={() => handleEliminar(m.codMateria)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Eliminar">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {materiasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan="3" className="p-12 text-center text-slate-400 italic bg-slate-50/30">
                        No se encontraron materias que coincidan con "{busqueda}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* MODAL (Se mantiene igual) */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-100">
            <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              {editando ? <Edit2 className="text-indigo-500"/> : <Plus className="text-indigo-500"/>}
              {editando ? 'Editar Materia' : 'Nueva Materia'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Código de Materia</label>
                <input
                  type="text" required value={formData.codMateria}
                  disabled={!!editando}
                  onChange={manejarCambioCodigo}
                  className={`w-full p-2.5 border rounded-xl outline-none font-mono transition-colors ${
                    errorCodigo ? 'bg-rose-50 border-rose-400 text-rose-900' : 'bg-slate-50 border-slate-200'
                  }`}
                  placeholder="Ej: 633"
                />
                {errorCodigo && <p className="text-xs text-rose-500 mt-1.5 font-medium">{errorCodigo}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre de la Materia</label>
                <input
                  type="text" required value={formData.nombreMateria}
                  onChange={manejarCambioNombre}
                  className={`w-full p-2.5 border rounded-xl outline-none transition-colors ${
                    errorNombre ? 'bg-rose-50 border-rose-400 text-rose-900' : 'bg-slate-50 border-slate-200'
                  }`}
                  placeholder="Ej: Análisis Matemático A"
                />
                {errorNombre ? <p className="text-xs text-rose-500 mt-1.5 font-medium">{errorNombre}</p> : <p className="text-xs text-slate-400 mt-1.5">Mínimo 3 caracteres.</p>}
              </div>

              <div className="flex gap-3 pt-6 mt-2 border-t border-slate-100">
                <button type="button" onClick={() => setMostrarModal(false)} className="flex-1 px-4 py-2.5 text-slate-600 font-bold bg-slate-100 rounded-xl">Cancelar</button>
                <button type="submit" disabled={!!errorCodigo || !!errorNombre} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}