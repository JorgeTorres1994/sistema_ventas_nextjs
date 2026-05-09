"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Edit2, 
  Calendar as CalendarIcon,
  DollarSign,
  Tag,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  ArrowUpRight,
  TrendingDown,
  Wallet,
  Save,
  Hash
} from 'lucide-react';
import { 
  getExpenses, 
  getExpenseCategories, 
  createExpense, 
  updateExpense, 
  deleteExpense,
  createExpenseCategory,
  getCashStatus
} from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cashStatus, setCashStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    cashRegisterId: '',
    notes: '',
    referenceNumber: ''
  });

  const [categoryData, setCategoryData] = useState({
    name: '',
    description: ''
  });

  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    startDate: '',
    endDate: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesData, categoriesData, cashData] = await Promise.all([
        getExpenses(filters),
        getExpenseCategories(),
        getCashStatus()
      ]);
      setExpenses(expensesData);
      setCategories(categoriesData);
      setCashStatus(cashData);
      
      // If cash is open, auto-select it for CASH payments
      if (cashData?.status === 'OPEN') {
        setFormData(prev => ({ ...prev, cashRegisterId: cashData.id }));
      }
    } catch (error) {
      toast.error('Error al cargar datos de finanzas');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(editingExpense ? 'Actualizando gasto...' : 'Registrando gasto...');
    
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        cashRegisterId: formData.paymentMethod === 'CASH' ? formData.cashRegisterId : null
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
        toast.success('Gasto actualizado', { id: toastId });
      } else {
        await createExpense(payload);
        toast.success('Gasto registrado con éxito', { id: toastId });
      }
      
      setIsModalOpen(false);
      setEditingExpense(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al procesar el gasto', { id: toastId });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading('Creando categoría...');
    try {
      await createExpenseCategory(categoryData);
      toast.success('Categoría creada', { id: toastId });
      setIsCategoryModalOpen(false);
      setCategoryData({ name: '', description: '' });
      const newCategories = await getExpenseCategories();
      setCategories(newCategories);
    } catch (error) {
      toast.error('Error al crear categoría', { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este registro de gasto?')) return;
    try {
      await deleteExpense(id);
      toast.success('Gasto eliminado');
      fetchData();
    } catch (error) {
      toast.error('No se pudo eliminar el gasto');
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      cashRegisterId: cashStatus?.status === 'OPEN' ? cashStatus.id : '',
      notes: '',
      referenceNumber: ''
    });
  };

  const openEditModal = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      categoryId: expense.categoryId,
      date: new Date(expense.date).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod || 'CASH',
      cashRegisterId: expense.cashRegisterId || '',
      notes: expense.notes || '',
      referenceNumber: expense.referenceNumber || ''
    });
    setIsModalOpen(true);
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-20">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                  <span>Finanzas</span><span>/</span>
                  <span className="text-on-surface-variant">Gastos y Egresos</span>
                </nav>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Salidas de Capital</h1>
                <p className="text-sm font-medium text-on-surface-variant max-w-xl">Gestión centralizada de egresos operativos, costos fijos y movimientos de caja.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-6 py-4 bg-card border border-outline-variant text-foreground rounded-[22px] text-[11px] font-black uppercase tracking-widest hover:bg-surface-low transition-all shadow-sm active:scale-95"
                >
                  Categorías
                </button>
                <button 
                  onClick={() => { resetForm(); setIsModalOpen(true); }}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-[22px] text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-rose-600/20 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Registrar Egreso
                </button>
              </div>
            </div>

            {/* Summary Grid - Fully Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-12">
              <div className="bg-card rounded-[32px] p-6 lg:p-8 border border-outline-variant shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                   <TrendingDown className="w-24 h-24 text-rose-600" />
                </div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Egresos Totales (Periodo)</p>
                <h2 className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter mb-4">S/ {totalExpenses.toFixed(2)}</h2>
                <div className="flex items-center gap-2 text-[9px] font-black text-rose-500 uppercase bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 w-fit">
                   Salida de Capital Detectada
                </div>
              </div>

              <div className="bg-card rounded-[32px] p-6 lg:p-8 border border-outline-variant shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                   <Wallet className="w-24 h-24 text-primary" />
                </div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Saldo Operativo en Caja</p>
                <h2 className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter mb-4">
                  {cashStatus?.status === 'OPEN' ? `S/ ${Number(cashStatus.currentBalance).toFixed(2)}` : 'CERRADA'}
                </h2>
                <div className={`flex items-center gap-2 text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border w-fit ${
                  cashStatus?.status === 'OPEN' ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' : 'text-on-surface-variant bg-surface-low border-outline-variant'
                }`}>
                   <div className={`w-1.5 h-1.5 rounded-full ${cashStatus?.status === 'OPEN' ? 'bg-emerald-500 animate-pulse' : 'bg-on-surface-variant'}`}></div>
                   {cashStatus?.status === 'OPEN' ? 'Turno de Caja Activo' : 'Sin Turno de Caja'}
                </div>
              </div>

              <div className="bg-card rounded-[32px] p-6 lg:p-8 border border-outline-variant shadow-sm relative overflow-hidden group sm:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                   <Tag className="w-24 h-24 text-amber-500" />
                </div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-2">Concentración de Gasto</p>
                <h2 className="text-2xl font-black text-foreground tracking-tight mt-2 line-clamp-1">Operativos / Logística</h2>
                <p className="text-[10px] text-on-surface-variant/60 font-black mt-3 uppercase tracking-widest">Representa el <span className="text-amber-600 font-black">45%</span> de salidas</p>
              </div>
            </div>

            {/* List and Filters */}
            <div className="bg-card rounded-[40px] border border-outline-variant shadow-sm overflow-hidden">
               <div className="p-6 lg:p-8 border-b border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-surface-low/30">
                  <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
                    <input 
                      type="text" 
                      placeholder="Buscar por descripción..."
                      className="w-full pl-16 pr-6 py-4 bg-surface-low border border-transparent rounded-[24px] text-sm font-black focus:bg-card focus:border-rose-500/50 transition-all outline-none text-foreground shadow-inner placeholder:text-on-surface-variant/30"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <select 
                      className="flex-1 lg:flex-none px-6 py-4 bg-surface-low border border-transparent rounded-[22px] text-[10px] font-black text-foreground outline-none cursor-pointer hover:bg-card transition-all shadow-inner uppercase tracking-widest"
                      value={filters.categoryId}
                      onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
                    >
                      <option value="">Todas las Categorías</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button className="w-14 h-14 bg-surface-low text-on-surface-variant border border-transparent rounded-[22px] flex items-center justify-center hover:bg-card hover:text-rose-500 transition-all active:scale-90 shadow-inner group">
                      <Filter className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
               </div>

               {/* Hybrid Display System */}
               <div className="space-y-4 lg:space-y-0">
                  {/* Mobile Cards */}
                  <div className="lg:hidden p-4 space-y-6">
                    {loading ? (
                      Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-surface-low rounded-[32px] h-48 animate-pulse"></div>
                      ))
                    ) : expenses.length === 0 ? (
                      <div className="py-20 text-center">
                        <Receipt className="w-12 h-12 text-on-surface-variant/10 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Sin registros de egresos</p>
                      </div>
                    ) : (
                      expenses.map((expense) => (
                        <div key={expense.id} className="bg-surface-low/30 rounded-[32px] p-6 border border-outline-variant/30 shadow-sm">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                    <TrendingDown className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-base font-black text-foreground tracking-tight line-clamp-1">{expense.description}</p>
                                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{format(new Date(expense.date), 'dd MMM, yyyy', { locale: es })}</p>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => openEditModal(expense)} className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-on-surface-variant border border-outline-variant"><Edit2 className="w-4 h-4" /></button>
                              </div>
                           </div>
                           
                           <div className="space-y-4 mb-6">
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Categoría</span>
                                 <span className="px-3 py-1 bg-rose-500/10 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{expense.category?.name}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Método</span>
                                 <span className="text-xs font-black text-foreground">{expense.paymentMethod === 'CASH' ? 'Efectivo' : 'Transferencia'}</span>
                              </div>
                              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
                                 <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Monto Total</span>
                                 <span className="text-xl font-black text-rose-600 tracking-tight">S/ {Number(expense.amount).toFixed(2)}</span>
                              </div>
                           </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-surface-low/30 border-b border-outline-variant/30">
                          <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Fecha y Referencia</th>
                          <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Descripción Operativa</th>
                          <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Origen de Fondos</th>
                          <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Inversión / Egreso</th>
                          <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Gestión</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/30">
                        {loading ? (
                          Array(5).fill(0).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                              <td colSpan={5} className="px-10 py-8 h-24 bg-surface-low/10"></td>
                            </tr>
                          ))
                        ) : expenses.length === 0 ? (
                          <tr>
                             <td colSpan={5} className="px-10 py-32 text-center">
                                <Receipt className="w-16 h-16 text-on-surface-variant/10 mx-auto mb-6" />
                                <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">No hay movimientos financieros registrados</p>
                             </td>
                          </tr>
                        ) : (
                          expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-rose-500/[0.02] transition-colors group">
                              <td className="px-10 py-8">
                                 <div className="flex flex-col">
                                   <span className="text-[15px] font-black text-foreground tracking-tight">
                                     {format(new Date(expense.date), 'dd MMM, yyyy', { locale: es })}
                                   </span>
                                   <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.1em] mt-1.5 flex items-center gap-1.5">
                                     <Hash className="w-3 h-3" /> {expense.referenceNumber || 'SIN REFERENCIA'}
                                   </span>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-6">
                                   <div className="w-14 h-14 rounded-[22px] bg-rose-500/10 flex items-center justify-center text-rose-500 transition-transform group-hover:scale-110 shadow-xl shadow-rose-500/5">
                                     <TrendingDown className="w-6 h-6" />
                                   </div>
                                   <div>
                                     <p className="text-sm font-black text-foreground truncate max-w-[280px] tracking-tight">{expense.description}</p>
                                     <span className="mt-2 inline-flex px-3 py-1 bg-rose-500/10 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-rose-500/20">
                                       {expense.category?.name}
                                     </span>
                                   </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                <div className="flex items-center gap-3">
                                  {expense.paymentMethod === 'CASH' ? (
                                    <div className="flex items-center gap-2.5 px-4 py-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                      <Wallet className="w-4 h-4" /> Caja Chica
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2.5 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                      <ArrowUpRight className="w-4 h-4" /> Transferencia
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <span className="text-xl font-black text-rose-600 tracking-tighter">
                                    S/ {Number(expense.amount).toFixed(2)}
                                 </span>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center justify-center gap-3">
                                    <button 
                                      onClick={() => openEditModal(expense)}
                                      className="w-11 h-11 bg-surface-low text-on-surface-variant hover:text-primary hover:bg-primary/10 border border-outline-variant/50 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                                    >
                                      <Edit2 className="w-4.5 h-4.5" />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(expense.id)}
                                      className="w-11 h-11 bg-surface-low text-on-surface-variant hover:text-rose-600 hover:bg-rose-500/10 border border-outline-variant/50 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-sm"
                                    >
                                      <Trash2 className="w-4.5 h-4.5" />
                                    </button>
                                 </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Main Expense Modal - Responsive Overhaul */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-card border-none sm:border border-outline-variant rounded-none sm:rounded-[40px] shadow-2xl w-full max-w-2xl h-full sm:h-auto max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-8 lg:px-12 pt-12 pb-8 border-b border-outline-variant/30 flex items-center justify-between bg-surface-low/20">
              <div>
                <h3 className="text-3xl font-black tracking-tighter text-foreground">{editingExpense ? 'Actualizar Egreso' : 'Registrar Salida'}</h3>
                <p className="text-[11px] text-on-surface-variant font-black uppercase tracking-widest mt-1">Control de Flujo de Efectivo</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-14 h-14 bg-surface-low hover:bg-card border border-outline-variant/30 rounded-[22px] flex items-center justify-center transition-all active:scale-90 group">
                <X className="w-6 h-6 text-on-surface-variant group-hover:rotate-90 transition-transform" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-10 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Descripción del Gasto</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-8 py-5 bg-surface-low border border-transparent rounded-[24px] focus:bg-card focus:border-rose-500/50 transition-all outline-none font-black text-sm text-foreground shadow-inner placeholder:text-on-surface-variant/20"
                    placeholder="Ej. Pago de suministros locales"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Importe (S/)</label>
                  <div className="relative">
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-rose-500 font-black text-lg">S/</span>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      className="w-full pl-16 pr-8 py-5 bg-surface-low border border-transparent rounded-[24px] focus:bg-card focus:border-rose-500/50 transition-all outline-none font-black text-xl text-foreground shadow-inner"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Categoría</label>
                  <select 
                    required
                    className="w-full px-8 py-5 bg-surface-low border border-transparent rounded-[24px] focus:bg-card focus:border-rose-500/50 transition-all outline-none font-black text-xs text-foreground shadow-inner cursor-pointer uppercase tracking-widest"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    <option value="">Seleccione categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Fecha Operación</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-8 py-5 bg-surface-low border border-transparent rounded-[24px] focus:bg-card focus:border-rose-500/50 transition-all outline-none font-black text-xs text-foreground shadow-inner"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Canal de Egreso</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'CASH'})}
                      className={`py-5 rounded-[22px] text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                        formData.paymentMethod === 'CASH' ? 'bg-amber-500/10 border-amber-500 text-amber-600 shadow-xl shadow-amber-500/10' : 'bg-surface-low border-transparent text-on-surface-variant/40'
                      }`}
                    >
                      Caja Chica
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'OTHER'})}
                      className={`py-5 rounded-[22px] text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                        formData.paymentMethod === 'OTHER' ? 'bg-primary/10 border-primary text-primary shadow-xl shadow-primary/10' : 'bg-surface-low border-transparent text-on-surface-variant/40'
                      }`}
                    >
                      Bancos
                    </button>
                  </div>
                </div>
                
                {formData.paymentMethod === 'CASH' && (
                  <div className="md:col-span-2 p-6 bg-amber-500/10 rounded-[28px] border border-amber-500/20 flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Afectación Directa a Caja</p>
                      <p className="text-[11px] text-on-surface-variant/80 font-bold leading-relaxed">
                        Este egreso se deducirá del saldo activo en tiempo real. {cashStatus?.status === 'OPEN' ? `Caja activa detectada.` : '⚠️ Atención: No hay turno de caja abierto.'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 space-y-3">
                   <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2">Memorándum / Notas</label>
                   <textarea 
                     className="w-full px-8 py-6 bg-surface-low border border-transparent rounded-[28px] focus:bg-card focus:border-rose-500/50 transition-all outline-none font-black text-sm text-foreground shadow-inner min-h-[120px] placeholder:text-on-surface-variant/20"
                     placeholder="Anotaciones internas del movimiento financiero..."
                     value={formData.notes}
                     onChange={e => setFormData({...formData, notes: e.target.value})}
                   />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:bg-surface-low rounded-[24px] transition-all active:scale-95"
                >
                  Descartar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-5 bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest rounded-[24px] shadow-2xl shadow-rose-600/30 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Save className="w-5 h-5" />
                  {editingExpense ? 'Actualizar Registro' : 'Confirmar Registro de Salida'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal - Responsive Overhaul */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-card border-none sm:border border-outline-variant rounded-none sm:rounded-[40px] shadow-2xl w-full max-w-md h-full sm:h-auto overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-10 pt-12 pb-8 border-b border-outline-variant/30 flex items-center justify-between bg-surface-low/20">
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-foreground">Gestión de Categorías</h3>
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-1">Clasificación Financiera</p>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="w-12 h-12 bg-surface-low hover:bg-card border border-outline-variant/30 rounded-2xl flex items-center justify-center transition-all active:scale-90">
                <X className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
            
            <div className="p-10 space-y-10">
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-2">Nueva Clasificación</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      required
                      className="flex-1 px-6 py-4 bg-surface-low border border-transparent rounded-[20px] focus:bg-card focus:border-primary/50 transition-all outline-none font-black text-sm text-foreground shadow-inner placeholder:text-on-surface-variant/20"
                      placeholder="Ej. Logística"
                      value={categoryData.name}
                      onChange={e => setCategoryData({...categoryData, name: e.target.value})}
                    />
                    <button type="submit" className="w-14 h-14 bg-primary text-on-primary rounded-[20px] hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center active:scale-95">
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-2">Registros Activos</label>
                <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                  {categories.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-surface-low/50 rounded-[20px] border border-outline-variant/30 group hover:border-primary/20 transition-all">
                      <span className="text-sm font-black text-foreground tracking-tight ml-2">{c.name}</span>
                      <button className="w-9 h-9 text-on-surface-variant/20 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl flex items-center justify-center transition-all active:scale-90 opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, growth, icon: Icon, isCurrency = false }: any) {
  return (
    <div className="flex-1 bg-card p-4 lg:p-8 rounded-[40px] border border-outline-variant shadow-sm group hover:shadow-xl hover:border-primary/20 transition-all">
       <div className="flex items-center justify-between mb-6">
          <div className="p-3.5 bg-surface-low rounded-2xl group-hover:bg-primary/10 transition-colors">
             <Icon className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
            growth > 0 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
             {growth > 0 ? <TrendingDown className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
             {Math.abs(growth)}%
          </div>
       </div>
       <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{title}</p>
       <h3 className="text-3xl font-black text-foreground tracking-tight">
         {isCurrency ? `S/ ${value.toLocaleString()}` : value}
       </h3>
    </div>
  );
}

