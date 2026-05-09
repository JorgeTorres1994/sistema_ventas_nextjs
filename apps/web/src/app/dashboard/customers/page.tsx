"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import {
  Search, UserPlus, ChevronLeft, ChevronRight, MoreVertical,
  X, Mail, Phone, MapPin, ShoppingBag, TrendingUp, Calendar,
  User, Hash, CheckCircle, AlertCircle, Edit2, ToggleLeft,
  ToggleRight, Users, UserCheck, UserMinus
} from 'lucide-react';
import { getCustomers, getCustomerById, toggleCustomerStatus, getCustomerStats } from '@/lib/api';

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
    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Activo</span>
  ) : (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20">Inactivo</span>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  const colors = ['bg-primary/10 text-primary', 'bg-emerald-500/10 text-emerald-500', 'bg-amber-500/10 text-amber-500', 'bg-rose-500/10 text-rose-500', 'bg-violet-500/10 text-violet-500'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-9 h-9 text-sm';
  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center font-black flex-shrink-0`}>
      {initials(name)}
    </div>
  );
}

// ── Customer Detail Drawer ─────────────────────────────────────────────────────
function CustomerDetailDrawer({
  customerId,
  onClose,
  onEdit,
  onStatusChange
}: {
  customerId: string;
  onClose: () => void;
  onEdit: (c: any) => void;
  onStatusChange?: () => void;
}) {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCustomerById(customerId)
      .then(setCustomer)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customerId]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const updated = await toggleCustomerStatus(customerId);
      setCustomer((prev: any) => ({ ...prev, isActive: updated.isActive }));
      if (onStatusChange) onStatusChange();
    } catch (e) { console.error(e); }
    finally { setToggling(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-card h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 border-l border-outline-variant"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-card">
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-low flex items-center justify-center transition-colors active:scale-90">
            <X className="w-4 h-4 text-on-surface-variant/40" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => customer && onEdit(customer)} className="w-8 h-8 rounded-full hover:bg-surface-low flex items-center justify-center transition-colors active:scale-90">
              <Edit2 className="w-4 h-4 text-on-surface-variant/40" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 overflow-y-auto bg-card">
            {/* Profile */}
            <div className="px-6 py-8 text-center border-b border-outline-variant/30 bg-card">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar name={customer.name} size="lg" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card ${customer.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>
              </div>
              <h2 className="text-xl font-black text-foreground">{customer.name}</h2>
              <p className="text-sm text-on-surface-variant font-medium mt-0.5">DNI: {customer.dni}</p>
              <div className="mt-3">
                <StatusBadge isActive={customer.isActive} />
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-5 grid grid-cols-2 gap-4 border-b border-outline-variant/30 bg-card">
              <div className="bg-card border border-outline-variant rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Total Gastado</p>
                <p className="text-xl font-black text-foreground">{fmtCurrency(customer.stats?.totalSpent ?? 0)}</p>
                <p className="text-[10px] text-primary font-bold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {customer.stats?.purchaseCount ?? 0} compras
                </p>
              </div>
              <div className="bg-card border border-outline-variant rounded-2xl p-4 shadow-sm">
                <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Última Compra</p>
                <p className="text-sm font-black text-foreground">
                  {customer.stats?.lastPurchase ? fmtDate(customer.stats.lastPurchase) : 'Nunca'}
                </p>
                <p className="text-[10px] text-on-surface-variant/40 font-bold mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Registro de actividad
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="px-6 py-5 space-y-4 border-b border-slate-100 bg-white">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Información de Contacto</h3>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Correo Electrónico</p>
                  <p className="text-sm font-bold text-slate-900">{customer.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Número de Teléfono</p>
                  <p className="text-sm font-bold text-slate-900">{customer.phone || '—'}</p>
                </div>
              </div>
              {customer.address && (
                <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Dirección</p>
                    <p className="text-sm font-bold text-slate-900">{customer.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent transactions */}
            <div className="px-6 py-5 bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-on-surface-variant/40 uppercase tracking-widest">Transacciones Recientes</h3>
                <span className="text-xs font-black text-primary">{customer._count?.sales ?? customer.sales?.length ?? 0} total</span>
              </div>
              <div className="space-y-3">
                {customer.sales?.slice(0, 5).map((sale: any) => (
                  <div key={sale.id} className="flex items-center gap-3 p-3 bg-card border border-outline-variant rounded-xl hover:bg-surface-low transition-colors group shadow-sm">
                    <div className="w-9 h-9 bg-surface-low rounded-xl flex items-center justify-center flex-shrink-0 border border-outline-variant group-hover:border-primary/20">
                      <ShoppingBag className="w-4 h-4 text-on-surface-variant/40 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground truncate group-hover:text-primary transition-colors">
                        {sale.items?.[0]?.product?.name ?? 'Venta'}
                      </p>
                      <p className="text-xs text-on-surface-variant/40 font-mono">Ref: #{sale.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-foreground">{fmtCurrency(Number(sale.total))}</p>
                      <p className="text-[10px] text-on-surface-variant/40">{sale.createdAt ? fmtDate(sale.createdAt) : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        {customer && (
          <div className="px-6 py-4 border-t border-outline-variant flex items-center gap-3 bg-card">
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95 ${
                customer.isActive
                  ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
              }`}
            >
              {toggling ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : customer.isActive ? (
                <ToggleLeft className="w-4 h-4" />
              ) : (
                <ToggleRight className="w-4 h-4" />
              )}
              {customer.isActive ? 'Desactivar' : 'Activar'}
            </button>
            <button
              onClick={() => customer && onEdit(customer)}
              className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-black text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> Editar Cliente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, withPurchases: 0 });

  const LIMIT = 10;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (search) params.search = search;
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;
      const res = await getCustomers(params);
      setCustomers(res.data);
      setTotal(res.total);
      
      const statsRes = await getCustomerStats();
      setStats(statsRes);
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
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-20">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                  <span>CRM</span><span>/</span>
                  <span className="text-on-surface-variant">Base de Clientes</span>
                </nav>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Gestión de Clientes</h1>
                <p className="text-sm font-medium text-on-surface-variant max-w-xl">Supervisión de relaciones comerciales, historial de consumo y perfiles de fidelidad.</p>
              </div>
              
              <div className="flex items-center">
                <button
                  onClick={() => router.push('/dashboard/customers/new')}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-[22px] text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                >
                  <UserPlus className="w-5 h-5" /> Agregar Cliente
                </button>
              </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
              <div className="bg-card p-6 lg:p-8 rounded-[32px] shadow-sm border border-outline-variant relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                   <Users className="w-24 h-24 text-primary" />
                </div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Base Total</p>
                <h3 className="text-4xl font-black text-foreground tracking-tighter">{stats.total}</h3>
              </div>

              <div className="bg-card p-6 lg:p-8 rounded-[32px] shadow-sm border border-outline-variant relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                   <UserCheck className="w-24 h-24 text-emerald-500" />
                </div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Cartera Activa</p>
                <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">{stats.active}</h3>
              </div>

              <div className="bg-card p-6 lg:p-8 rounded-[32px] shadow-sm border border-outline-variant relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                   <UserMinus className="w-24 h-24 text-rose-500" />
                </div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Inactivos</p>
                <h3 className="text-4xl font-black text-rose-600 tracking-tighter">{stats.inactive}</h3>
              </div>

              <div className="bg-card p-6 lg:p-8 rounded-[32px] shadow-sm border border-outline-variant relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                   <ShoppingBag className="w-24 h-24 text-amber-500" />
                </div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Convertidos</p>
                <h3 className="text-4xl font-black text-amber-600 tracking-tighter">{stats.withPurchases}</h3>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-card rounded-[40px] border border-outline-variant shadow-sm overflow-hidden mb-8">
              <div className="p-6 lg:p-8 border-b border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-low/30">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/30" />
                  <input
                    placeholder="Filtrar por nombre, DNI o correo..."
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-surface-low border border-transparent rounded-[24px] text-sm font-black focus:bg-card focus:border-primary/40 transition-all outline-none text-foreground shadow-inner placeholder:text-on-surface-variant/20"
                  />
                  {searchInput && (
                    <button onClick={() => setSearchInput('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="flex-1 lg:flex-none px-6 py-4 bg-surface-low border border-transparent rounded-[22px] text-[10px] font-black text-foreground outline-none cursor-pointer hover:bg-card transition-all shadow-inner uppercase tracking-widest"
                  >
                    <option value="">Todos los Estados</option>
                    <option value="active">Solo Activos</option>
                    <option value="inactive">Solo Inactivos</option>
                  </select>
                </div>
              </div>

              {/* Hybrid Data Display */}
              <div className="space-y-4 lg:space-y-0">
                {/* Mobile Cards */}
                <div className="lg:hidden p-4 space-y-6">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="bg-surface-low rounded-[32px] h-48 animate-pulse"></div>
                    ))
                  ) : customers.length === 0 ? (
                    <div className="py-20 text-center">
                      <Users className="w-12 h-12 text-on-surface-variant/10 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Sin registros de clientes</p>
                    </div>
                  ) : (
                    customers.map((customer) => (
                      <div key={customer.id} 
                        onClick={() => setSelectedId(customer.id)}
                        className="bg-surface-low/30 rounded-[32px] p-6 border border-outline-variant/30 shadow-sm active:scale-[0.98] transition-all"
                      >
                         <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                               <div className="relative">
                                  <Avatar name={customer.name} />
                                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${customer.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                               </div>
                               <div>
                                  <p className="text-base font-black text-foreground tracking-tight line-clamp-1">{customer.name}</p>
                                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">DNI: {customer.dni}</p>
                               </div>
                            </div>
                            <button className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-on-surface-variant border border-outline-variant"><MoreVertical className="w-4 h-4" /></button>
                         </div>
                         
                         <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Contacto</span>
                               <span className="text-xs font-bold text-foreground truncate max-w-[200px]">{customer.email || 'Sin correo'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Actividad</span>
                               <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2.5 py-1 rounded-lg">{customer._count?.sales ?? 0} Ventas</span>
                            </div>
                         </div>

                         <div className="flex gap-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedId(customer.id); }}
                              className="flex-1 py-3.5 bg-primary/10 text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                            >
                              Ver Perfil
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/customers/${customer.id}/edit`); }}
                              className="flex-1 py-3.5 bg-surface-low text-on-surface-variant border border-outline-variant/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-card transition-all"
                            >
                              Editar
                            </button>
                         </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                  <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead>
                      <tr className="bg-surface-low/30 border-b border-outline-variant/30">
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Identidad del Cliente</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Documentación</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Información de Enlace</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Estado</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Gestión</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={5} className="px-10 py-8 h-24 bg-surface-low/10"></td>
                          </tr>
                        ))
                      ) : customers.length === 0 ? (
                        <tr>
                           <td colSpan={5} className="px-10 py-32 text-center">
                              <Users className="w-16 h-16 text-on-surface-variant/10 mx-auto mb-6" />
                              <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">No hay registros de clientes en la base de datos</p>
                           </td>
                        </tr>
                      ) : (
                        customers.map(customer => (
                          <tr key={customer.id}
                            className="hover:bg-primary/[0.02] transition-colors group cursor-pointer"
                            onClick={() => setSelectedId(customer.id)}
                          >
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-6">
                                <div className="relative transition-transform group-hover:scale-110">
                                  <Avatar name={customer.name} />
                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${customer.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                </div>
                                <div>
                                  <p className="text-lg font-black text-foreground tracking-tighter leading-tight">{customer.name}</p>
                                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">{customer._count?.sales ?? 0} Ventas acumuladas</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                   <Hash className="w-3 h-3" /> Documento Nacional
                                </span>
                                <span className="text-base font-black text-foreground font-mono tracking-wider">{customer.dni}</span>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-foreground tracking-tight">{customer.email || 'Sin correo registrado'}</span>
                                <span className="text-[11px] text-on-surface-variant font-bold mt-1.5">{customer.phone || 'Sin teléfono'}</span>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <StatusBadge isActive={!!customer.isActive} />
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex items-center justify-center gap-3">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedId(customer.id); }}
                                  className="w-11 h-11 bg-surface-low text-on-surface-variant hover:text-primary hover:bg-primary/10 border border-outline-variant/50 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                                >
                                  <Edit2 className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/customers/${customer.id}/edit`); }}
                                  className="w-11 h-11 bg-surface-low text-on-surface-variant hover:text-rose-600 hover:bg-rose-500/10 border border-outline-variant/50 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                                >
                                  <MoreVertical className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Premium Pagination */}
                <div className="px-8 py-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between bg-surface-low/30 gap-6">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Página {page} de {totalPages}</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="w-12 h-12 rounded-[18px] border border-outline-variant/50 flex items-center justify-center hover:bg-card text-on-surface-variant disabled:opacity-30 transition-all active:scale-90"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="hidden sm:flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        if (p < 1 || p > totalPages) return null;
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            className={`w-12 h-12 rounded-[18px] text-[11px] font-black transition-all active:scale-90 ${p === page ? 'bg-primary text-on-primary shadow-xl shadow-primary/20' : 'border border-outline-variant/50 text-on-surface-variant hover:bg-card'}`}>
                            {p}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="w-12 h-12 rounded-[18px] border border-outline-variant/50 flex items-center justify-center hover:bg-card text-on-surface-variant disabled:opacity-30 transition-all active:scale-90"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Drawer - Responsive Overhaul */}
      {selectedId && (
        <CustomerDetailDrawer
          customerId={selectedId}
          onClose={() => setSelectedId(null)}
          onEdit={(c) => { setSelectedId(null); router.push(`/dashboard/customers/${c.id}/edit`); }}
          onStatusChange={fetchData}
        />
      )}
    </div>
  );
}

