"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search, Plus, ChevronLeft, ChevronRight, X, 
  DollarSign, ArrowUpRight, ArrowDownRight, Clock, 
  Lock, Unlock, AlertCircle, FileText, CheckCircle2,
  Download, Filter, RefreshCw, Loader2, CreditCard,
  Target, TrendingUp, Info
} from 'lucide-react';
import { 
    getCashStatus, 
    openCash, 
    closeCash, 
    getCashMovements, 
    createCashMovement 
} from '@/lib/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number) => `$${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

// ── Components ─────────────────────────────────────────────────────────────────
function StatCard({ title, amount, subtitle, icon: Icon, color, trend }: any) {
  const colorClasses: any = {
    blue: 'border-blue-100 bg-white group-hover:bg-blue-50/50',
    indigo: 'border-indigo-100 bg-indigo-600 text-white',
    gray: 'border-gray-100 bg-gray-50/50 text-gray-900',
  };
  
  return (
    <div className={`relative flex-1 p-8 rounded-[32px] border-2 transition-all duration-300 group overflow-hidden ${colorClasses[color] || colorClasses.blue}`}>
      {color === 'indigo' && (
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-24 h-24" />
         </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-[10px] font-black uppercase tracking-[2px] ${color === 'indigo' ? 'text-indigo-100' : 'text-gray-400'}`}>
          {title}
        </h3>
        {Icon && <Icon className={`w-5 h-5 ${color === 'indigo' ? 'text-indigo-100' : 'text-blue-600'}`} />}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-black tracking-tight">{fmtCurrency(amount)}</p>
      </div>
      {subtitle && (
        <p className={`text-[11px] font-bold mt-4 flex items-center gap-1.5 ${color === 'indigo' ? 'text-indigo-100/70' : 'text-gray-400'}`}>
          {trend ? <trend.icon className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function CashRegisterPage() {
  const [register, setRegister] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setRefreshing(true);
      const [statusRes, movementsRes] = await Promise.all([
        getCashStatus(),
        getCashMovements(),
      ]);
      setRegister(statusRes);
      setMovements(movementsRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F9FAFB] items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-y-auto">
        
        {/* Header */}
        <header className="px-10 py-8 bg-transparent flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Cash Register</h1>
            <p className="text-base text-gray-500 font-medium">
              {register 
                ? `Register ID: RM-${register.id.slice(0,8).toUpperCase()} • Terminal 01`
                : 'Caja cerrada. Abre una sesión para comenzar a operar.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
             {refreshing && <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />}
             {!register ? (
                <button 
                    onClick={() => setIsOpenModalOpen(true)}
                    className="px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2"
                >
                    <Unlock className="w-4 h-4 text-emerald-500" /> Open Cash
                </button>
             ) : (
                <button 
                    onClick={() => setIsCloseModalOpen(true)}
                    className="px-8 py-3.5 bg-[#0052FF] rounded-2xl text-sm font-black text-white hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center gap-2"
                >
                    <Lock className="w-4 h-4" /> Close Cash
                </button>
             )}
          </div>
        </header>

        <main className="flex-1 px-10 pb-10 space-y-10">
          
          {/* Metrics Grid */}
          <div className="flex gap-8">
            <StatCard 
              title="Opening Balance" 
              amount={register?.openingBalance ?? 0}
              subtitle={register ? `Set at ${fmtTime(register.createdAt)} Today` : 'No active session'}
              icon={register ? Unlock : Lock}
              color="blue"
            />
            <StatCard 
              title="Current Balance" 
              amount={register?.currentBalance ?? 0}
              subtitle={`+ ${((register?.totalIn ?? 0) / (register?.openingBalance || 1) * 100).toFixed(1)}% from start`}
              icon={TrendingUp}
              color="indigo"
              trend={{ icon: TrendingUp }}
            />
            <StatCard 
              title="Expected Balance" 
              amount={register?.currentBalance ?? 0} // In-app, current balance is expected
              subtitle="Matches internal ledger"
              icon={Target}
              color="gray"
              trend={{ icon: CheckCircle2 }}
            />
          </div>

          {/* Movements Section */}
          <section className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-100/50 overflow-hidden flex flex-col">
            <div className="px-10 py-8 flex items-center justify-between border-b border-gray-50 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                 <h2 className="text-xl font-black text-gray-900">Cash Movements</h2>
                 <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black tracking-widest uppercase">
                    Session Audit
                 </span>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                    onClick={() => register && setIsMovementModalOpen(true)}
                    disabled={!register}
                    className="px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-100 transition-all flex items-center gap-2 disabled:opacity-30"
                 >
                    <Plus className="w-4 h-4" /> Add Manual Adjustment
                 </button>
                 <button className="p-2.5 text-gray-300 hover:text-gray-900"><Download className="w-4 h-4"/></button>
              </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[2px] border-b border-gray-50">
                       <th className="px-10 py-5">Time</th>
                       <th className="px-6 py-5">Type</th>
                       <th className="px-10 py-5">Description</th>
                       <th className="px-10 py-5 text-right">Amount</th>
                       <th className="px-10 py-5 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                           <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                              <RefreshCw className="w-8 h-8 text-gray-300" />
                           </div>
                           <p className="text-sm font-black text-gray-900 mb-1">No movements recorded yet</p>
                           <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Awaiting transactions...</p>
                        </td>
                      </tr>
                    ) : (
                      movements.map((m, idx) => {
                        // Rough calculation for "Balance After" visual only
                        const balanceAfter = movements.slice(idx).reduce((sum, mov) => 
                            sum + (mov.type === 'IN' ? Number(mov.amount) : -Number(mov.amount)), 
                            Number(register?.openingBalance || 0));
                        
                        return (
                          <tr key={m.id} className="group hover:bg-gray-50/50 transition-all cursor-default">
                             <td className="px-10 py-6 text-sm font-bold text-gray-900">{fmtTime(m.createdAt)}</td>
                             <td className="px-6 py-6">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 w-fit ${
                                    m.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                   <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                   CASH {m.type}
                                </span>
                             </td>
                             <td className="px-10 py-6 font-bold">
                                <p className="text-sm text-gray-900 leading-tight">{m.description}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Automated Ledger Entry</p>
                             </td>
                             <td className={`px-10 py-6 text-right font-black text-sm tracking-tight ${m.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {m.type === 'IN' ? '+' : '-'}{fmtCurrency(m.amount)}
                             </td>
                             <td className="px-10 py-6 text-right font-black text-gray-900 text-sm tracking-tight opacity-50">
                                {fmtCurrency(balanceAfter)}
                             </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
               </table>
            </div>

            <div className="p-8 bg-gray-50/30 flex items-center justify-between border-t border-gray-50">
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Showing {movements.length} of {movements.length} movements today
               </p>
               <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all opacity-30 cursor-not-allowed">
                     <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all opacity-30 cursor-not-allowed">
                     <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </div>
          </section>

        </main>
      </div>

      {/* Modals ────────────────────────────────────────────────────────────────── */}
      <CashModal 
        isOpen={isOpenModalOpen} 
        onClose={() => setIsOpenModalOpen(false)}
        title="Open Cash Register"
        subtitle="Start a new session by recording the initial physical cash."
        actionLabel="Start Session"
        onSubmit={async (data: any) => {
            await openCash(data);
            fetchStatus();
        }}
        fields={[
            { name: 'openingBalance', label: 'Opening Balance', type: 'number', placeholder: '0.00', required: true },
            { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Initial denominations, etc...' }
        ]}
      />

      <CashModal 
        isOpen={isCloseModalOpen} 
        onClose={() => setIsCloseModalOpen(false)}
        title="Close Cash Register"
        subtitle="Record final counts to reconcile with the digital expected balance."
        actionLabel="Finalize & Close"
        status="warning"
        onSubmit={async (data: any) => {
            await closeCash(data);
            fetchStatus();
        }}
        fields={[
            { name: 'closingBalance', label: 'Physical Cash Count', type: 'number', placeholder: '0.00', required: true },
            { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Discrepancy reasons, observations...' }
        ]}
      />

      <CashModal 
        isOpen={isMovementModalOpen} 
        onClose={() => setIsMovementModalOpen(false)}
        title="Manual Adjustment"
        subtitle="Log an unexpected cash inflow or operational expense."
        actionLabel="Record Movement"
        onSubmit={async (data: any) => {
            await createCashMovement(data);
            fetchStatus();
        }}
        fields={[
            { name: 'type', label: 'Movement Type', type: 'select', options: [{v:'IN', l:'Cash In'}, {v:'OUT', l:'Cash Out'}], required: true },
            { name: 'amount', label: 'Adjustment Amount', type: 'number', placeholder: '0.00', required: true },
            { name: 'description', label: 'Purpose', type: 'text', placeholder: 'e.g. Petty cash refill, office supplies...', required: true }
        ]}
      />

    </div>
  );
}

// ── Shared UI Components ───────────────────────────────────────────────────────

function CashModal({ isOpen, onClose, title, subtitle, fields, onSubmit, actionLabel, status = 'default' }: any) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
        await onSubmit(formData);
        onClose();
        setFormData({});
    } catch (err: any) {
        setError(err.response?.data?.message || 'Action failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
         <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                  {status === 'warning' ? <Lock className="w-6 h-6" /> : <DollarSign className="w-6 h-6" />}
               </div>
               <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">{title}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{subtitle}</p>
               </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-300 hover:text-gray-900 transition-all">
               <X className="w-6 h-6" />
            </button>
         </div>

         <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {fields.map((f: any) => (
                <div key={f.name} className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">{f.label}</label>
                    {f.type === 'textarea' ? (
                        <textarea 
                            required={f.required}
                            className="w-full bg-[#F5F8FA] border-2 border-transparent focus:border-blue-100 rounded-2xl p-4 text-sm font-medium focus:outline-none transition-all resize-none h-24"
                            placeholder={f.placeholder}
                            onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                        />
                    ) : f.type === 'select' ? (
                        <select 
                            required={f.required}
                            className="w-full bg-[#F5F8FA] border-2 border-transparent focus:border-blue-100 rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                            onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                        >
                            <option value="">Select option...</option>
                            {f.options.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
                        </select>
                    ) : (
                        <input 
                            type={f.type}
                            required={f.required}
                            step="0.01"
                            className="w-full bg-[#F5F8FA] border-2 border-transparent focus:border-blue-100 rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all"
                            placeholder={f.placeholder}
                            onChange={e => setFormData({ ...formData, [f.name]: f.type === 'number' ? parseFloat(e.target.value) : e.target.value })}
                        />
                    )}
                </div>
            ))}

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[10px] font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            <button 
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
                    status === 'warning' ? 'bg-amber-500 text-white shadow-amber-100 hover:bg-amber-600' : 'bg-[#0052FF] text-white shadow-blue-100 hover:bg-blue-700'
                }`}
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : actionLabel}
            </button>
         </form>
      </div>
    </div>
  );
}
