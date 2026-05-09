"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
    Search, Plus, Calendar, Download, 
    RotateCcw, Eye, ChevronLeft, ChevronRight,
    TrendingUp, ShoppingBag, DollarSign, AlertCircle, X,
    User, Hash, Clock, CreditCard, RefreshCw
} from 'lucide-react';
import { getSales, getSaleById, cancelSale, reSendInvoice } from '@/lib/api';
import { toast } from 'sonner';
import SaleDetailDrawer from '@/components/sales/SaleDetailDrawer';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number) => `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

// ── Components ─────────────────────────────────────────────────────────────────

const SalesSummary = ({ stats }: any) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:p-8">
    <div className="bg-card p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] border border-outline-variant shadow-sm group hover:border-primary/30 transition-all">
       <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center text-primary mb-4">
          <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6" />
       </div>
       <p className="text-[9px] lg:text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Ingresos Totales</p>
       <h4 className="text-xl lg:text-2xl font-black text-foreground leading-none">{fmtCurrency(stats.totalRevenue)}</h4>
    </div>
    <div className="bg-card p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] border border-outline-variant shadow-sm group hover:border-primary/30 transition-all">
       <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-500/10 rounded-xl lg:rounded-2xl flex items-center justify-center text-emerald-500 mb-4">
          <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" />
       </div>
       <p className="text-[9px] lg:text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Transacciones</p>
       <h4 className="text-xl lg:text-2xl font-black text-foreground leading-none">{stats.transactionCount}</h4>
    </div>
    <div className="bg-card p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] border border-outline-variant shadow-sm group hover:border-primary/30 transition-all">
       <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-500/10 rounded-xl lg:rounded-2xl flex items-center justify-center text-amber-500 mb-4">
          <DollarSign className="w-5 h-5 lg:w-6 lg:h-6" />
       </div>
       <p className="text-[9px] lg:text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Ticket Promedio</p>
       <h4 className="text-xl lg:text-2xl font-black text-foreground leading-none">{fmtCurrency(stats.avgSale)}</h4>
    </div>
    <div className="bg-card p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] border border-outline-variant shadow-sm group hover:border-primary/30 transition-all">
       <div className="w-10 h-10 lg:w-12 lg:h-12 bg-rose-500/10 rounded-xl lg:rounded-2xl flex items-center justify-center text-rose-500 mb-4">
          <AlertCircle className="w-5 h-5 lg:w-6 lg:h-6" />
       </div>
       <p className="text-[9px] lg:text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Anulaciones</p>
       <h4 className="text-xl lg:text-2xl font-black text-foreground leading-none">{stats.returns}</h4>
    </div>
  </div>
);

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Todos');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    setMounted(true);
    const searchParams = new URLSearchParams(window.location.search);
    const openId = searchParams.get('open');
    if (openId) {
      setSelectedSaleId(openId);
    }
  }, []);
  
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
      case 'PAID': return <span className="px-2.5 py-1 rounded-full text-[9px] lg:text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">Pagado</span>;
      case 'PENDING': return <span className="px-2.5 py-1 rounded-full text-[9px] lg:text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest">Pendiente</span>;
      case 'PARTIAL': return <span className="px-2.5 py-1 rounded-full text-[9px] lg:text-[10px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">Parcial</span>;
      case 'CANCELLED': return <span className="px-2.5 py-1 rounded-full text-[9px] lg:text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-widest">Anulado</span>;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 w-full overflow-hidden">
        <TopBar />
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Module Header */}
          <div className="px-4 lg:px-10 py-6 lg:py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shrink-0">
            <div>
              <h1 className="text-2xl lg:text-4xl font-black text-foreground tracking-tight leading-none mb-2">Historial de Ventas</h1>
              <p className="text-xs lg:text-base text-on-surface-variant font-medium">Auditoría centralizada de transacciones • Nexus Genesis</p>
            </div>
            <Link href="/dashboard/pos" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-primary hover:opacity-90 text-on-primary px-6 lg:px-8 py-3.5 lg:py-4 rounded-xl lg:rounded-2xl font-black text-xs lg:text-sm transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95">
                <Plus className="w-5 h-5" /> Nueva Venta
              </button>
            </Link>
          </div>

          <main className="px-4 lg:px-10 pb-20 space-y-6 lg:space-y-10">
            {/* Controls Bar */}
            <div className="bg-card p-4 lg:p-6 rounded-[24px] lg:rounded-[32px] shadow-sm border border-outline-variant flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Buscar venta o cliente..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-3.5 lg:py-4 bg-surface-low border border-outline-variant rounded-xl lg:rounded-2xl focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm font-bold text-foreground placeholder:text-on-surface-variant/50"
                />
              </div>

              <div className="flex flex-wrap bg-surface-low p-1.5 rounded-xl lg:rounded-2xl border border-outline-variant gap-1">
                {['Todos', 'Pagado', 'Pendiente', 'Anulado'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s === 'Anulado' ? 'CANCELLED' : (s === 'Pagado' ? 'PAID' : (s === 'Pendiente' ? 'PENDING' : 'Todos')))}
                    className={`flex-1 min-w-[70px] px-3 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${
                      (status === 'CANCELLED' && s === 'Anulado') || 
                      (status === 'PAID' && s === 'Pagado') || 
                      (status === 'PENDING' && s === 'Pendiente') || 
                      (status === 'Todos' && s === 'Todos')
                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                        : 'text-on-surface-variant hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button className="hidden lg:block p-4 bg-surface-low hover:bg-primary/10 rounded-2xl transition-colors text-on-surface-variant hover:text-primary border border-outline-variant active:scale-95">
                <Download className="w-5 h-5" />
              </button>
            </div>

            <SalesSummary stats={stats} />

            <section className="bg-card rounded-[24px] lg:rounded-[40px] shadow-sm border border-outline-variant overflow-hidden flex flex-col">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-low border-b border-outline-variant">
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">ID Venta</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Cliente</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-center">Estado</th>
                      <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-right">Monto Neto</th>
                      <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {loading ? (
                      <tr><td colSpan={5} className="py-24 text-center text-on-surface-variant font-black uppercase tracking-widest animate-pulse text-xs">Auditando registros...</td></tr>
                    ) : sales.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                          <p className="text-sm font-black text-on-surface-variant uppercase tracking-widest">No se encontraron transacciones</p>
                        </td>
                      </tr>
                    ) : sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-primary/5 transition-all cursor-default group">
                        <td className="px-10 py-6 font-black text-primary text-sm">
                          {sale.documentSeries && sale.documentNumber 
                            ? `${sale.documentSeries}-${sale.documentNumber.toString().padStart(8, '0')}` 
                            : `#SAL-${sale.id.substring(0,6).toUpperCase()}`}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-surface-low flex items-center justify-center text-on-surface-variant font-black text-[10px] border border-outline-variant group-hover:bg-card">{sale.customer?.name?.[0] || 'G'}</div>
                            <span className="text-sm font-black text-foreground leading-none">{sale.customer?.name || 'Cliente de Mostrador'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">{getStatusBadge(sale.status)}</td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-sm font-black text-foreground tracking-tight">{fmtCurrency(sale.total)}</span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => setSelectedSaleId(sale.id)} className="p-3 bg-surface-low group-hover:bg-card hover:!bg-primary rounded-xl text-on-surface-variant hover:text-white transition-all active:scale-95"><Eye className="w-4 h-4" /></button>
                            {sale.status !== 'CANCELLED' && (
                              <button onClick={() => handleCancelSale(sale.id)} className="p-3 bg-surface-low group-hover:bg-card hover:!bg-rose-600 rounded-xl text-on-surface-variant hover:text-white transition-all active:scale-95"><RotateCcw className="w-4 h-4" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-outline-variant">
                {loading ? (
                  <div className="py-20 text-center text-on-surface-variant font-black uppercase text-[10px] animate-pulse">Cargando...</div>
                ) : sales.length === 0 ? (
                  <div className="py-20 text-center">
                    <ShoppingBag className="w-10 h-10 text-on-surface-variant/10 mx-auto mb-4" />
                    <p className="text-xs font-black text-on-surface-variant/30 uppercase tracking-widest">Sin ventas</p>
                  </div>
                ) : sales.map((sale) => (
                  <div key={sale.id} className="p-5 space-y-4 hover:bg-primary/5 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-primary">
                          {sale.documentSeries && sale.documentNumber 
                            ? `${sale.documentSeries}-${sale.documentNumber.toString().padStart(8, '0')}` 
                            : `#SAL-${sale.id.substring(0,6).toUpperCase()}`}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-bold mt-1 uppercase">{fmtDate(sale.createdAt)}</p>
                      </div>
                      {getStatusBadge(sale.status)}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-low flex items-center justify-center text-on-surface-variant font-black text-[9px] border border-outline-variant">{sale.customer?.name?.[0] || 'G'}</div>
                        <p className="text-xs font-black text-foreground truncate max-w-[150px]">{sale.customer?.name || 'Cliente de Mostrador'}</p>
                      </div>
                      <p className="text-sm font-black text-foreground tracking-tight">{fmtCurrency(sale.total)}</p>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => setSelectedSaleId(sale.id)} 
                        className="flex-1 py-3 bg-surface-low hover:bg-primary text-on-surface-variant hover:text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Detalle
                      </button>
                      {sale.status !== 'CANCELLED' && (
                        <button 
                          onClick={() => handleCancelSale(sale.id)} 
                          className="flex-1 py-3 bg-surface-low hover:bg-rose-600 text-on-surface-variant hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" /> Anular
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      {mounted && (
        <SaleDetailDrawer 
          saleId={selectedSaleId} 
          onClose={() => setSelectedSaleId(null)} 
          onCancelSale={(id: string) => {
            handleCancelSale(id);
            setSelectedSaleId(null);
          }} 
        />
      )}
    </div>
  );
}
