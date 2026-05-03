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
    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100">Activo</span>
  ) : (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-600 border border-rose-100">Inactivo</span>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  const colors = ['bg-violet-100 text-violet-700', 'bg-blue-100 text-blue-700', 'bg-teal-100 text-teal-700', 'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700'];
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
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => customer && onEdit(customer)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : customer ? (
          <div className="flex-1 overflow-y-auto">
            {/* Profile */}
            <div className="px-6 py-8 bg-gradient-to-b from-indigo-50 to-white text-center border-b border-gray-100">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar name={customer.name} size="lg" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${customer.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                </div>
              </div>
              <h2 className="text-xl font-black text-gray-900">{customer.name}</h2>
              <p className="text-sm text-gray-400 font-medium mt-0.5">DNI: {customer.dni}</p>
              <div className="mt-3">
                <StatusBadge isActive={customer.isActive} />
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-5 grid grid-cols-2 gap-4 border-b border-gray-100">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Gastado</p>
                <p className="text-xl font-black text-gray-900">{fmtCurrency(customer.stats?.totalSpent ?? 0)}</p>
                <p className="text-[10px] text-indigo-500 font-bold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {customer.stats?.purchaseCount ?? 0} compras
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Última Compra</p>
                <p className="text-sm font-black text-gray-900">
                  {customer.stats?.lastPurchase ? fmtDate(customer.stats.lastPurchase) : 'Nunca'}
                </p>
                <p className="text-[10px] text-gray-400 font-bold mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Registro de actividad
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="px-6 py-5 space-y-4 border-b border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Información de Contacto</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Correo Electrónico</p>
                  <p className="text-sm font-bold text-gray-900">{customer.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Número de Teléfono</p>
                  <p className="text-sm font-bold text-gray-900">{customer.phone || '—'}</p>
                </div>
              </div>
              {customer.address && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Dirección</p>
                    <p className="text-sm font-bold text-gray-900">{customer.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent transactions */}
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Transacciones Recientes</h3>
                <span className="text-xs font-bold text-indigo-600">{customer._count?.sales ?? customer.sales?.length ?? 0} total</span>
              </div>
              <div className="space-y-3">
                {customer.sales?.slice(0, 5).map((sale: any) => (
                  <div key={sale.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <ShoppingBag className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-800 truncate">
                        {sale.items?.[0]?.product?.name ?? 'Venta'}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">Ref: #{sale.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-gray-900">{fmtCurrency(Number(sale.total))}</p>
                      <p className="text-[10px] text-gray-400">{sale.createdAt ? fmtDate(sale.createdAt) : ''}</p>
                    </div>
                  </div>
                ))}
                {(!customer.sales || customer.sales.length === 0) && (
                  <div className="text-center py-6">
                    <ShoppingBag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-300 font-bold">Sin transacciones aún</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer */}
        {customer && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                customer.isActive
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
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
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
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
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-hidden">
        <TopBar />

        {/* Module Header */}
        <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Gestión</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Clientes</h1>
            <p className="text-sm text-gray-400 font-medium mt-1">Gestione sus relaciones con los clientes y vea el historial de transacciones.</p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => router.push('/dashboard/customers/new')}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-black text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
            >
              <UserPlus className="w-4 h-4" /> Agregar Cliente
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 flex-1 min-w-64">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                placeholder="Filtrar por nombre, DNI o correo..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none flex-1"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="text-gray-300 hover:text-gray-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 focus:outline-none"
            >
              <option value="">Todos los Estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Clientes</p>
                <h3 className="text-2xl font-black text-gray-900">{stats.total}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Activos</p>
                <h3 className="text-2xl font-black text-emerald-600">{stats.active}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <UserMinus className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Inactivos</p>
                <h3 className="text-2xl font-black text-rose-600">{stats.inactive}</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Con Compras</p>
                <h3 className="text-2xl font-black text-amber-600">{stats.withPurchases}</h3>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400">
                Mostrando {total === 0 ? 0 : (page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total} clientes
              </p>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">DNI / Identidad</th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Información de Contacto</th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <User className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="font-black text-gray-400">No se encontraron clientes</p>
                    </td>
                  </tr>
                ) : (
                  customers.map(customer => (
                    <tr key={customer.id}
                      className="hover:bg-gray-50/60 transition-colors group">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar name={customer.name} />
                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${customer.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          </div>
                          <div>
                            <p className="font-black text-sm text-gray-900">{customer.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{customer._count?.sales ?? 0} compras</p>
                          </div>
                        </div>
                      </td>
                      {/* DNI */}
                      <td className="px-4 py-4">
                        <p className="text-sm font-bold text-gray-700 font-mono">{customer.dni}</p>
                      </td>
                      {/* Contact */}
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-gray-700">{customer.email || '—'}</p>
                        <p className="text-xs text-gray-400">{customer.phone || ''}</p>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-4"><StatusBadge isActive={!!customer.isActive} /></td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedId(customer.id); }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-black transition-colors">
                            Ver
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/customers/${customer.id}/edit`); }}
                            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-black transition-colors">
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-400">Página {page} de {totalPages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-black transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Detail Drawer */}
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
