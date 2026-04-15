"use client";

import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface RecentOrdersProps {
  orders: {
    id: string;
    customer: string;
    product: string;
    amount: number;
    status: string;
    date: string;
  }[];
  isLoading: boolean;
}

const RecentOrders = ({ orders, isLoading }: RecentOrdersProps) => {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-PE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-sm flex-1 animate-pulse">
        <div className="w-48 h-6 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="w-20 h-4 bg-gray-100 rounded"></div>
              <div className="w-32 h-4 bg-gray-100 rounded"></div>
              <div className="w-24 h-4 bg-gray-100 rounded"></div>
              <div className="w-16 h-4 bg-gray-100 rounded"></div>
              <div className="w-20 h-6 bg-gray-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm flex-1 mt-6 overflow-hidden">
      <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#111827]">Ventas Recientes</h2>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition">
          Ver Todo
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <th className="py-3 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">ID de Orden</th>
              <th className="py-3 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Cliente</th>
              <th className="py-3 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Producto</th>
              <th className="py-3 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Monto</th>
              <th className="py-3 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Estado</th>
              <th className="py-3 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Fecha</th>
              <th className="py-3 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#6B7280] text-sm">
                  No se encontraron ventas recientes.
                </td>
              </tr>
            ) : orders.map((order, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-[15px] font-medium text-[#111827]">{order.id}</td>
                <td className="py-4 px-6 text-[15px] text-[#4B5563]">{order.customer}</td>
                <td className="py-4 px-6 text-[15px] text-[#4B5563]">{order.product}</td>
                <td className="py-4 px-6 text-[15px] font-semibold text-[#111827]">{formatCurrency(order.amount)}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'PAID' || order.status === 'COMPLETED' 
                      ? 'bg-blue-50 text-blue-700' 
                      : order.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status === 'PAID' || order.status === 'COMPLETED' ? 'Completado' : 
                     order.status === 'PENDING' ? 'Pendiente' : 
                     order.status === 'CANCELLED' ? 'Cancelado' : order.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-[15px] text-[#6B7280]">{formatDate(order.date)}</td>
                <td className="py-4 px-6 text-right">
                  <button className="text-[#9CA3AF] hover:text-[#4B5563] p-1 rounded-lg hover:bg-gray-100 transition">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;
