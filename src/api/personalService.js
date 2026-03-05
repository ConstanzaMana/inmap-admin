// src/api/personalService.js

let mockPersonal = [
  {
    id: "1",
    nombrePersonal: "Joaquín",
    apellidoPersonal: "Lucero",
    cargoLaboral: "Profesor con dedicación simple",
    dni: "39514617",
    oficina: "D14" // Simulamos el idDestino o el nombre de la oficina
  },
  {
    id: "2",
    nombrePersonal: "Lucía",
    apellidoPersonal: "Fernández",
    cargoLaboral: "JTP",
    dni: "38123456",
    oficina: "Laboratorio electrónica 2"
  }
];

export const personalService = {
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockPersonal]), 500);
    });
  },

  create: async (nuevoPersonal) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const personalConId = { ...nuevoPersonal, id: Date.now().toString() };
        mockPersonal.push(personalConId);
        resolve(personalConId);
      }, 500);
    });
  },

  update: async (id, datosActualizados) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockPersonal = mockPersonal.map(p => p.id === id ? { ...p, ...datosActualizados } : p);
        resolve({ id, ...datosActualizados });
      }, 500);
    });
  },

  delete: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockPersonal = mockPersonal.filter(p => p.id !== id);
        resolve(true);
      }, 500);
    });
  }
};