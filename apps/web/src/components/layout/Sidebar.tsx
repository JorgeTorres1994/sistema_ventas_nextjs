"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  ShoppingCart, 
  Users, 
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
        { name: 'Ventas', icon: Wallet, path: '/sales', permission: 'sales' },
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
      {/* Maestro Backdrop for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] animate-in fade-in duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`w-[280px] sm:w-80 border-r border-[var(--outline-variant)] h-screen bg-[var(--sidebar)]/95 backdrop-blur-2xl flex flex-col justify-between fixed left-0 top-0 overflow-y-auto overflow-x-hidden scrollbar-hide z-[110] cubic-bezier(0.4, 0, 0.2, 1) ${
        mounted ? 'transition-all duration-300' : ''
      } ${
        isOpen ? 'translate-x-0 opacity-100 shadow-[20px_0_60px_rgba(0,0,0,0.4)]' : '-translate-x-full lg:translate-x-0 lg:opacity-100'
      } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
      <div>
        {/* Mobile Header with Close Button */}
        <div className={`flex items-center p-6 relative group ${isCollapsed ? 'lg:justify-center lg:px-0' : 'justify-between'}`}>
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
                             // Can't easily append a React component directly via DOM, so we use a simpler approach:
                             // We'll set a state or just add an innerHTML with an SVG icon
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
              <div className={`overflow-hidden ${mounted ? 'transition-all duration-300' : ''} ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-28 lg:w-32 opacity-100'}`}>
                 <h1 className="font-black text-foreground text-sm tracking-tighter leading-none truncate" title={settings?.businessName || 'Nexus Genesis'}>
                    {settings?.businessName || 'Nexus Genesis'}
                 </h1>
                 <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1">Sistemas Élite</p>
              </div>
           </div>
           
           {!isMobile && (
             <button 
               onClick={toggleCollapse}
               className={`hidden lg:flex items-center justify-center w-6 h-6 bg-surface-low border border-outline-variant/50 rounded-lg text-on-surface-variant hover:text-primary hover:border-primary/30 active:scale-90 absolute z-50 shadow-sm ${mounted ? 'transition-all' : ''} ${isCollapsed ? 'left-1/2 -translate-x-1/2 -bottom-3' : 'right-4 top-7'}`}
             >
                <ChevronLeft className={`w-3.5 h-3.5 ${mounted ? 'transition-transform duration-300' : ''} ${isCollapsed ? 'rotate-180' : ''}`} />
             </button>
           )}

           {isMobile && (
             <button 
               onClick={() => setIsOpen(false)}
               className="p-2 bg-surface-low rounded-xl text-on-surface-variant hover:text-primary transition-all active:scale-90 border border-outline-variant/30"
             >
                <X className="w-5 h-5" />
             </button>
           )}
        </div>

        <nav className={`px-4 pb-4 space-y-6 ${isCollapsed ? 'lg:px-2' : ''}`}>
          {filteredGroups.map((group) => (
            <div key={group.title} className="space-y-2 relative">
              {isCollapsed ? (
                <div className="h-px w-6 bg-outline-variant opacity-20 mx-auto my-4 hidden lg:block"></div>
              ) : (
                <div className="px-4 flex items-center gap-3">
                   <div className="h-px flex-1 bg-outline-variant opacity-20"></div>
                   <h3 className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-40 whitespace-nowrap">{group.title}</h3>
                   <div className="h-px flex-1 bg-outline-variant opacity-20"></div>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const fullPath = item.path === '/' ? '/dashboard' : `/dashboard${item.path}`;
                  const isActive = item.path === '/' 
                    ? pathname === '/dashboard' 
                    : (item.path === '/inventory' ? pathname === fullPath : pathname?.includes(item.path));
                  return (
                    <Link 
                      href={item.path === '/' ? '/dashboard' : `/dashboard${item.path}`} 
                      key={item.name}
                      onClick={() => isMobile && setIsOpen(false)}
                    >
                      <div
                        title={isCollapsed ? item.name : undefined}
                        className={`flex items-center gap-3 py-3 rounded-[16px] cursor-pointer group relative ${mounted ? 'transition-all duration-300' : ''} ${isCollapsed ? 'lg:justify-center px-4 lg:px-0' : 'px-4'} ${
                          isActive 
                            ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 scale-[1.02] lg:scale-100' 
                            : 'text-on-surface-variant hover:bg-surface-low hover:text-primary'
                        }`}
                      >
                        <item.icon className={`shrink-0 w-[18px] h-[18px] transition-colors ${isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-primary'}`} />
                        <span className={`text-[12px] font-black uppercase tracking-tight whitespace-nowrap overflow-hidden ${mounted ? 'transition-all duration-300' : ''} ${isActive ? 'text-on-primary' : ''} ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto opacity-100'}`}>{item.name}</span>
                        {isActive && !isCollapsed && (
                          <div className="ml-auto shrink-0 w-1.5 h-1.5 bg-white rounded-full shadow-lg shadow-white/50"></div>
                        )}
                        {isActive && isCollapsed && (
                          <div className="absolute right-1 w-1 h-4 bg-white rounded-full shadow-lg shadow-white/50 hidden lg:block"></div>
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

      <div className={`p-4 border-t border-outline-variant/30 space-y-2 bg-surface-low/50 backdrop-blur-md ${isCollapsed ? 'lg:p-4 lg:px-2' : 'lg:p-6'}`}>
        {isAdmin && (
          <Link 
            href="/dashboard/settings"
            onClick={() => isMobile && setIsOpen(false)}
          >
            <div title={isCollapsed ? 'Configuración' : undefined} className={`flex items-center gap-3 py-3 rounded-[16px] cursor-pointer ${mounted ? 'transition-all duration-300' : ''} ${isCollapsed ? 'lg:justify-center px-4 lg:px-0' : 'px-4'} ${
              pathname === '/dashboard/settings'
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'text-on-surface-variant hover:bg-card hover:text-foreground border border-transparent hover:border-outline-variant/50'
            }`}>
              <Settings className={`shrink-0 w-5 h-5 ${pathname === '/dashboard/settings' ? 'text-on-primary' : 'text-on-surface-variant'}`} />
              <span className={`text-[12px] font-black uppercase tracking-tight whitespace-nowrap overflow-hidden ${mounted ? 'transition-all duration-300' : ''} ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto opacity-100'}`}>Configuración</span>
            </div>
          </Link>
        )}
        <button 
          onClick={logout}
          title={isCollapsed ? 'Cerrar Sesión' : undefined}
          className={`w-full flex items-center gap-3 py-3 rounded-[16px] cursor-pointer text-rose-500 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 active:scale-95 ${mounted ? 'transition-all' : ''} ${isCollapsed ? 'lg:justify-center px-4 lg:px-0' : 'px-4'}`}
        >
          <LogOut className="shrink-0 w-5 h-5" />
          <span className={`text-[12px] font-black uppercase tracking-tight whitespace-nowrap overflow-hidden ${mounted ? 'transition-all duration-300' : ''} ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto opacity-100'}`}>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
