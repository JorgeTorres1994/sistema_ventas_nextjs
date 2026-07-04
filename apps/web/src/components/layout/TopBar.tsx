"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, LogOut, Settings as SettingsIcon, ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/lib/api';
import { useSidebar } from './SidebarContext';

const TopBar = () => {
  const { toggle } = useSidebar();
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [version] = useState(() => Date.now());
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
    setMounted(true);
    const loadUser = async () => {
      // 1. First try to load basic name from local storage for instant feedback
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }

      // 2. IMMEDIATELY fetch fresh data from API to ensure avatar is correct and not stale
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const freshUser = await res.json();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      } catch (error) {
        console.error('Error fetching fresh user data:', error);
      }
      
      fetchNotifications();
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
    <header className="h-[88px] border-b border-[var(--outline-variant)] bg-[var(--sidebar)]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 w-full sticky top-0 z-30 transition-all duration-300">
      
      {/* Left Section: Menu Toggle, Search & Status */}
      <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
        <button 
          onClick={toggle}
          className="lg:hidden p-2 hover:bg-[var(--surface-container-low)] rounded-xl transition-colors text-[var(--on-surface-variant)]"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Branding for Mobile Viewport */}
        <Link href="/dashboard" className="lg:hidden flex items-center gap-3 active:scale-95 transition-transform group">
           <div className="w-10 h-10 bg-primary rounded-[14px] flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-500">
              <span className="text-on-primary font-black text-xs tracking-tighter">NG</span>
           </div>
           <div className="flex flex-col">
              <span className="text-sm font-black text-foreground tracking-tighter uppercase leading-none">Nexus</span>
              <span className="text-[7px] font-black text-primary uppercase tracking-[0.3em] leading-none mt-1">Genesis</span>
           </div>
        </Link>

        <div className="hidden md:relative md:flex w-full max-w-xs lg:max-w-sm group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[var(--on-surface-variant)] group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Buscar en Nexus Genesis..."
            className="block w-full pl-12 pr-4 py-3 bg-[var(--surface-container-low)] border border-transparent rounded-2xl text-sm font-black text-[var(--foreground)] placeholder-[var(--on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-[var(--surface-container-lowest)] focus:border-primary transition-all duration-300 shadow-sm"
          />
        </div>

        {/* System Pulse */}
        <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-[var(--surface-container-low)] rounded-2xl border border-[var(--outline-variant)] shrink-0">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest">Servidor Activo</span>
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-6">
        
        {/* Date & Branding (Minimal) */}
        <div className="hidden xl:flex flex-col items-end gap-0.5">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Acceso Prioritario</span>
          <span className="text-xs font-black text-[var(--on-surface-variant)] uppercase tracking-tighter">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        <div className="w-px h-8 bg-[var(--outline-variant)] mx-2"></div>
        
        <div className="flex items-center gap-4">
          <div className="relative" ref={notifRef}>
            <button 
              className="relative w-12 h-12 flex items-center justify-center bg-[var(--surface-container-low)] hover:bg-primary/10 rounded-[16px] transition-all duration-300 group shadow-sm border border-transparent hover:border-primary/20 active:scale-95"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (!isNotificationsOpen && notifications.some(n => !n.isRead)) {
                  markAllAsRead();
                }
              }}
            >
              <Bell className="w-5 h-5 text-[var(--on-surface-variant)] group-hover:text-primary transition-colors" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[var(--surface-container-lowest)] animate-pulse shadow-sm"></span>
              )}
            </button>

            {/* Notifications Dropdown (Ultra Compact Mobile) */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-4 w-[260px] sm:w-96 bg-[var(--card)] rounded-[20px] sm:rounded-[32px] shadow-[0px_25px_80px_rgba(0,0,0,0.18)] border border-[var(--outline-variant)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 z-50">
                <div className="p-3 sm:p-6 border-b border-[var(--outline-variant)] flex justify-between items-center bg-[var(--surface-container-low)]">
                  <div>
                    <p className="text-[11px] sm:text-sm font-black text-[var(--foreground)] uppercase tracking-tight">Notificaciones</p>
                    <p className="text-[8px] sm:text-[10px] text-[var(--on-surface-variant)] font-black uppercase tracking-widest mt-0.5 sm:mt-1">Alertas de Seguridad</p>
                  </div>
                  <span className="text-[8px] sm:text-[10px] font-black text-primary bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl uppercase tracking-widest border border-primary/20 shrink-0">
                    {notifications.filter(n => !n.isRead).length} Nuevas
                  </span>
                </div>
                <div className="max-h-[250px] sm:max-h-[380px] overflow-y-auto scrollbar-hide">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-3 sm:p-5 border-b border-[var(--outline-variant)] flex gap-2.5 sm:gap-4 hover:bg-[var(--surface-container-low)] transition-all duration-300 ${!notif.isRead ? 'bg-primary/5' : ''}`}>
                        <div className="shrink-0 mt-0.5">
                          {notif.module === 'AUTH' ? (
                            <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm ${notif.action === 'SECURITY_ALERT' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                              <User className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] flex items-center justify-center">
                              <Bell className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] sm:text-sm font-black text-[var(--foreground)] leading-tight sm:leading-snug mb-1 truncate sm:whitespace-normal">{notif.description}</p>
                          <p className="text-[8px] sm:text-[10px] text-[var(--on-surface-variant)] font-black uppercase tracking-tight">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 sm:p-10 text-center flex flex-col items-center gap-2 sm:gap-4">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-[var(--surface-container-low)] rounded-full flex items-center justify-center">
                        <Bell className="w-5 h-5 sm:w-8 sm:h-8 text-[var(--outline-variant)]" />
                      </div>
                      <p className="text-[10px] sm:text-sm font-black text-[var(--on-surface-variant)] uppercase tracking-widest opacity-30">Bandeja Vacía</p>
                    </div>
                  )}
                </div>
                <div className="p-2 sm:p-4 border-t border-[var(--outline-variant)] text-center bg-[var(--surface-container-low)]">
                  <Link 
                    href="/dashboard/audit" 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="block py-1 sm:py-2 text-[8px] sm:text-[10px] font-black text-primary hover:text-primary-container transition-colors uppercase tracking-[0.2em]"
                  >
                    Auditar Historial Completo
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Area (Enhanced) */}
          <div className={`relative transition-opacity duration-500 ${mounted && user ? 'opacity-100' : 'opacity-0'}`} ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-4 bg-[var(--surface-container-lowest)] hover:bg-[var(--surface-container-low)] rounded-[22px] transition-all duration-300 border border-[var(--outline-variant)] shadow-sm hover:shadow-md group active:scale-95"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-[16px] bg-gradient-to-tr from-primary to-primary-container overflow-hidden border-2 border-[var(--surface-container-lowest)] shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
                  {mounted && userAvatar ? (
                    <img 
                      src={`${userAvatar}${userAvatar.includes('?') ? '&' : '?'}v=${version}`} 
                      alt={user?.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.fallback-text')) {
                           const span = document.createElement('span');
                           span.className = 'text-on-primary font-black text-sm uppercase fallback-text';
                           span.innerText = user?.name?.charAt(0) || 'U';
                           parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-on-primary font-black text-sm uppercase fallback-text">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[var(--surface-container-lowest)]"></div>
              </div>
              <div className="text-left hidden lg:block">
                <p className={`text-[13px] font-black text-[var(--foreground)] leading-none mb-1 ${!mounted ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}>
                  {user?.name || 'Cargando...'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/10 rounded-lg">
                    {String(roleName || 'Usuario')}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[var(--on-surface-variant)] transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu (Enhanced & Responsive) */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-4 w-[calc(100vw-32px)] md:w-80 bg-[var(--card)] rounded-[24px] md:rounded-[32px] shadow-[0px_25px_80px_rgba(0,0,0,0.18)] border border-[var(--outline-variant)] overflow-hidden animate-in fade-in zoom-in-95 duration-300 z-50">
                <div className="p-6 md:p-8 pb-4 md:pb-6 border-b border-[var(--outline-variant)] bg-[var(--surface-container-low)]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-tr from-primary to-primary-container p-0.5 shadow-lg shadow-primary/20">
                      <div className="w-full h-full rounded-[10px] md:rounded-[14px] bg-[var(--surface-container-lowest)] overflow-hidden flex items-center justify-center">
                        {mounted && userAvatar ? (
                          <img 
                            src={`${userAvatar}${userAvatar.includes('?') ? '&' : '?'}v=${version}`} 
                            alt={user?.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('.fallback-text')) {
                                 const span = document.createElement('span');
                                 span.className = 'text-primary font-black text-lg md:text-xl uppercase fallback-text';
                                 span.innerText = user?.name?.charAt(0) || 'U';
                                 parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-primary font-black text-lg md:text-xl uppercase fallback-text">
                            {user?.name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-[var(--foreground)] leading-tight truncate">{user?.name}</p>
                      <p className="text-[10px] text-[var(--on-surface-variant)] font-black uppercase tracking-tight mt-1 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 py-1.5 md:py-2 bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl text-center">
                      <p className="text-[7px] md:text-[8px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest mb-0.5">Estado</p>
                      <p className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase">Activo</p>
                    </div>
                    <div className="flex-1 py-1.5 md:py-2 bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] rounded-xl text-center">
                      <p className="text-[7px] md:text-[8px] font-black text-[var(--on-surface-variant)] uppercase tracking-widest mb-0.5">Seguridad</p>
                      <p className="text-[9px] md:text-[10px] font-black text-primary uppercase">SSL+</p>
                    </div>
                  </div>
                </div>
                <div className="p-2 md:p-3">
                  <Link 
                    href="/dashboard/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 text-sm font-black text-[var(--foreground)] hover:bg-[var(--surface-container-low)] rounded-xl md:rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <User className="w-4 h-4 md:w-5 md:h-5 text-[var(--on-surface-variant)] group-hover:text-primary" />
                      <span className="uppercase text-[10px] md:text-[11px] tracking-widest">Mi Perfil</span>
                    </div>
                    <ChevronDown className="-rotate-90 w-3.5 h-3.5 text-[var(--outline-variant)]" />
                  </Link>
                  {isAdmin && (
                    <Link 
                      href="/dashboard/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center justify-between px-4 md:px-5 py-3 md:py-4 text-sm font-black text-[var(--foreground)] hover:bg-[var(--surface-container-low)] rounded-xl md:rounded-2xl transition-all group"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <SettingsIcon className="w-4 h-4 md:w-5 md:h-5 text-[var(--on-surface-variant)] group-hover:text-primary" />
                        <span className="uppercase text-[10px] md:text-[11px] tracking-widest">Ajustes</span>
                      </div>
                      <ChevronDown className="-rotate-90 w-3.5 h-3.5 text-[var(--outline-variant)]" />
                    </Link>
                  )}
                </div>
                <div className="p-3 bg-[var(--surface-container-low)]">
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 md:py-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl md:rounded-2xl transition-all group active:scale-[0.98]"
                  >
                    <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
