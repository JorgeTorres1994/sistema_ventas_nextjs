"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search, Plus, ChevronLeft, ChevronRight, X, Calendar, 
  ShoppingCart, Filter, Package, Eye, FileText, CheckCircle2,
  Clock, AlertCircle, Building2, TrendingDown
} from 'lucide-react';
import { getPurchases, getPurchaseById } from '@/lib/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtCurrency = (n: number) => {
  return `$${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// ── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    CANCELLED: "bg-rose-50 text-rose-600 border-rose-100",
  };
  const labels: any = { COMPLETED: "RECEIVED", PENDING: "PENDING", CANCELLED: "CANCELLED" };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${styles[status] || 'bg-gray-100'}`}>
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
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
      <div 
        className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">Purchase Order</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">#{id.slice(0,8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : purchase ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Summary Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <StatusBadge status={purchase.status} />
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Date</p>
                <p className="text-sm font-black text-gray-900">{fmtDate(purchase.createdAt)}</p>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" /> Supplier Information
              </h3>
              <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-lg font-black">
                    {purchase.supplier?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <p className="text-base font-black text-gray-900">{purchase.supplier?.name}</p>
                    <p className="text-xs text-gray-400 font-mono">Tax ID: {purchase.supplier?.dniRuc}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm font-medium text-gray-600">
                  {purchase.supplier?.email && <p>Email: {purchase.supplier.email}</p>}
                  {purchase.supplier?.phone && <p>Phone: {purchase.supplier.phone}</p>}
                  {purchase.supplier?.address && <p>Address: {purchase.supplier.address}</p>}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" /> Item Details
              </h3>
              <div className="overflow-hidden rounded-2xl border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr className="border-b border-gray-100">
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Cost</th>
                            <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {purchase.items?.map((item: any) => (
                            <tr key={item.id} className="text-sm">
                                <td className="px-4 py-4">
                                    <p className="font-black text-gray-900">{item.product?.name}</p>
                                </td>
                                <td className="px-4 py-4 text-center font-bold text-gray-600">{item.quantity}</td>
                                <td className="px-4 py-4 text-right font-medium text-gray-500">{fmtCurrency(Number(item.costPrice))}</td>
                                <td className="px-4 py-4 text-right font-black text-gray-900">{fmtCurrency(item.quantity * Number(item.costPrice))}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-gray-50/50">
                        <tr>
                            <td colSpan={3} className="px-4 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Grand Total</td>
                            <td className="px-4 py-4 text-right text-lg font-black text-indigo-600">{fmtCurrency(Number(purchase.total))}</td>
                        </tr>
                    </tfoot>
                </table>
              </div>
            </div>
          </div>
        ) : null}
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
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-y-auto">
        
        {/* Header */}
        <header className="px-10 py-8 bg-white/50 backdrop-blur-md sticky top-0 z-20 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">Purchase Orders</h1>
            <p className="text-base text-gray-400 font-medium">Manage and track global procurement lifecycle.</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/purchases/new')}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all"
          >
            <Plus className="w-5 h-5" /> New Purchase
          </button>
        </header>

        <main className="flex-1 px-10 pb-12 space-y-8">
          
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: 'Total Orders', value: total, icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-l-indigo-600' },
              { label: 'Pending', value: purchases.filter(p => p.status === 'PENDING').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-l-amber-600' },
              { label: 'Received', value: purchases.filter(p => p.status === 'COMPLETED').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-l-emerald-600' },
              { label: 'Cancelled', value: purchases.filter(p => p.status === 'CANCELLED').length, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-l-rose-600' },
            ].map((m, i) => (
              <div key={i} className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 ${m.border} flex items-center justify-between`}>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
                  <p className="text-3xl font-black text-gray-900">{m.value.toLocaleString()}</p>
                </div>
                <div className={`${m.bg} ${m.color} w-12 h-12 rounded-2xl flex items-center justify-center`}>
                  <m.icon className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>

          {/* Table Area */}
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            {/* Filter Bar */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input 
                  placeholder="Search by ID or supplier name..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-black text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="COMPLETED">Received</option>
                <option value="PENDING">Pending</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest text-left">
                        <th className="px-8 py-5">Order ID</th>
                        <th className="px-6 py-5">Supplier</th>
                        <th className="px-6 py-5">Total Amount</th>
                        <th className="px-6 py-5">Date</th>
                        <th className="px-6 py-5 text-center">Status</th>
                        <th className="px-8 py-5 text-right w-16">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <td key={j} className="px-8 py-5"><div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" /></td>
                                ))}
                            </tr>
                        ))
                    ) : purchases.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-20 text-center">
                                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="font-black text-gray-600">No purchase records found</p>
                            </td>
                        </tr>
                    ) : (
                        purchases.map(purchase => (
                            <tr key={purchase.id} 
                                className="group hover:bg-indigo-50/30 transition-colors cursor-pointer"
                                onClick={() => setSelectedId(purchase.id)}>
                                <td className="px-8 py-5">
                                    <span className="text-sm font-black text-indigo-600 hover:underline">
                                        #PO-{purchase.id.slice(0, 4).toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-[11px] font-black text-gray-600">
                                            {purchase.supplier?.name?.[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900">{purchase.supplier?.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm font-black text-gray-900">{fmtCurrency(Number(purchase.total))}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-sm font-medium text-gray-500">{fmtDate(purchase.createdAt)}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <StatusBadge status={purchase.status} />
                                </td>
                                <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                                    <button 
                                        onClick={() => setSelectedId(purchase.id)}
                                        className="p-2 bg-gray-50 hover:bg-gray-200 rounded-xl text-gray-400 hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="px-8 py-5 bg-white border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Showing {(page-1)*LIMIT + 1} to {Math.min(page*LIMIT, total)} of {total} orders
                </p>
                <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                        className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                        return (
                            <button key={p} onClick={() => setPage(p)}
                                className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${p === page ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}>
                                {p}
                            </button>
                        );
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-all">
                        <ChevronRight className="w-5 h-5" />
                    </button>
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
