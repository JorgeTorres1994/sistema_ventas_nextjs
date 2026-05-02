"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/lib/api';

const TopBar = () => {
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

    // Listen for storage changes (even in same tab)
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
  const isAdmin = roleName === 'Administrador' || roleName === 'ADMIN';

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

        <div className="relative" ref={notifRef}>
          <div 
            className="cursor-pointer group p-2 hover:bg-gray-50 rounded-full transition-colors"
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (!isNotificationsOpen && notifications.some(n => !n.isRead)) {
                markAllAsRead();
              }
            }}
          >
            <Bell className="w-5 h-5 text-[#4B5563] group-hover:text-blue-600 transition-colors" />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </div>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0px_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 z-50">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <p className="text-sm font-black text-gray-900">Notificaciones</p>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  {notifications.filter(n => !n.isRead).length} nuevas
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 border-b border-gray-50 flex gap-3 hover:bg-gray-50/50 transition-colors ${!notif.isRead ? 'bg-blue-50/20' : ''}`}>
                      <div className="mt-1">
                        {notif.module === 'AUTH' ? (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notif.action === 'SECURITY_ALERT' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                            <User className="w-4 h-4" />
                          </div>
                        ) : notif.module === 'USERS' ? (
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <SettingsIcon className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                            <Bell className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{notif.description}</p>
                        <p className="text-xs text-gray-500 font-medium">{new Date(notif.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm font-medium text-gray-400">
                    No tienes notificaciones
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-gray-50 text-center bg-gray-50/50">
                <Link 
                  href="/dashboard/audit" 
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
                >
                  Ver Todo El Historial
                </Link>
              </div>
            </div>
          )}
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
                {String(user?.role?.name || user?.role || 'Colaborador')}
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
                {isAdmin && (
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
                )}
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
