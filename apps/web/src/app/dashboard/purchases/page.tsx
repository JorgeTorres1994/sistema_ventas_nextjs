"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import {
  Search, Plus, ChevronLeft, ChevronRight, X, Calendar, 
  ShoppingCart, Filter, Package, Eye, FileText, CheckCircle2,
  Clock, AlertCircle, Building2, TrendingDown, Mail, Phone, MapPin
} from 'lucide-react';
import { getPurchases, getPurchaseById } from '@/lib/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('es-PE', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtCurrency = (n: number) => {
  return `S/ ${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    COMPLETED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    CANCELLED: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };
  const labels: any = { COMPLETED: "RECIBIDO", PENDING: "PENDIENTE", CANCELLED: "CANCELADO" };
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black border uppercase tracking-[0.15em] ${styles[status] || 'bg-surface-low text-on-surface-variant border-outline-variant'}`}>
      {labels[status] || status}
    </span>
  );
}

// ── Purchase Detail Drawer ─────────────────────────────────────────────────────
function PurchaseDetailDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPurchaseById(id)
      .then(setPurchase)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" />
      <div 
        className="relative w-full max-w-2xl bg-card h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 border-l border-outline-variant/30"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 lg:px-10 py-6 lg:py-8 border-b border-outline-variant/30 flex items-center justify-between bg-card/80 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20">
              <ShoppingCart className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-foreground leading-none tracking-tight">Orden de Compra</h2>
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.3em] mt-2 opacity-60">REF: #{id.slice(0,8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl hover:bg-surface-low flex items-center justify-center transition-all active:scale-90 text-on-surface-variant border border-outline-variant/30">
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : purchase ? (
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-10 pb-32">
            {/* Status & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 lg:p-8 bg-surface-low rounded-[32px] border border-outline-variant/30 group hover:shadow-lg transition-all">
                <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4 opacity-40">Estado de Operación</p>
                <StatusBadge status={purchase.status} />
              </div>
              <div className="p-6 lg:p-8 bg-surface-low rounded-[32px] border border-outline-variant/30 group hover:shadow-lg transition-all">
                <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4 opacity-40">Fecha de Registro</p>
                <p className="text-sm font-black text-foreground uppercase tracking-widest">{fmtDate(purchase.createdAt)}</p>
              </div>
            </div>

            {/* Supplier Section */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-4 ml-1">
                <Building2 className="w-4 h-4 text-primary" /> Socio Comercial
              </h3>
              <div className="p-6 lg:p-8 bg-card border border-outline-variant/30 rounded-[40px] shadow-sm group hover:shadow-2xl hover:border-primary/20 transition-all">
                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-outline-variant/10">
                  <div className="w-16 h-16 bg-primary text-on-primary rounded-[24px] flex items-center justify-center text-2xl font-black shadow-xl shadow-primary/20">
                    {purchase.supplier?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <p className="text-xl font-black text-foreground tracking-tight">{purchase.supplier?.name}</p>
                    <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">RUC/DNI: {purchase.supplier?.dniRuc}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   {[
                    { label: 'Correo Electrónico', value: purchase.supplier?.email, icon: Mail },
                    { label: 'Teléfono de Contacto', value: purchase.supplier?.phone, icon: Phone },
                   ].filter(item => item.value).map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 flex items-center gap-2">
                        <item.icon className="w-3.5 h-3.5" /> {item.label}
                      </p>
                      <p className="text-sm font-bold text-foreground break-all">{item.value}</p>
                    </div>
                   ))}
                   {purchase.supplier?.address && (
                    <div className="sm:col-span-2 space-y-2">
                      <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> Dirección Fiscal
                      </p>
                      <p className="text-sm font-medium text-foreground leading-relaxed">{purchase.supplier.address}</p>
                    </div>
                   )}
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.3em] flex items-center gap-4 ml-1">
                <Package className="w-4 h-4 text-primary" /> Detalle de Artículos
              </h3>
              <div className="overflow-hidden rounded-[40px] border border-outline-variant/30 bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-low/50">
                          <tr className="border-b border-outline-variant/10">
                              <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Descripción</th>
                              <th className="px-4 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-widest text-center">Cant.</th>
                              <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-widest text-right">Unitario</th>
                              <th className="px-8 py-6 text-[9px] font-black text-on-surface-variant uppercase tracking-widest text-right">Total</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                          {purchase.items?.map((item: any) => (
                              <tr key={item.id} className="hover:bg-primary/[0.02] transition-colors">
                                  <td className="px-8 py-6">
                                      <p className="font-black text-sm text-foreground tracking-tight">{item.product?.name}</p>
                                      <p className="text-[9px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mt-1">ID: {item.product?.id.slice(0,8).toUpperCase()}</p>
                                  </td>
                                  <td className="px-4 py-6 text-center font-black text-foreground text-sm">{item.quantity}</td>
                                  <td className="px-8 py-6 text-right font-bold text-on-surface-variant text-xs">{fmtCurrency(Number(item.costPrice))}</td>
                                  <td className="px-8 py-6 text-right font-black text-foreground text-sm tracking-tight">{fmtCurrency(item.quantity * Number(item.costPrice))}</td>
                              </tr>
                          ))}
                      </tbody>
                      <tfoot className="bg-surface-low/30">
                          <tr>
                              <td colSpan={3} className="px-8 py-10 text-right text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-60">Monto Total Invertido</td>
                              <td className="px-8 py-10 text-right text-2xl font-black text-primary tracking-tighter">{fmtCurrency(Number(purchase.total))}</td>
                          </tr>
                      </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        
        {/* Detail Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-card/80 backdrop-blur-xl border-t border-outline-variant/30 flex items-center gap-4">
           <button className="flex-1 h-[60px] bg-primary text-on-primary rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:opacity-90 shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 active:scale-95">
              <FileText className="w-5 h-5" /> Generar Comprobante
           </button>
           <button onClick={onClose} className="px-8 h-[60px] bg-surface-low text-on-surface-variant rounded-[24px] font-black text-[11px] uppercase tracking-widest border border-outline-variant/30 hover:bg-card transition-all">
              Cerrar
           </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const LIMIT = 10;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getPurchases(params);
      setPurchases(res.data);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 w-full overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-10 pb-32">
          <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
            
            {/* Optimized Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Ciclo de Abastecimiento</p>
                <h1 className="text-3xl lg:text-5xl font-black text-foreground tracking-tighter leading-none">Compras</h1>
                <p className="text-sm text-on-surface-variant font-medium mt-2 max-w-lg">Gestión integral de adquisiciones, control de costos y stock entrante.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push('/dashboard/purchases/new')}
                  className="w-full lg:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-primary text-on-primary rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:opacity-90 shadow-2xl shadow-primary/30 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nueva Compra</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid - Premium ERP Styling */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {[
                { label: 'Total Órdenes', value: total, icon: ShoppingCart, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Pendientes', value: purchases.filter(p => p.status === 'PENDING').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { label: 'Recibidas', value: purchases.filter(p => p.status === 'COMPLETED').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Canceladas', value: purchases.filter(p => p.status === 'CANCELLED').length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
              ].map((m, i) => (
                <div key={i} className="bg-card p-6 lg:p-8 rounded-[32px] border border-outline-variant/30 shadow-sm group hover:shadow-xl transition-all">
                   <div className="flex items-center justify-between mb-6">
                      <div className={`${m.bg} ${m.color} w-12 h-12 rounded-2xl flex items-center justify-center border border-current/10`}>
                        <m.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-on-surface-variant/20 tracking-tighter">0{i+1}</span>
                   </div>
                   <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2 opacity-60">{m.label}</p>
                   <p className="text-2xl lg:text-4xl font-black text-foreground tracking-tighter leading-none">{m.value.toLocaleString('es-PE')}</p>
                </div>
              ))}
            </div>

            {/* Standardized Filter Bar (52px) */}
            <div className="bg-card rounded-[32px] border border-outline-variant/30 shadow-sm p-3">
               <div className="flex flex-col lg:flex-row items-center gap-3">
                  <div className="flex items-center gap-4 bg-surface-low border border-outline-variant/20 rounded-[24px] px-6 h-[52px] flex-1 shadow-inner focus-within:bg-card focus-within:border-primary/40 transition-all w-full">
                    <Search className="w-5 h-5 text-on-surface-variant/40 flex-shrink-0" />
                    <input 
                      placeholder="Buscar por ID de orden o proveedor..."
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      className="bg-transparent text-sm font-bold text-foreground outline-none flex-1 placeholder:text-on-surface-variant/30"
                    />
                    {searchInput && (
                      <button onClick={() => setSearchInput('')} className="text-on-surface-variant/40 hover:text-primary transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none">
                      <select 
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-full lg:w-[200px] h-[52px] pl-6 pr-12 bg-surface-low border border-outline-variant/20 rounded-[24px] text-[10px] font-black text-on-surface-variant uppercase tracking-widest focus:outline-none focus:border-primary/40 shadow-inner cursor-pointer appearance-none"
                      >
                        <option value="">Todos los Estados</option>
                        <option value="COMPLETED">Recibido</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="CANCELLED">Cancelado</option>
                      </select>
                      <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 pointer-events-none rotate-90" />
                    </div>
                  </div>
               </div>
            </div>

            {/* Content Area - Card Grid (Mobile) / Table (Desktop) */}
            <div className="bg-card rounded-[48px] border border-outline-variant/30 shadow-sm overflow-hidden min-h-[400px]">
               
               {/* MOBILE VIEW (lg:hidden) */}
               <div className="lg:hidden divide-y divide-outline-variant/10">
                  {loading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="p-6 space-y-4 animate-pulse">
                        <div className="flex justify-between"><div className="h-4 bg-surface-low rounded w-24" /><div className="h-4 bg-surface-low rounded w-20" /></div>
                        <div className="h-8 bg-surface-low rounded w-3/4" />
                      </div>
                    ))
                  ) : purchases.length === 0 ? (
                    <div className="p-16 text-center">
                      <ShoppingCart className="w-16 h-16 text-on-surface-variant/10 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Sin órdenes registradas</p>
                    </div>
                  ) : purchases.map(purchase => (
                    <div 
                      key={purchase.id} 
                      className="p-6 space-y-6 hover:bg-primary/[0.02] active:bg-primary/[0.05] transition-colors cursor-pointer"
                      onClick={() => setSelectedId(purchase.id)}
                    >
                      <div className="flex justify-between items-start">
                         <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                            #PO-{purchase.id.slice(0, 4).toUpperCase()}
                         </span>
                         <StatusBadge status={purchase.status} />
                      </div>

                      <div>
                         <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Proveedor</p>
                         <p className="text-base font-black text-foreground tracking-tight">{purchase.supplier?.name}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-surface-low p-4 rounded-2xl border border-outline-variant/30">
                            <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Total Inversión</p>
                            <p className="text-sm font-black text-foreground tracking-tight">{fmtCurrency(Number(purchase.total))}</p>
                         </div>
                         <div className="bg-surface-low p-4 rounded-2xl border border-outline-variant/30 text-right">
                            <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Fecha</p>
                            <p className="text-xs font-black text-foreground uppercase">{fmtDate(purchase.createdAt)}</p>
                         </div>
                      </div>
                    </div>
                  ))}
               </div>

               {/* DESKTOP VIEW (lg:block) */}
               <div className="hidden lg:block overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-low/30 text-[10px] font-black text-on-surface-variant tracking-[0.3em] uppercase">
                          <th className="px-10 py-8 border-b border-outline-variant/30">Referencia</th>
                          <th className="px-8 py-8 border-b border-outline-variant/30">Socio Comercial</th>
                          <th className="px-8 py-8 border-b border-outline-variant/30">Inversión Total</th>
                          <th className="px-8 py-8 border-b border-outline-variant/30 text-center">Estado</th>
                          <th className="px-10 py-8 border-b border-outline-variant/30 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/20">
                        {loading ? (
                          Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              <td colSpan={5} className="px-10 py-8"><div className="h-6 bg-surface-low rounded-xl w-full" /></td>
                            </tr>
                          ))
                        ) : (
                          purchases.map(purchase => (
                            <tr key={purchase.id} 
                                className="group hover:bg-primary/[0.02] transition-all cursor-pointer"
                                onClick={() => setSelectedId(purchase.id)}>
                                <td className="px-10 py-8">
                                    <span className="text-[11px] font-black text-primary uppercase tracking-wider bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                                        #PO-{purchase.id.slice(0, 4).toUpperCase()}
                                    </span>
                                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-3 ml-1">{fmtDate(purchase.createdAt)}</p>
                                </td>
                                <td className="px-8 py-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-primary text-on-primary rounded-[20px] flex items-center justify-center text-xl font-black shadow-lg shadow-primary/10 transition-transform group-hover:rotate-6 group-hover:scale-110">
                                            {purchase.supplier?.name?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{purchase.supplier?.name}</p>
                                            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">RUC: {purchase.supplier?.dniRuc}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-8">
                                    <p className="text-lg font-black text-foreground tracking-tighter">{fmtCurrency(Number(purchase.total))}</p>
                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-1 opacity-60">Procesado</p>
                                </td>
                                <td className="px-8 py-8 text-center">
                                    <StatusBadge status={purchase.status} />
                                </td>
                                <td className="px-10 py-8 text-right" onClick={e => e.stopPropagation()}>
                                    <button 
                                        onClick={() => setSelectedId(purchase.id)}
                                        className="w-12 h-12 bg-surface-low hover:bg-primary text-on-surface-variant hover:text-on-primary rounded-2xl border border-outline-variant/30 hover:border-primary transition-all active:scale-95 shadow-sm inline-flex items-center justify-center"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                  </table>
               </div>

               {/* Standardized Pagination */}
               <div className="px-10 py-8 bg-surface-low/30 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
                      Página {page} de {totalPages} <span className="mx-2">•</span> {total} Órdenes Registradas
                  </p>
                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setPage(p => Math.max(1, p-1))} 
                        disabled={page === 1}
                        className="w-12 h-12 rounded-2xl border border-outline-variant/30 bg-card flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-low disabled:opacity-30 transition-all active:scale-90 shadow-sm"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                            if (p < 1 || p > totalPages) return null;
                            return (
                                <button key={p} onClick={() => setPage(p)}
                                    className={`w-12 h-12 rounded-2xl text-xs font-black transition-all active:scale-90 shadow-sm ${p === page ? 'bg-primary text-on-primary shadow-xl shadow-primary/20' : 'bg-card border border-outline-variant/30 text-on-surface-variant hover:border-primary/40'}`}>
                                    {p}
                                </button>
                            );
                        })}
                      </div>
                      <button 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                        disabled={page === totalPages}
                        className="w-12 h-12 rounded-2xl border border-outline-variant/30 bg-card flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-low disabled:opacity-30 transition-all active:scale-90 shadow-sm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Drawer Overlay */}
      {selectedId && <PurchaseDetailDrawer id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

