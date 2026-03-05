import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map, GraduationCap,
  Clock, CalendarCheck, Settings, LogOut, Users
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link to={to} className="block no-underline">
      <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
        active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}>
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 p-6 flex flex-col gap-8 shadow-xl min-h-screen">
      <div className="flex items-center gap-3 px-2">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">In</div>
        <h1 className="text-xl font-bold text-white tracking-tight">InMap Admin</h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Principal</p>
        <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/" />
        <SidebarItem icon={Map} label="Mapa Editor" to="/mapa" />

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-6 mb-2 px-2">Gestión Académica</p>
        <SidebarItem icon={GraduationCap} label="Materias" to="/materias" />
        <SidebarItem icon={Clock} label="Horarios" to="/horarios" />
        <SidebarItem icon={Users} label="Personal" to="/personal" />
      </nav>

      <div className="pt-6 border-t border-slate-800 flex flex-col gap-2">
        <SidebarItem icon={Settings} label="Configuración" to="/config" />
        <SidebarItem icon={LogOut} label="Cerrar Sesión" to="/login" />
      </div>
    </aside>
  );
}