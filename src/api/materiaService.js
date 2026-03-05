
// Simulamos una base de datos en memoria
let mockMaterias = [
  { id: 1, codigo: "INF101", nombre: "Introducción a la Programación", departamento: "Ingeniería en Computación" },
  { id: 2, codigo: "MAT201", nombre: "Análisis Matemático II", departamento: "Ciencias Básicas" },
  { id: 3, codigo: "FIS102", nombre: "Física II", departamento: "Ciencias Básicas" }
];

export const materiasService = {
  // GET: Obtener todas las materias
  getAll: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockMaterias]), 500); // Simulamos medio segundo de carga
    });
  },

  // POST: Crear una nueva materia
  create: async (nuevaMateria) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const materiaConId = {
          ...nuevaMateria,
          id: Date.now() // Generamos un ID temporal
        };
        mockMaterias.push(materiaConId);
        resolve(materiaConId);
      }, 500);
    });
  },

  // PUT: Actualizar una materia existente
  update: async (id, datosActualizados) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockMaterias = mockMaterias.map(m => m.id === id ? { ...m, ...datosActualizados } : m);
        resolve({ id, ...datosActualizados });
      }, 500);
    });
  },

  // DELETE: Eliminar una materia
  delete: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockMaterias = mockMaterias.filter(m => m.id !== id);
        resolve(true);
      }, 500);
    });
  }
};