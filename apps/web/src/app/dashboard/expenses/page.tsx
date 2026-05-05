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
  Save
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
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans text-[#111827]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden transition-all duration-300">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] px-4 lg:px-10 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">Gastos</h1>
                <p className="text-sm lg:text-base text-[#6B7280]">Control de egresos y costos operativos.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-100 text-gray-700 rounded-2xl text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                >
                  Categorías
                </button>
                <button 
                  onClick={() => { resetForm(); setIsModalOpen(true); }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Registrar Egreso
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                   <TrendingDown className="w-20 h-20 text-rose-600" />
                </div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Egresos Totales (Periodo)</p>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">S/ {totalExpenses.toFixed(2)}</h2>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-rose-600 uppercase bg-rose-50 px-3 py-1 rounded-full w-fit">
                   Salida de Capital
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                   <Wallet className="w-20 h-20 text-blue-600" />
                </div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Estado de Caja Actual</p>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                  {cashStatus?.status === 'OPEN' ? `S/ ${Number(cashStatus.currentBalance).toFixed(2)}` : 'CERRADA'}
                </h2>
                <div className={`mt-4 flex items-center gap-2 text-[10px] font-bold uppercase px-3 py-1 rounded-full w-fit ${
                  cashStatus?.status === 'OPEN' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-50'
                }`}>
                   {cashStatus?.status === 'OPEN' ? 'Caja Abierta' : 'Sin Turno Activo'}
                </div>
              </div>

              <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                   <Tag className="w-20 h-20 text-amber-600" />
                </div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Categoría más costosa</p>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight mt-2">Operativos / Local</h2>
                <p className="text-xs text-gray-400 font-bold mt-2 uppercase">Representa el 45% de gastos</p>
              </div>
            </div>

            {/* List and Filters */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-6 lg:p-8 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="relative w-full lg:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Buscar por descripción..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-500 transition-all outline-none"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 w-full lg:w-auto">
                    <select 
                      className="flex-1 lg:flex-none px-4 py-3 bg-gray-50 border-transparent rounded-xl text-xs font-bold text-gray-500 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                      value={filters.categoryId}
                      onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
                    >
                      <option value="">Categorías</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[900px]">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha y Ref</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción / Categoría</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Método</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={5} className="px-8 py-6"><div className="h-4 bg-gray-50 rounded w-full"></div></td>
                          </tr>
                        ))
                      ) : expenses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center">
                             <Receipt className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                             <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">No se encontraron gastos</p>
                          </td>
                        </tr>
                      ) : expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex flex-col">
                               <span className="text-sm font-black text-gray-900">
                                 {format(new Date(expense.date), 'dd MMM, yyyy', { locale: es })}
                               </span>
                               <span className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                                 {expense.referenceNumber || 'SIN REF'}
                               </span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                                 <TrendingDown className="w-5 h-5 text-rose-600" />
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-gray-900 truncate max-w-[250px]">{expense.description}</p>
                                 <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase">
                                   {expense.category?.name}
                                 </span>
                               </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              {expense.paymentMethod === 'CASH' ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-amber-100">
                                  <Wallet className="w-3.5 h-3.5" /> Efectivo (Caja)
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-blue-100">
                                  <DollarSign className="w-3.5 h-3.5" /> Transferencia
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <span className="text-lg font-black text-gray-900 tracking-tight">
                               S/ {Number(expense.amount).toFixed(2)}
                             </span>
                          </td>
                          <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                             <div className="flex items-center justify-center gap-2 transition-opacity">
                                <button 
                                  onClick={() => openEditModal(expense)}
                                  className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(expense.id)}
                                  className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
               </div>
            </div>
          </div>
        </main>
      </div>

      {/* Main Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-10 pt-10 pb-6 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black mb-1">{editingExpense ? 'Editar Registro' : 'Registrar Salida de Efectivo'}</h3>
                <p className="text-sm text-gray-400">Complete los datos del gasto realizado.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Descripción del Gasto</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-gray-700 shadow-sm"
                    placeholder="Ej. Pago de luz local principal"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Monto (S/)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-rose-500 transition-all outline-none font-black text-lg text-gray-900 shadow-sm"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Categoría</label>
                  <select 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-gray-700 shadow-sm appearance-none cursor-pointer"
                    value={formData.categoryId}
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    <option value="">Seleccione categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Fecha</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-gray-700 shadow-sm"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Método de Pago</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'CASH'})}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        formData.paymentMethod === 'CASH' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-gray-50 text-gray-400 hover:border-gray-100'
                      }`}
                    >
                      Efectivo
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, paymentMethod: 'OTHER'})}
                      className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        formData.paymentMethod === 'OTHER' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-50 text-gray-400 hover:border-gray-100'
                      }`}
                    >
                      Transferencia
                    </button>
                  </div>
                </div>
                
                {formData.paymentMethod === 'CASH' && (
                  <div className="md:col-span-2 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Aviso de Caja</p>
                      <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                        Este gasto se restará automáticamente del saldo actual de la caja abierta ({cashStatus?.status === 'OPEN' ? `Caja ID: ${cashStatus.id.slice(0,8)}` : 'No hay caja abierta'}).
                      </p>
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 space-y-2">
                   <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Notas Adicionales</label>
                   <textarea 
                     className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-rose-500 transition-all outline-none font-bold text-gray-700 shadow-sm min-h-[100px]"
                     placeholder="Detalles adicionales o justificación..."
                     value={formData.notes}
                     onChange={e => setFormData({...formData, notes: e.target.value})}
                   />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-gray-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 rounded-[22px] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-rose-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[22px] shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Save className="w-5 h-5" />
                  {editingExpense ? 'Actualizar Gasto' : 'Confirmar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-10 pt-10 pb-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-black">Categorías de Gasto</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="p-10 space-y-8">
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nueva Categoría</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required
                      className="flex-1 px-5 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-sm"
                      placeholder="Ej. Alquiler"
                      value={categoryData.name}
                      onChange={e => setCategoryData({...categoryData, name: e.target.value})}
                    />
                    <button type="submit" className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Categorías Actuales</label>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {categories.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-sm font-bold text-gray-700">{c.name}</span>
                      <button className="text-gray-300 hover:text-rose-500 transition-colors">
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
    <div className="flex-1 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group hover:shadow-xl hover:border-blue-100 transition-all">
       <div className="flex items-center justify-between mb-6">
          <div className="p-3.5 bg-gray-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
             <Icon className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
            growth > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
             {growth > 0 ? <TrendingDown className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
             {Math.abs(growth)}%
          </div>
       </div>
       <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
       <h3 className="text-3xl font-black text-gray-900 tracking-tight">
         {isCurrency ? `S/ ${value.toLocaleString()}` : value}
       </h3>
    </div>
  );
}
