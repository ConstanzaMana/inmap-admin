/**
 * Administra la lógica de Horarios, la asignación de materias
 * a espacios físicos y la vinculación de personal docente a dichas clases.
 */
import { fetchConFallback } from './apiConfig.js';

// almacenamiento temporal en memoria para optimizar el rendimiento y reducir peticiones
let cacheAsignaciones = null;
let cacheHorariosBase = null; 

export const horariosService = {

  // Gestión de asignaciones (vínculo materia-horario-destino) ---

  //Trae de la API la lista completa de asignaciones
  getAll: async () => {
    if (cacheAsignaciones) return cacheAsignaciones;
    cacheAsignaciones = await fetchConFallback('/asignaciones', { method: 'GET' }, []);
    return cacheAsignaciones;
  },

  //Registra una nueva asignación en el sistema y sincroniza el almacenamiento local..
  create: async (nuevo) => {
    const creado = await fetchConFallback('/guardarAsignacion', { method: 'POST', body: JSON.stringify(nuevo) }, null);
    if (cacheAsignaciones && creado) cacheAsignaciones.push(creado);
    return creado;
  },

  //Actualiza los datos de una asignación existente mediante su ID.
  update: async (idAsignacion, datos) => {
    const actualizado = await fetchConFallback(`/actualizarAsignacion/${idAsignacion}`, { method: 'PUT', body: JSON.stringify(datos) }, null);
    if (cacheAsignaciones && actualizado) {
      cacheAsignaciones = cacheAsignaciones.map(h => h.idAsignacion === idAsignacion ? actualizado : h);
    }
    return actualizado;
  },

  //elimina una asignación y sincroniza el almacenamiento local.
  delete: async (idAsignacion) => {
    await fetchConFallback(`/eliminarAsignacion/${idAsignacion}`, { method: 'DELETE' }, null);
    if (cacheAsignaciones) {
      cacheAsignaciones = cacheAsignaciones.filter(h => h.idAsignacion !== idAsignacion);
    }
    return true;
  },


  // Gstión de horarios

  getAllHorariosBase: async () => {
    if (cacheHorariosBase) return cacheHorariosBase;
    cacheHorariosBase = await fetchConFallback('/horarios', { method: 'GET' }, []);
    return cacheHorariosBase;
  },

  //Crea un nuevo turno (rango horario y día) en la base de datos.
  createHorario: async (nuevo) => {
    const creado = await fetchConFallback('/guardarHorario', { method: 'POST', body: JSON.stringify(nuevo) }, null);
    if (cacheHorariosBase && creado) cacheHorariosBase.push(creado);
    return creado;
  },

  //Modifica un turno existente y actualiza la referencia en memoria.
  updateHorario: async (idHorario, datos) => {
    const actualizado = await fetchConFallback(`/actualizarHorario/${idHorario}`, { method: 'PUT', body: JSON.stringify(datos) }, null);
    if (cacheHorariosBase && actualizado) {
      cacheHorariosBase = cacheHorariosBase.map(h => h.idHorario === idHorario ? actualizado : h);
    }
    return actualizado;
  },

  //Elimina un turno base, siempre que no existan dependencias activas.
  deleteHorario: async (idHorario) => {
    await fetchConFallback(`/eliminarHorario/${idHorario}`, { method: 'DELETE' }, null);
    if (cacheHorariosBase) {
      cacheHorariosBase = cacheHorariosBase.filter(h => h.idHorario !== idHorario);
    }
    return true;
  },


  // Gestión de vinculación con Personal

  //Establece la relación entre un docente y una asignación específica.
  createAsignacionProfesor: async (idAsignacion, idPersonal) => {
    return await fetchConFallback('/guardarEsta', { method: 'POST', body: JSON.stringify({ idAsignacion, idPersonal }) }, null);
  },

  //Disuelve la relación existente entre un docente y una asignación.
  deleteAsignacionProfesor: async (idAsignacion, idPersonal) => {
    return await fetchConFallback(`/eliminarEsta/${idPersonal}/${idAsignacion}`, { method: 'DELETE' }, null);
  }
};