"use client";

import React from 'react';
import { MoreHorizontal, Eye, Printer, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { cancelSale } from '@/lib/api';
import { toast } from 'sonner';
import SaleDetailDrawer from '../sales/SaleDetailDrawer';
import TicketPrintModal from '../sales/TicketPrintModal';

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
  const [selectedSaleId, setSelectedSaleId] = React.useState<string | null>(null);
  const [printSaleId, setPrintSaleId] = React.useState<string | null>(null);

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

  const handleCancelSale = async (id: string) => {
    toast('¿Desea anular esta venta?', {
      description: 'Esta acción restaurará el stock de los productos. No se puede deshacer.',
      action: {
        label: 'Confirmar Anulación',
        onClick: async () => {
          const toastId = toast.loading('Anulando venta...');
          try {
            // Remove the #SAL- prefix if it's there
            const realId = id.replace('#SAL-', '').toLowerCase();
            await cancelSale(realId);
            toast.success('Venta anulada correctamente', { id: toastId });
            // Ideally we should refresh the dashboard data here, but for now we update UI
            window.location.reload();
          } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al cancelar la venta';
            toast.error(msg, { id: toastId });
          }
        }
      },
      duration: 5000,
    });
  };

  const handlePrint = (orderId: string) => {
    setPrintSaleId(orderId);
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
        <Link href="/dashboard/sales" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition">
          Ver Todo
        </Link>
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
              <th className="py-3 px-6 text-xs font-semibold text-[#6B7280] uppercase tracking-wider text-center">Acción</th>
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
                <td className="py-4 px-6 text-[15px] font-medium text-[#111827]">{(order as any).displayId || order.id}</td>
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
                <td className="py-4 px-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handlePrint(order.id)}
                      title="Imprimir y Gestionar Venta"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90 flex items-center justify-center group"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Shared Components */}
      <SaleDetailDrawer 
        saleId={selectedSaleId} 
        onClose={() => setSelectedSaleId(null)} 
        onCancelSale={handleCancelSale}
      />

      <TicketPrintModal 
        saleId={printSaleId} 
        onClose={() => setPrintSaleId(null)} 
      />
    </div>
  );
};

export default RecentOrders;
