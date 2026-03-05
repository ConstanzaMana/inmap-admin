// src/pages/Materias.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { materiasService } from '../api/materiaService';

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal (Formulario)
  const [mostrarModal, setMostrarModal] = useState(false);
  const [materiaEditando, setMateriaEditando] = useState(null);
  const [formData, setFormData] = useState({ codigo: '', nombre: '', departamento: '' });

  // Cargar datos al inicio
  const cargarMaterias = async () => {
    setCargando(true);
    const data = await materiasService.getAll();
    setMaterias(data);
    setCargando(false);
  };

  useEffect(() => {
    cargarMaterias();
  }, []);

  // Manejar el envío del formulario (Crear o Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    if (materiaEditando) {
      // Es una edición (Simula PUT)
      await materiasService.update(materiaEditando.id, formData);
    } else {
      // Es una creación (Simula POST)
      await materiasService.create(formData);
    }

    setMostrarModal(false);
    setMateriaEditando(null);
    setFormData({ codigo: '', nombre: '', departamento: '' });
    cargarMaterias();
  };

  // Abrir modal para editar
  const abrirEdicion = (materia) => {
    setMateriaEditando(materia);
    setFormData({ codigo: materia.codigo, nombre: materia.nombre, departamento: materia.departamento });
    setMostrarModal(true);
  };

  // Eliminar materia
  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta materia?')) {
      setCargando(true);
      await materiasService.delete(id); // Simula DELETE
      cargarMaterias();
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="text-indigo-600" /> Gestión de Materias
          </h1>
          <p className="text-slate-500">Administra las asignaturas que se dictan en la facultad.</p>
        </div>
        <button
          onClick={() => {
            setMateriaEditando(null);
            setFormData({ codigo: '', nombre: '', departamento: '' });
            setMostrarModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Agregar Materia
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {cargando ? (
          <div className="p-8 text-center text-slate-500">Cargando datos...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-600">Código</th>
                <th className="p-4 font-semibold text-slate-600">Nombre</th>
                <th className="p-4 font-semibold text-slate-600">Departamento</th>
                <th className="p-4 font-semibold text-slate-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materias.map((materia) => (
                <tr key={materia.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-mono text-sm text-slate-600">{materia.codigo}</td>
                  <td className="p-4 font-medium text-slate-900">{materia.nombre}</td>
                  <td className="p-4 text-slate-600">{materia.departamento}</td>
                  <td className="p-4 flex justify-end gap-2">
                    <button onClick={() => abrirEdicion(materia)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleEliminar(materia.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal / Formulario */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-900">
              {materiaEditando ? 'Editar Materia' : 'Nueva Materia'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
                <input
                  type="text" required
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: INF101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input
                  type="text" required
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Sistemas Distribuidos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                <input
                  type="text" required
                  value={formData.departamento}
                  onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ej: Computación"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}