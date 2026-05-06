"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import {
  Search, Plus, ChevronLeft, ChevronRight, X, Mail, Phone, MapPin, 
  ShoppingBag, TrendingUp, Calendar, Building2, CheckCircle, AlertCircle, 
  Edit2, ToggleLeft, ToggleRight, Hash
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
    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center w-max gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVO
    </span>
  ) : (
    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-600 border border-amber-100 flex items-center w-max gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> EN ESPERA
    </span>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  const colors = ['bg-indigo-100 text-indigo-700', 'bg-blue-100 text-blue-700', 'bg-teal-100 text-teal-700', 'bg-sky-100 text-sky-700', 'bg-slate-100 text-slate-700'];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sizeClass} ${color} rounded-xl flex items-center justify-center font-black flex-shrink-0`}>
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
            <button onClick={() => supplier && onEdit(supplier)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Edit2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : supplier ? (
          <div className="flex-1 overflow-y-auto">
            {/* Profile */}
            <div className="px-6 py-8 bg-gradient-to-b from-blue-50 to-white text-left border-b border-gray-100">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-black">
                    {initials(supplier.name)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${supplier.isActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                </div>
                <div className="flex-1 pt-1">
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">{supplier.name}</h2>
                  <p className="text-sm text-gray-500 font-medium mt-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold tracking-wide uppercase">PROVEEDOR</span>
                    Socio desde {new Date(supplier.createdAt).getFullYear()}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="px-6 py-6 border-b border-gray-100">
              <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 mb-4">
                <p className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest mb-1">Total Compras</p>
                <p className="text-3xl font-black text-gray-900">{fmtCurrency(supplier.stats?.totalSpent ?? 0)}</p>
                <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Abastecimiento Activo
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pedidos Abiertos</p>
                  <p className="text-2xl font-black text-gray-900">
                    {supplier.stats?.purchaseCount?.toString().padStart(2, '0') ?? '00'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Última Compra</p>
                  <p className="text-sm font-black text-gray-900 leading-tight mt-1">
                    {supplier.stats?.lastPurchase ? fmtDate(supplier.stats.lastPurchase) : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="px-6 py-6 space-y-4 border-b border-gray-100">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> Información de Contacto
              </h3>
              
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100/50 space-y-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">DNI / RUC</p>
                  <p className="text-sm font-bold text-gray-900 font-mono">{supplier.dniRuc || '—'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Correo Electrónico</p>
                    <p className="text-sm font-medium text-gray-900 break-words">{supplier.email || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Teléfono</p>
                    <p className="text-sm font-medium text-gray-900">{supplier.phone || '—'}</p>
                  </div>
                </div>

                {supplier.address && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Dirección Completa</p>
                    <p className="text-sm font-medium text-gray-900 leading-relaxed">{supplier.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="px-6 py-6 pb-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-600" /> Órdenes Recientes
                </h3>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Ver Todos</button>
              </div>
              
              <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                      <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {supplier.purchases?.slice(0, 5).map((purchase: any) => (
                      <tr key={purchase.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-xs font-bold text-gray-600 font-mono">
                          #PO-{purchase.id.slice(0, 4).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                          {purchase.createdAt ? fmtDate(purchase.createdAt) : ''}
                        </td>
                        <td className="px-4 py-3 text-sm font-black text-gray-900 text-right">
                          {fmtCurrency(Number(purchase.total))}
                        </td>
                      </tr>
                    ))}
                    {(!supplier.purchases || supplier.purchases.length === 0) && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center bg-gray-50/30">
                          <p className="text-xs text-gray-400 font-bold">Sin órdenes recientes</p>
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
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 flex items-center gap-3">
            <button
              onClick={() => supplier && onEdit(supplier)}
              className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Crear Orden de Compra
            </button>
            <button
              onClick={handleToggle}
              disabled={toggling}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 ${
                supplier.isActive
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
              title={supplier.isActive ? 'Desactivar Proveedor' : 'Activar Proveedor'}
            >
              {toggling ? (
                <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              ) : supplier.isActive ? (
                <ToggleLeft className="w-5 h-5" />
              ) : (
                <ToggleRight className="w-5 h-5" />
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
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-hidden">
        <TopBar />

        {/* Module Header */}
        <div className="px-10 py-8 bg-transparent flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Proveedores</h1>
            <p className="text-base text-gray-500 font-medium">Gestione su red global de proveedores y cadenas de abastecimiento.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/suppliers/new')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-sm font-black text-white hover:bg-blue-700 shadow-lg shadow-blue-200/50 transition-all"
            >
              <Plus className="w-5 h-5" /> Agregar Proveedor
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-10 pb-10 space-y-6">

          {/* Filter Bar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-5 py-3 flex-1 shadow-sm">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                placeholder="Filtrar por nombre, región o categoría..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="bg-transparent text-sm font-medium text-gray-700 outline-none flex-1 placeholder:text-gray-400"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="text-gray-300 hover:text-gray-500 bg-gray-50 rounded-full p-1">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm text-sm font-bold text-gray-600">
               <Calendar className="w-4 h-4 text-gray-400" />
               <span>Últimos 30 Días</span>
            </div>

            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-5 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="">Estado: Todos</option>
              <option value="active">Activo</option>
              <option value="inactive">En Espera</option>
            </select>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-black text-gray-400 tracking-widest uppercase">
                  <th className="px-8 py-5">Nombre del Proveedor</th>
                  <th className="px-6 py-5">Categoría</th>
                  <th className="px-6 py-5">Persona de Contacto</th>
                  <th className="px-6 py-5">Correo</th>
                  <th className="px-6 py-5">Estado</th>
                  <th className="px-6 py-5">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-8 py-5">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="font-black text-lg text-gray-900 mb-1">No se encontraron proveedores</p>
                      <p className="text-sm font-medium text-gray-500">Intente ajustar sus filtros o agregue un nuevo proveedor.</p>
                    </td>
                  </tr>
                ) : (
                  suppliers.map(supplier => (
                    <tr key={supplier.id}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      onClick={() => setSelectedId(supplier.id)}>
                      {/* Name */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar name={supplier.name} />
                          <div>
                            <p className="font-black text-sm text-gray-900">{supplier.name}</p>
                            <p className="text-xs text-gray-500 font-medium">ID: SUP-{supplier.id.slice(0,5)}</p>
                          </div>
                        </div>
                      </td>
                      {/* Category - Stubbed for visual consistency with design */}
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-blue-100/50 text-blue-700 rounded-full text-[11px] font-black">
                          Partner
                        </span>
                      </td>
                      {/* Contact Person - Stubbed to map to Name or Contact if separate */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-gray-700">{supplier.name.split(' ')[0]} {supplier.name.split(' ')[1] || ''}</p>
                      </td>
                      {/* Email */}
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-gray-500">{supplier.email || '—'}</p>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-5">
                        <StatusBadge isActive={!!supplier.isActive} />
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedId(supplier.id); }}
                            className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-black transition-colors"
                          >
                           Detalles
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <p className="text-[11px] font-black text-gray-400 tracking-widest uppercase">
                Mostrando {total === 0 ? 0 : (page - 1) * LIMIT + 1} a {Math.min(page * LIMIT, total)} de {total} proveedores
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-black transition-all ${p === page ? 'bg-blue-600 text-white shadow-md shadow-blue-200/50' : 'text-gray-500 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-30 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
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
