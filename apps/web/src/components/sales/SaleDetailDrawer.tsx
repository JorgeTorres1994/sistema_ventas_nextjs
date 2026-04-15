"use client";

import React, { useEffect, useState } from 'react';
import { X, User, Calendar, Hash, FileText, CreditCard, AlertTriangle, CheckCircle, ShoppingBag } from 'lucide-react';
import { getSaleById } from '@/lib/api';

interface SaleDetailDrawerProps {
  saleId: string | null;
  onClose: () => void;
  onCancelSuccess: () => void;
}

export default function SaleDetailDrawer({ saleId, onClose, onCancelSuccess }: SaleDetailDrawerProps) {
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (saleId) {
      setLoading(true);
      getSaleById(saleId)
        .then(data => setSale(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [saleId]);

  if (!saleId) return null;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'PARTIAL': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${saleId ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[70] transform transition-transform duration-500 ease-out ${saleId ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-black text-gray-900 leading-none">Sale Detail</h2>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Transaction #{sale?.id?.substring(0, 8)}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : sale ? (
              <>
                {/* General Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date & Time</p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      {new Date(sale.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border ${getStatusStyle(sale.status)}`}>
                      {sale.status}
                    </div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <User className="w-4 h-4 text-indigo-500" />
                      {sale.customer?.name || 'Walk-in Customer'}
                    </div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Issued By</p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Hash className="w-4 h-4 text-indigo-500" />
                      {sale.user?.name}
                    </div>
                  </div>
                </div>

                {/* Products Table */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                    <ShoppingBag className="w-4 h-4 text-orange-500" /> Items List
                  </h3>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-widest">
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-4 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sale.items?.map((item: any) => (
                          <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                            <td className="px-4 py-3 font-bold text-gray-800">{item.product?.name}</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-right text-gray-500">S/ {Number(item.price).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-black text-gray-900">S/ {(item.quantity * Number(item.price)).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-tight">Subtotal</span>
                    <span className="text-gray-900 font-bold">S/ {Number(sale.total - sale.taxAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold uppercase tracking-tight">Tax (8%)</span>
                    <span className="text-gray-900 font-bold">S/ {Number(sale.taxAmount).toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-black text-gray-900 uppercase tracking-tight leading-none">Total Amount</span>
                    <span className="text-2xl font-black text-indigo-600 leading-none">S/ {Number(sale.total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment History */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-tight">
                    <CreditCard className="w-4 h-4 text-blue-500" /> Payments
                  </h3>
                  <div className="space-y-2">
                    {sale.payments?.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-xs">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span className="font-bold text-gray-700 uppercase tracking-widest">{payment.method}</span>
                        </div>
                        <span className="font-black text-gray-900">S/ {Number(payment.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-gray-400">Select a sale to view details</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
