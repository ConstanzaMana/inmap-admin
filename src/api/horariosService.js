// src/api/horariosService.js

let mockHorarios = [
  {
    id: 1,
    idRecinto: "R05",
    nombreDestino: "Aula 210",
    nombreMateria: "Análisis Matemático A",
    dia: "Lunes",
    horaInicio: "08:00:00",
    horaFin: "12:00:00",
    docentes: [
      { id: "1", nombrePersonal: "Joaquín", apellidoPersonal: "Lucero" }
    ] // <-- Agregamos los docentes acá
  },
  {
    id: 2,
    idRecinto: "R30",
    nombreDestino: "Laboratorio electrónica 2",
    nombreMateria: "Sistemas Digitales",
    dia: "Martes",
    horaInicio: "14:30:00",
    horaFin: "18:00:00",
    docentes: []
  }
];

export const horariosService = {
  getAll: async () => new Promise(resolve => setTimeout(() => resolve([...mockHorarios]), 500)),
  create: async (nuevo) => new Promise(resolve => setTimeout(() => {
    const horario = { ...nuevo, id: Date.now() };
    mockHorarios.push(horario);
    resolve(horario);
  }, 500)),
  update: async (id, datos) => new Promise(resolve => setTimeout(() => {
    mockHorarios = mockHorarios.map(h => h.id === id ? { ...h, ...datos } : h);
    resolve({ id, ...datos });
  }, 500)),
  delete: async (id) => new Promise(resolve => setTimeout(() => {
    mockHorarios = mockHorarios.filter(h => h.id !== id);
    resolve(true);
  }, 500))
};