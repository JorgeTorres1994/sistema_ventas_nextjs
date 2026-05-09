"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
  CreditCard, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  User, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MoreHorizontal,
  ChevronRight,
  Plus,
  X,
  History,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Hash
} from 'lucide-react';
import { 
  getReceivables, 
  getPayables, 
  recordCreditPayment,
  getCashStatus
} from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CreditsPage() {
  const [activeTab, setActiveTab] = useState<'RECEIVABLES' | 'PAYABLES'>('RECEIVABLES');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cashStatus, setCashStatus] = useState<any>(null);
  
  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    notes: '',
  });

  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [creditsData, cashData] = await Promise.all([
        activeTab === 'RECEIVABLES' ? getReceivables(filters) : getPayables(filters),
        getCashStatus()
      ]);
      setData(creditsData);
      setCashStatus(cashData);
    } catch (error) {
      toast.error('Error al cargar datos financieros');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit) return;

    const toastId = toast.loading('Registrando abono...');
    try {
      await recordCreditPayment({
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.paymentMethod,
        notes: paymentData.notes,
        creditSaleId: activeTab === 'RECEIVABLES' ? selectedCredit.id : undefined,
        creditPurchaseId: activeTab === 'PAYABLES' ? selectedCredit.id : undefined,
        cashRegisterId: paymentData.paymentMethod === 'CASH' ? cashStatus?.id : undefined
      });

      toast.success('Abono registrado con éxito', { id: toastId });
      setIsPaymentModalOpen(false);
      setSelectedCredit(null);
      setPaymentData({ amount: '', paymentMethod: 'CASH', notes: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar el pago', { id: toastId });
    }
  };

  const totalDebt = data.reduce((acc, curr) => acc + Number(curr.remainingAmount), 0);
  const overdueCount = data.filter(c => c.status === 'OVERDUE' || (c.dueDate && new Date(c.dueDate) < new Date())).length;

  return (    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-20">
            
            {/* Header and Contextual Controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-12">
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                  <span>Finanzas</span><span>/</span>
                  <span className="text-on-surface-variant">Créditos y Cobranzas</span>
                </nav>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Gestión de Carteras</h1>
                <p className="text-sm font-medium text-on-surface-variant max-w-xl">Supervisión de cuentas por cobrar y obligaciones de pago pendientes.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex bg-card p-2 rounded-[28px] border border-outline-variant/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-surface-low/30 pointer-events-none"></div>
                  <button 
                    onClick={() => setActiveTab('RECEIVABLES')}
                    className={`relative z-10 px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${
                      activeTab === 'RECEIVABLES' 
                        ? 'bg-primary text-on-primary shadow-xl shadow-primary/20' 
                        : 'text-on-surface-variant/60 hover:text-foreground'
                    }`}
                  >
                    <ArrowUpRight className={`w-4 h-4 ${activeTab === 'RECEIVABLES' ? 'opacity-100' : 'opacity-30'}`} />
                    Por Cobrar
                  </button>
                  <button 
                    onClick={() => setActiveTab('PAYABLES')}
                    className={`relative z-10 px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${
                      activeTab === 'PAYABLES' 
                        ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/20' 
                        : 'text-on-surface-variant/60 hover:text-foreground'
                    }`}
                  >
                    <ArrowDownRight className={`w-4 h-4 ${activeTab === 'PAYABLES' ? 'opacity-100' : 'opacity-30'}`} />
                    Por Pagar
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
               <div className="bg-card p-6 lg:p-8 rounded-[32px] border border-outline-variant shadow-sm relative overflow-hidden group col-span-1 sm:col-span-2">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                     <Wallet className={`w-32 h-32 ${activeTab === 'RECEIVABLES' ? 'text-primary' : 'text-rose-600'}`} />
                  </div>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Total {activeTab === 'RECEIVABLES' ? 'Cartera Pendiente' : 'Adeudado a Terceros'}</p>
                  <h3 className={`text-4xl lg:text-5xl font-black tracking-tighter mb-4 ${activeTab === 'RECEIVABLES' ? 'text-primary' : 'text-rose-600'}`}>
                    S/ {totalDebt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-low rounded-xl text-[9px] font-black text-on-surface-variant uppercase tracking-widest border border-outline-variant/30">
                       <Receipt className="w-3.5 h-3.5" /> {data.length} Documentos
                    </span>
                  </div>
               </div>

               <div className="bg-card p-6 lg:p-8 rounded-[32px] border border-outline-variant shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                     <Clock className="w-24 h-24 text-rose-500" />
                  </div>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Vencidos</p>
                  <h3 className={`text-4xl font-black tracking-tighter mb-2 ${overdueCount > 0 ? 'text-rose-600' : 'text-foreground'}`}>{overdueCount}</h3>
                  <p className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest">Atención prioritaria</p>
               </div>

               <div className="bg-card p-6 lg:p-8 rounded-[32px] border border-outline-variant shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                     <TrendingUp className="w-24 h-24 text-emerald-500" />
                  </div>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Eficiencia</p>
                  <h3 className="text-4xl font-black text-emerald-600 tracking-tighter mb-2">84%</h3>
                  <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Tasa de cobro</p>
               </div>
            </div>

            {/* Advanced Filters Bar */}
            <div className="bg-card p-6 lg:p-8 rounded-[40px] border border-outline-variant shadow-sm mb-12 flex flex-col lg:flex-row items-stretch lg:items-center gap-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16"></div>
               
               <div className="flex-1 relative z-10">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/30" />
                  <input 
                    type="text" 
                    placeholder={`Buscar por ${activeTab === 'RECEIVABLES' ? 'cliente' : 'proveedor'}...`}
                    className="w-full pl-16 pr-6 py-5 bg-surface-low border border-transparent rounded-[24px] text-sm font-black focus:bg-card focus:border-primary/40 transition-all outline-none text-foreground shadow-inner placeholder:text-on-surface-variant/20"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
               </div>
               
               <div className="flex items-center gap-4 relative z-10">
                  <select 
                    className="flex-1 lg:flex-none px-8 py-5 bg-surface-low border border-transparent rounded-[22px] text-[10px] font-black text-foreground outline-none cursor-pointer hover:bg-card transition-all shadow-inner uppercase tracking-[0.1em]"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">Todos los Estados</option>
                    <option value="PENDING">Pendientes</option>
                    <option value="PARTIAL">Con Abonos</option>
                    <option value="PAID">Liquidados</option>
                    <option value="OVERDUE">Vencidos</option>
                  </select>
                  <button className="w-14 h-14 bg-surface-low text-on-surface-variant border border-transparent rounded-[22px] flex items-center justify-center hover:bg-card hover:text-primary transition-all active:scale-90 shadow-inner group">
                    <Filter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
               </div>
            </div>

            {/* Hybrid List Content */}
            <div className="space-y-4 lg:space-y-0">
               {/* Mobile/Tablet Cards */}
               <div className="lg:hidden space-y-6">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="bg-card rounded-[32px] p-6 h-48 animate-pulse border border-outline-variant/30"></div>
                    ))
                  ) : data.length === 0 ? (
                    <div className="bg-card rounded-[32px] p-12 text-center border border-outline-variant/30">
                       <History className="w-12 h-12 text-on-surface-variant/10 mx-auto mb-4" />
                       <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Sin registros activos</p>
                    </div>
                  ) : (
                    data.map((item) => {
                      const entity = activeTab === 'RECEIVABLES' ? item.sale?.customer : item.purchase?.supplier;
                      const docRef = activeTab === 'RECEIVABLES' 
                        ? `${item.sale?.series}-${item.sale?.correlative}` 
                        : `COMPRA-${item.purchaseId?.slice(0,8) || item.id.slice(0,8)}`;
                      const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'PAID';

                      return (
                        <div key={item.id} className="bg-card rounded-[32px] p-6 border border-outline-variant/30 shadow-sm">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${activeTab === 'RECEIVABLES' ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {activeTab === 'RECEIVABLES' ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                                 </div>
                                 <div>
                                    <p className="text-lg font-black text-foreground tracking-tight line-clamp-1">{entity?.name || 'Sujeto Desconocido'}</p>
                                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-0.5">REF: {docRef}</p>
                                 </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                item.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                item.status === 'PARTIAL' ? 'bg-primary/10 text-primary border-primary/20' :
                                isOverdue ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                              }`}>
                                {item.status === 'PAID' ? 'Liquidado' : item.status === 'PARTIAL' ? 'Abonado' : isOverdue ? 'Vencido' : 'Pendiente'}
                              </span>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-outline-variant/20">
                              <div className="space-y-1">
                                 <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Vencimiento</p>
                                 <p className={`text-xs font-black ${isOverdue ? 'text-rose-600' : 'text-foreground'}`}>{item.dueDate ? format(new Date(item.dueDate), 'dd MMM, yyyy', { locale: es }) : 'N/A'}</p>
                              </div>
                              <div className="space-y-1 text-right">
                                 <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Total Documento</p>
                                 <p className="text-xs font-black text-foreground">S/ {Number(item.totalAmount).toFixed(2)}</p>
                              </div>
                           </div>

                           <div className="flex items-center justify-between p-4 bg-surface-low rounded-2xl mb-6">
                              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Saldo Pendiente</span>
                              <span className={`text-xl font-black tracking-tight ${activeTab === 'RECEIVABLES' ? 'text-primary' : 'text-rose-600'}`}>S/ {Number(item.remainingAmount).toFixed(2)}</span>
                           </div>

                           {item.status !== 'PAID' && (
                              <button 
                                onClick={() => { setSelectedCredit(item); setIsPaymentModalOpen(true); }}
                                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all ${
                                  activeTab === 'RECEIVABLES' ? 'bg-primary text-on-primary shadow-primary/20' : 'bg-rose-600 text-white shadow-rose-600/20'
                                }`}
                              >
                                Registrar Abono
                              </button>
                           )}
                        </div>
                      );
                    })
                  )}
               </div>

               {/* Desktop Premium Table */}
               <div className="hidden lg:block bg-card rounded-[48px] border border-outline-variant shadow-sm overflow-x-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                  <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead>
                      <tr className="bg-surface-low/30 border-b border-outline-variant/30">
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Sujeto / Documento de Referencia</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Compromiso de Pago</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Estado Operativo</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Inversión Pendiente</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {loading ? (
                        Array(6).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={5} className="px-10 py-8 h-24 bg-surface-low/10"></td>
                          </tr>
                        ))
                      ) : data.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-10 py-32 text-center">
                             <History className="w-16 h-16 text-on-surface-variant/10 mx-auto mb-6" />
                             <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">No hay deudas activas en esta cartera</p>
                          </td>
                        </tr>
                      ) : (
                        data.map((item) => {
                          const entity = activeTab === 'RECEIVABLES' ? item.sale?.customer : item.purchase?.supplier;
                          const docRef = activeTab === 'RECEIVABLES' 
                            ? `${item.sale?.series}-${item.sale?.correlative}` 
                            : `COMPRA-${item.purchaseId?.slice(0,8) || item.id.slice(0,8)}`;
                          const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'PAID';

                          return (
                            <tr key={item.id} className="hover:bg-primary/[0.01] transition-colors group">
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-transform group-hover:scale-110 shadow-xl shadow-black/5 ${
                                      activeTab === 'RECEIVABLES' ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                       {activeTab === 'RECEIVABLES' ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
                                    </div>
                                    <div>
                                       <p className="text-lg font-black text-foreground tracking-tighter leading-tight">{entity?.name || 'Sujeto Desconocido'}</p>
                                       <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                                         <Hash className="w-3 h-3" /> {docRef}
                                       </p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-3">
                                    <Calendar className={`w-5 h-5 ${isOverdue ? 'text-rose-500' : 'text-on-surface-variant/30'}`} />
                                    <div className="flex flex-col">
                                       <span className={`text-sm font-black tracking-tight ${isOverdue ? 'text-rose-600' : 'text-foreground'}`}>
                                         {item.dueDate ? format(new Date(item.dueDate), 'dd MMM, yyyy', { locale: es }) : 'N/A'}
                                       </span>
                                       {isOverdue && <span className="text-[9px] font-black text-rose-600/60 uppercase tracking-widest mt-0.5">Documento Expirado</span>}
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2.5 w-fit ${
                                   item.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                   item.status === 'PARTIAL' ? 'bg-primary/10 text-primary border-primary/20' :
                                   isOverdue ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                 }`}>
                                   <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'PAID' ? 'bg-emerald-500' : item.status === 'PARTIAL' ? 'bg-primary' : isOverdue ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></div>
                                   {item.status === 'PAID' ? 'Liquidado' : item.status === 'PARTIAL' ? 'Abonado' : isOverdue ? 'Vencido' : 'Pendiente'}
                                 </span>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <div className="flex flex-col items-end">
                                    <span className={`text-xl font-black tracking-tighter ${activeTab === 'RECEIVABLES' ? 'text-primary' : 'text-rose-600'}`}>
                                      S/ {Number(item.remainingAmount).toFixed(2)}
                                    </span>
                                    <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-1">de S/ {Number(item.totalAmount).toFixed(2)}</span>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-center">
                                 {item.status !== 'PAID' ? (
                                   <button 
                                     onClick={() => { setSelectedCredit(item); setIsPaymentModalOpen(true); }}
                                     className={`px-8 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-3 mx-auto ${
                                       activeTab === 'RECEIVABLES' ? 'bg-primary text-on-primary shadow-primary/20 hover:opacity-90' : 'bg-rose-600 text-white shadow-rose-600/20 hover:bg-rose-700'
                                     }`}
                                   >
                                     <CheckCircle2 className="w-4 h-4" /> Registrar Pago
                                   </button>
                                 ) : (
                                   <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                                      <CheckCircle2 className="w-6 h-6" />
                                   </div>
                                 )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Payment Modal - Responsive Overhaul */}
      {isPaymentModalOpen && selectedCredit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-300">
           <div className="bg-card border-none sm:border border-outline-variant rounded-none sm:rounded-[44px] shadow-2xl w-full max-w-xl h-full sm:h-auto max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="px-8 lg:px-12 pt-12 pb-8 border-b border-outline-variant/30 flex items-center justify-between bg-surface-low/20">
                 <div>
                    <h3 className="text-3xl font-black tracking-tighter text-foreground">Abono a Cartera</h3>
                    <p className="text-[11px] text-on-surface-variant font-black uppercase tracking-widest mt-1">Operación de Caja Directa</p>
                 </div>
                 <button onClick={() => setIsPaymentModalOpen(false)} className="w-14 h-14 bg-surface-low hover:bg-card border border-outline-variant/30 rounded-[22px] flex items-center justify-center transition-all active:scale-90 group">
                    <X className="w-6 h-6 text-on-surface-variant group-hover:rotate-90 transition-transform" />
                 </button>
              </div>

              <form onSubmit={handlePayment} className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 scrollbar-hide">
                 <div className="bg-surface-low/50 p-8 rounded-[32px] border border-outline-variant/30 flex items-center justify-between shadow-inner">
                    <div>
                       <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Deuda Pendiente Actual</p>
                       <p className="text-4xl font-black text-foreground tracking-tighter">S/ {Number(selectedCredit.remainingAmount).toFixed(2)}</p>
                    </div>
                    <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center border border-outline-variant/30 shadow-xl shadow-black/5">
                       <DollarSign className="w-8 h-8 text-emerald-500" />
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Importe a Liquidar (S/)</label>
                       <div className="relative">
                          <span className="absolute left-8 top-1/2 -translate-y-1/2 text-primary font-black text-xl">S/</span>
                          <input 
                            type="number"
                            step="0.01"
                            required
                            autoFocus
                            className="w-full pl-16 pr-8 py-6 bg-surface-low border border-transparent rounded-[28px] focus:bg-card focus:border-primary/50 transition-all outline-none font-black text-3xl text-foreground shadow-inner placeholder:text-on-surface-variant/20"
                            placeholder="0.00"
                            value={paymentData.amount}
                            onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Canal de Recepción/Pago</label>
                       <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button"
                            onClick={() => setPaymentData({...paymentData, paymentMethod: 'CASH'})}
                            className={`py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                              paymentData.paymentMethod === 'CASH' ? 'bg-amber-500/10 border-amber-500 text-amber-600 shadow-xl shadow-amber-500/10' : 'bg-surface-low border-transparent text-on-surface-variant/30'
                            }`}
                          >
                            Efectivo (Caja)
                          </button>
                          <button 
                            type="button"
                            onClick={() => setPaymentData({...paymentData, paymentMethod: 'TRANSFER'})}
                            className={`py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                              paymentData.paymentMethod === 'TRANSFER' ? 'bg-primary/10 border-primary text-primary shadow-xl shadow-primary/20' : 'bg-surface-low border-transparent text-on-surface-variant/30'
                            }`}
                          >
                            Transferencia
                          </button>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Memorándum de Pago</label>
                       <textarea 
                         className="w-full px-8 py-6 bg-surface-low border border-transparent rounded-[28px] focus:bg-card focus:border-primary/50 transition-all outline-none font-black text-sm text-foreground shadow-inner min-h-[120px] placeholder:text-on-surface-variant/20"
                         placeholder="Detalles adicionales del abono realizado..."
                         value={paymentData.notes}
                         onChange={e => setPaymentData({...paymentData, notes: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button 
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="flex-1 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:bg-surface-low rounded-[24px] transition-all active:scale-95"
                    >
                      Descartar
                    </button>
                    <button 
                      type="submit"
                      className={`flex-[2] py-5 text-white font-black text-[10px] uppercase tracking-widest rounded-[24px] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                        activeTab === 'RECEIVABLES' ? 'bg-primary hover:scale-[1.02] shadow-primary/30' : 'bg-rose-600 hover:scale-[1.02] shadow-rose-600/30'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Confirmar Operación
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

