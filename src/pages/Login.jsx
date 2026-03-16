import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from "../assets/logo.png";
import { API_BASE_URL } from '../api/apiConfig';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  const manejarLogin = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error('Credenciales inválidas');
      }

      const data = await response.json();

      if (data.token) {
        localStorage.setItem('adminToken', data.token);

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Sesión iniciada correctamente',
          showConfirmButton: false,
          timer: 2000
        });

        navigate('/');
      }

    } catch (error) {
      console.error('Error en login:', error);
      Swal.fire('Acceso Denegado', 'El usuario o la contraseña son incorrectos.', 'error');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* MITAD IZQUIERDA: Branding (Se oculta en celulares) */}
      <div className="hidden md:flex w-1/2 bg-[#dcecf9] flex-col items-center justify-center p-12 text-center">
        <div className="mb-8">
          {/* Usamos tu logo acá, escalado para que sea protagonista */}
          <img src={logo} alt="InMap Logo" className="w-48 h-48 object-contain drop-shadow-xl" />
        </div>
        <h1 className="text-2xl font-medium text-slate-700 max-w-sm leading-snug">
          Sistema de gestión de InMap
        </h1>
      </div>

      {/* MITAD DERECHA: Formulario */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">

          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Inicio de sesión
            </h2>
          </div>

          <form onSubmit={manejarLogin} className="space-y-6 mt-8">

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Nombre de usuario
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium text-slate-800"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className={`w-full py-3 rounded-lg font-bold text-blue-900 transition-all ${
                cargando
                  ? 'bg-blue-100 cursor-not-allowed'
                  : 'bg-[#bfdbfe] hover:bg-[#93c5fd]'
              }`}
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>

            <div className="pt-2">
              <a href="#" className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
                ¿Olvidó su contraseña?
              </a>
            </div>
          </form>

        </div>
      </div>

    </div>
  );
}