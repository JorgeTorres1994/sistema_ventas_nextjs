"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import {
  Search, Plus, ChevronLeft, ChevronRight, X, Mail, Phone, MapPin, 
  ShoppingBag, TrendingUp, Calendar, Building2, CheckCircle, AlertCircle, 
  Edit2, ToggleLeft, ToggleRight, Hash, Clock
} from 'lucide-react';
import { getSuppliers, getSupplierById, toggleSupplierStatus } from '@/lib/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtCurrency(n: number) {
  return `S/ ${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center w-max gap-1.5 uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVO
    </span>
  ) : (
    <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center w-max gap-1.5 uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> EN ESPERA
    </span>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  const colors = ['bg-primary/10 text-primary', 'bg-blue-500/10 text-blue-500', 'bg-emerald-500/10 text-emerald-500', 'bg-purple-500/10 text-purple-500', 'bg-rose-500/10 text-rose-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-sm';
  return (
    <div className={`${sizeClass} ${color} rounded-2xl flex items-center justify-center font-black flex-shrink-0 border border-current/10 transition-all group-hover:scale-105`}>
      {size === 'lg' ? initials(name) : <Building2 className="w-5 h-5 opacity-70" />}
    </div>
  );
}

// ── Supplier Detail Drawer ─────────────────────────────────────────────────────
function SupplierDetailDrawer({
  supplierId,
  onClose,
  onEdit,
}: {
  supplierId: string;
  onClose: () => void;
  onEdit: (s: any) => void;
}) {
  const router = useRouter();
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    setLoading(true);
    getSupplierById(supplierId)
      .then(setSupplier)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [supplierId]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const updated = await toggleSupplierStatus(supplierId);
      setSupplier((prev: any) => ({ ...prev, isActive: updated.isActive }));
    } catch (e) { console.error(e); }
    finally { setToggling(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div
        className="relative w-full max-w-md bg-card h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 border-l border-outline-variant"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-outline-variant flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <button onClick={onClose} className="p-3 rounded-2xl hover:bg-surface-low flex items-center justify-center transition-all active:scale-90 text-on-surface-variant">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <button onClick={() => supplier && onEdit(supplier)} className="p-3 rounded-2xl hover:bg-surface-low flex items-center justify-center transition-all active:scale-90 text-on-surface-variant">
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : supplier ? (
          <div className="flex-1 overflow-y-auto pb-32">
            {/* Profile */}
            <div className="px-8 py-10 bg-gradient-to-b from-primary/5 to-transparent border-b border-outline-variant">
              <div className="flex items-start gap-5">
                <div className="relative group">
                  <div className="w-20 h-20 bg-primary text-on-primary rounded-3xl flex items-center justify-center text-2xl font-black shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform">
                    {initials(supplier.name)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-card ${supplier.isActive ? 'bg-emerald-500' : 'bg-amber-500'} shadow-sm`} />
                </div>
                <div className="flex-1 pt-1">
                  <h2 className="text-2xl font-black text-foreground leading-tight tracking-tight">{supplier.name}</h2>
                  <p className="text-xs text-on-surface-variant font-black mt-2 flex items-center gap-2 uppercase tracking-widest opacity-60">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[9px]">PROVEEDOR</span>
                    <span>Socio desde {new Date(supplier.createdAt).getFullYear()}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="px-8 py-8 space-y-6">
              <div className="bg-surface-low rounded-[32px] p-8 border border-outline-variant group hover:shadow-xl hover:border-primary/20 transition-all">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 opacity-60">Total Compras</p>
                <p className="text-4xl font-black text-foreground tracking-tighter">{fmtCurrency(supplier.stats?.totalSpent ?? 0)}</p>
                <p className="text-[10px] text-emerald-500 font-black mt-4 flex items-center gap-2 uppercase tracking-widest">
                  <TrendingUp className="w-4 h-4" /> Abastecimiento Activo
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-low rounded-[28px] p-6 border border-outline-variant">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2 opacity-60">Pedidos</p>
                  <p className="text-3xl font-black text-foreground tracking-tighter">
                    {supplier.stats?.purchaseCount?.toString().padStart(2, '0') ?? '00'}
                  </p>
                </div>
                <div className="bg-surface-low rounded-[28px] p-6 border border-outline-variant">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2 opacity-60">Última Compra</p>
                  <p className="text-xs font-black text-foreground uppercase tracking-widest leading-relaxed mt-1">
                    {supplier.stats?.lastPurchase ? fmtDate(supplier.stats.lastPurchase) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="px-8 py-8 space-y-6 border-y border-outline-variant bg-surface-low/30">
              <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                <Building2 className="w-4 h-4 text-primary" /> Información de Contacto
              </h3>
              
              <div className="grid gap-6">
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 opacity-60">DNI / RUC</p>
                  <p className="text-sm font-black text-foreground font-mono tracking-wider bg-card px-4 py-3 rounded-xl border border-outline-variant">{supplier.dniRuc || '—'}</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 opacity-60">Correo Electrónico</p>
                    <div className="flex items-center gap-3 bg-card px-4 py-3 rounded-xl border border-outline-variant">
                      <Mail className="w-4 h-4 text-primary/40" />
                      <p className="text-sm font-bold text-foreground break-all">{supplier.email || '—'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 opacity-60">Teléfono</p>
                    <div className="flex items-center gap-3 bg-card px-4 py-3 rounded-xl border border-outline-variant">
                      <Phone className="w-4 h-4 text-primary/40" />
                      <p className="text-sm font-bold text-foreground">{supplier.phone || '—'}</p>
                    </div>
                  </div>
                </div>

                {supplier.address && (
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 opacity-60">Dirección</p>
                    <div className="flex items-start gap-3 bg-card px-4 py-4 rounded-xl border border-outline-variant">
                      <MapPin className="w-4 h-4 text-primary/40 mt-0.5" />
                      <p className="text-sm font-medium text-foreground leading-relaxed">{supplier.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="px-8 py-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4 text-primary" /> Órdenes Recientes
                </h3>
                <button className="text-[10px] font-black text-primary hover:opacity-70 uppercase tracking-widest">Ver Todos</button>
              </div>
              
              <div className="rounded-3xl overflow-hidden border border-outline-variant bg-card shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-low/50">
                      <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-widest">ID</th>
                      <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Fecha</th>
                      <th className="px-6 py-4 text-[9px] font-black text-on-surface-variant uppercase tracking-widest text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {supplier.purchases?.slice(0, 5).map((purchase: any) => (
                      <tr key={purchase.id} className="hover:bg-primary/5 transition-all">
                        <td className="px-6 py-4 text-[11px] font-black text-foreground font-mono">
                          #PO-{purchase.id.slice(0, 4).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-[11px] text-on-surface-variant font-bold uppercase">
                          {purchase.createdAt ? fmtDate(purchase.createdAt) : ''}
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-foreground text-right tracking-tight">
                          {fmtCurrency(Number(purchase.total))}
                        </td>
                      </tr>
                    ))}
                    {(!supplier.purchases || supplier.purchases.length === 0) && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center">
                          <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40">Sin órdenes recientes</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        {supplier && (
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-card/80 backdrop-blur-md border-t border-outline-variant flex items-center gap-4">
            <button
              onClick={() => supplier && onEdit(supplier)}
              className="flex-1 py-4 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Nueva Orden
            </button>
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`p-4 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 active:scale-90 border-2 ${
                supplier.isActive
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
              }`}
              title={supplier.isActive ? 'Desactivar Proveedor' : 'Activar Proveedor'}
            >
              {toggling ? (
                <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : supplier.isActive ? (
                <ToggleLeft className="w-6 h-6" />
              ) : (
                <ToggleRight className="w-6 h-6" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const LIMIT = 10;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (search) params.search = search;
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;
      const res = await getSuppliers(params);
      setSuppliers(res.data);
      setTotal(res.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Abastecimiento Global</p>
                <h1 className="text-3xl lg:text-5xl font-black text-foreground tracking-tighter leading-none">Proveedores</h1>
                <p className="text-sm text-on-surface-variant font-medium mt-2 max-w-lg">Gestión estratégica y control de calidad de la red de suministros.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/dashboard/suppliers/new')}
                  className="w-full lg:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-primary text-on-primary rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:opacity-90 shadow-2xl shadow-primary/30 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nuevo Proveedor</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid - Premium ERP Styling */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {[
                { label: 'Proveedores', value: total, icon: Building2, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Activos', value: suppliers.filter(s => s.isActive).length, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'En Espera', value: suppliers.filter(s => !s.isActive).length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { label: 'Nuevos (Mes)', value: suppliers.filter(s => new Date(s.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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
                      placeholder="Buscar por nombre, RUC o email..."
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
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="w-full lg:w-[200px] h-[52px] pl-6 pr-12 bg-surface-low border border-outline-variant/20 rounded-[24px] text-[10px] font-black text-on-surface-variant uppercase tracking-widest focus:outline-none focus:border-primary/40 shadow-inner cursor-pointer appearance-none"
                      >
                        <option value="">Estado: Todos</option>
                        <option value="active">Activos</option>
                        <option value="inactive">En Espera</option>
                      </select>
                      <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 pointer-events-none rotate-90" />
                    </div>

                    <div className="hidden lg:flex items-center gap-3 h-[52px] px-6 bg-surface-low border border-outline-variant/20 rounded-[24px] text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest shadow-inner">
                       <Hash className="w-4 h-4" />
                       <span>{total} Total</span>
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
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-low rounded-2xl" />
                        <div className="space-y-2"><div className="h-4 bg-surface-low rounded w-32" /><div className="h-3 bg-surface-low rounded w-20" /></div>
                      </div>
                    </div>
                  ))
                ) : suppliers.length === 0 ? (
                  <div className="p-16 text-center">
                    <Building2 className="w-16 h-16 text-on-surface-variant/10 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Sin proveedores registrados</p>
                  </div>
                ) : suppliers.map(supplier => (
                  <div 
                    key={supplier.id} 
                    className="p-6 space-y-6 hover:bg-primary/[0.02] active:bg-primary/[0.05] transition-colors cursor-pointer"
                    onClick={() => setSelectedId(supplier.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar name={supplier.name} />
                        <div>
                          <p className="font-black text-base text-foreground tracking-tight">{supplier.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40">SUP-{supplier.id.slice(0,5).toUpperCase()}</p>
                        </div>
                      </div>
                      <StatusBadge isActive={!!supplier.isActive} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-surface-low p-4 rounded-2xl border border-outline-variant/30">
                          <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Contacto</p>
                          <p className="text-xs font-black text-foreground truncate">{supplier.phone || '—'}</p>
                       </div>
                       <div className="bg-surface-low p-4 rounded-2xl border border-outline-variant/30">
                          <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Email</p>
                          <p className="text-xs font-black text-foreground truncate">{supplier.email || '—'}</p>
                       </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                       <div>
                          <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Total Compras</p>
                          <p className="text-sm font-black text-primary tracking-tight">{fmtCurrency(supplier.stats?.totalSpent ?? 0)}</p>
                       </div>
                       <button className="px-6 py-2.5 bg-card border border-outline-variant/50 rounded-xl text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
                          Ficha
                       </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP VIEW (lg:block) */}
              <div className="hidden lg:block overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-low/30 text-[10px] font-black text-on-surface-variant tracking-[0.3em] uppercase">
                      <th className="px-8 py-8 border-b border-outline-variant/30">Identidad del Proveedor</th>
                      <th className="px-6 py-8 border-b border-outline-variant/30">DNI / RUC</th>
                      <th className="px-6 py-8 border-b border-outline-variant/30 text-center">Compras</th>
                      <th className="px-6 py-8 border-b border-outline-variant/30">Email / Contacto</th>
                      <th className="px-6 py-8 border-b border-outline-variant/30">Estado</th>
                      <th className="px-8 py-8 border-b border-outline-variant/30 text-right">Análisis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {loading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-8 py-8"><div className="h-6 bg-surface-low rounded-xl w-full" /></td>
                        </tr>
                      ))
                    ) : (
                      suppliers.map(supplier => (
                        <tr key={supplier.id}
                          className="hover:bg-primary/[0.02] transition-all cursor-pointer group"
                          onClick={() => setSelectedId(supplier.id)}>
                          <td className="px-8 py-8">
                            <div className="flex items-center gap-4">
                              <Avatar name={supplier.name} />
                              <div>
                                <p className="font-black text-base text-foreground tracking-tight group-hover:text-primary transition-colors">{supplier.name}</p>
                                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">SUP-{supplier.id.slice(0,5).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-8 font-mono text-[11px] font-bold text-foreground opacity-60 tracking-wider">
                            {supplier.dniRuc || '—'}
                          </td>
                          <td className="px-6 py-8 text-center">
                            <p className="text-sm font-black text-foreground tracking-tight">{fmtCurrency(supplier.stats?.totalSpent ?? 0)}</p>
                            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">{(supplier.stats?.purchaseCount || 0).toString().padStart(2, '0')} Órdenes</p>
                          </td>
                          <td className="px-6 py-8">
                            <p className="text-xs font-bold text-foreground tracking-tight mb-1">{supplier.email || '—'}</p>
                            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{supplier.phone || '—'}</p>
                          </td>
                          <td className="px-6 py-8">
                            <StatusBadge isActive={!!supplier.isActive} />
                          </td>
                          <td className="px-8 py-8 text-right" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedId(supplier.id); }}
                              className="px-6 py-3 bg-surface-low text-on-surface-variant hover:bg-primary hover:text-on-primary border border-outline-variant/30 hover:border-primary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                            >
                             Ver Ficha
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION FOOTER */}
              <div className="px-8 py-8 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between bg-surface-low/30 gap-6">
                <p className="text-[10px] font-black text-on-surface-variant tracking-widest uppercase opacity-60">
                  Página {page} de {totalPages} <span className="mx-2">•</span> {total} Entidades
                </p>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
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

      {/* Detail Drawer */}
      {selectedId && (
        <SupplierDetailDrawer
          supplierId={selectedId}
          onClose={() => setSelectedId(null)}
          onEdit={(s) => { setSelectedId(null); router.push(`/dashboard/suppliers/${s.id}/edit`); }}
        />
      )}
    </div>
  );
}

