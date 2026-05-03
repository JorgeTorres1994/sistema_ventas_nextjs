"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { logout } from '@/lib/api';
import Link from 'next/link';

interface PosTopBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function PosTopBar({ searchQuery, setSearchQuery }: PosTopBarProps) {
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/audit/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/audit/mark-read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        fetchNotifications();
      }
    };

    loadUser();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener('storage', loadUser);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('storage', loadUser);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const userAvatar = user?.avatarUrl 
    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}${user.avatarUrl}`)
    : null;

  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;

  return (
    <header className="h-[88px] border-b border-gray-100/50 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 w-full sticky top-0 z-30 transition-all duration-300">
      
      {/* Left Section: Search & Status */}
      <div className="flex items-center gap-8 flex-1">
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar productos o SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-transparent rounded-2xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white focus:border-blue-500 transition-all duration-300 shadow-sm"
          />
        </div>

        {/* System Pulse */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Servidor Activo</span>
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Date & Branding (Minimal) */}
        <div className="hidden xl:flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Punto de Venta</span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        <div className="w-px h-8 bg-gray-100 mx-2"></div>
        
        <div className="flex items-center gap-4">
          <div className="relative" ref={notifRef}>
            <button 
              className="relative p-3 bg-gray-50 hover:bg-blue-50 rounded-2xl transition-all duration-300 group shadow-sm border border-transparent hover:border-blue-100 active:scale-95"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (!isNotificationsOpen && notifications.some(n => !n.isRead)) {
                  markAllAsRead();
                }
              }}
            >
              <Bell className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse shadow-sm"></span>
              )}
            </button>

            {/* Notifications Dropdown (Enhanced) */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-4 w-96 bg-white rounded-[32px] shadow-[0px_25px_80px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300 z-50">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/20">
                  <div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Notificaciones</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Alertas POS</p>
                  </div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-blue-100">
                    {notifications.filter(n => !n.isRead).length} Nuevas
                  </span>
                </div>
                <div className="max-h-[380px] overflow-y-auto scrollbar-hide">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-5 border-b border-gray-50 flex gap-4 hover:bg-gray-50/50 transition-all duration-300 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}>
                        <div className="shrink-0 mt-0.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${notif.module === 'AUTH' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                            {notif.module === 'AUTH' ? <User className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-gray-800 leading-snug mb-1">{notif.description}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Bell className="w-8 h-8 text-gray-200" />
                      </div>
                      <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Sin Notificaciones</p>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-50 text-center bg-gray-50/10">
                  <Link 
                    href="/dashboard/audit" 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="block py-2 text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-[0.2em]"
                  >
                    Ver Auditoría Completa
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Area (Enhanced) */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-4 bg-white hover:bg-gray-50 rounded-[22px] transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-md group active:scale-95"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-[16px] bg-gradient-to-tr from-blue-600 to-indigo-600 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
                  {userAvatar ? (
                    <img src={userAvatar} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-black text-sm uppercase">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-[13px] font-black text-gray-900 leading-none mb-1">
                  {user?.name || 'Cargando...'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-lg">
                    {String(roleName || 'Usuario')}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu (Enhanced) */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-4 w-72 bg-white rounded-[32px] shadow-[0px_25px_80px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300 z-50">
                <div className="p-8 pb-6 border-b border-gray-50 bg-gray-50/20">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-200">
                      <div className="w-full h-full rounded-[14px] bg-white overflow-hidden flex items-center justify-center">
                        {userAvatar ? (
                          <img src={userAvatar} alt={user?.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-blue-600 font-black text-xl uppercase">
                            {user?.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 leading-tight">{user?.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1 truncate max-w-[140px]">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 py-2 bg-white border border-gray-100 rounded-xl text-center">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Estado</p>
                      <p className="text-[10px] font-black text-emerald-500 uppercase">Activo</p>
                    </div>
                    <div className="flex-1 py-2 bg-white border border-gray-100 rounded-xl text-center">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Seguridad</p>
                      <p className="text-[10px] font-black text-blue-500 uppercase">SSL+</p>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <Link 
                    href="/dashboard/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center justify-between px-5 py-4 text-sm font-black text-gray-600 hover:bg-gray-50 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <User className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                      <span className="uppercase text-[11px] tracking-widest">Mi Perfil</span>
                    </div>
                    <ChevronDown className="-rotate-90 w-4 h-4 text-gray-200" />
                  </Link>
                  <Link 
                    href="/dashboard/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center justify-between px-5 py-4 text-sm font-black text-gray-600 hover:bg-gray-50 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <SettingsIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
                      <span className="uppercase text-[11px] tracking-widest">Ajustes</span>
                    </div>
                    <ChevronDown className="-rotate-90 w-4 h-4 text-gray-200" />
                  </Link>
                </div>
                <div className="p-3 bg-gray-50/50">
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all group"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
