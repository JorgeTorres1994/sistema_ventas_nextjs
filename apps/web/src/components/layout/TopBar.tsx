"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/lib/api';

const TopBar = () => {
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };

    loadUser();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    // Listen for storage changes (even in same tab)
    window.addEventListener('storage', loadUser);

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('storage', loadUser);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const userAvatar = user?.avatarUrl 
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `https://nexus-api.onrender.com${user.avatarUrl}`)
    : null;

  return (
    <header className="h-[88px] border-b border-[#E5E7EB] bg-white flex items-center justify-between px-8 w-full sticky top-0 z-30">
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-[#9CA3AF]" />
        </div>
        <input
          type="text"
          placeholder="Buscar información..."
          className="block w-full pl-10 pr-3 py-2.5 border-none bg-[#F9FAFB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#4B5563]">Nexus Genesis</span>
          <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-full px-4 py-1.5 text-[11px] font-black text-blue-700 uppercase tracking-widest">
            Acceso Prioritario
          </div>
        </div>
        
        <div className="w-px h-8 bg-[#E5E7EB]"></div>

        <div className="relative cursor-pointer group">
          <Bell className="w-5 h-5 text-[#4B5563] group-hover:text-blue-600 transition-colors" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white translate-x-0.5 -translate-y-0.5"></span>
        </div>

        {/* User Profile Area */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-2xl transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 overflow-hidden border-2 border-white shadow-md flex items-center justify-center">
              {userAvatar ? (
                <img src={userAvatar} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-black text-sm uppercase">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-black text-[#111827] leading-tight capitalize">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                {user?.role?.name === 'ADMIN' || user?.role === 'ADMIN' ? 'Administrador' : 'Colaborador'}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0px_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Sesión Iniciada como</p>
                <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <Link 
                  href="/dashboard/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100">
                    <User className="w-4 h-4" />
                  </div>
                  Mi Perfil
                </Link>
                <Link 
                  href="/dashboard/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  Configuración
                </Link>
              </div>
              <div className="p-2 border-t border-gray-50">
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center group-hover:bg-rose-100">
                    <LogOut className="w-4 h-4" />
                  </div>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
