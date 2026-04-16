"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { 
    Search, Plus, Calendar, Download, 
    RotateCcw, Eye, ChevronLeft, ChevronRight,
    TrendingUp, ShoppingBag, DollarSign, AlertCircle
} from 'lucide-react';
import { getSales, cancelSale } from '@/lib/api';
import { toast } from 'sonner';

// ── Components ─────────────────────────────────────────────────────────────────

const SalesSummary = ({ stats }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group hover:border-blue-100 transition-all">
       <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
          <TrendingUp className="w-6 h-6" />
       </div>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ingresos Totales</p>
       <h4 className="text-2xl font-black text-gray-900 leading-none">S/ {stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
    </div>
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group hover:border-blue-100 transition-all">
       <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
          <ShoppingBag className="w-6 h-6" />
       </div>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Transacciones</p>
       <h4 className="text-2xl font-black text-gray-900 leading-none">{stats.transactionCount}</h4>
    </div>
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group hover:border-blue-100 transition-all">
       <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
          <DollarSign className="w-6 h-6" />
       </div>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ticket Promedio</p>
       <h4 className="text-2xl font-black text-gray-900 leading-none">S/ {stats.avgSale.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
    </div>
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group hover:border-blue-100 transition-all">
       <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
          <AlertCircle className="w-6 h-6" />
       </div>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Anulaciones</p>
       <h4 className="text-2xl font-black text-gray-900 leading-none">{stats.returns}</h4>
    </div>
  </div>
);

// Mocks for structure - in real life these would be imported from components
// ── Sale Detail Drawer ────────────────────────────────────────────────────────
const SaleDetailDrawer = ({ saleId, onClose, onCancelSuccess }: any) => {
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (saleId) {
      setLoading(true);
      // In a real app, this would be a specific API call. For now, since we have the data in the list, 
      // but the list might not have all items, we'll simulate a fetch.
      // Assuming getSales returns the full object or we fetch by ID if possible.
      // Placeholder for actual fetch logic:
      setLoading(false);
      // In the real implementation, we would call an API here.
    }
  }, [saleId]);

  if (!saleId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm shadow-2xl" />
      <div 
        className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col p-0 overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Detalle de Transacción</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          <div className="flex items-center justify-center py-20 text-gray-300 font-bold uppercase tracking-[0.2em]">
             Cargando información...
          </div>
        </div>
      </div>
    </div>
  );
};

// Re-importing X from lucide-react since I added a close button
import { X } from 'lucide-react';

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    transactionCount: 0,
    avgSale: 0,
    returns: 0
  });

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSales({
        search,
        status: status === 'Todos' ? undefined : status,
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      setSales(data);
      
      const total = data.reduce((acc: number, s: any) => s.status !== 'CANCELLED' ? acc + Number(s.total) : acc, 0);
      const paidSales = data.filter((s: any) => s.status !== 'CANCELLED');
      const cancelledCount = data.filter((s: any) => s.status === 'CANCELLED').length;

      setStats({
        totalRevenue: total,
        transactionCount: paidSales.length,
        avgSale: paidSales.length > 0 ? total / paidSales.length : 0,
        returns: cancelledCount
      });
    } catch (error) {
      toast.error('Error al cargar el historial de ventas');
    } finally {
      setLoading(false);
    }
  }, [search, status, dateRange]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSales(), 300);
    return () => clearTimeout(timer);
  }, [fetchSales]);

  const handleCancelSale = async (id: string) => {
    toast('¿Desea anular esta venta?', {
      description: 'Esta acción restaurará el stock de los productos. No se puede deshacer.',
      action: {
        label: 'Confirmar Anulación',
        onClick: async () => {
          const toastId = toast.loading('Anulando venta...');
          try {
            await cancelSale(id);
            toast.success('Venta anulada correctamente', { id: toastId });
            fetchSales();
          } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al cancelar la venta';
            toast.error(msg, { id: toastId });
          }
        }
      },
      duration: 5000,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">Pagado</span>;
      case 'PENDING': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-widest">Pendiente</span>;
      case 'PARTIAL': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">Parcial</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-widest">Anulado</span>;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-hidden">
        {/* Top Header */}
        <header className="px-10 py-8 bg-white/50 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">Historial de Ventas</h1>
            <p className="text-base text-gray-400 font-medium">Auditoría centralizada de transacciones • Nexus Genesis</p>
          </div>
          <Link href="/dashboard/pos">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-100 flex items-center gap-3">
              <Plus className="w-5 h-5" /> Nueva Venta
            </button>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto px-10 pb-12 space-y-8 scroll-smooth scrollbar-hide">
          {/* Controls Bar */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar por cliente, ID o DNI..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm font-bold text-gray-700"
              />
            </div>

            <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
              {['Todos', 'Pagado', 'Pendiente', 'Anulado'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s === 'Anulado' ? 'CANCELLED' : (s === 'Pagado' ? 'PAID' : (s === 'Pendiente' ? 'PENDING' : 'Todos')))}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    (status === 'CANCELLED' && s === 'Anulado') || 
                    (status === 'PAID' && s === 'Pagado') || 
                    (status === 'PENDING' && s === 'Pendiente') || 
                    (status === 'Todos' && s === 'Todos')
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors text-gray-500 border border-gray-100">
              <Download className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">ID Venta</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Cliente</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Estado</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Monto Neto</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={5} className="py-24 text-center text-gray-300 font-black uppercase tracking-widest animate-pulse text-xs">Auditando registros...</td></tr>
                ) : sales.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No se encontraron transacciones</p>
                    </td>
                  </tr>
                ) : sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-blue-50/20 transition-all cursor-default">
                    <td className="px-10 py-6 font-black text-blue-600 text-sm">#SAL-{sale.id.substring(0,6).toUpperCase()}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-black text-[10px] border border-gray-200">{sale.customer?.name?.[0] || 'G'}</div>
                        <span className="text-sm font-black text-gray-900 leading-none">{sale.customer?.name || 'Cliente de Mostrador'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">{getStatusBadge(sale.status)}</td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black text-gray-900 tracking-tight">S/ {Number(sale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => setSelectedSaleId(sale.id)} className="p-3 bg-gray-100 hover:bg-blue-600 rounded-xl text-gray-400 hover:text-white transition-all"><Eye className="w-4 h-4" /></button>
                        {sale.status !== 'CANCELLED' && (
                          <button onClick={() => handleCancelSale(sale.id)} className="p-3 bg-gray-100 hover:bg-rose-600 rounded-xl text-gray-400 hover:text-white transition-all"><RotateCcw className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SalesSummary stats={stats} />
        </main>
      </div>

      <SaleDetailDrawer 
        saleId={selectedSaleId} 
        onClose={() => setSelectedSaleId(null)} 
        onCancelSuccess={() => {
          setSelectedSaleId(null);
          fetchSales();
        }}
      />
    </div>
  );
}
