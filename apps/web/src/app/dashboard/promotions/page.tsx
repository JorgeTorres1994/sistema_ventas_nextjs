"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
  Ticket, 
  Tag, 
  Gift, 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Percent,
  Users,
  ShoppingBag,
  Zap,
  MoreVertical,
  Filter,
  Star,
  Trophy,
  X
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState<'promos' | 'coupons'>('promos');
  const [promotions, setPromotions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'promos') {
        const res = await api.get('/promotions');
        setPromotions(res.data);
      } else {
        const res = await api.get('/promotions/coupons');
        setCoupons(res.data);
      }
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
      active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
    }`}>
      {active ? 'Activo' : 'Inactivo'}
    </span>
  );

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans text-[#111827]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Promociones y Fidelización</h1>
                <p className="text-[#6B7280]">Gestiona tus campañas de marketing, cupones de descuento y programa de puntos.</p>
              </div>
              
              <button className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-[24px] text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                <Plus className="w-5 h-5" />
                {activeTab === 'promos' ? 'Nueva Promoción' : 'Nuevo Cupón'}
              </button>
            </div>

            {/* Loyalty Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-[-20px] top-[-20px] bg-blue-50 w-32 h-32 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                  <Trophy className="w-10 h-10 text-blue-600 mb-6 relative z-10" />
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Puntos Emitidos</h3>
                  <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-4xl font-black text-gray-900 tracking-tight">24.5k</span>
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +12%
                    </span>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-[-20px] top-[-20px] bg-emerald-50 w-32 h-32 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                  <Star className="w-10 h-10 text-emerald-600 mb-6 relative z-10" />
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Clientes VIP</h3>
                  <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-4xl font-black text-gray-900 tracking-tight">186</span>
                    <span className="text-xs font-bold text-gray-400">Activos</span>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-[-20px] top-[-20px] bg-rose-50 w-32 h-32 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                  <Tag className="w-10 h-10 text-rose-600 mb-6 relative z-10" />
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Cupones Usados</h3>
                  <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-4xl font-black text-gray-900 tracking-tight">1,240</span>
                    <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                       Este mes
                    </span>
                  </div>
               </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-gray-100/50 p-1.5 rounded-[28px] w-fit">
              <button 
                onClick={() => setActiveTab('promos')}
                className={`flex items-center gap-2 px-8 py-3 rounded-[22px] text-sm font-bold transition-all ${
                  activeTab === 'promos' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Zap className={`w-4 h-4 ${activeTab === 'promos' ? 'fill-blue-600' : ''}`} />
                Campañas Activas
              </button>
              <button 
                onClick={() => setActiveTab('coupons')}
                className={`flex items-center gap-2 px-8 py-3 rounded-[22px] text-sm font-bold transition-all ${
                  activeTab === 'coupons' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Ticket className={`w-4 h-4 ${activeTab === 'coupons' ? 'fill-blue-600' : ''}`} />
                Cupones de Descuento
              </button>
            </div>

            {/* Content List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-[40px] border border-gray-100 animate-pulse"></div>
                ))
              ) : activeTab === 'promos' ? (
                promotions.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-gray-100 shadow-sm">
                    <Gift className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No hay campañas vigentes</h3>
                    <p className="text-gray-400 text-sm">Crea tu primera promoción para incentivar las ventas.</p>
                  </div>
                ) : (
                  promotions.map((promo: any) => (
                    <div key={promo.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-50/50 transition-all group">
                       <div className="flex justify-between items-start mb-6">
                          <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                             <Percent className="w-6 h-6" />
                          </div>
                          <StatusBadge active={promo.isActive} />
                       </div>
                       
                       <h3 className="text-xl font-black text-gray-900 mb-2">{promo.name}</h3>
                       <p className="text-gray-500 text-sm mb-6 line-clamp-2">{promo.description}</p>
                       
                       <div className="space-y-4 mb-8">
                          <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                             <Clock className="w-4 h-4 text-blue-600" />
                             Vence: {format(new Date(promo.endDate), 'dd MMM yyyy', { locale: es })}
                          </div>
                          <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                             <ShoppingBag className="w-4 h-4 text-emerald-600" />
                             Min. Compra: S/ {Number(promo.minPurchase || 0).toFixed(2)}
                          </div>
                       </div>
                       
                       <button 
                         onClick={() => handleViewDetails(promo)}
                         className="w-full py-4 bg-gray-50 text-gray-900 rounded-[20px] text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                       >
                          Ver Detalles
                       </button>
                    </div>
                  ))
                )
              ) : (
                coupons.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-gray-100 shadow-sm">
                    <Ticket className="w-16 h-16 text-gray-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No hay cupones creados</h3>
                    <p className="text-gray-400 text-sm">Empieza creando códigos de descuento para tus clientes.</p>
                  </div>
                ) : (
                  coupons.map((coupon: any) => (
                    <div key={coupon.id} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-emerald-50/50 transition-all group">
                       <div className="flex justify-between items-start mb-6">
                          <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                             <Ticket className="w-6 h-6" />
                          </div>
                          <StatusBadge active={coupon.isActive} />
                       </div>
                       
                       <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-gray-900 text-white text-xs font-black rounded-lg tracking-widest uppercase">
                             {coupon.code}
                          </span>
                       </div>
                       <h3 className="text-xl font-black text-gray-900 mb-2">{coupon.type === 'PERCENTAGE' ? `${Number(coupon.value)}% OFF` : `S/ ${Number(coupon.value)} OFF`}</h3>
                       <p className="text-gray-500 text-sm mb-6 line-clamp-2">{coupon.description}</p>
                       
                       <div className="space-y-4 mb-8">
                          <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                             <Calendar className="w-4 h-4 text-emerald-600" />
                             Válido hasta: {format(new Date(coupon.endDate), 'dd MMM yyyy', { locale: es })}
                          </div>
                          <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                             <Users className="w-4 h-4 text-blue-600" />
                             Usos: {coupon.usageCount} / {coupon.usageLimit || '∞'}
                          </div>
                       </div>
                       
                       <button 
                         onClick={() => handleViewDetails(coupon)}
                         className="w-full py-4 bg-gray-50 text-gray-900 rounded-[20px] text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition-colors"
                       >
                          Ver Detalles
                       </button>
                    </div>
                  ))
                )
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className={`h-32 flex items-center justify-center ${activeTab === 'promos' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                 {activeTab === 'promos' ? <Zap className="w-16 h-16 text-white/20 absolute right-[-20px] top-[-20px] rotate-12" /> : <Ticket className="w-16 h-16 text-white/20 absolute right-[-20px] top-[-20px] rotate-12" />}
                 <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/30">
                    {activeTab === 'promos' ? <Gift className="w-10 h-10 text-white" /> : <Ticket className="w-10 h-10 text-white" />}
                 </div>
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="absolute top-6 right-6 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors"
                 >
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-10">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <h2 className="text-2xl font-black text-gray-900 mb-1">{selectedItem.name || selectedItem.code}</h2>
                       <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{activeTab === 'promos' ? 'Campaña de Marketing' : 'Cupón de Descuento'}</p>
                    </div>
                    <StatusBadge active={selectedItem.isActive} />
                 </div>

                 <p className="text-gray-600 mb-10 leading-relaxed">
                    {selectedItem.description || 'Sin descripción detallada disponible para este registro.'}
                 </p>

                 <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valor</p>
                       <p className="text-xl font-black text-gray-900">
                          {selectedItem.type === 'PERCENTAGE' ? `${Number(selectedItem.value)}%` : `S/ ${Number(selectedItem.value)}`}
                          <span className="text-xs text-gray-400 ml-1">{selectedItem.type === 'PERCENTAGE' ? 'DTO' : 'MENOS'}</span>
                       </p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Min. Compra</p>
                       <p className="text-xl font-black text-gray-900">
                          S/ {Number(selectedItem.minPurchase || 0).toFixed(2)}
                       </p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                       <span className="text-sm font-bold text-gray-400">Vigencia:</span>
                       <span className="text-sm font-black text-gray-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          {format(new Date(selectedItem.startDate), 'dd/MM/yy')} - {format(new Date(selectedItem.endDate), 'dd/MM/yy')}
                       </span>
                    </div>
                    {activeTab === 'coupons' && (
                       <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-gray-400">Usos realizados:</span>
                          <span className="text-sm font-black text-gray-900">
                             {selectedItem.usageCount} veces
                          </span>
                       </div>
                    )}
                 </div>
              </div>
              
              <div className="p-8 bg-gray-50 flex gap-4">
                 <button className="flex-1 py-4 bg-gray-900 text-white rounded-[20px] text-sm font-black uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-gray-200">
                    Editar
                 </button>
                 <button className="px-8 py-4 bg-white text-rose-600 border border-rose-100 rounded-[20px] text-sm font-black uppercase tracking-widest hover:bg-rose-50 transition-colors">
                    Desactivar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
