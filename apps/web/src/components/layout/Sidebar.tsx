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
  LogOut
} from 'lucide-react';

import { useSettings } from '../SettingsProvider';
import { logout } from '@/lib/api';

const Sidebar = () => {
  const pathname = usePathname();
  const { settings } = useSettings();
  const [isAdmin, setIsAdmin] = React.useState(false);
  
  React.useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.role === 'ADMIN');
    }
  }, []);

  const menuItems = [
    { name: 'Tablero', icon: LayoutDashboard, path: '/' },
    { name: 'Terminal POS', icon: MonitorSmartphone, path: '/pos' },
    { name: 'Caja Registradora', icon: Wallet, path: '/cash' },
    { name: 'Ventas', icon: Wallet, path: '/sales' },
    { name: 'Compras', icon: ShoppingCart, path: '/purchases' },
    { name: 'Clientes', icon: Users2, path: '/customers' },
    { name: 'Productos', icon: Package, path: '/products' },
    { name: 'Inventario', icon: Boxes, path: '/inventory' },
    { name: 'Proveedores', icon: Building2, path: '/suppliers' },
    { name: 'Estadísticas', icon: BarChart3, path: '/analytics' },
    { name: 'Reportes', icon: FileText, path: '/reports' },
    // Only show Users to Admin
    ...(isAdmin ? [{ name: 'Usuarios', icon: Users, path: '/users' }] : []),
  ];

  return (
    <aside className="w-64 border-r border-[#E5E7EB] h-screen bg-[#F9FAFB] flex flex-col justify-between fixed left-0 top-0">
      <div>
        <div className="flex items-center gap-3 p-6 mb-2">
          {settings?.logoUrl ? (
            <img src={`http://localhost:3005${settings.logoUrl}`} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
              <img src="/logo.png" alt="Nexus Genesis" className="w-full h-full object-contain p-1" />
            </div>
          )}
          <div>
            <h1 className="font-bold text-[#111827] text-md leading-tight truncate w-32" title={settings?.businessName || 'Nexus Genesis'}>
              {settings?.businessName || 'Nexus Genesis'}
            </h1>
            <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-0.5">Sistemas Élite</p>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = item.path === '/' 
              ? pathname === '/dashboard' 
              : pathname?.includes(item.path);
            return (
            <Link href={item.path === '/' ? '/dashboard' : `/dashboard${item.path}`} key={item.name}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-[#E0E7FF] text-blue-700 font-medium' 
                    : 'text-[#4B5563] hover:bg-gray-100 hover:text-[#111827]'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-[#6B7280]'}`} />
                <span className="text-[15px]">{item.name}</span>
              </div>
            </Link>
          )})}
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
  );
};

export default Sidebar;
