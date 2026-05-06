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

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number) => `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

// ── Components ─────────────────────────────────────────────────────────────────

const SalesSummary = ({ stats }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group hover:border-blue-100 transition-all">
       <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
          <TrendingUp className="w-6 h-6" />
       </div>
       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ingresos Totales</p>
       <h4 className="text-2xl font-black text-gray-900 leading-none">S/ {stats.totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</h4>
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
       <h4 className="text-2xl font-black text-gray-900 leading-none">S/ {stats.avgSale.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</h4>
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
const SaleDetailDrawer = ({ saleId, onClose, onCancelSale }: any) => {
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (saleId) {
      setLoading(true);
      getSaleById(saleId)
        .then(setSale)
        .catch(() => toast.error('Error al cargar detalle de venta'))
        .finally(() => setLoading(false));
    } else {
      setSale(null);
    }
  }, [saleId]);

  if (!saleId) return null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />
      <div 
        className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 ease-out"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h2 className="text-2xl font-black text-gray-900 tracking-tight">Comprobante de Venta</h2>
               {sale && (
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(sale.status)}`}>
                   {sale.status === 'PAID' ? 'Pagado' : sale.status === 'CANCELLED' ? 'Anulado' : 'Pendiente'}
                 </span>
               )}
            </div>
            <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" /> {sale?.documentSeries && sale?.documentNumber ? `${sale.documentSeries}-${sale.documentNumber.toString().padStart(8, '0')}` : saleId.toUpperCase()}
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl hover:bg-gray-50 flex items-center justify-center transition-all group">
            <X className="w-6 h-6 text-gray-300 group-hover:text-gray-900 transition-colors" />
          </button>
        </div>
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
             <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
             <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">Sincronizando auditoría...</p>
          </div>
        ) : sale ? (
          <div className="flex-1 overflow-y-auto scrollbar-hide">
             {/* Main Info */}
             <div className="px-10 py-8 grid grid-cols-2 gap-8 border-b border-gray-50 bg-gray-50/30">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100 text-blue-600">
                         <User className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Cliente</p>
                         <p className="text-sm font-black text-gray-900">{sale.customer?.name || 'Cliente de Mostrador'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100 text-amber-600">
                         <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Fecha de Emisión</p>
                         <p className="text-sm font-black text-gray-900">{fmtDate(sale.createdAt)}</p>
                      </div>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100 text-indigo-600">
                         <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Método de Pago</p>
                         <p className="text-sm font-black text-gray-900">{sale.paymentMethod || 'Efectivo'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100 text-emerald-600">
                         <Clock className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Hora de Registro</p>
                         <p className="text-sm font-black text-gray-900">{fmtTime(sale.createdAt)}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Electronic Invoicing Status */}
             <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estado SUNAT</p>
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${sale.invoiceStatus === 'SENT' ? 'bg-emerald-500' : sale.invoiceStatus === 'ERROR' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      <span className="text-sm font-black text-gray-900">
                         {sale.invoiceStatus === 'SENT' ? 'Comprobante Aceptado' : sale.invoiceStatus === 'ERROR' ? 'Error en Envío' : 'Pendiente de Sincronización'}
                      </span>
                   </div>
                </div>
                <div className="flex gap-2">
                   {sale.invoiceStatus === 'ERROR' && (
                      <button 
                        onClick={async () => {
                          const tid = toast.loading('Re-enviando a SUNAT...');
                          try {
                            const res = await reSendInvoice(sale.id);
                            toast.success('Sincronizado correctamente', { id: tid });
                            // Refresh local state
                            getSaleById(sale.id).then(setSale);
                          } catch (e: any) {
                            toast.error('Error al re-enviar: ' + (e.response?.data?.message || e.message), { id: tid });
                          }
                        }}
                        className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2"
                      >
                         <RefreshCw className="w-3.5 h-3.5" /> Re-intentar
                      </button>
                   )}
                   {sale.pdfUrl && (
                      <a href={sale.pdfUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-2">
                         <Download className="w-3.5 h-3.5" /> PDF
                      </a>
                   )}
                   {sale.xmlUrl && (
                      <a href={sale.xmlUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2">
                         <Download className="w-3.5 h-3.5" /> XML
                      </a>
                   )}
                </div>
             </div>

             {/* Items Table */}
             <div className="px-10 py-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Resumen de Artículos</h3>
                <div className="space-y-4">
                   {sale.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-100 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-black text-xs">
                               {item.product?.name?.[0] || 'P'}
                            </div>
                            <div>
                               <p className="text-sm font-black text-gray-900">{item.product?.name || 'Producto Desconocido'}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-gray-400 font-bold">{item.quantity} unidades × {fmtCurrency(Number(item.price))}</p>
                                  <span className="text-[9px] font-black bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-md uppercase tracking-widest border border-indigo-100/50">
                                     {item.product?.category?.name || 'General'}
                                  </span>
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black text-gray-900">{fmtCurrency(Number(item.price) * item.quantity)}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Totals */}
             <div className="mx-10 my-6 p-8 bg-gray-900 rounded-[32px] text-white shadow-2xl shadow-gray-200">
                <div className="space-y-4 border-b border-white/10 pb-6 mb-6">
                   <div className="flex justify-between items-center opacity-60">
                      <span className="text-xs font-bold uppercase tracking-widest">Subtotal Gravado</span>
                      <span className="text-sm font-black">{fmtCurrency(Number(sale.total) / 1.18)}</span>
                   </div>
                   <div className="flex justify-between items-center opacity-60">
                      <span className="text-xs font-bold uppercase tracking-widest">I.G.V (18%)</span>
                      <span className="text-sm font-black">{fmtCurrency(Number(sale.total) - (Number(sale.total) / 1.18))}</span>
                   </div>
                </div>
                <div className="flex justify-between items-center">
                   <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Total a Liquidar</p>
                      <h4 className="text-3xl font-black tracking-tighter">{fmtCurrency(Number(sale.total))}</h4>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Monto Recibido</p>
                      <p className="text-xl font-black text-emerald-400">{fmtCurrency(Number(sale.amountPaid || sale.total))}</p>
                   </div>
                </div>
             </div>
             
             <div className="px-10 py-10">
                {sale.status !== 'CANCELLED' ? (
                   <button 
                     onClick={() => {
                        onCancelSale(sale.id);
                     }}
                     className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-3"
                   >
                      <RotateCcw className="w-4 h-4" /> Solicitar Anulación de Comprobante
                   </button>
                ) : (
                   <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4">
                      <AlertCircle className="w-6 h-6 text-rose-600" />
                      <div>
                         <p className="text-sm font-black text-rose-900">Esta venta ha sido anulada</p>
                         <p className="text-xs text-rose-600 font-medium">Los productos han sido devueltos al inventario central.</p>
                      </div>
                   </div>
                )}
             </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 font-black uppercase tracking-widest">
             No se pudo recuperar la información
          </div>
        )}
      </div>
    </div>
  );
};

export default function SalesPage() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const openId = searchParams?.get('open');

  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(openId || null);
  
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
        <TopBar />
        
        {/* Module Header */}
        <div className="px-10 py-8 bg-transparent flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">Historial de Ventas</h1>
            <p className="text-base text-gray-400 font-medium">Auditoría centralizada de transacciones • Nexus Genesis</p>
          </div>
          <Link href="/dashboard/pos">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-100 flex items-center gap-3">
              <Plus className="w-5 h-5" /> Nueva Venta
            </button>
          </Link>
        </div>

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

          <SalesSummary stats={stats} />

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
                    <td className="px-10 py-6 font-black text-blue-600 text-sm">
                      {sale.documentSeries && sale.documentNumber 
                        ? `${sale.documentSeries}-${sale.documentNumber.toString().padStart(8, '0')}` 
                        : `#SAL-${sale.id.substring(0,6).toUpperCase()}`}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-black text-[10px] border border-gray-200">{sale.customer?.name?.[0] || 'G'}</div>
                        <span className="text-sm font-black text-gray-900 leading-none">{sale.customer?.name || 'Cliente de Mostrador'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">{getStatusBadge(sale.status)}</td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black text-gray-900 tracking-tight">S/ {Number(sale.total).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
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
        </main>
      </div>

      <SaleDetailDrawer 
        saleId={selectedSaleId} 
        onClose={() => setSelectedSaleId(null)} 
        onCancelSale={(id: string) => {
          handleCancelSale(id);
          setSelectedSaleId(null);
        }} 
      />
    </div>
  );
}
