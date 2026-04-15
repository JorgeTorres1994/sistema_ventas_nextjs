"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { 
  Search, 
  Filter, 
  Calendar, 
  MoreVertical, 
  Eye, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { getSales, cancelSale } from '@/lib/api';
import SalesSummary from '@/components/sales/SalesSummary';
import SaleDetailDrawer from '@/components/sales/SaleDetailDrawer';

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
      
      // Calculate Stats
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
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  }, [search, status, dateRange]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSales(), 300);
    return () => clearTimeout(timer);
  }, [fetchSales]);

  const handleCancelSale = async (id: string) => {
    if (window.confirm('¿Está seguro de que desea cancelar esta venta? Esto restaurará los niveles de stock.')) {
      try {
        await cancelSale(id);
        fetchSales();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error al cancelar la venta');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">Pagado</span>;
      case 'PENDING': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-widest">Pendiente</span>;
      case 'PARTIAL': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-widest">Parcial</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-600 text-white border border-gray-700 uppercase tracking-widest">Cancelado</span>;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-hidden">
        {/* Top Header */}
        <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              <span>Lumen Ledger</span>
              <span>/</span>
              <span className="text-gray-900">Ventas</span>
            </nav>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Transacciones de Venta</h1>
          </div>
          <Link href="/dashboard/pos">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-200 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Nueva Venta
            </button>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth hide-scrollbar">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
            {/* Real-time Search */}
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar ID de venta o cliente..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none text-sm font-medium"
              />
            </div>

            {/* Status Filters */}
            <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-100">
              {['Todos', 'Pagado', 'Pendiente', 'Parcial'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    status === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Date Range Simulation */}
            <div className="relative group">
               <button className="flex items-center gap-3 px-5 py-3 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl transition-all text-sm font-black text-gray-700 uppercase tracking-widest">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Oct 1 - Oct 31, 2023</span>
               </button>
            </div>

            {/* Export */}
            <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
              <Download className="w-5 h-5" />
            </button>
          </div>

          {/* Sales Table Wrapper */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">ID Venta</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Cliente</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Fecha y Hora</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Estado</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Total</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">Cargando Historial de Transacciones...</td></tr>
                  ) : sales.length === 0 ? (
                    <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">No se encontraron transacciones</td></tr>
                  ) : sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-indigo-50/20 group transition-colors">
                      <td className="px-8 py-5 font-black text-indigo-600 text-sm">
                        #{sale.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                            {sale.customer?.name?.[0] || 'W'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 leading-none">{sale.customer?.name || 'Venta al Paso'}</p>
                            <p className="text-[10px] font-bold text-gray-400 mt-1">{sale.customer?.email || 'Venta Individual'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-700 leading-none">{new Date(sale.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1">{new Date(sale.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                      </td>
                      <td className="px-8 py-5">
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-sm font-black text-gray-900 tracking-tight">S/ {Number(sale.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2 scale-90">
                          <button 
                            onClick={() => setSelectedSaleId(sale.id)}
                            className="p-2 hover:bg-white border-transparent hover:border-gray-100 border rounded-xl text-gray-400 hover:text-indigo-600 shadow-sm transition-all"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {sale.status !== 'CANCELLED' && (
                            <button 
                              onClick={() => handleCancelSale(sale.id)}
                              className="p-2 hover:bg-rose-50 border-transparent hover:border-rose-100 border rounded-xl text-gray-400 hover:text-rose-600 transition-all"
                            >
                              <RotateCcw className="w-5 h-5" />
                            </button>
                          )}
                          <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Implementation */}
            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mostrando 1 a {sales.length} de {sales.length} registros</span>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-not-allowed">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex bg-white border border-gray-100 rounded-xl p-1">
                   <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black tracking-widest shadow-lg shadow-indigo-100 transition-all">1</button>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors cursor-not-allowed">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Insights Summary */}
          <SalesSummary stats={stats} />
        </main>
      </div>

      {/* Detail Drawer Integration */}
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
