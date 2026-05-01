"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
  Boxes, 
  Search, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Printer, 
  Download, 
  Filter,
  ChevronRight,
  TrendingUp,
  Package,
  Info,
  DollarSign,
  History,
  Tag,
  BarChart3
} from 'lucide-react';
import { getKardex, getProducts } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function KardexPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [kardexData, setKardexData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts({ limit: 1000 });
        setProducts(response.data);
        if (response.data.length > 0) {
          setSelectedProductId(response.data[0].id);
        }
      } catch (error) {
        toast.error('Error al cargar productos');
      }
    };
    fetchProducts();
  }, []);

  const fetchKardex = useCallback(async () => {
    if (!selectedProductId) return;
    setLoading(true);
    try {
      const data = await getKardex(selectedProductId, filters);
      setKardexData(data);
    } catch (error) {
      toast.error('Error al cargar el Kardex');
    } finally {
      setLoading(false);
    }
  }, [selectedProductId, filters]);

  useEffect(() => {
    fetchKardex();
  }, [fetchKardex]);

  const getReasonBadge = (reason: string) => {
    const colors: any = {
      'SALE': 'bg-blue-50 text-blue-600 border-blue-100',
      'PURCHASE': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'ADJUSTMENT': 'bg-amber-50 text-amber-600 border-amber-100',
      'SALE_CANCELLED': 'bg-rose-50 text-rose-600 border-rose-100',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${colors[reason] || 'bg-gray-50 text-gray-400 border-gray-100'}`}>
        {reason === 'SALE' ? 'Venta' : 
         reason === 'PURCHASE' ? 'Compra' : 
         reason === 'ADJUSTMENT' ? 'Ajuste' : 
         reason === 'SALE_CANCELLED' ? 'Venta Anulada' : reason}
      </span>
    );
  };

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
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Kardex de Inventario Valorizado</h1>
                <p className="text-[#6B7280]">Seguimiento detallado de costos y existencias con método de promedio ponderado.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">
                  <Printer className="w-5 h-5" />
                  Imprimir
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95">
                  <Download className="w-5 h-5" />
                  Exportar Excel
                </button>
              </div>
            </div>

            {/* Product Selector & Filters */}
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm mb-10">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="md:col-span-2 space-y-3">
                     <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Seleccionar Producto</label>
                     <div className="relative">
                        <Package className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                        <select 
                          className="w-full pl-16 pr-6 py-5 bg-gray-50 border-transparent rounded-[24px] focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-700 appearance-none cursor-pointer"
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - Stock: {p.stock}</option>
                          ))}
                        </select>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha Inicio</label>
                     <input 
                       type="date" 
                       className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[24px] focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-700"
                       value={filters.startDate}
                       onChange={e => setFilters({...filters, startDate: e.target.value})}
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Fecha Fin</label>
                     <input 
                       type="date" 
                       className="w-full px-6 py-5 bg-gray-50 border-transparent rounded-[24px] focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-700"
                       value={filters.endDate}
                       onChange={e => setFilters({...filters, endDate: e.target.value})}
                     />
                  </div>
               </div>
            </div>

            {/* Product Summary Mini Cards */}
            {kardexData?.product && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Costo Unit. Promedio</p>
                   <h4 className="text-2xl font-black text-blue-600 tracking-tight">S/ {Number(kardexData.product.purchasePrice).toFixed(2)}</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Actual</p>
                   <h4 className="text-2xl font-black text-gray-900 tracking-tight">{kardexData.product.stock} Unid.</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Valor Total Inventario</p>
                   <h4 className="text-2xl font-black text-emerald-600 tracking-tight">S/ {(kardexData.product.stock * Number(kardexData.product.purchasePrice)).toFixed(2)}</h4>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Precio de Venta</p>
                   <h4 className="text-2xl font-black text-amber-600 tracking-tight">S/ {Number(kardexData.product.price).toFixed(2)}</h4>
                </div>
              </div>
            )}

            {/* Valued Kardex Table */}
            <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-8 py-8 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Fecha y Movimiento</th>
                        <th colSpan={3} className="px-8 py-8 text-[10px] font-black text-emerald-600 uppercase tracking-widest text-center border-b border-gray-100 bg-emerald-50/20">Entradas</th>
                        <th colSpan={3} className="px-8 py-8 text-[10px] font-black text-rose-600 uppercase tracking-widest text-center border-b border-gray-100 bg-rose-50/20">Salidas</th>
                        <th colSpan={3} className="px-8 py-8 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center border-b border-gray-100 bg-blue-50/20">Saldos Finales</th>
                      </tr>
                      <tr className="bg-gray-50/80">
                        <th className="px-8 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Descripción</th>
                        {/* Entradas */}
                        <th className="px-4 py-4 text-[9px] font-black text-emerald-500 uppercase text-center border-l border-gray-100">Cant</th>
                        <th className="px-4 py-4 text-[9px] font-black text-emerald-500 uppercase text-center">Costo U.</th>
                        <th className="px-4 py-4 text-[9px] font-black text-emerald-500 uppercase text-center">Total</th>
                        {/* Salidas */}
                        <th className="px-4 py-4 text-[9px] font-black text-rose-500 uppercase text-center border-l border-gray-100">Cant</th>
                        <th className="px-4 py-4 text-[9px] font-black text-rose-500 uppercase text-center">Costo U.</th>
                        <th className="px-4 py-4 text-[9px] font-black text-rose-500 uppercase text-center">Total</th>
                        {/* Saldos */}
                        <th className="px-4 py-4 text-[9px] font-black text-blue-500 uppercase text-center border-l border-gray-100">Cant</th>
                        <th className="px-4 py-4 text-[9px] font-black text-blue-500 uppercase text-center">Costo P.</th>
                        <th className="px-4 py-4 text-[9px] font-black text-blue-500 uppercase text-center">Valor T.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        Array(8).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={10} className="px-8 py-6"><div className="h-4 bg-gray-50 rounded w-full"></div></td>
                          </tr>
                        ))
                      ) : !kardexData || kardexData.movements.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-8 py-32 text-center">
                             <History className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                             <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No hay movimientos registrados para este periodo</p>
                          </td>
                        </tr>
                      ) : kardexData.movements.map((move: any) => (
                        <tr key={move.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                               <span className="text-[11px] font-black text-gray-900 mb-1">
                                 {format(new Date(move.createdAt), 'dd MMM yyyy, HH:mm', { locale: es })}
                               </span>
                               {getReasonBadge(move.reason)}
                             </div>
                          </td>
                          
                          {/* Entradas column */}
                          <td className="px-4 py-6 text-center border-l border-gray-50">
                             {move.type === 'IN' ? <span className="text-sm font-black text-emerald-600">{move.quantity}</span> : '-'}
                          </td>
                          <td className="px-4 py-6 text-center">
                             {move.type === 'IN' ? <span className="text-[11px] font-bold text-gray-500">S/ {Number(move.unitCost).toFixed(2)}</span> : '-'}
                          </td>
                          <td className="px-4 py-6 text-center">
                             {move.type === 'IN' ? <span className="text-sm font-black text-emerald-700">S/ {Number(move.totalCost).toFixed(2)}</span> : '-'}
                          </td>

                          {/* Salidas column */}
                          <td className="px-4 py-6 text-center border-l border-gray-50">
                             {move.type === 'OUT' ? <span className="text-sm font-black text-rose-600">{move.quantity}</span> : '-'}
                          </td>
                          <td className="px-4 py-6 text-center">
                             {move.type === 'OUT' ? <span className="text-[11px] font-bold text-gray-500">S/ {Number(move.unitCost).toFixed(2)}</span> : '-'}
                          </td>
                          <td className="px-4 py-6 text-center">
                             {move.type === 'OUT' ? <span className="text-sm font-black text-rose-700">S/ {Number(move.totalCost).toFixed(2)}</span> : '-'}
                          </td>

                          {/* Saldos column */}
                          <td className="px-4 py-6 text-center border-l border-gray-50 bg-blue-50/10">
                             <span className="text-sm font-black text-gray-900">{move.nextStock}</span>
                          </td>
                          <td className="px-4 py-6 text-center bg-blue-50/10">
                             <span className="text-[11px] font-bold text-blue-600">S/ {(Number(move.nextValue) / move.nextStock).toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-6 text-center bg-blue-50/10">
                             <span className="text-sm font-black text-blue-700">S/ {Number(move.nextValue).toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
