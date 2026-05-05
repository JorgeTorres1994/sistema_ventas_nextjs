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
  Receipt
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

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans text-[#111827]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden transition-all duration-300">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] px-4 lg:px-10 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header and Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-10">
              <div className="w-full sm:w-auto">
                <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-4">Cobranzas</h1>
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full sm:w-fit">
                  <button 
                    onClick={() => setActiveTab('RECEIVABLES')}
                    className={`flex-1 sm:flex-none px-4 lg:px-8 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === 'RECEIVABLES' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Clientes
                  </button>
                  <button 
                    onClick={() => setActiveTab('PAYABLES')}
                    className={`flex-1 sm:flex-none px-4 lg:px-8 py-3 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === 'PAYABLES' 
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Proveedores
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-left sm:text-right">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pendiente</p>
                   <h2 className={`text-3xl lg:text-4xl font-black tracking-tighter ${activeTab === 'RECEIVABLES' ? 'text-blue-600' : 'text-rose-600'}`}>
                     S/ {totalDebt.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                   </h2>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
               <div className="bg-white p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                     <Clock className="w-20 h-20 text-gray-900" />
                  </div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Vencidos</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter">{overdueCount}</h3>
                  </div>
               </div>

               <div className="bg-white p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                     <TrendingUp className="w-20 h-20 text-emerald-600" />
                  </div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Recuperación</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter">S/ 4.2k</h3>
                  </div>
               </div>

               <div className="bg-white p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                     <History className="w-20 h-20 text-blue-600" />
                  </div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Próximo</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-lg lg:text-xl font-black text-gray-900 tracking-tight">3 días</h3>
                  </div>
               </div>
            </div>

            {/* List and Filters */}
            <div className="bg-white rounded-[32px] lg:rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 lg:p-10 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
                  <div className="relative w-full lg:w-96">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder={`Buscar...`}
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent rounded-[24px] text-sm font-bold focus:bg-white focus:border-blue-500 transition-all outline-none"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    <select 
                      className="flex-1 lg:flex-none px-6 py-4 bg-gray-50 border-transparent rounded-[20px] text-[10px] lg:text-xs font-black text-gray-500 outline-none cursor-pointer hover:bg-gray-100 transition-colors uppercase tracking-widest"
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                    >
                      <option value="">Estados</option>
                      <option value="PENDING">Pendientes</option>
                      <option value="PARTIAL">Abonados</option>
                      <option value="PAID">Pagados</option>
                      <option value="OVERDUE">Vencidos</option>
                    </select>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[900px]">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sujeto / Documento</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vencimiento</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto Restante</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={5} className="px-10 py-8"><div className="h-4 bg-gray-50 rounded w-full"></div></td>
                          </tr>
                        ))
                      ) : data.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-10 py-32 text-center">
                             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                <History className="w-10 h-10 text-gray-200" />
                             </div>
                             <h3 className="text-lg font-black text-gray-900 mb-1">Sin registros pendientes</h3>
                             <p className="text-sm text-gray-400 font-medium">No hay deudas que coincidan con los filtros actuales.</p>
                          </td>
                        </tr>
                      ) : data.map((item) => {
                        const entity = activeTab === 'RECEIVABLES' ? item.sale?.customer : item.purchase?.supplier;
                        const docRef = activeTab === 'RECEIVABLES' 
                          ? `${item.sale?.series}-${item.sale?.correlative}` 
                          : `COMPRA-${item.purchaseId.slice(0,8)}`;
                        const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'PAID';

                        return (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-all group">
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors ${
                                    activeTab === 'RECEIVABLES' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-rose-50 border-rose-100 text-rose-600'
                                  }`}>
                                     {activeTab === 'RECEIVABLES' ? <User className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-gray-900">{entity?.name || 'Sujeto Desconocido'}</p>
                                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Ref: {docRef}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-2">
                                  <Calendar className={`w-4 h-4 ${isOverdue ? 'text-rose-500' : 'text-gray-400'}`} />
                                  <span className={`text-sm font-bold ${isOverdue ? 'text-rose-600' : 'text-gray-900'}`}>
                                    {item.dueDate ? format(new Date(item.dueDate), 'dd MMM, yyyy', { locale: es }) : 'N/A'}
                                  </span>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                 item.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                 item.status === 'PARTIAL' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                 isOverdue ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                               }`}>
                                 {item.status === 'PAID' ? 'LIQUIDADO' : 
                                  item.status === 'PARTIAL' ? 'ABONADO' : 
                                  isOverdue ? 'VENCIDO' : 'PENDIENTE'}
                               </span>
                            </td>
                            <td className="px-10 py-8 text-right">
                               <div className="flex flex-col items-end">
                                  <span className="text-lg font-black text-gray-900 tracking-tight">
                                    S/ {Number(item.remainingAmount).toFixed(2)}
                                  </span>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                                    de S/ {Number(item.totalAmount).toFixed(2)}
                                  </span>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex items-center justify-center gap-2">
                                  {item.status !== 'PAID' && (
                                    <button 
                                      onClick={() => { setSelectedCredit(item); setIsPaymentModalOpen(true); }}
                                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                                        activeTab === 'RECEIVABLES' 
                                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                          : 'bg-rose-600 text-white hover:bg-rose-700'
                                      }`}
                                    >
                                      Registrar Abono
                                    </button>
                                  )}
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedCredit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20">
              <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                 <div>
                    <h3 className="text-2xl font-black mb-1">Registrar Pago a Cuenta</h3>
                    <p className="text-sm font-medium text-gray-400">Ref: {selectedCredit.id.slice(0,8).toUpperCase()}</p>
                 </div>
                 <button onClick={() => setIsPaymentModalOpen(false)} className="p-4 hover:bg-gray-50 rounded-3xl transition-colors">
                    <X className="w-6 h-6 text-gray-300" />
                 </button>
              </div>

              <form onSubmit={handlePayment} className="p-10 space-y-10">
                 <div className="bg-gray-50/50 p-8 rounded-[32px] border border-gray-100 flex items-center justify-between">
                    <div>
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Deuda Pendiente</p>
                       <p className="text-3xl font-black text-gray-900 tracking-tighter">S/ {Number(selectedCredit.remainingAmount).toFixed(2)}</p>
                    </div>
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
                       <DollarSign className="w-6 h-6 text-emerald-500" />
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Monto del Abono (S/)</label>
                       <input 
                         type="number"
                         step="0.01"
                         required
                         autoFocus
                         className="w-full px-8 py-5 bg-gray-50 border border-transparent rounded-[24px] focus:bg-white focus:border-blue-500 transition-all outline-none font-black text-2xl text-gray-900 shadow-sm"
                         placeholder="0.00"
                         value={paymentData.amount}
                         onChange={e => setPaymentData({...paymentData, amount: e.target.value})}
                       />
                    </div>

                    <div className="space-y-3">
                       <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Método de Cobro/Pago</label>
                       <div className="grid grid-cols-2 gap-4">
                          <button 
                            type="button"
                            onClick={() => setPaymentData({...paymentData, paymentMethod: 'CASH'})}
                            className={`py-5 rounded-[22px] text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                              paymentData.paymentMethod === 'CASH' ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-lg shadow-amber-50' : 'bg-white border-gray-50 text-gray-400 hover:border-gray-100'
                            }`}
                          >
                            Efectivo (Caja)
                          </button>
                          <button 
                            type="button"
                            onClick={() => setPaymentData({...paymentData, paymentMethod: 'TRANSFER'})}
                            className={`py-5 rounded-[22px] text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                              paymentData.paymentMethod === 'TRANSFER' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-lg shadow-blue-50' : 'bg-white border-gray-50 text-gray-400 hover:border-gray-100'
                            }`}
                          >
                            Transferencia
                          </button>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Notas (Opcional)</label>
                       <textarea 
                         className="w-full px-8 py-5 bg-gray-50 border border-transparent rounded-[24px] focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-sm text-gray-700 shadow-sm min-h-[100px]"
                         placeholder="Justificación del abono..."
                         value={paymentData.notes}
                         onChange={e => setPaymentData({...paymentData, notes: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsPaymentModalOpen(false)}
                      className="flex-1 py-5 text-gray-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 rounded-[24px] transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className={`flex-[2] py-5 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[24px] shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                        activeTab === 'RECEIVABLES' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
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
