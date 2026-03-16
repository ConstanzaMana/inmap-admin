/**
 * servicios de autenticación y gestión de usuarios.
 * Módulo que centraliza las peticiones de seguridad, incluyendo el
 * cambio de contraseña y el registro de nuevos perfiles.
 */
import axios from 'axios';

const API_URL = 'https://suzanne-nonprincipled-submaniacally.ngrok-free.dev';

export const authService = {
  
  /**
   * Actualiza la contraseña del usuario autenticado.
   * Renueva el token en el almacenamiento local para mantener la sesión activa.
   */
  actualizarPassword: async (oldPassword, newPassword) => {
    const token = localStorage.getItem('adminToken');

    const response = await axios.post(`${API_URL}/actualizarPassword`, {
      oldPassword: oldPassword,
      newPassword: newPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.data && response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
    }

    return response.data;
  },

  //Registra un nuevo perfil de usuario.
  registrarUsuario: async (nuevoUsuario) => {
    const token = localStorage.getItem('adminToken');

    const response = await axios.post(`${API_URL}/register`, nuevoUsuario, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  }
};