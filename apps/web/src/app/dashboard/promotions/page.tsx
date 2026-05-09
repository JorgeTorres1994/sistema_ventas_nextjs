"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
  Ticket, Tag, Gift, Plus, Search, Calendar, 
  CheckCircle2, XCircle, Clock, ArrowRight,
  TrendingUp, Percent, Users, ShoppingBag, 
  Zap, MoreVertical, Filter, Star, Trophy, X, Save, Edit2, Power
} from 'lucide-react';
import { 
  getPromotions, createPromotion, updatePromotion, togglePromotionStatus,
  getCoupons, createCoupon, updateCoupon, toggleCouponStatus 
} from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState<'promos' | 'coupons'>('promos');
  const [promotions, setPromotions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // Form State
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    type: 'PERCENTAGE',
    value: 0,
    minPurchase: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    code: '',
    usageLimit: 100
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'promos') {
        const data = await getPromotions();
        setPromotions(data);
      } else {
        const data = await getCoupons();
        setCoupons(data);
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setFormData({
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      minPurchase: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      code: '',
      usageLimit: 100
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setIsEditing(true);
    setSelectedItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      type: item.type || 'PERCENTAGE',
      value: Number(item.value),
      minPurchase: Number(item.minPurchase || 0),
      startDate: new Date(item.startDate).toISOString().split('T')[0],
      endDate: new Date(item.endDate).toISOString().split('T')[0],
      code: item.code || '',
      usageLimit: item.usageLimit || 100
    });
    setIsFormOpen(true);
    setIsDetailOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    const toastId = toast.loading(isEditing ? 'Actualizando...' : 'Creando...');
    
    try {
      if (activeTab === 'promos') {
        if (isEditing) await updatePromotion(selectedItem.id, formData);
        else await createPromotion(formData);
      } else {
        if (isEditing) await updateCoupon(selectedItem.id, formData);
        else await createCoupon(formData);
      }
      
      toast.success(isEditing ? 'Actualizado correctamente' : 'Creado correctamente', { id: toastId });
      setIsFormOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar solicitud', { id: toastId });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleToggleStatus = async (item: any) => {
    const toastId = toast.loading('Cambiando estado...');
    try {
      if (activeTab === 'promos') await togglePromotionStatus(item.id);
      else await toggleCouponStatus(item.id);
      
      toast.success('Estado actualizado', { id: toastId });
      fetchData();
      if (isDetailOpen) setIsDetailOpen(false);
    } catch (error) {
      toast.error('Error al cambiar estado', { id: toastId });
    }
  };

  const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
      active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    }`}>
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-10">
          <div className="max-w-7xl mx-auto space-y-10">
            
            {/* Optimized Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Estrategia de Crecimiento</p>
                <h1 className="text-3xl lg:text-5xl font-black text-foreground tracking-tighter leading-none">Promociones</h1>
                <p className="text-sm text-on-surface-variant font-medium mt-2 max-w-lg">Gestione campañas de fidelización, cupones y programas de marketing.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleOpenCreate}
                  className="w-full lg:w-auto flex items-center justify-center gap-4 px-10 py-5 bg-primary text-on-primary rounded-[24px] text-[11px] font-black uppercase tracking-widest hover:opacity-90 shadow-2xl shadow-primary/30 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>{activeTab === 'promos' ? 'Nueva Promoción' : 'Nuevo Cupón'}</span>
                </button>
              </div>
            </div>

            {/* Loyalty Stats Grid - Premium ERP Styling */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {[
                { label: 'Puntos Emitidos', value: '24.5k', icon: Trophy, color: 'text-primary', bg: 'bg-primary/10', trend: '+12%' },
                { label: 'Clientes VIP', value: '186', icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'ACTIVOS' },
                { label: 'Cupones Usados', value: '1,240', icon: Tag, color: 'text-rose-500', bg: 'bg-rose-500/10', trend: 'MES' },
                { label: 'Costo Promo', value: 'S/ 4.2k', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '-5%' },
              ].map((m, i) => (
                <div key={i} className="bg-card p-6 lg:p-8 rounded-[32px] border border-outline-variant/30 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
                   <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:scale-125 transition-transform duration-700">
                      <m.icon className={`w-24 h-24 ${m.color}`} />
                   </div>
                   <div className="flex items-center justify-between mb-6 relative z-10">
                      <div className={`${m.bg} ${m.color} w-12 h-12 rounded-2xl flex items-center justify-center border border-current/10`}>
                        <m.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-on-surface-variant/20 tracking-tighter">0{i+1}</span>
                   </div>
                   <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2 opacity-60 relative z-10">{m.label}</p>
                   <div className="flex items-baseline gap-2 relative z-10">
                      <p className="text-2xl lg:text-4xl font-black text-foreground tracking-tighter leading-none">{m.value}</p>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${m.trend.startsWith('+') ? 'text-emerald-500' : 'text-on-surface-variant/40'}`}>{m.trend}</span>
                   </div>
                </div>
              ))}
            </div>

            {/* Standardized Filter Bar (52px) & Tabs */}
            <div className="bg-card rounded-[32px] border border-outline-variant/30 shadow-sm p-3">
               <div className="flex flex-col lg:flex-row items-center gap-3">
                  <div className="flex items-center gap-2 bg-surface-low p-1.5 rounded-[24px] w-full lg:w-fit border border-outline-variant/20 shadow-inner">
                    <button 
                      onClick={() => setActiveTab('promos')}
                      className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 h-[40px] rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'promos' ? 'bg-card text-primary shadow-lg border border-outline-variant' : 'text-on-surface-variant hover:text-foreground opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Zap className={`w-3.5 h-3.5 ${activeTab === 'promos' ? 'fill-current' : ''}`} />
                      Campañas
                    </button>
                    <button 
                      onClick={() => setActiveTab('coupons')}
                      className={`flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 h-[40px] rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'coupons' ? 'bg-card text-primary shadow-lg border border-outline-variant' : 'text-on-surface-variant hover:text-foreground opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Ticket className={`w-3.5 h-3.5 ${activeTab === 'coupons' ? 'fill-current' : ''}`} />
                      Cupones
                    </button>
                  </div>

                  <div className="flex items-center gap-4 bg-surface-low border border-outline-variant/20 rounded-[24px] px-6 h-[52px] flex-1 shadow-inner focus-within:bg-card focus-within:border-primary/40 transition-all w-full">
                    <Search className="w-5 h-5 text-on-surface-variant/40 flex-shrink-0" />
                    <input 
                      placeholder={`Buscar por nombre o descripción de ${activeTab === 'promos' ? 'campaña' : 'cupón'}...`}
                      className="bg-transparent text-sm font-bold text-foreground outline-none flex-1 placeholder:text-on-surface-variant/30"
                    />
                  </div>
               </div>
            </div>

            {/* Content List - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-80 bg-card rounded-[48px] border border-outline-variant animate-pulse shadow-sm"></div>
                ))
              ) : activeTab === 'promos' ? (
                promotions.length === 0 ? (
                  <div className="col-span-full py-24 text-center bg-card rounded-[48px] border border-outline-variant shadow-sm border-dashed">
                    <div className="w-24 h-24 bg-surface-low rounded-full flex items-center justify-center mx-auto mb-6">
                      <Gift className="w-12 h-12 text-on-surface-variant/20" />
                    </div>
                    <h3 className="text-lg font-black text-foreground uppercase tracking-widest mb-2">Sin campañas vigentes</h3>
                    <p className="text-on-surface-variant font-medium opacity-60 max-w-sm mx-auto">Inicie su primera estrategia de marketing para potenciar el crecimiento.</p>
                  </div>
                ) : (
                  promotions.map((promo: any) => (
                    <div key={promo.id} className="bg-card rounded-[48px] p-8 lg:p-10 border border-outline-variant shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col">
                       <div className="flex justify-between items-start mb-8">
                          <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all ${promo.isActive ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary group-hover:scale-110 shadow-lg shadow-primary/10' : 'bg-surface-low text-on-surface-variant/40 border border-outline-variant'}`}>
                             <Percent className="w-8 h-8" />
                          </div>
                          <StatusBadge active={promo.isActive} />
                       </div>
                       
                       <div className="flex-1">
                          <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors leading-none">{promo.name}</h3>
                          <p className="text-on-surface-variant text-sm font-medium mb-8 line-clamp-2 opacity-70 leading-relaxed">{promo.description}</p>
                       </div>
                       
                       <div className="space-y-4 mb-10 bg-surface-low p-6 rounded-[32px] border border-outline-variant/30">
                          <div className="flex items-center gap-3 text-[10px] font-black text-foreground uppercase tracking-widest">
                             <Clock className="w-4 h-4 text-primary opacity-60" />
                             <span className="opacity-40">Finaliza:</span>
                             <span>{format(new Date(promo.endDate), 'dd MMM yyyy', { locale: es })}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-black text-foreground uppercase tracking-widest">
                             <ShoppingBag className="w-4 h-4 text-emerald-500 opacity-60" />
                             <span className="opacity-40">Min. Compra:</span>
                             <span>S/ {Number(promo.minPurchase || 0).toLocaleString()}</span>
                          </div>
                       </div>
                       
                       <div className="flex gap-3">
                          <button 
                            onClick={() => { setSelectedItem(promo); setIsDetailOpen(true); }}
                            className="flex-1 h-16 bg-surface-low text-foreground border border-outline-variant rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-card hover:border-primary transition-all active:scale-95 shadow-sm"
                          >
                             Detalles
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(promo)}
                            className="w-16 h-16 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-on-primary transition-all shadow-sm active:scale-90 border border-primary/20 flex items-center justify-center"
                          >
                             <Edit2 className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                  ))
                )
              ) : (
                coupons.length === 0 ? (
                  <div className="col-span-full py-24 text-center bg-card rounded-[48px] border border-outline-variant shadow-sm border-dashed">
                    <div className="w-24 h-24 bg-surface-low rounded-full flex items-center justify-center mx-auto mb-6">
                      <Ticket className="w-12 h-12 text-on-surface-variant/20" />
                    </div>
                    <h3 className="text-lg font-black text-foreground uppercase tracking-widest mb-2">Sin cupones activos</h3>
                    <p className="text-on-surface-variant font-medium opacity-60 max-w-sm mx-auto">Emita códigos promocionales para recompensar la fidelidad de sus clientes.</p>
                  </div>
                ) : (
                  coupons.map((coupon: any) => (
                    <div key={coupon.id} className="bg-card rounded-[48px] p-8 lg:p-10 border border-outline-variant shadow-sm hover:shadow-2xl hover:border-emerald-500/20 transition-all group relative overflow-hidden flex flex-col">
                       <div className="flex justify-between items-start mb-8">
                          <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all ${coupon.isActive ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 shadow-lg shadow-emerald-500/10' : 'bg-surface-low text-on-surface-variant/40 border border-outline-variant'}`}>
                             <Ticket className="w-8 h-8" />
                          </div>
                          <StatusBadge active={coupon.isActive} />
                       </div>

                       <div className="flex-1">
                          <div className="inline-block px-4 py-1.5 bg-foreground text-background text-[9px] font-black rounded-lg tracking-[0.2em] uppercase border border-outline-variant/30 shadow-sm mb-4">
                             {coupon.code}
                          </div>
                          <h3 className="text-3xl font-black text-foreground mb-2 tracking-tighter group-hover:text-emerald-500 transition-colors leading-none">
                            {coupon.type === 'PERCENTAGE' ? `${Number(coupon.value)}% OFF` : `S/ ${Number(coupon.value)} OFF`}
                          </h3>
                          <p className="text-on-surface-variant text-sm font-medium mb-8 line-clamp-2 opacity-70 leading-relaxed">{coupon.description}</p>
                       </div>
                       
                       <div className="space-y-4 mb-10 bg-surface-low p-6 rounded-[32px] border border-outline-variant/30">
                          <div className="flex items-center gap-3 text-[10px] font-black text-foreground uppercase tracking-widest">
                             <Calendar className="w-4 h-4 text-emerald-500 opacity-60" />
                             <span className="opacity-40">Validez:</span>
                             <span>{format(new Date(coupon.endDate), 'dd/MM/yy')}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-black text-foreground uppercase tracking-widest">
                             <Users className="w-4 h-4 text-primary opacity-60" />
                             <span className="opacity-40">Uso:</span>
                             <span className={coupon.usageCount >= coupon.usageLimit ? 'text-rose-500' : ''}>
                              {coupon.usageCount} / {coupon.usageLimit || '∞'}
                             </span>
                          </div>
                       </div>
                       
                       <div className="flex gap-3">
                          <button 
                            onClick={() => { setSelectedItem(coupon); setIsDetailOpen(true); }}
                            className="flex-1 h-16 bg-surface-low text-foreground border border-outline-variant rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-card hover:border-emerald-500 transition-all active:scale-95 shadow-sm"
                          >
                             Detalles
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(coupon)}
                            className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-90 border border-emerald-500/20 flex items-center justify-center"
                          >
                             <Edit2 className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                  ))
                )
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Form Modal (Create/Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsFormOpen(false)}></div>
           <div className="bg-card w-full max-w-2xl rounded-[32px] sm:rounded-[48px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 border border-outline-variant flex flex-col max-h-[90vh]">
              <div className="p-6 sm:p-10 border-b border-outline-variant flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-20">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-foreground mb-1 tracking-tight">
                    {isEditing ? 'Optimizar ' : 'Nueva '} 
                    {activeTab === 'promos' ? 'Campaña' : 'Cupón'}
                  </h2>
                  <p className="text-on-surface-variant font-medium text-[9px] sm:text-sm opacity-60 uppercase tracking-widest">Configuración de Estrategia Comercial</p>
                </div>
                <button onClick={() => setIsFormOpen(false)} className="p-3 sm:p-4 hover:bg-surface-low rounded-2xl transition-all active:scale-90 text-on-surface-variant">
                  <X className="w-6 h-6 sm:w-7 h-7" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 sm:p-10 space-y-6 sm:space-y-8 overflow-y-auto flex-1">
                {activeTab === 'promos' ? (
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2 opacity-60">Identificador de Campaña</label>
                      <input 
                        type="text" required
                        className="w-full px-8 py-5 bg-surface-low border border-outline-variant rounded-3xl focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-foreground placeholder:text-on-surface-variant/30 shadow-sm"
                        placeholder="ej. BLACK FRIDAY EXCLUSIVE"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2 opacity-60">Narrativa de la Promoción</label>
                      <textarea 
                        className="w-full px-8 py-5 bg-surface-low border border-outline-variant rounded-3xl focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-foreground placeholder:text-on-surface-variant/30 min-h-[120px] shadow-sm leading-relaxed"
                        placeholder="Detalles estratégicos de la oferta para el cliente..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2 opacity-60">Código Estratégico</label>
                        <input 
                          type="text" required
                          className="w-full px-8 py-5 bg-surface-low border border-outline-variant rounded-3xl focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-primary uppercase tracking-[0.2em] placeholder:text-on-surface-variant/30 shadow-sm"
                          placeholder="ej. GENESIS2026"
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2 opacity-60">Cuota de Aplicaciones</label>
                        <input 
                          type="number" required
                          className="w-full px-8 py-5 bg-surface-low border border-outline-variant rounded-3xl focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-foreground shadow-sm"
                          value={formData.usageLimit}
                          onChange={(e) => setFormData({...formData, usageLimit: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2 opacity-60">Algoritmo de Descuento</label>
                    <div className="relative">
                      <select 
                        className="w-full px-8 py-5 bg-surface-low border border-outline-variant rounded-3xl focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-foreground appearance-none shadow-sm cursor-pointer"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="PERCENTAGE">Proporcional (%)</option>
                        <option value="FIXED">Monto Absoluto (S/)</option>
                      </select>
                      <Zap className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary opacity-40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2 opacity-60">Factor de Beneficio</label>
                    <input 
                      type="number" step="0.01" required
                      className="w-full px-8 py-5 bg-surface-low border border-outline-variant rounded-3xl focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-foreground shadow-sm"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2 opacity-60">Lanzamiento</label>
                    <input 
                      type="date" required
                      className="w-full px-8 py-5 bg-surface-low border border-outline-variant rounded-3xl focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-foreground shadow-sm uppercase text-[11px] tracking-widest"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2 opacity-60">Finalización</label>
                    <input 
                      type="date" required
                      className="w-full px-8 py-5 bg-surface-low border border-outline-variant rounded-3xl focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-foreground shadow-sm uppercase text-[11px] tracking-widest"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2 opacity-60">Barrera de Entrada (Compra Mínima S/)</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full px-8 py-5 bg-surface-low border border-outline-variant rounded-3xl focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-foreground shadow-sm"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({...formData, minPurchase: parseFloat(e.target.value) || 0})}
                  />
                </div>

                </div>
                <div className="p-6 sm:p-10 bg-surface-low border-t border-outline-variant/30 flex-shrink-0">
                  <button 
                    type="submit"
                    disabled={loadingAction}
                    className="w-full py-5 bg-primary text-on-primary rounded-[24px] sm:rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                  >
                    {loadingAction ? <Zap className="w-6 h-6 animate-pulse" /> : <Save className="w-6 h-6" />}
                    {isEditing ? 'Ejecutar Actualización' : 'Sincronizar Campaña'}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsDetailOpen(false)}></div>
           <div className="bg-card w-full max-w-lg rounded-[40px] sm:rounded-[56px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-outline-variant flex flex-col max-h-[95vh]">
              <div className={`h-32 sm:h-40 flex items-center justify-center relative overflow-hidden transition-colors flex-shrink-0 ${activeTab === 'promos' ? 'bg-primary' : 'bg-emerald-600'}`}>
                 <div className="absolute inset-0 bg-black/10"></div>
                 {activeTab === 'promos' ? <Zap className="w-24 h-24 sm:w-32 h-32 text-white/10 absolute right-[-20px] top-[-20px] rotate-12" /> : <Ticket className="w-24 h-24 sm:w-32 h-32 text-white/10 absolute right-[-20px] top-[-20px] rotate-12" />}
                 <div className="bg-white/20 p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] backdrop-blur-xl border border-white/30 shadow-2xl relative z-10 scale-100 sm:scale-110">
                    {activeTab === 'promos' ? <Gift className="w-8 h-8 sm:w-12 h-12 text-white" /> : <Ticket className="w-8 h-8 sm:w-12 h-12 text-white" />}
                 </div>
                 <button 
                   onClick={() => setIsDetailOpen(false)}
                   className="absolute top-4 sm:top-8 right-4 sm:right-8 p-2.5 sm:p-3 bg-black/20 hover:bg-black/40 text-white rounded-2xl transition-all active:scale-90 z-20 backdrop-blur-md"
                 >
                    <X className="w-5 h-5 sm:w-6 h-6" />
                 </button>
              </div>

              <div className="p-6 sm:p-14 overflow-y-auto flex-1">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <h2 className="text-3xl font-black text-foreground mb-2 tracking-tight">{selectedItem.name || selectedItem.code}</h2>
                       <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] opacity-60">
                        {activeTab === 'promos' ? 'Inteligencia de Marketing' : 'Cupón Estratégico'}
                       </p>
                    </div>
                    <StatusBadge active={selectedItem.isActive} />
                 </div>

                 <p className="text-on-surface-variant font-medium mb-10 leading-relaxed text-base opacity-80">
                    {selectedItem.description || 'Este registro no cuenta con una narrativa detallada asignada en la configuración actual.'}
                 </p>

                 <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="bg-surface-low p-8 rounded-[32px] border border-outline-variant group hover:border-primary/20 transition-all">
                       <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 opacity-60">Beneficio</p>
                       <p className="text-2xl font-black text-foreground tracking-tighter">
                          {selectedItem.type === 'PERCENTAGE' ? `${Number(selectedItem.value)}%` : `S/ ${Number(selectedItem.value)}`}
                          <span className="text-[10px] text-primary ml-2 uppercase tracking-widest">{selectedItem.type === 'PERCENTAGE' ? 'DTO' : 'NETO'}</span>
                       </p>
                    </div>
                    <div className="bg-surface-low p-8 rounded-[32px] border border-outline-variant group hover:border-primary/20 transition-all">
                       <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-3 opacity-60">Threshold</p>
                       <p className="text-2xl font-black text-foreground tracking-tighter">
                          S/ {Number(selectedItem.minPurchase || 0).toFixed(2)}
                       </p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-8 border-t border-outline-variant/30">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-60">Ciclo de Vida:</span>
                       <span className="text-[11px] font-black text-foreground flex items-center gap-3 uppercase tracking-widest bg-surface-low px-4 py-2 rounded-xl border border-outline-variant/30 shadow-sm">
                          <Calendar className="w-4 h-4 text-primary" />
                          {format(new Date(selectedItem.startDate), 'dd/MM/yy')} - {format(new Date(selectedItem.endDate), 'dd/MM/yy')}
                       </span>
                    </div>
                 </div>
              </div>
              
              <div className="p-6 sm:p-12 bg-surface-low flex flex-col sm:flex-row gap-4 border-t border-outline-variant/30 flex-shrink-0">
                 <button 
                   onClick={() => handleOpenEdit(selectedItem)}
                   className="flex-1 py-4 sm:py-5 bg-foreground text-background rounded-2xl sm:rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl shadow-foreground/10 flex items-center justify-center gap-4 active:scale-95"
                 >
                    <Edit2 className="w-5 h-5" /> Editar Registro
                 </button>
                 <button 
                   onClick={() => handleToggleStatus(selectedItem)}
                   className={`py-4 sm:p-5 rounded-2xl sm:rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 border-2 active:scale-95 ${
                     selectedItem.isActive 
                     ? 'bg-card text-rose-500 border-rose-500/20 hover:bg-rose-500/10 shadow-lg shadow-rose-500/10' 
                     : 'bg-emerald-500 text-white border-emerald-500 hover:opacity-90 shadow-lg shadow-emerald-500/20'
                   }`}
                 >
                    <Power className="w-5 h-5" />
                    {selectedItem.isActive ? 'Desactivar' : 'Activar'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

