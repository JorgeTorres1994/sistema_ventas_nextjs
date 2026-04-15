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
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />IN
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-100">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />OUT
    </span>
  );
}

// ── Reason Badge ──────────────────────────────────────────────────────────────
function ReasonBadge({ reason }: { reason: string }) {
  const map: Record<string, { label: string; color: string }> = {
    SALE:            { label: 'Customer Sale',     color: 'bg-blue-50 text-blue-600 border-blue-100' },
    PURCHASE:        { label: 'Purchase Order',    color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    ADJUSTMENT:      { label: 'Stock Adjustment',  color: 'bg-amber-50 text-amber-600 border-amber-100' },
    SALE_CANCELLED:  { label: 'Sale Cancelled',    color: 'bg-gray-50 text-gray-500 border-gray-100' },
    RETURN:          { label: 'Customer Return',   color: 'bg-teal-50 text-teal-600 border-teal-100' },
    DAMAGE:          { label: 'Damage/Shrinkage',  color: 'bg-rose-50 text-rose-600 border-rose-100' },
  };
  const cfg = map[reason] ?? { label: reason, color: 'bg-gray-50 text-gray-500 border-gray-100' };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black border ${cfg.color}`}>
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
      setInsights(res.insights);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, type, reason, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-y-auto">

        {/* Header */}
        <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-start justify-between sticky top-0 z-20">
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              <button onClick={() => router.push('/dashboard/inventory')} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Inventory
              </button>
              <span>/</span>
              <span className="text-indigo-600">Movement History</span>
            </nav>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Movement History</h1>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={() => router.push('/dashboard/inventory')}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-black text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
              <Plus className="w-4 h-4" /> Manual Adjustment
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 space-y-8">

          {/* Filters */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Date Range */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Date Range
                </label>
                <div className="flex items-center gap-2">
                  <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }}
                    className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 border-0" />
                  <span className="text-gray-300 font-bold">→</span>
                  <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setPage(1); }}
                    className="flex-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 border-0" />
                </div>
              </div>

              {/* Movement Type */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Filter className="w-3 h-3" /> Movement Type
                </label>
                <select value={type} onChange={e => { setType(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none">
                  <option value="">All Types</option>
                  <option value="IN">IN — Stock Added</option>
                  <option value="OUT">OUT — Stock Removed</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Filter className="w-3 h-3" /> Reason
                </label>
                <select value={reason} onChange={e => { setReason(e.target.value); setPage(1); }}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 appearance-none">
                  <option value="">All Reasons</option>
                  <option value="SALE">Customer Sale</option>
                  <option value="PURCHASE">Purchase Order</option>
                  <option value="ADJUSTMENT">Stock Adjustment</option>
                  <option value="SALE_CANCELLED">Sale Cancelled</option>
                  <option value="RETURN">Customer Return</option>
                  <option value="DAMAGE">Damage/Shrinkage</option>
                </select>
              </div>
            </div>

            {(type || reason || startDate || endDate) && (
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">Active filters:</span>
                {type && <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black">{type}</span>}
                {reason && <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black">{reason}</span>}
                {startDate && <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black">From {startDate}</span>}
                {endDate && <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black">To {endDate}</span>}
                <button onClick={() => { setType(''); setReason(''); setStartDate(''); setEndDate(''); setPage(1); }}
                  className="ml-auto text-xs font-bold text-gray-400 hover:text-rose-500 transition-colors">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Movement Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            
            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400">
                Showing {total === 0 ? 0 : (page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total} movements
              </p>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Reason</th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Quantity</th>
                  <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <BarChart3 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="font-black text-gray-400">No movements found</p>
                      <p className="text-xs text-gray-300 mt-1">Try adjusting your filters</p>
                    </td>
                  </tr>
                ) : (
                  movements.map(mv => (
                    <tr key={mv.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Date */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-gray-800">{formatDate(mv.createdAt)}</p>
                        <p className="text-xs text-gray-400 font-mono">{formatTime(mv.createdAt)}</p>
                      </td>
                      {/* Product */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                            {mv.product?.imageUrl ? (
                              <img src={mv.product.imageUrl} alt={mv.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-4 h-4 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 max-w-[160px] truncate">{mv.product?.name ?? '—'}</p>
                            {mv.product?.category && (
                              <p className="text-xs text-gray-400 font-medium">{mv.product.category.name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Type */}
                      <td className="px-4 py-4"><TypeBadge type={mv.type} /></td>
                      {/* Reason */}
                      <td className="px-4 py-4"><ReasonBadge reason={mv.reason ?? 'ADJUSTMENT'} /></td>
                      {/* Quantity */}
                      <td className="px-4 py-4">
                        <span className={`text-lg font-black ${mv.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {mv.type === 'IN' ? '+' : '-'}{mv.quantity}
                        </span>
                        <span className="text-xs text-gray-400 font-bold ml-1">units</span>
                      </td>
                      {/* Reference */}
                      <td className="px-4 py-4">
                        <span className="text-xs font-mono text-gray-400">{mv.referenceId ?? '—'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-400">Page {page} of {totalPages}</p>
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

          {/* Insights & Recent Activity */}
          <div className="grid grid-cols-3 gap-6">

            {/* Inventory Insights Card */}
            <div className="col-span-2 bg-indigo-50 rounded-3xl p-8 border border-indigo-100">
              <h3 className="text-xl font-black text-indigo-900 mb-2">Inventory Insights</h3>
              <p className="text-sm text-indigo-700/70 font-medium mb-8 max-w-sm">
                Real-time visibility into your stock movements. Monitor inbound and outbound trends to optimize reordering.
              </p>
              <div className="flex items-end gap-10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-black text-indigo-800/60 uppercase tracking-widest">Total Inbound</span>
                  </div>
                  <p className="text-4xl font-black text-indigo-900">
                    {insights.totalIn >= 1000 ? `${(insights.totalIn / 1000).toFixed(1)}k` : insights.totalIn}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ArrowUpCircle className="w-5 h-5 text-rose-500" />
                    <span className="text-xs font-black text-indigo-800/60 uppercase tracking-widest">Total Outbound</span>
                  </div>
                  <p className="text-4xl font-black text-indigo-900">
                    {insights.totalOut >= 1000 ? `${(insights.totalOut / 1000).toFixed(1)}k` : insights.totalOut}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-base font-black text-gray-900 mb-4 flex items-center justify-between">
                Recent Activity
                <BarChart3 className="w-4 h-4 text-gray-300" />
              </h3>
              <div className="space-y-4">
                {movements.slice(0, 4).map(mv => (
                  <div key={mv.id} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${mv.type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-700 truncate">
                        {mv.type === 'IN' ? 'Stock Added' : 'Stock Removed'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium truncate">{mv.product?.name ?? '—'}</p>
                    </div>
                    <span className={`text-xs font-black flex-shrink-0 ${mv.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {mv.type === 'IN' ? '+' : '-'}{mv.quantity}
                    </span>
                  </div>
                ))}
                {movements.length === 0 && !loading && (
                  <p className="text-xs text-gray-300 font-bold text-center py-4">No recent activity</p>
                )}
                {loading && Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
              <button onClick={() => { setType(''); setReason(''); setPage(1); }}
                className="mt-4 w-full py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-black text-gray-600 transition-colors">
                View All Logs
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
