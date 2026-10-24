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

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`w-[280px] sm:w-80 h-screen bg-[var(--sidebar)]/95 backdrop-blur-2xl border-r border-[var(--outline-variant)]/60 flex flex-col justify-between fixed left-0 top-0 overflow-hidden z-[110] select-none ${
        mounted ? 'transition-all duration-300 ease-in-out' : ''
      } ${
        isOpen ? 'translate-x-0 opacity-100 shadow-[20px_0_60px_rgba(0,0,0,0.5)]' : '-translate-x-full lg:translate-x-0 lg:opacity-100'
      } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>

        {/* Top Header */}
        <div className={`h-[70px] px-4 flex items-center justify-between border-b border-[var(--outline-variant)]/40 shrink-0 relative ${
          isCollapsed ? 'lg:px-3 lg:justify-center' : ''
        }`}>
          <div className={`flex items-center gap-3 transition-opacity duration-300 ${mounted && settings ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container p-0.5 flex items-center justify-center shadow-md shadow-primary/25">
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
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[var(--sidebar)]"></span>
              </span>
            </div>

            <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-28 lg:w-36 opacity-100'}`}>
              <h1 className="font-bold text-foreground text-[14px] tracking-tight leading-tight truncate" title={settings?.businessName || 'Nexus Genesis'}>
                {settings?.businessName || 'Nexus Genesis'}
              </h1>
              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mt-0.5">Sistemas Élite</p>
            </div>
          </div>
          
          {/* Desktop Toggle Button */}
          {!isMobile && !isCollapsed && (
            <button 
              onClick={toggleCollapse}
              title="Colapsar menú"
              className="w-7 h-7 rounded-lg bg-surface-low/80 hover:bg-surface-low border border-outline-variant/40 hover:border-primary/40 flex items-center justify-center text-on-surface-variant hover:text-foreground transition-all duration-200 shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Desktop Expand Button when collapsed */}
          {!isMobile && isCollapsed && (
            <button 
              onClick={toggleCollapse}
              title="Expandir menú"
              className="hidden lg:flex absolute -right-3 top-5 w-6 h-6 rounded-full bg-surface-low hover:bg-card border border-outline-variant/60 hover:border-primary/50 text-on-surface-variant hover:text-primary items-center justify-center shadow-md transition-all duration-200 active:scale-95 z-50"
            >
              <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 bg-surface-low rounded-xl text-on-surface-variant hover:text-primary transition-all active:scale-90 border border-outline-variant/30"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin py-3 space-y-4 ${
          isCollapsed ? 'px-2' : 'px-3'
        }`}>
          {filteredGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {isCollapsed ? (
                <div className="w-6 h-px bg-outline-variant/30 mx-auto my-2" />
              ) : (
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.16em] select-none">
                    {group.title}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const fullPath = item.path === '/' ? '/dashboard' : `/dashboard${item.path}`;
                  const isActive = item.path === '/' 
                    ? pathname === '/dashboard' 
                    : (item.path === '/inventory' ? pathname === fullPath : pathname?.includes(item.path));
                  return (
                    <Link 
                      href={fullPath} 
                      key={item.name}
                      onClick={() => isMobile && setIsOpen(false)}
                      className="block outline-none"
                    >
                      <div
                        title={isCollapsed ? item.name : undefined}
                        className={`group relative flex items-center gap-3 rounded-xl transition-all duration-200 ${
                          isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'h-[38px] px-3'
                        } ${
                          isActive 
                            ? 'bg-primary text-white shadow-sm shadow-primary/25 font-semibold' 
                            : 'text-on-surface-variant/80 hover:text-foreground hover:bg-surface-low/80 font-medium'
                        }`}
                      >
                        <item.icon className={`shrink-0 transition-transform duration-200 ${
                          isCollapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'
                        } ${
                          isActive 
                            ? 'text-white' 
                            : 'text-on-surface-variant/70 group-hover:text-foreground group-hover:scale-105'
                        }`} />
                        
                        {!isCollapsed && (
                          <span className="text-[13px] tracking-normal truncate flex-1">
                            {item.name}
                          </span>
                        )}

                        {isActive && !isCollapsed && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-sm shrink-0" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Footer Section */}
        <div className={`p-3 border-t border-[var(--outline-variant)]/40 bg-surface-low/20 backdrop-blur-md space-y-1 shrink-0 ${
          isCollapsed ? 'px-2' : 'px-3'
        }`}>
          {isAdmin && (
            <Link 
              href="/dashboard/settings"
              onClick={() => isMobile && setIsOpen(false)}
              className="block outline-none"
            >
              <div 
                title={isCollapsed ? 'Configuración' : undefined} 
                className={`group flex items-center gap-3 rounded-xl transition-all duration-200 ${
                  isCollapsed ? 'justify-center h-10 w-10 mx-auto' : 'h-[38px] px-3'
                } ${
                  pathname === '/dashboard/settings'
                    ? 'bg-primary text-white shadow-sm shadow-primary/25 font-semibold'
                    : 'text-on-surface-variant/80 hover:text-foreground hover:bg-surface-low/80 font-medium'
                }`}
              >
                <Settings className={`shrink-0 transition-transform duration-200 ${
                  isCollapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'
                } ${
                  pathname === '/dashboard/settings' 
                    ? 'text-white' 
                    : 'text-on-surface-variant/70 group-hover:text-foreground group-hover:rotate-45'
                }`} />
                {!isCollapsed && (
                  <span className="text-[13px] tracking-normal truncate flex-1">
                    Configuración
                  </span>
                )}
              </div>
            </Link>
          )}

          <button 
            onClick={logout}
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
            className={`w-full group flex items-center gap-3 rounded-xl transition-all duration-200 text-rose-500 hover:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 active:scale-98 font-medium ${
              isCollapsed ? 'justify-center h-10 w-10 mx-auto p-0' : 'h-[38px] px-3'
            }`}
          >
            <LogOut className={`shrink-0 transition-transform duration-200 ${
              isCollapsed ? 'w-5 h-5' : 'w-[18px] h-[18px]'
            } group-hover:-translate-x-0.5`} />
            {!isCollapsed && (
              <span className="text-[13px] tracking-normal truncate">
                Cerrar Sesión
              </span>
            )}
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;