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
  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex-1 group hover:border-blue-100 transition-all">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
      color === 'blue' ? 'bg-blue-50 text-blue-600' : 
      color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 
      color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'
    }`}>
      <Icon className="w-7 h-7" />
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{fmtCurrency(amount)}</h3>
      <div className="flex items-center gap-2">
         {trend && <trend.icon className="w-3 h-3 text-emerald-500" />}
         <p className="text-[11px] font-bold text-gray-400">{subtitle}</p>
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl border border-white/20">
        <div className="p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{title}</h2>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">{subtitle}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map((f: any) => (
              <div key={f.name}>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{f.label}</label>
                {f.type === 'select' ? (
                  <select 
                    required={f.required}
                    onChange={(e) => setFormData({...formData, [f.name]: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none font-bold text-gray-700"
                  >
                    <option value="">Seleccione opción...</option>
                    {f.options.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea 
                    required={f.required}
                    placeholder={f.placeholder}
                    onChange={(e) => setFormData({...formData, [f.name]: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none font-bold text-gray-700 h-32 resize-none"
                  />
                ) : (
                  <input 
                    type={f.type}
                    required={f.required}
                    placeholder={f.placeholder}
                    onChange={(e) => setFormData({...formData, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none font-bold text-gray-700"
                  />
                )}
              </div>
            ))}
            
            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading}
                className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-xl transition-all active:scale-[0.98] ${
                  status === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
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
      <div className="flex h-screen bg-[#F8F9FC] items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-hidden">
        <TopBar />

        {/* Module Header */}
        <div className="px-10 py-8 bg-transparent flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">Control de Caja</h1>
            <p className="text-base text-gray-400 font-medium">Control centralizado de flujos de efectivo • Nexus Genesis</p>
          </div>
          <div className="flex items-center gap-3">
             {refreshing && <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mr-2" />}
             {!register ? (
                <button 
                    onClick={() => setIsOpenModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-100 flex items-center gap-3"
                >
                    <Unlock className="w-5 h-5" /> Apertura de Turno
                </button>
             ) : (
                <button 
                    onClick={() => setIsCloseModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-100 flex items-center gap-3"
                >
                    <Lock className="w-5 h-5" /> Cerrar Caja
                </button>
             )}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-10 py-10 space-y-10">
          
          {/* Metrics Grid */}
          <div className="flex gap-8">
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
          <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-10 py-8 flex items-center justify-between border-b border-gray-50 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-4">
                 <h2 className="text-xl font-black text-gray-900">Bitácora de Movimientos</h2>
                 <span className="px-3 py-1 bg-gray-50 text-gray-400 rounded-full text-[10px] font-black tracking-widest uppercase">Auditoría</span>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                    onClick={() => register && setIsMovementModalOpen(true)}
                    disabled={!register}
                    className="px-6 py-3 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2 disabled:opacity-30"
                 >
                    <Plus className="w-4 h-4" /> Ajuste Manual
                 </button>
                 <button className="p-3.5 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl border border-gray-50"><Download className="w-4 h-4"/></button>
              </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/30 text-[10px] font-black text-gray-400 uppercase tracking-[2px] border-b border-gray-50">
                       <th className="px-10 py-6">Cronología</th>
                       <th className="px-6 py-6 text-center">Naturaleza</th>
                       <th className="px-10 py-6">Concepto / Referencia</th>
                       <th className="px-10 py-6 text-right">Monto Neto</th>
                       <th className="px-10 py-6 text-right opacity-50">Saldo Posterior</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {movements.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-24 text-center">
                           <RefreshCw className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                           <p className="text-sm font-black text-gray-300 uppercase tracking-widest">Esperando transacciones...</p>
                        </td>
                      </tr>
                    ) : (
                      movements.map((m, idx) => {
                        const balanceAfter = movements.slice(idx).reduce((sum, mov) => 
                            sum + (mov.type === 'IN' ? Number(mov.amount) : -Number(mov.amount)), 
                            Number(register?.openingBalance || 0));
                        
                        return (
                          <tr key={m.id} className="group hover:bg-blue-50/20 transition-all animate-in fade-in">
                             <td className="px-10 py-6 text-sm font-bold text-gray-900">{fmtTime(m.createdAt)}</td>
                             <td className="px-6 py-6 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase inline-flex items-center gap-1.5 ${
                                    m.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                }`}>
                                   <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                   {m.type === 'IN' ? 'Entrada' : 'Salida'}
                                </span>
                             </td>
                             <td className="px-10 py-6">
                                <p className="text-sm font-black text-gray-900 leading-tight">{m.description || 'Transacción POS'}</p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Registro de Auditoría</p>
                             </td>
                             <td className={`px-10 py-6 text-right font-black text-sm tracking-tight ${m.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {m.type === 'IN' ? '+' : '-'}{fmtCurrency(m.amount)}
                             </td>
                             <td className="px-10 py-6 text-right font-black text-gray-900 text-sm tracking-tight opacity-20">
                                {fmtCurrency(balanceAfter)}
                             </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
               </table>
            </div>
          </section>

        </main>
      </div>

      <CashModal 
        isOpen={isOpenModalOpen} 
        onClose={() => setIsOpenModalOpen(false)}
        title="Apertura de Caja"
        subtitle="Registre el capital inicial antes de iniciar operaciones POS."
        actionLabel="Iniciar Turno"
        onSubmit={async (data: any) => {
            const toastId = toast.loading('Sincronizando...');
            try {
                await openCash(data);
                toast.success('Sesión iniciada correctamente', { id: toastId });
                fetchStatus();
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Error en validación', { id: toastId });
            }
        }}
        fields={[
            { name: 'openingBalance', label: 'Capital Inicial (Uso de Caja)', type: 'number', placeholder: 'S/ 0.00', required: true },
            { name: 'notes', label: 'Notas de Auditoría', type: 'textarea', placeholder: 'Ej: Diferencias en billetes menores...' }
        ]}
      />

      <CashModal 
        isOpen={isCloseModalOpen} 
        onClose={() => setIsCloseModalOpen(false)}
        title="Cierre de Caja"
        subtitle="Confirme el saldo físico para realizar el cierre de caja."
        actionLabel="Finalizar Operación"
        status="warning"
        onSubmit={async (data: any) => {
            const toastId = toast.loading('Calculando diferencias...');
            try {
                await closeCash(data);
                toast.success('Ciclo de caja cerrado', { id: toastId });
                fetchStatus();
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Error en cierre', { id: toastId });
            }
        }}
        fields={[
            { name: 'closingBalance', label: 'Efectivo Físico en Caja', type: 'number', placeholder: 'S/ 0.00', required: true },
            { name: 'notes', label: 'Justificación de Diferencias', type: 'textarea', placeholder: 'Si existe descuadre, detalle los motivos...' }
        ]}
      />

      <CashModal 
        isOpen={isMovementModalOpen} 
        onClose={() => setIsMovementModalOpen(false)}
        title="Ajuste de Saldo"
        subtitle="Registre flujos externos (gastos, retiros, dotaciones)."
        actionLabel="Registrar Ajuste"
        onSubmit={async (data: any) => {
            const toastId = toast.loading('Auditando...');
            try {
                await createCashMovement(data);
                toast.success('Ajuste registrado', { id: toastId });
                fetchStatus();
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Error de registro', { id: toastId });
            }
        }}
        fields={[
            { name: 'type', label: 'Tipo de Flujo', type: 'select', options: [{v:'IN', l:'Reposición/Ingreso'}, {v:'OUT', l:'Gasto/Egreso'}], required: true },
            { name: 'amount', label: 'Monto Neto', type: 'number', placeholder: 'S/ 0.00', required: true },
            { name: 'description', label: 'Concepto Detallado', type: 'text', placeholder: 'Ej: Pago de servicios básicos...', required: true }
        ]}
      />
    </div>
  );
}
