"use client";

import React, { useState, useEffect } from 'react';
import { 
    X, User, Calendar, Hash, CreditCard, 
    Clock, RefreshCw, Download, AlertCircle, RotateCcw
} from 'lucide-react';
import { getSaleById, reSendInvoice } from '@/lib/api';
import { toast } from 'sonner';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number) => `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

interface SaleDetailDrawerProps {
    saleId: string | null;
    onClose: () => void;
    onCancelSale: (id: string) => void;
}

const SaleDetailDrawer = ({ saleId, onClose, onCancelSale }: SaleDetailDrawerProps) => {
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
      case 'PAID': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-surface-low text-on-surface-variant border-outline-variant';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
      <div 
        className="relative w-full max-w-2xl bg-card h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 ease-out border-l border-outline-variant"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-outline-variant flex items-center justify-between bg-card sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h2 className="text-2xl font-black text-foreground tracking-tight">Comprobante de Venta</h2>
               {sale && (
                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(sale.status)}`}>
                   {sale.status === 'PAID' ? 'Pagado' : sale.status === 'CANCELLED' ? 'Anulado' : 'Pendiente'}
                 </span>
               )}
            </div>
            <p className="text-sm text-on-surface-variant font-medium flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" /> {sale?.documentSeries && sale?.documentNumber ? `${sale.documentSeries}-${sale.documentNumber.toString().padStart(8, '0')}` : saleId.toUpperCase()}
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl hover:bg-surface-low flex items-center justify-center transition-all group active:scale-90">
            <X className="w-6 h-6 text-on-surface-variant group-hover:text-foreground transition-colors" />
          </button>
        </div>
        
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
             <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
             <p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em]">Sincronizando auditoría...</p>
          </div>
        ) : sale ? (
          <div className="flex-1 overflow-y-auto scrollbar-hide">
             {/* Main Info */}
             <div className="px-10 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-outline-variant bg-surface-low">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-card rounded-xl shadow-sm flex items-center justify-center border border-outline-variant text-primary">
                         <User className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Cliente</p>
                         <p className="text-sm font-black text-foreground">{sale.customer?.name || 'Cliente de Mostrador'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-card rounded-xl shadow-sm flex items-center justify-center border border-outline-variant text-amber-500">
                         <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Fecha de Emisión</p>
                         <p className="text-sm font-black text-foreground">{fmtDate(sale.createdAt)}</p>
                      </div>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-card rounded-xl shadow-sm flex items-center justify-center border border-outline-variant text-primary/80">
                         <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Método de Pago</p>
                         <p className="text-sm font-black text-foreground">{sale.paymentMethod || 'Efectivo'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-card rounded-xl shadow-sm flex items-center justify-center border border-outline-variant text-emerald-500">
                         <Clock className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Hora de Registro</p>
                         <p className="text-sm font-black text-foreground">{fmtTime(sale.createdAt)}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* Electronic Invoicing Status */}
             <div className="px-10 py-6 border-b border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                   <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Estado SUNAT</p>
                   <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${sale.invoiceStatus === 'SENT' ? 'bg-emerald-500' : sale.invoiceStatus === 'ERROR' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                      <span className="text-sm font-black text-foreground">
                         {sale.invoiceStatus === 'SENT' ? 'Comprobante Aceptado' : sale.invoiceStatus === 'ERROR' ? 'Error en Envío' : 'Pendiente de Sincronización'}
                      </span>
                   </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
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
                        className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                      >
                         <RefreshCw className="w-3.5 h-3.5" /> Re-intentar
                      </button>
                   )}
                   {sale.pdfUrl && (
                      <a href={sale.pdfUrl} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2 border border-primary/20">
                         <Download className="w-3.5 h-3.5" /> PDF
                      </a>
                   )}
                   {sale.xmlUrl && (
                      <a href={sale.xmlUrl} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none px-4 py-2 bg-surface-low text-on-surface-variant rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-low/80 transition-all flex items-center justify-center gap-2 border border-outline-variant">
                         <Download className="w-3.5 h-3.5" /> XML
                      </a>
                   )}
                </div>
             </div>

             {/* Items Table */}
             <div className="px-10 py-8">
                <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-6">Resumen de Artículos</h3>
                <div className="space-y-4">
                   {sale.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-card rounded-2xl border border-outline-variant shadow-sm hover:border-primary/30 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-surface-low rounded-xl flex items-center justify-center text-on-surface-variant font-black text-xs">
                               {item.product?.name?.[0] || 'P'}
                            </div>
                            <div>
                               <p className="text-sm font-black text-foreground">{item.product?.name || 'Producto Desconocido'}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-xs text-on-surface-variant font-bold">{item.quantity} unidades × {fmtCurrency(Number(item.price))}</p>
                                  <span className="text-[9px] font-black bg-primary/5 text-primary px-1.5 py-0.5 rounded-md uppercase tracking-widest border border-primary/10">
                                     {item.product?.category?.name || 'General'}
                                  </span>
                               </div>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black text-foreground">{fmtCurrency(Number(item.price) * item.quantity)}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Totals Section */}
             <div className="mx-10 my-6 p-8 bg-surface-low rounded-[32px] border border-outline-variant shadow-lg">
                <div className="space-y-4 border-b border-outline-variant pb-6 mb-6">
                   <div className="flex justify-between items-center opacity-70">
                      <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Subtotal Gravado</span>
                      <span className="text-sm font-black text-foreground">{fmtCurrency(Number(sale.total) / 1.18)}</span>
                   </div>
                   <div className="flex justify-between items-center opacity-70">
                      <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">I.G.V (18%)</span>
                      <span className="text-sm font-black text-foreground">{fmtCurrency(Number(sale.total) - (Number(sale.total) / 1.18))}</span>
                   </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Total a Liquidar</p>
                      <h4 className="text-3xl font-black tracking-tighter text-foreground">{fmtCurrency(Number(sale.total))}</h4>
                   </div>
                   <div className="text-left sm:text-right w-full sm:w-auto p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Monto Recibido</p>
                      <p className="text-xl font-black text-emerald-500">{fmtCurrency(Number(sale.amountPaid || sale.total))}</p>
                   </div>
                </div>
             </div>
             
             <div className="px-10 py-10">
                {sale.status !== 'CANCELLED' ? (
                   <button 
                     onClick={() => {
                        onCancelSale(sale.id);
                     }}
                     className="w-full py-4 bg-rose-500/10 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500/20 transition-all flex items-center justify-center gap-3 border border-rose-500/10"
                   >
                      <RotateCcw className="w-4 h-4" /> Solicitar Anulación de Comprobante
                   </button>
                ) : (
                   <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4">
                      <AlertCircle className="w-6 h-6 text-rose-500" />
                      <div>
                         <p className="text-sm font-black text-rose-500">Esta venta ha sido anulada</p>
                         <p className="text-xs text-on-surface-variant font-medium">Los productos han sido devueltos al inventario central.</p>
                      </div>
                   </div>
                )}
             </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant font-black uppercase tracking-widest">
             No se pudo recuperar la información
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleDetailDrawer;