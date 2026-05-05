"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
  ArrowLeft, Download, Plus, ChevronLeft, ChevronRight,
  Package, TrendingUp, TrendingDown, BarChart3, Calendar, Filter,
  ArrowDownCircle, ArrowUpCircle
} from 'lucide-react';
import { getInventoryMovements } from '@/lib/api';

// ── Type Badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  if (type === 'IN')
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ENTRADA
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> SALIDA
    </span>
  );
}

// ── Reason Badge ──────────────────────────────────────────────────────────────
function ReasonBadge({ reason }: { reason: string }) {
  const map: Record<string, { label: string; color: string }> = {
    SALE:            { label: 'Venta a Cliente',     color: 'bg-blue-50 text-blue-600 border-blue-100' },
    PURCHASE:        { label: 'Orden de Compra',    color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    ADJUSTMENT:      { label: 'Ajuste Stock',  color: 'bg-amber-50 text-amber-600 border-amber-100' },
    SALE_CANCELLED:  { label: 'Venta Anulada',    color: 'bg-gray-50 text-gray-500 border-gray-100' },
    RETURN:          { label: 'Devolución',   color: 'bg-teal-50 text-teal-600 border-teal-100' },
    DAMAGE:          { label: 'Daño / Desmedro',  color: 'bg-rose-50 text-rose-600 border-rose-100' },
  };
  const cfg = map[reason] ?? { label: reason, color: 'bg-gray-50 text-gray-500 border-gray-100' };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MovementHistoryPage() {
  const router = useRouter();
  const [movements, setMovements] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({ totalIn: 0, totalOut: 0 });

  // Filters
  const [type, setType] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const LIMIT = 10;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventoryMovements({ page, limit: LIMIT, type, reason, startDate, endDate });
      setMovements(res.data);
      setTotal(res.total);
      setInsights(res.insights || { totalIn: 0, totalOut: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, type, reason, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-PE', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-y-auto transition-all duration-300">

        {/* Header */}
        <header className="px-4 lg:px-10 py-6 lg:py-8 bg-white/50 backdrop-blur-md border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sticky top-0 z-20">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 lg:mb-3">
              <button onClick={() => router.push('/dashboard/inventory')} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Inventario
              </button>
              <span className="opacity-30">/</span>
              <span className="text-indigo-600">Historial</span>
            </nav>
            <h1 className="text-2xl lg:text-4xl font-black text-gray-900 tracking-tight leading-none">Movimientos</h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/inventory')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 rounded-2xl text-xs font-black text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Ajuste Manual</span> <span className="sm:hidden">Nuevo</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-10 space-y-8 lg:space-y-10">

          {/* Filters */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Date Range */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Rango de Fechas
                </label>
                <div className="flex items-center gap-3">
                  <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }}
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-[10px] lg:text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 border-none appearance-none" />
                  <span className="text-gray-300 font-black">→</span>
                  <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }}
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-[10px] lg:text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 border-none appearance-none" />
                </div>
              </div>

              {/* Movement Type */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Filter className="w-3 h-3" /> Tipo
                </label>
                <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-xl text-[10px] lg:text-sm font-black text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 border-none cursor-pointer">
                  <option value="">Todos</option>
                  <option value="IN">ENTRADAS</option>
                  <option value="OUT">SALIDAS</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <Filter className="w-3 h-3" /> Motivo
                </label>
                <select value={reason} onChange={e => { setReason(e.target.value); setPage(1); }}
                  className="w-full px-5 py-3.5 bg-gray-50 rounded-xl text-[10px] lg:text-sm font-black text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 border-none cursor-pointer">
                  <option value="">Todos los Motivos</option>
                  <option value="SALE">Venta</option>
                  <option value="PURCHASE">Compra</option>
                  <option value="ADJUSTMENT">Ajuste</option>
                  <option value="SALE_CANCELLED">Anulación</option>
                </select>
              </div>
            </div>

            {(type || reason || startDate || endDate) && (
              <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-center gap-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filtros:</span>
                <div className="flex flex-wrap gap-2">
                  {type && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black">{type}</span>}
                </div>
                <button onClick={() => { setType(''); setReason(''); setStartDate(''); setEndDate(''); setPage(1); }}
                  className="sm:ml-auto w-full sm:w-auto text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline transition-all">
                  Limpiar Todo
                </button>
              </div>
            )}
          </div>

          {/* Movement Table */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            
            <div className="px-6 lg:px-8 py-4 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Logs de inventario
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/20 border-b border-gray-100">
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fecha y Hora</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Producto</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tipo</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Motivo</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cantidad</th>
                  <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Referencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-8 py-6">
                          <div className="h-4 bg-gray-100 rounded-full animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <BarChart3 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="font-black text-gray-400 uppercase tracking-widest text-sm">No se encontraron movimientos</p>
                      <p className="text-sm font-medium text-gray-300 mt-1">Intente ajustar sus criterios de búsqueda</p>
                    </td>
                  </tr>
                ) : (
                  movements.map(mv => (
                    <tr key={mv.id} className="hover:bg-gray-50/50 transition-colors group">
                      {/* Date */}
                      <td className="px-10 py-6">
                        <p className="text-sm font-black text-gray-900 leading-tight">{formatDate(mv.createdAt)}</p>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{formatTime(mv.createdAt)}</p>
                      </td>
                      {/* Product */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                            {mv.product?.imageUrl ? (
                              <img src={mv.product.imageUrl} alt={mv.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate max-w-[200px] leading-tight">{mv.product?.name ?? '—'}</p>
                            {mv.product?.category && (
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{mv.product.category.name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Type */}
                      <td className="px-6 py-6"><TypeBadge type={mv.type} /></td>
                      {/* Reason */}
                      <td className="px-6 py-6"><ReasonBadge reason={mv.reason ?? 'ADJUSTMENT'} /></td>
                      {/* Quantity */}
                      <td className="px-6 py-6">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-xl font-black ${mv.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {mv.type === 'IN' ? '+' : '-'}{mv.quantity}
                          </span>
                          <span className="text-[10px] text-gray-400 font-black uppercase">unid.</span>
                        </div>
                      </td>
                      {/* Reference */}
                      <td className="px-10 py-6">
                        <span className="text-[10px] font-black text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded-lg">
                          REF-{mv.referenceId?.substring(0,8).toUpperCase() ?? 'MANUAL'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>

            {/* Pagination */}
            <div className="px-10 py-5 bg-white border-t border-gray-100 flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Página {page} de {totalPages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-all text-gray-400">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${p === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-all text-gray-400">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Insights & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Inventory Insights Card */}
            <div className="lg:col-span-2 bg-indigo-600 rounded-[32px] p-10 border border-indigo-700 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white mb-3">Perspectiva Estratégica</h3>
                <p className="text-indigo-100 font-medium mb-12 max-w-sm opacity-80">
                  Visibilidad total del flujo de mercancías. Monitoree las tendencias de entrada y salida para optimizar su reabastecimiento proactivo.
                </p>
                <div className="flex items-end gap-16">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
                      <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Ingresos Totales</span>
                    </div>
                    <p className="text-5xl font-black text-white">
                      {insights.totalIn >= 1000 ? `${(insights.totalIn / 1000).toFixed(1)}k` : insights.totalIn}
                    </p>
                  </div>
                  <div className="w-px h-16 bg-white/10" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpCircle className="w-5 h-5 text-rose-400" />
                      <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">Salidas Totales</span>
                    </div>
                    <p className="text-5xl font-black text-white">
                      {insights.totalOut >= 1000 ? `${(insights.totalOut / 1000).toFixed(1)}k` : insights.totalOut}
                    </p>
                  </div>
                </div>
              </div>
              <TrendingUp className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-[0.03] group-hover:scale-110 transition-transform duration-700 select-none pointer-events-none" />
            </div>

            {/* Recent Activity Mini-List */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-xs font-black text-gray-900 mb-8 flex items-center justify-between uppercase tracking-widest">
                Actividad Reciente
                <BarChart3 className="w-4 h-4 text-gray-200" />
              </h3>
              <div className="space-y-6 flex-1">
                {movements.slice(0, 5).map(mv => (
                  <div key={mv.id} className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${mv.type === 'IN' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-800 truncate leading-none mb-1">
                        {mv.type === 'IN' ? 'Ingreso de Stock' : 'Salida de Stock'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold truncate uppercase">{mv.product?.name ?? '—'}</p>
                    </div>
                    <span className={`text-xs font-black flex-shrink-0 ${mv.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {mv.type === 'IN' ? '+' : '-'}{mv.quantity}
                    </span>
                  </div>
                ))}
                {movements.length === 0 && !loading && (
                  <div className="text-center py-6">
                    <p className="text-xs text-gray-200 font-black uppercase">Sin registros recientes</p>
                  </div>
                )}
                {loading && Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
              <button onClick={() => { setType(''); setReason(''); setPage(1); }}
                className="mt-8 w-full py-3.5 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest transition-all">
                Ver Todos los Logs
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
