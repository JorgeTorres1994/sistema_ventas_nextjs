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
  History
} from 'lucide-react';

import { useSettings } from '../SettingsProvider';
import { useSidebar } from '../SidebarProvider';
import { logout } from '@/lib/api';
import { X } from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { isOpen, setIsOpen } = useSidebar();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [permissions, setPermissions] = React.useState<string[]>([]);
  
  React.useEffect(() => {
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
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`w-64 border-r border-[#E5E7EB] h-screen bg-[#F9FAFB] flex flex-col justify-between fixed left-0 top-0 overflow-y-auto scrollbar-hide z-[100] transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between p-6 mb-2">
            <div className="flex items-center gap-3">
              {settings?.logoUrl ? (
                <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}${settings.logoUrl}`} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                  <img src="/logo.png" alt="Nexus Genesis" className="w-full h-full object-contain p-1" />
                </div>
              )}
              <div>
                <h1 className="font-bold text-[#111827] text-md leading-tight truncate w-24" title={settings?.businessName || 'Nexus Genesis'}>
                  {settings?.businessName || 'Nexus Genesis'}
                </h1>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-0.5">Sistemas Élite</p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <button 
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <nav className="px-4 pb-4 space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <h3 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">{group.title}</h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const fullPath = item.path === '/' ? '/dashboard' : `/dashboard${item.path}`;
                    const isActive = item.path === '/' 
                      ? pathname === '/dashboard' 
                      : (item.path === '/inventory' ? pathname === fullPath : pathname?.includes(item.path));
                    return (
                      <Link href={item.path === '/' ? '/dashboard' : `/dashboard${item.path}`} key={item.name}>
                        <div
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group ${
                            isActive 
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                              : 'text-[#4B5563] hover:bg-white hover:text-blue-600 hover:shadow-sm'
                          }`}
                        >
                          <item.icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-white' : 'text-[#9CAA9C] group-hover:text-blue-600'}`} />
                          <span className={`text-sm font-bold ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-[#E5E7EB] space-y-1">
          {isAdmin && (
            <Link href="/dashboard/settings">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                pathname === '/dashboard/settings'
                  ? 'bg-[#E0E7FF] text-blue-700 font-medium'
                  : 'text-[#4B5563] hover:bg-gray-100 hover:text-[#111827]'
              }`}>
                <Settings className={`w-5 h-5 ${pathname === '/dashboard/settings' ? 'text-blue-600' : 'text-[#6B7280]'}`} />
                <span className="text-[15px]">Configuración</span>
              </div>
            </Link>
          )}
          <div 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            <span className="text-[15px] font-medium">Cerrar Sesión</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
