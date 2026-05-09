"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
    Unlock, Lock, TrendingUp, Target, 
    CheckCircle2, Plus, Download, RefreshCw, 
    ChevronLeft, ChevronRight, Loader2,
    DollarSign, AlertCircle, Calendar
} from 'lucide-react';
import { 
    getCashStatus, 
    getCashMovements, 
    openCash, 
    closeCash, 
    createCashMovement 
} from '@/lib/api';
import { toast } from 'sonner';

// ── Components ─────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) => `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

const StatCard = ({ title, amount, subtitle, icon: Icon, color, trend }: any) => (
  <div className="bg-card p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] border border-outline-variant shadow-sm flex-1 min-w-[280px] lg:min-w-0 group hover:border-primary/30 transition-all">
    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center mb-4 lg:mb-6 transition-transform group-hover:scale-110 ${
      color === 'blue' ? 'bg-primary/10 text-primary' : 
      color === 'indigo' ? 'bg-primary/10 text-primary' : 
      color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface-low text-on-surface-variant'
    }`}>
      <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
    </div>
    <div className="space-y-1">
      <p className="text-[9px] lg:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-2xl lg:text-3xl font-black text-foreground tracking-tighter">{fmtCurrency(amount)}</h3>
      <div className="flex items-center gap-2">
         {trend && <trend.icon className="w-3 h-3 text-emerald-500" />}
         <p className="text-[10px] lg:text-[11px] font-bold text-on-surface-variant truncate">{subtitle}</p>
      </div>
    </div>
  </div>
);

const CashModal = ({ isOpen, onClose, title, subtitle, actionLabel, onSubmit, fields, status }: any) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card w-full max-w-lg rounded-[32px] lg:rounded-[40px] overflow-hidden shadow-2xl border border-outline-variant max-h-[90vh] overflow-y-auto">
        <div className="p-6 lg:p-10">
          <div className="mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-black text-foreground tracking-tight mb-2">{title}</h2>
            <p className="text-xs lg:text-sm text-on-surface-variant font-medium leading-relaxed">{subtitle}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
            {fields.map((f: any) => (
              <div key={f.name}>
                <label className="block text-[9px] lg:text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2 lg:mb-3">{f.label}</label>
                {f.type === 'select' ? (
                  <select 
                    required={f.required}
                    onChange={(e) => setFormData({...formData, [f.name]: e.target.value})}
                    className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-surface-low border border-outline-variant rounded-xl lg:rounded-2xl focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-foreground text-sm"
                  >
                    <option value="" className="bg-card">Seleccione...</option>
                    {f.options.map((o: any) => <option key={o.v} value={o.v} className="bg-card">{o.l}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea 
                    required={f.required}
                    placeholder={f.placeholder}
                    onChange={(e) => setFormData({...formData, [f.name]: e.target.value})}
                    className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-surface-low border border-outline-variant rounded-xl lg:rounded-2xl focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-foreground h-24 lg:h-32 resize-none text-sm placeholder:text-on-surface-variant/50"
                  />
                ) : (
                  <input 
                    type={f.type}
                    required={f.required}
                    placeholder={f.placeholder}
                    onChange={(e) => setFormData({...formData, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value})}
                    className="w-full px-4 lg:px-6 py-3 lg:py-4 bg-surface-low border border-outline-variant rounded-xl lg:rounded-2xl focus:bg-card focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold text-foreground text-sm placeholder:text-on-surface-variant/50"
                  />
                )}
              </div>
            ))}
            
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 lg:py-4 text-on-surface-variant font-black uppercase text-[9px] lg:text-[10px] tracking-widest hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className={`flex-[2] py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-[0.2em] text-white shadow-xl transition-all active:scale-[0.98] ${
                  status === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-primary hover:opacity-90 shadow-primary/20'
                }`}
              >
                {loading ? 'Procesando...' : actionLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

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
      toast.error('Error al sincronizar el estado de caja');
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
      <div className="flex h-screen bg-background items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 w-full overflow-hidden">
        <TopBar />

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Module Header */}
          <div className="px-4 lg:px-10 py-6 lg:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${register ? 'bg-emerald-500 animate-pulse' : 'bg-on-surface-variant/30'}`} />
                <h1 className="text-2xl lg:text-4xl font-black text-foreground tracking-tight leading-none">Control de Caja</h1>
              </div>
              <p className="text-xs lg:text-base text-on-surface-variant font-medium">Gestión de flujos de efectivo • {register ? 'Turno Activo' : 'Caja Cerrada'}</p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
               {refreshing && <RefreshCw className="w-5 h-5 text-primary animate-spin mr-2" />}
               {!register ? (
                  <button 
                      onClick={() => setIsOpenModalOpen(true)}
                      className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black text-xs lg:text-sm transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 active:scale-95"
                  >
                      <Unlock className="w-4 h-4 lg:w-5 lg:h-5" /> Apertura
                  </button>
               ) : (
                  <button 
                      onClick={() => setIsCloseModalOpen(true)}
                      className="flex-1 md:flex-none bg-primary hover:opacity-90 text-on-primary px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-black text-xs lg:text-sm transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95"
                  >
                      <Lock className="w-4 h-4 lg:w-5 lg:h-5" /> Cerrar Caja
                  </button>
               )}
            </div>
          </div>

          <main className="px-4 lg:px-10 pb-20 space-y-6 lg:space-y-10">
            
            {/* Metrics Grid */}
            <div className="flex flex-col md:flex-row gap-4">
              <StatCard 
                title="Capital en Apertura" 
                amount={register?.openingBalance ?? 0}
                subtitle={register ? `Inicio: ${fmtTime(register.createdAt)}` : 'Terminal cerrada'}
                icon={register ? Unlock : Lock}
                color="blue"
              />
              <StatCard 
                title="Saldo Estimado" 
                amount={register?.currentBalance ?? 0}
                subtitle="Basado en facturación real"
                icon={TrendingUp}
                color="indigo"
                trend={{ icon: TrendingUp }}
              />
              <StatCard 
                title="Consistencia" 
                amount={register?.currentBalance ?? 0} 
                subtitle="Sincronizado con backend"
                icon={Target}
                color="gray"
                trend={{ icon: CheckCircle2 }}
              />
            </div>

            {/* Movements Section */}
            <section className="bg-card rounded-[24px] lg:rounded-[40px] shadow-sm border border-outline-variant overflow-hidden flex flex-col">
              <div className="px-5 lg:px-10 py-5 lg:py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-outline-variant bg-card sticky top-0 z-10">
                <div className="flex items-center gap-3 lg:gap-4">
                   <h2 className="text-lg lg:text-xl font-black text-foreground">Movimientos</h2>
                   <span className="px-2.5 py-1 bg-surface-low text-on-surface-variant rounded-full text-[8px] lg:text-[10px] font-black tracking-widest uppercase">Audit</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                   <button 
                      onClick={() => register && setIsMovementModalOpen(true)}
                      disabled={!register}
                      className="flex-1 sm:flex-none px-4 lg:px-6 py-2.5 lg:py-3 bg-surface-low text-on-surface-variant rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                   >
                      <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Ajuste Manual
                   </button>
                   <button className="p-2.5 lg:p-3.5 bg-surface-low text-on-surface-variant hover:text-primary rounded-xl border border-outline-variant active:scale-95 transition-all"><Download className="w-4 h-4"/></button>
                </div>
              </div>

              <div className="hidden md:block overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-low text-[10px] font-black text-on-surface-variant uppercase tracking-[2px] border-b border-outline-variant">
                         <th className="px-10 py-6">Cronología</th>
                         <th className="px-6 py-6 text-center">Naturaleza</th>
                         <th className="px-10 py-6">Concepto</th>
                         <th className="px-10 py-6 text-right">Monto</th>
                         <th className="px-10 py-6 text-right opacity-50">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {movements.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-24 text-center">
                             <RefreshCw className="w-12 h-12 text-on-surface-variant/10 mx-auto mb-4" />
                             <p className="text-sm font-black text-on-surface-variant/30 uppercase tracking-widest">Sin transacciones</p>
                          </td>
                        </tr>
                      ) : (
                        movements.map((m, idx) => {
                          const balanceAfter = movements.slice(idx).reduce((sum, mov) => 
                              sum + (mov.type === 'IN' ? Number(mov.amount) : -Number(mov.amount)), 
                              Number(register?.openingBalance || 0));
                          
                          return (
                            <tr key={m.id} className="group hover:bg-primary/5 transition-all animate-in fade-in">
                               <td className="px-10 py-6 text-sm font-bold text-foreground">{fmtTime(m.createdAt)}</td>
                               <td className="px-6 py-6 text-center">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase inline-flex items-center gap-1.5 ${
                                      m.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                  }`}>
                                     <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                     {m.type === 'IN' ? 'Entrada' : 'Salida'}
                                  </span>
                               </td>
                               <td className="px-10 py-6">
                                  <p className="text-sm font-black text-foreground leading-tight">{m.description || 'Transacción POS'}</p>
                                  <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-wider font-bold">Auditoría</p>
                               </td>
                               <td className={`px-10 py-6 text-right font-black text-sm tracking-tight ${m.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {m.type === 'IN' ? '+' : '-'}{fmtCurrency(m.amount)}
                                </td>
                               <td className="px-10 py-6 text-right font-black text-foreground text-sm tracking-tight opacity-20">
                                  {fmtCurrency(balanceAfter)}
                                </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                 </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-outline-variant">
                {movements.length === 0 ? (
                  <div className="py-20 text-center">
                    <RefreshCw className="w-10 h-10 text-on-surface-variant/10 mx-auto mb-4" />
                    <p className="text-xs font-black text-on-surface-variant/30 uppercase tracking-widest">Sin transacciones</p>
                  </div>
                ) : (
                  movements.map((m, idx) => {
                    const balanceAfter = movements.slice(idx).reduce((sum, mov) => 
                        sum + (mov.type === 'IN' ? Number(mov.amount) : -Number(mov.amount)), 
                        Number(register?.openingBalance || 0));
                    
                    return (
                      <div key={m.id} className="p-5 space-y-4 hover:bg-primary/5 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-black text-foreground">{fmtTime(m.createdAt)}</p>
                            <span className={`mt-2 px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase inline-flex items-center gap-1 ${
                                m.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                               {m.type === 'IN' ? 'Entrada' : 'Salida'}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-black tracking-tight ${m.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {m.type === 'IN' ? '+' : '-'}{fmtCurrency(m.amount)}
                            </p>
                            <p className="text-[10px] font-bold text-on-surface-variant mt-1">Saldo: {fmtCurrency(balanceAfter)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground leading-snug">{m.description || 'Transacción POS'}</p>
                          <p className="text-[9px] text-on-surface-variant mt-1 uppercase font-black tracking-tighter">Registro de Auditoría</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

          </main>
        </div>
      </div>

      <CashModal 
        isOpen={isOpenModalOpen} 
        onClose={() => setIsOpenModalOpen(false)}
        title="Apertura de Caja"
        subtitle="Registre el capital inicial antes de iniciar operaciones."
        actionLabel="Iniciar Turno"
        onSubmit={async (data: any) => {
            const toastId = toast.loading('Sincronizando...');
            try {
                await openCash(data);
                toast.success('Sesión iniciada', { id: toastId });
                fetchStatus();
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Error', { id: toastId });
            }
        }}
        fields={[
            { name: 'openingBalance', label: 'Capital Inicial', type: 'number', placeholder: 'S/ 0.00', required: true },
            { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Notas de apertura...' }
        ]}
      />

      <CashModal 
        isOpen={isCloseModalOpen} 
        onClose={() => setIsCloseModalOpen(false)}
        title="Cierre de Caja"
        subtitle="Confirme el saldo físico para finalizar el turno."
        actionLabel="Finalizar Operación"
        status="warning"
        onSubmit={async (data: any) => {
            const toastId = toast.loading('Calculando...');
            try {
                await closeCash(data);
                toast.success('Ciclo de caja cerrado', { id: toastId });
                fetchStatus();
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Error', { id: toastId });
            }
        }}
        fields={[
            { name: 'closingBalance', label: 'Efectivo Físico', type: 'number', placeholder: 'S/ 0.00', required: true },
            { name: 'notes', label: 'Justificación', type: 'textarea', placeholder: 'Detalle diferencias si existen...' }
        ]}
      />

      <CashModal 
        isOpen={isMovementModalOpen} 
        onClose={() => setIsMovementModalOpen(false)}
        title="Ajuste de Saldo"
        subtitle="Registre flujos externos (gastos, retiros)."
        actionLabel="Registrar"
        onSubmit={async (data: any) => {
            const toastId = toast.loading('Registrando...');
            try {
                await createCashMovement(data);
                toast.success('Ajuste registrado', { id: toastId });
                fetchStatus();
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Error', { id: toastId });
            }
        }}
        fields={[
            { name: 'type', label: 'Tipo', type: 'select', options: [{v:'IN', l:'Ingreso'}, {v:'OUT', l:'Egreso'}], required: true },
            { name: 'amount', label: 'Monto', type: 'number', placeholder: 'S/ 0.00', required: true },
            { name: 'description', label: 'Concepto', type: 'text', placeholder: 'Motivo del ajuste...', required: true }
        ]}
      />
    </div>
  );
}


