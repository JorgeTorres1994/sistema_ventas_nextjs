"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  FileText, 
  Settings,
  MonitorSmartphone,
  Boxes,
  Users2,
  Building2,
  LogOut,
  ShieldCheck,
  Receipt, 
  CreditCard,
  Tag,
  History,
  X,
  ChevronLeft
} from 'lucide-react';

import { useSettings } from '../SettingsProvider';
import { useSidebar } from './SidebarContext';
import { logout } from '@/lib/api';

const Sidebar = () => {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { isOpen, setIsOpen, isMobile, isCollapsed, toggleCollapse } = useSidebar();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [permissions, setPermissions] = React.useState<string[]>([]);
  const [mounted, setMounted] = React.useState(false);
  const [version] = React.useState(() => Date.now());
  
  React.useEffect(() => {
    setMounted(true);
    const loadUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const roleName = typeof user.role === 'object' ? user.role?.name : user.role;
        setIsAdmin(roleName === 'Administrador' || roleName === 'ADMIN');
        setPermissions(user.permissions || []);
      }
    };

    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  const hasPermission = (module: string) => {
    if (isAdmin) return true;
    return permissions.includes(`${module}:read`);
  };

  const menuGroups = [
    {
      title: 'Principal',
      items: [
        { name: 'Tablero', icon: LayoutDashboard, path: '/', permission: 'dashboard' },
        { name: 'Terminal POS', icon: MonitorSmartphone, path: '/pos', permission: 'pos' },
      ]
    },
    {
      title: 'Ventas y Caja',
      items: [
        { name: 'Caja Registradora', icon: Wallet, path: '/cash', permission: 'cash' },
        { name: 'Ventas', icon: Receipt, path: '/sales', permission: 'sales' },
        { name: 'Facturación Electrónica', icon: FileText, path: '/invoicing', permission: 'sales' },
        { name: 'Cotizaciones', icon: FileText, path: '/quotations', permission: 'sales' },
        { name: 'Gastos y Egresos', icon: Receipt, path: '/expenses', permission: 'expenses' },
        { name: 'Créditos y Cobranzas', icon: CreditCard, path: '/credits', permission: 'credits' },
        { name: 'Clientes', icon: Users2, path: '/customers', permission: 'customers' },
      ]
    },
    {
      title: 'Logística',
      items: [
        { name: 'Productos', icon: Package, path: '/products', permission: 'products' },
        { name: 'Categorías', icon: Tag, path: '/categories', permission: 'products' },
        { name: 'Inventario', icon: Boxes, path: '/inventory', permission: 'inventory' },
        { name: 'Kardex Valorizado', icon: BarChart3, path: '/inventory/kardex', permission: 'inventory' },
        { name: 'Proveedores', icon: Building2, path: '/suppliers', permission: 'suppliers' },
        { name: 'Compras', icon: ShoppingCart, path: '/purchases', permission: 'purchases' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { name: 'Promociones y Fidelización', icon: Tag, path: '/promotions', permission: 'promotions' },
      ]
    },
    {
      title: 'Administración',
      items: [
        { name: 'Reportes', icon: FileText, path: '/reports', permission: 'reports:read' },
        { name: 'Auditoría y Logs', icon: History, path: '/audit', permission: 'audit:read' },
        { name: 'Usuarios', icon: Users2, path: '/users', permission: 'users:read' },
        { name: 'Roles y Permisos', icon: ShieldCheck, path: '/roles', permission: 'roles:read' },
      ]
    }
  ];

  const filteredGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => hasPermission(item.permission))
  })).filter(group => group.items.length > 0);

  const getGroupDot = (title: string) => {
    switch (title) {
      case 'Principal':
        return 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]';
      case 'Ventas y Caja':
        return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]';
      case 'Logística':
        return 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.9)]';
      case 'Marketing':
        return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]';
      case 'Administración':
        return 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]';
      default:
        return 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]';
    }
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. VISTA MÓVIL: RESTAURADA EXACTAMENTE COMO ANTES (Drawer clásico grande)  */}
      {/* ========================================================================= */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] animate-in fade-in duration-500 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`lg:hidden w-[280px] sm:w-80 border-r border-[var(--outline-variant)] h-screen bg-[var(--sidebar)]/95 backdrop-blur-2xl flex flex-col justify-between fixed left-0 top-0 overflow-y-auto overflow-x-hidden scrollbar-thin z-[110] cubic-bezier(0.4, 0, 0.2, 1) ${
        mounted ? 'transition-all duration-300' : ''
      } ${
        isOpen ? 'translate-x-0 opacity-100 shadow-[20px_0_60px_rgba(0,0,0,0.5)]' : '-translate-x-full opacity-0 pointer-events-none'
      }`}>
        <div>
          {/* Mobile Header with Close Button */}
          <div className="flex items-center p-6 justify-between relative group">
            <div className={`flex items-center gap-3 transition-opacity duration-500 ${mounted && settings ? 'opacity-100' : 'opacity-0'}`}>
              <div className="relative shrink-0">
                <div className="w-10 h-10 bg-primary rounded-[12px] flex items-center justify-center shadow-lg shadow-primary/20">
                  {mounted && settings?.logoUrl ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}${settings.logoUrl}?v=${version}`} 
                      alt="Logo" 
                      className="w-full h-full object-cover rounded-[10px]" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent && !parent.querySelector('.fallback-icon')) {
                          parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-on-primary fallback-icon"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`;
                        }
                      }}
                    />
                  ) : (
                    <Building2 className="w-5 h-5 text-on-primary fallback-icon" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--sidebar)]"></div>
              </div>
              <div className="w-28 opacity-100">
                <h1 className="font-black text-foreground text-sm tracking-tighter leading-none truncate" title={settings?.businessName || 'Nexus Genesis'}>
                  {settings?.businessName || 'Nexus Genesis'}
                </h1>
                <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">Sistemas Élite</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 bg-surface-low rounded-xl text-on-surface-variant hover:text-primary transition-all active:scale-90 border border-outline-variant/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation List */}
          <nav className="px-4 pb-4 space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.title} className="space-y-2 relative">
                <div className="px-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-outline-variant opacity-20"></div>
                  <h3 className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-40 whitespace-nowrap">{group.title}</h3>
                  <div className="h-px flex-1 bg-outline-variant opacity-20"></div>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const fullPath = item.path === '/' ? '/dashboard' : `/dashboard${item.path}`;
                    const isActive = item.path === '/' 
                      ? pathname === '/dashboard' 
                      : (item.path === '/inventory' ? pathname === fullPath : pathname?.includes(item.path));
                    return (
                      <Link 
                        href={fullPath} 
                        key={item.name}
                        onClick={() => setIsOpen(false)}
                      >
                        <div
                          className={`flex items-center gap-3 py-3 rounded-[16px] cursor-pointer group relative px-4 ${
                            isActive 
                              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                              : 'text-on-surface-variant hover:bg-surface-low hover:text-primary'
                          }`}
                        >
                          <item.icon className={`shrink-0 w-[18px] h-[18px] transition-colors ${isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-primary'}`} />
                          <span className={`text-[12px] font-black uppercase tracking-tight whitespace-nowrap overflow-hidden ${isActive ? 'text-on-primary' : ''}`}>{item.name}</span>
                          {isActive && (
                            <div className="ml-auto shrink-0 w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50"></div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Mobile Footer */}
        <div className="p-4 border-t border-outline-variant/30 space-y-2 bg-surface-low/50 backdrop-blur-md">
          {isAdmin && (
            <Link 
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
            >
              <div className={`flex items-center gap-3 py-3 rounded-[16px] cursor-pointer px-4 ${
                pathname === '/dashboard/settings'
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'text-on-surface-variant hover:bg-card hover:text-foreground border border-transparent hover:border-outline-variant/50'
              }`}>
                <Settings className={`shrink-0 w-5 h-5 ${pathname === '/dashboard/settings' ? 'text-on-primary' : 'text-on-surface-variant'}`} />
                <span className="text-[12px] font-black uppercase tracking-tight whitespace-nowrap overflow-hidden">Configuración</span>
              </div>
            </Link>
          )}
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 py-3 rounded-[16px] cursor-pointer text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 active:scale-95 px-4"
          >
            <LogOut className="shrink-0 w-5 h-5" />
            <span className="text-[12px] font-black uppercase tracking-tight whitespace-nowrap overflow-hidden">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. VISTA COMPUTADORA / PC: PROFESIONAL, AMIGABLE Y CON EFECTOS            */}
      {/* ========================================================================= */}
      <aside className={`hidden lg:flex flex-col justify-between fixed left-0 top-0 h-screen bg-[#0d131f]/95 backdrop-blur-2xl border-r border-slate-800/80 z-[110] select-none transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>

        {/* Toggle Button: Always pinned to the edge with fluid rotation & smooth slide */}
        <button 
          onClick={toggleCollapse}
          title={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
          className="absolute -right-3.5 top-6 w-7 h-7 rounded-full bg-[#111827] hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700 hover:border-blue-400 flex items-center justify-center shadow-lg transition-colors duration-200 z-50 cursor-pointer active:scale-95"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isCollapsed ? 'rotate-180' : 'rotate-0'
          }`} />
        </button>

        {/* Top Header */}
        <div className={`h-[72px] flex items-center border-b border-slate-800/80 shrink-0 relative transition-all duration-300 overflow-hidden ${
          isCollapsed ? 'justify-center px-0' : 'px-4'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo Box with Gradient & Glow */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/20 transition-transform duration-200 hover:scale-105 cursor-pointer">
                {mounted && settings?.logoUrl ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}${settings.logoUrl}?v=${version}`} 
                    alt="Logo" 
                    className="w-full h-full object-cover rounded-[10px]" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white fallback-icon"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`;
                      }
                    }}
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-white fallback-icon" />
                )}
              </div>
              {/* Online Status Pulse */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0d131f]"></span>
              </span>
            </div>

            {/* Titles with Smooth Collapse Animation */}
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap ${
              isCollapsed ? 'w-0 opacity-0 max-w-0 -translate-x-3 pointer-events-none' : 'w-auto opacity-100 max-w-[140px] translate-x-0'
            }`}>
              <h1 className="font-extrabold text-white text-[14px] tracking-tight leading-tight truncate" title={settings?.businessName || 'Nexus Genesis'}>
                {settings?.businessName || 'Nexus Genesis'}
              </h1>
              <p className="text-[9px] font-extrabold text-blue-400 uppercase tracking-[0.22em] mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-pulse"></span>
                Sistemas Élite
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin py-3 space-y-4 transition-all duration-300 ${
          isCollapsed ? 'px-2' : 'px-3'
        }`}>
          {filteredGroups.map((group) => {
            const dotClass = getGroupDot(group.title);
            return (
              <div key={group.title} className="space-y-1">
                {/* Collapsed Divider */}
                <div className={`w-6 h-px bg-slate-800 mx-auto transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isCollapsed ? 'my-3 opacity-100 scale-100' : 'my-0 opacity-0 scale-0 h-0 overflow-hidden'
                }`} />

                {/* Expanded Group Header with Dot */}
                <div className={`flex items-center gap-2 px-3 pt-2 pb-1 select-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
                  isCollapsed ? 'opacity-0 max-h-0 py-0 -translate-x-3 pointer-events-none' : 'opacity-100 max-h-8 translate-x-0'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.18em] truncate">
                    {group.title}
                  </span>
                </div>
                
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const fullPath = item.path === '/' ? '/dashboard' : `/dashboard${item.path}`;
                    const isActive = item.path === '/' 
                      ? pathname === '/dashboard' 
                      : (item.path === '/inventory' ? pathname === fullPath : pathname?.includes(item.path));
                    
                    return (
                      <Link href={fullPath} key={item.name} className="block outline-none">
                        <div
                          className={`group relative flex items-center h-[42px] rounded-xl transition-all duration-200 cursor-pointer overflow-visible ${
                            isCollapsed ? 'justify-center px-0' : 'px-2.5'
                          } ${
                            isActive 
                              ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)] ring-1 ring-white/20' 
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/70 hover:translate-x-0.5 border border-transparent hover:border-slate-700/50'
                          }`}
                        >
                          {/* Active Pill Side Bar */}
                          {isActive && isCollapsed && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-l-full shadow-[0_0_8px_#ffffff]" />
                          )}

                          {/* Hover Accent Line on Expanded */}
                          {!isActive && !isCollapsed && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-blue-500 rounded-r-full group-hover:h-5 transition-all duration-200" />
                          )}

                          {/* Icon Box with Badge */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isActive 
                              ? 'bg-white/20 text-white shadow-inner' 
                              : 'bg-slate-800/80 text-slate-300 group-hover:text-blue-400 group-hover:bg-blue-500/10 group-hover:scale-105'
                          }`}>
                            <item.icon className="w-4 h-4 shrink-0" />
                          </div>
                          
                          {/* Label Container with Smooth Expand/Collapse */}
                          <div className={`flex items-center justify-between flex-1 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap ml-2.5 ${
                            isCollapsed ? 'w-0 opacity-0 max-w-0 -translate-x-3 pointer-events-none' : 'w-auto opacity-100 max-w-[160px] translate-x-0'
                          }`}>
                            <span className={`text-[13px] font-semibold tracking-tight truncate flex-1 ${
                              isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                            }`}>
                              {item.name}
                            </span>

                            {/* Active Neon Pulse Indicator */}
                            {isActive && (
                              <span className="relative flex h-2 w-2 ml-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white shadow-[0_0_8px_#ffffff]"></span>
                              </span>
                            )}
                          </div>

                          {/* Floating Tooltip in Collapsed Mode */}
                          <div className={`absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900/95 backdrop-blur-md text-white text-[12px] font-bold rounded-lg shadow-2xl border border-slate-700/80 pointer-events-none transition-all duration-200 whitespace-nowrap z-[200] flex items-center gap-2 ${
                            isCollapsed ? 'opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0' : 'hidden'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                            {item.name}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Desktop Footer */}
        <div className={`p-3 border-t border-slate-800/80 bg-slate-900/40 backdrop-blur-md space-y-1.5 shrink-0 transition-all duration-300 ${
          isCollapsed ? 'px-2' : 'px-3'
        }`}>
          {isAdmin && (
            <Link href="/dashboard/settings" className="block outline-none">
              <div 
                className={`group relative flex items-center h-[42px] rounded-xl transition-all duration-200 cursor-pointer overflow-visible ${
                  isCollapsed ? 'justify-center px-0' : 'px-2.5'
                } ${
                  pathname === '/dashboard/settings'
                    ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-[0_4px_16px_rgba(37,99,235,0.35)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70 hover:translate-x-0.5 border border-transparent hover:border-slate-700/50'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 group-hover:bg-blue-500/10 flex items-center justify-center shrink-0 text-slate-300 group-hover:text-blue-400 transition-all">
                  <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 shrink-0" />
                </div>
                <div className={`flex items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap ml-2.5 ${
                  isCollapsed ? 'w-0 opacity-0 max-w-0 -translate-x-3 pointer-events-none' : 'w-auto opacity-100 max-w-[160px] translate-x-0'
                }`}>
                  <span className="text-[13px] font-semibold text-slate-200 group-hover:text-white tracking-tight flex-1">
                    Configuración
                  </span>
                </div>

                {/* Settings Tooltip when Collapsed */}
                <div className={`absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900/95 text-white text-[12px] font-bold rounded-lg shadow-2xl border border-slate-700 pointer-events-none transition-all duration-200 whitespace-nowrap z-[200] ${
                  isCollapsed ? 'opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0' : 'hidden'
                }`}>
                  Configuración
                </div>
              </div>
            </Link>
          )}

          <button 
            onClick={logout}
            className={`w-full group relative flex items-center h-[42px] rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-200 font-semibold text-[13px] shadow-sm active:scale-98 cursor-pointer overflow-visible ${
              isCollapsed ? 'justify-center px-0' : 'px-2.5'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 group-hover:bg-rose-500/25 flex items-center justify-center shrink-0 transition-all">
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform shrink-0" />
            </div>
            <div className={`flex items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap ml-2.5 ${
              isCollapsed ? 'w-0 opacity-0 max-w-0 -translate-x-3 pointer-events-none' : 'w-auto opacity-100 max-w-[160px] translate-x-0'
            }`}>
              <span className="tracking-tight">Cerrar Sesión</span>
            </div>

            {/* Logout Tooltip when Collapsed */}
            <div className={`absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 px-3 py-1.5 bg-rose-950/95 text-rose-200 text-[12px] font-bold rounded-lg shadow-2xl border border-rose-800 pointer-events-none transition-all duration-200 whitespace-nowrap z-[200] ${
              isCollapsed ? 'opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0' : 'hidden'
            }`}>
              Cerrar Sesión
            </div>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
