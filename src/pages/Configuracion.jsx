import React, { useState } from 'react';
import { Settings, Lock, UserPlus, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { authService } from '../api/authService';

export default function Configuracion() {

  const [panelAbierto, setPanelAbierto] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [formPass, setFormPass] = useState({ passActual: '', passNueva: '', confirmarPass: '' });
  const [formRegistro, setFormRegistro] = useState({ username: '', password: '', confirmPassword: '', role: 'VISUAL' });
  const coincidenPass = formPass.passNueva === formPass.confirmarPass && formPass.confirmarPass !== '';
  const coincidenReg = formRegistro.password === formRegistro.confirmPassword && formRegistro.confirmPassword !== '';

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!coincidenPass || formPass.passNueva.length < 6) return;
    setCargando(true);
    try {
      await authService.actualizarPassword(formPass.passActual, formPass.passNueva);
      Swal.fire({ icon: 'success', title: 'Contraseña actualizada', timer: 2000, showConfirmButton: false });
      setFormPass({ passActual: '', passNueva: '', confirmarPass: '' });
      setPanelAbierto(null);
    } catch (error) {
      Swal.fire('Error', 'La contraseña actual es incorrecta.', 'error');
    } finally { setCargando(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!coincidenReg || formRegistro.password.length < 6) return;
    setCargando(true);
    try {
      await authService.registrarUsuario({
        username: formRegistro.username,
        password: formRegistro.password,
        role: formRegistro.role
      });
      Swal.fire({ icon: 'success', title: 'Usuario creado', text: `Perfil ${formRegistro.username} listo.` });
      setFormRegistro({ username: '', password: '', confirmPassword: '', role: 'VISUAL' });
      setPanelAbierto(null);
    } catch (error) {
      Swal.fire('Error', 'No se pudo crear el usuario.', 'error');
    } finally { setCargando(false); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto mb-10">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
          <Settings className="text-indigo-600" /> Configuración del Sistema
        </h1>
        <p className="text-slate-500 text-sm">Gestiona tu seguridad y accesos de administrador.</p>
      </div>

      <div className="space-y-4">

        {/* Cambiar Contraseña*/}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
          <button
            onClick={() => setPanelAbierto(panelAbierto === 'pass' ? null : 'pass')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Lock size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800">Cambiar mi contraseña</h3>
                <p className="text-xs text-slate-500">Actualiza tu clave personal</p>
              </div>
            </div>
            {panelAbierto === 'pass' ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
          </button>

          {panelAbierto === 'pass' && (
            <form onSubmit={handleUpdatePassword} className="p-8 pt-0 border-t border-slate-50 space-y-5 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña Actual</label>
                  <input type="password" value={formPass.passActual} onChange={e => setFormPass({...formPass, passActual: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div className="hidden md:block"></div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                  <input type="password" value={formPass.passNueva} onChange={e => setFormPass({...formPass, passNueva: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Confirmar Nueva</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formPass.confirmarPass}
                      onChange={e => setFormPass({...formPass, confirmarPass: e.target.value})}
                      className={`w-full px-4 py-3 border rounded-2xl outline-none transition-all ${
                        formPass.confirmarPass === '' ? 'bg-slate-50 border-slate-200' :
                        coincidenPass ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-100' : 'bg-rose-50 border-rose-500 ring-2 ring-rose-100'
                      }`}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {formPass.confirmarPass !== '' && (coincidenPass ? <CheckCircle2 className="text-emerald-600" size={18} /> : <AlertCircle className="text-rose-600" size={18} />)}
                    </div>
                  </div>
                </div>
              </div>
              <button disabled={!coincidenPass || cargando} className="mt-4 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all">
                {cargando ? 'Guardando...' : 'Actualizar Contraseña'}
              </button>
            </form>
          )}
        </div>

        {/* Crear Nuevo Usuario */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
          <button
            onClick={() => setPanelAbierto(panelAbierto === 'registro' ? null : 'registro')}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <UserPlus size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-slate-800">Crear nuevo perfil</h3>
                <p className="text-xs text-slate-500">Registra administradores o visualizadores</p>
              </div>
            </div>
            {panelAbierto === 'registro' ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
          </button>

          {panelAbierto === 'registro' && (
           <form onSubmit={handleRegister} className="p-8 pt-0 border-t border-slate-50 space-y-6 animate-in fade-in slide-in-from-top-2">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">

               {/* Nombre de Usuario */}
               <div className="space-y-1.5">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nombre de Usuario</label>
                 <input
                   type="text"
                   name="new-user-name-inmap"
                   autoComplete="new-username"
                   value={formRegistro.username}
                   onChange={e => setFormRegistro({...formRegistro, username: e.target.value})}
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                   placeholder="Ej: nuevo_admin"
                 />
               </div>

               {/* Rol */}
               <div className="space-y-1.5">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Rol</label>
                 <select
                   value={formRegistro.role}
                   onChange={e => setFormRegistro({...formRegistro, role: e.target.value})}
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                 >
                   <option value="VISUAL">Visualizador (Lectura)</option>
                   <option value="ADMIN">Administrador (Total)</option>
                 </select>
               </div>

               {/* Contraseña Nueva */}
               <div className="space-y-1.5">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                 <input
                   type="password"
                   name="new-user-password-inmap"
                   autoComplete="new-password"
                   value={formRegistro.password}
                   onChange={e => setFormRegistro({...formRegistro, password: e.target.value})}
                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                 />
               </div>

               <div className="space-y-1.5">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
                 <div className="relative">
                   <input
                     type="password"
                     name="confirm-user-password-inmap"
                     autoComplete="new-password"
                     value={formRegistro.confirmPassword}
                     onChange={e => setFormRegistro({...formRegistro, confirmPassword: e.target.value})}
                     className={`w-full px-4 py-3 border rounded-2xl outline-none transition-all ${
                       formRegistro.confirmPassword === '' ? 'bg-slate-50 border-slate-200' :
                       coincidenReg ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-100' : 'bg-rose-50 border-rose-500 ring-2 ring-rose-100'
                     }`}
                   />
                   <div className="absolute right-4 top-1/2 -translate-y-1/2">
                     {formRegistro.confirmPassword !== '' && (coincidenReg ? <CheckCircle2 className="text-emerald-600" size={18} /> : <AlertCircle className="text-rose-600" size={18} />)}
                   </div>
                 </div>
               </div>
             </div>

             <button
               disabled={!coincidenReg || cargando || formRegistro.password.length < 6}
               className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center gap-2"
             >
               <UserPlus size={18} /> {cargando ? 'Registrando...' : 'Registrar Perfil'}
             </button>
           </form>
          )}
        </div>

      </div>
    </div>
  );
}