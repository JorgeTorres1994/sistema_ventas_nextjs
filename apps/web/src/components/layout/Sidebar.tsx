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
  Boxes
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Terminal POS', icon: MonitorSmartphone, path: '/pos' },
    { name: 'Sales', icon: Wallet, path: '/sales' },
    { name: 'Orders', icon: ShoppingCart, path: '/orders' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'Inventory', icon: Boxes, path: '/inventory' },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
    { name: 'Reports', icon: FileText, path: '/reports' },
  ];

  return (
    <aside className="w-64 border-r border-[#E5E7EB] h-screen bg-[#F9FAFB] flex flex-col justify-between fixed left-0 top-0">
      <div>
        <div className="flex items-center gap-3 p-6 mb-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-[#111827] text-lg leading-tight">Analytics Pro</h1>
            <p className="text-sm text-[#6B7280]">Enterprise Plan</p>
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
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-[#4B5563] hover:bg-gray-100 hover:text-[#111827] transition-colors">
          <Settings className="w-5 h-5 text-[#6B7280]" />
          <span className="text-[15px]">Settings</span>
        </div>
        <div 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <span className="material-symbols-outlined w-5 h-5 text-rose-500">logout</span>
          <span className="text-[15px] font-medium">Log out</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
