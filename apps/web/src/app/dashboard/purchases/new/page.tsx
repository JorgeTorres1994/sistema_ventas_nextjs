"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
    ArrowLeft, Building2, Truck, ChevronDown, 
    Package, Trash2, Plus, FileText, X, 
    Search, Info, Loader2, Calendar, 
    DollarSign, ChevronRight, Save
} from 'lucide-react';
import { 
    getSuppliers, 
    getApiProducts, 
    createPurchase 
} from '@/lib/api';
import { toast } from 'sonner';

interface PurchaseItem {
  productId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sku: string;
  quantity: number;
  costPrice: number;
}

export default function NewPurchasePage() {
  const router = useRouter();

  // State: Form Data
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [shippingCost, setShippingCost] = useState(0);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  
  // State: Resources
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  
  // State: Product Selection
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  // State: Form UI
  const [submitting, setSubmitting] = useState(false);

  const fmtCurrency = (n: number) => `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Fetch Suppliers
  useEffect(() => {
    getSuppliers({ isActive: true, limit: 100 })
      .then(res => setSuppliers(res.data))
      .catch(() => toast.error('No se pudieron cargar los proveedores'))
      .finally(() => setLoadingSuppliers(false));
  }, []);

  // Product Search Debounce
  useEffect(() => {
    if (productQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      setSearchingProducts(true);
      getApiProducts({ search: productQuery, isActive: true, limit: 10 })
        .then(res => setSearchResults(res.data))
        .catch(() => toast.error('Error al buscar productos'))
        .finally(() => setSearchingProducts(false));
    }, 400);
    return () => clearTimeout(t);
  }, [productQuery]);

  // Derived: Stats
  const selectedSupplier = useMemo(() => suppliers.find(s => s.id === selectedSupplierId), [selectedSupplierId, suppliers]);
  
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0), [items]);
  const taxRate = 0.18; // IGV 18% para Perú
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount + shippingCost;

  // Actions
  const addProduct = (product: any) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
        setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
        setItems([...items, {
            productId: product.id,
            name: product.name,
            description: product.description || 'Sin descripción',
            imageUrl: product.imageUrl,
            sku: product.sku || 'SKU-TEMP',
            quantity: 1,
            costPrice: Number(product.purchasePrice) || 0
        }]);
    }
    setIsSearchOpen(false);
    setProductQuery('');
  };

  const updateItem = (id: string, field: 'quantity' | 'costPrice', val: number) => {
    setItems(items.map(i => i.productId === id ? { ...i, [field]: val } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.productId !== id));
  };

  const handleSubmit = async (isConfirm: boolean = true) => {
    if (!selectedSupplierId) return toast.error('Seleccione un proveedor');
    if (items.length === 0) return toast.error('Agregue al menos un producto a la compra');
    
    setSubmitting(true);
    const toastId = toast.loading(isConfirm ? 'Procesando orden de compra...' : 'Guardando borrador...');
    
    try {
      await createPurchase({
        supplierId: selectedSupplierId,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, costPrice: i.costPrice })),
        status: isConfirm ? 'COMPLETED' : 'PENDING',
        notes,
        expectedDelivery: expectedDelivery || undefined,
        subtotal,
        taxAmount,
        shippingCost,
        total: grandTotal
      });
      toast.success(isConfirm ? 'Compra registrada y stock actualizado' : 'Borrador guardado correctamente', { id: toastId });
      setTimeout(() => router.push('/dashboard/purchases'), 1200);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al procesar la orden';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 w-full overflow-hidden">
        <TopBar />
        
        <header className="px-4 lg:px-10 py-6 border-b border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-6 sticky top-0 z-30 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-6 w-full sm:w-auto">
            <button 
              onClick={() => router.push('/dashboard/purchases')}
              className="w-12 h-12 rounded-2xl border border-outline-variant/30 hover:bg-surface-low flex items-center justify-center transition-all active:scale-90 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <nav className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">
                <span>Abastecimiento</span><span>/</span>
                <span className="text-primary">Nueva Orden</span>
              </nav>
              <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tighter">Generar Compra</h1>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
             <button 
                onClick={() => handleSubmit(false)}
                className="flex-1 sm:flex-none h-[52px] px-8 bg-surface-low border border-outline-variant/30 rounded-[20px] text-[11px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-card transition-all active:scale-95"
                disabled={submitting}
             >
                Borrador
             </button>
             <button 
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="flex-1 sm:flex-none h-[52px] px-10 bg-primary text-on-primary rounded-[20px] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all flex items-center justify-center gap-3 active:scale-95"
             >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Confirmar
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 pb-32 bg-background">
          <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
            
            {/* Form Sections Grid */}
            <div className="grid grid-cols-12 gap-8 lg:gap-12">
              
              {/* Supplier Selection */}
              <div className="col-span-12 lg:col-span-7 space-y-6">
                <div className="bg-card rounded-[40px] border border-outline-variant/30 shadow-sm p-6 lg:p-10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-20" />
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-[20px] flex items-center justify-center border border-primary/20">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-lg font-black text-foreground tracking-tight">Socio Comercial</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Proveedor de Suministros</label>
                      <div className="relative group">
                        <select 
                          value={selectedSupplierId}
                          onChange={e => setSelectedSupplierId(e.target.value)}
                          className="w-full h-[60px] pl-6 pr-12 bg-surface-low border-2 border-transparent focus:border-primary/30 rounded-[24px] text-sm font-bold text-foreground appearance-none focus:outline-none focus:bg-card transition-all shadow-inner"
                        >
                          <option value="">Seleccione proveedor...</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 pointer-events-none transition-transform group-focus-within:rotate-180" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Referencia Fiscal</label>
                      <div className="w-full h-[60px] px-6 bg-surface-low border-2 border-transparent rounded-[24px] flex items-center text-sm font-black text-on-surface-variant/60 font-mono shadow-inner italic">
                        {selectedSupplier ? `ID: ${selectedSupplier.dniRuc}` : 'Pendiente de selección'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logistics Details */}
              <div className="col-span-12 lg:col-span-5 space-y-6">
                <div className="bg-card rounded-[40px] border border-outline-variant/30 shadow-sm p-6 lg:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-[20px] flex items-center justify-center border border-emerald-500/20">
                      <Truck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h2 className="text-lg font-black text-foreground tracking-tight">Cronograma</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Fecha Emisión</label>
                      <div className="relative group">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" />
                        <input 
                          type="date"
                          value={orderDate}
                          onChange={e => setOrderDate(e.target.value)}
                          className="w-full h-[60px] pl-14 pr-6 bg-surface-low border-2 border-transparent focus:border-primary/30 rounded-[24px] text-xs font-black text-foreground focus:outline-none focus:bg-card transition-all shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Entrega Est.</label>
                      <div className="relative group">
                        <Truck className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                        <input 
                          type="date"
                          value={expectedDelivery}
                          onChange={e => setExpectedDelivery(e.target.value)}
                          className="w-full h-[60px] pl-14 pr-6 bg-surface-low border-2 border-transparent focus:border-emerald-500/30 rounded-[24px] text-xs font-black text-foreground focus:outline-none focus:bg-card transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table Section */}
            <section className="bg-card rounded-[48px] border border-outline-variant/30 shadow-sm overflow-hidden min-h-[400px]">
              <div className="px-6 lg:px-10 py-8 border-b border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-6 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
                <div>
                  <h2 className="text-xl font-black text-foreground tracking-tight">Artículos de Abastecimiento</h2>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">Total de ítems: {items.length}</p>
                </div>
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full sm:w-auto h-[56px] px-8 bg-primary/10 text-primary rounded-[20px] font-black text-[11px] uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-3 active:scale-95 border border-primary/20"
                >
                  <Plus className="w-5 h-5" /> Agregar Ítem
                </button>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                 <table className="w-full text-left border-collapse min-w-[800px]">
                   <thead>
                     <tr className="bg-surface-low/30 text-[10px] font-black text-on-surface-variant tracking-[0.3em] uppercase">
                       <th className="px-10 py-6 border-b border-outline-variant/10">Descripción del Producto</th>
                       <th className="px-6 py-6 border-b border-outline-variant/10 text-center">SKU</th>
                       <th className="px-6 py-6 border-b border-outline-variant/10 text-center w-40">Cantidad</th>
                       <th className="px-6 py-6 border-b border-outline-variant/10 text-right w-40">Costo Unit.</th>
                       <th className="px-10 py-6 border-b border-outline-variant/10 text-right w-48">Total</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-outline-variant/10">
                     {items.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="py-24 text-center">
                            <div className="w-20 h-20 bg-surface-low rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-outline-variant/30">
                              <Package className="w-10 h-10 text-on-surface-variant/20" />
                            </div>
                            <p className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Lista de compra vacía</p>
                            <p className="text-xs font-bold text-on-surface-variant opacity-60">Escanee o busque productos para iniciar el registro.</p>
                         </td>
                       </tr>
                     ) : (
                       items.map(item => (
                         <tr key={item.productId} className="group hover:bg-primary/[0.02] transition-colors relative">
                           <td className="px-10 py-8">
                              <div className="flex items-center gap-5">
                                 <div className="w-16 h-16 bg-surface-low rounded-[20px] overflow-hidden flex-shrink-0 flex items-center justify-center border border-outline-variant/30 shadow-sm transition-transform group-hover:scale-105">
                                    {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-on-surface-variant/20" />}
                                 </div>
                                 <div>
                                    <p className="text-base font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{item.name}</p>
                                    <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 mt-1 max-w-[280px] truncate">{item.description}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-8 text-center">
                              <span className="px-3 py-1.5 bg-surface-low border border-outline-variant/30 rounded-lg text-[9px] font-black tracking-widest uppercase text-on-surface-variant">
                                 {item.sku}
                              </span>
                           </td>
                           <td className="px-6 py-8">
                              <div className="flex items-center justify-center">
                                 <input 
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={e => updateItem(item.productId, 'quantity', parseInt(e.target.value) || 0)}
                                    className="w-24 h-[44px] bg-surface-low border-2 border-transparent focus:border-primary/20 rounded-xl text-sm font-black text-foreground text-center focus:outline-none transition-all"
                                  />
                              </div>
                           </td>
                           <td className="px-6 py-8 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-[10px] font-black text-on-surface-variant opacity-40 uppercase">S/</span>
                                <input 
                                  type="number"
                                  step="0.01"
                                  value={item.costPrice}
                                  onChange={e => updateItem(item.productId, 'costPrice', parseFloat(e.target.value) || 0)}
                                  className="w-28 h-[44px] bg-surface-low border-2 border-transparent focus:border-primary/20 rounded-xl text-sm font-black text-foreground text-right focus:outline-none transition-all"
                                />
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right relative group/row">
                              <p className="text-lg font-black text-foreground tracking-tighter">{fmtCurrency(item.quantity * item.costPrice)}</p>
                              <button 
                                  onClick={() => removeItem(item.productId)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                              >
                                  <Trash2 className="w-5 h-5" />
                              </button>
                           </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
              </div>
              
              {/* Summary Area */}
              <div className="p-8 lg:p-12 bg-card grid grid-cols-12 gap-12 border-t border-outline-variant/20">
                 <div className="col-span-12 lg:col-span-7 space-y-4">
                    <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] flex items-center gap-3 ml-1">
                      <FileText className="w-4 h-4 text-primary" /> Observaciones del Pedido
                    </h3>
                    <textarea 
                      placeholder="Indique requerimientos específicos, condiciones de pago o detalles logísticos relevantes..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={4}
                      className="w-full bg-surface-low border-2 border-transparent focus:border-primary/20 rounded-[32px] p-6 text-sm font-medium text-foreground focus:outline-none transition-all resize-none shadow-inner"
                    />
                 </div>

                 <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="bg-surface-low rounded-[32px] p-8 space-y-4 shadow-inner border border-outline-variant/10">
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Subtotal Neto</p>
                        <p className="text-base font-black text-foreground tracking-tight">{fmtCurrency(subtotal)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Costos de Envío / Logística</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-on-surface-variant opacity-40 uppercase">S/</span>
                          <input 
                            type="number" 
                            value={shippingCost} 
                            onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
                            className="w-24 bg-transparent text-right font-black text-foreground focus:outline-none border-b border-outline-variant/30 focus:border-primary transition-all h-[32px]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Impuestos (IGV 18%)</p>
                        <p className="text-base font-bold text-foreground tracking-tight">{fmtCurrency(taxAmount)}</p>
                      </div>
                      
                      <div className="pt-6 border-t border-outline-variant/30 mt-4 flex items-center justify-between">
                         <p className="text-xs font-black text-foreground uppercase tracking-[0.3em]">Total Inversión</p>
                         <p className="text-4xl font-black text-primary tracking-tighter animate-in fade-in zoom-in duration-500">
                            {fmtCurrency(grandTotal)}
                         </p>
                      </div>
                    </div>
                 </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
               <button 
                  onClick={() => router.push('/dashboard/purchases')}
                  className="w-full sm:w-auto h-[64px] px-12 bg-surface-low border border-outline-variant/30 rounded-[24px] font-black text-[11px] uppercase tracking-widest text-on-surface-variant hover:bg-card transition-all active:scale-95"
               >
                  Descartar Orden
               </button>
               <button 
                  onClick={() => handleSubmit(true)}
                  disabled={submitting}
                  className="w-full sm:w-auto h-[64px] px-16 bg-primary text-on-primary rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/30 hover:opacity-90 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
               >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  Registrar Operación
               </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modernized Product Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsSearchOpen(false)}>
           <div className="w-full max-w-2xl bg-card rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-outline-variant/30" onClick={e => e.stopPropagation()}>
              <div className="px-8 lg:px-12 py-10 border-b border-outline-variant/20 flex items-center justify-between bg-surface-low/30">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20 shadow-inner">
                       <Search className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">Buscar Artículos</h3>
                       <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.3em] mt-3 opacity-60">Base de Datos Global de Almacén</p>
                    </div>
                 </div>
                 <button onClick={() => setIsSearchOpen(false)} className="w-12 h-12 rounded-2xl hover:bg-surface-low flex items-center justify-center text-on-surface-variant/40 hover:text-foreground transition-all border border-outline-variant/30">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="p-8 lg:p-12 space-y-8">
                 <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/20 group-focus-within:text-primary transition-colors" />
                    <input 
                       autoFocus
                       placeholder="Nombre del producto, categoría o código SKU..."
                       value={productQuery}
                       onChange={e => setProductQuery(e.target.value)}
                       className="w-full h-[64px] pl-16 pr-8 bg-surface-low border-2 border-transparent focus:border-primary/30 rounded-[28px] text-base font-bold text-foreground focus:outline-none focus:bg-card transition-all shadow-inner"
                    />
                 </div>
                 
                 <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar min-h-[200px]">
                    {searchingProducts ? (
                       <div className="py-24 flex flex-col items-center justify-center text-on-surface-variant/20 gap-6">
                          <Loader2 className="w-12 h-12 animate-spin text-primary" />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Sincronizando Inventario...</p>
                       </div>
                    ) : searchResults.length === 0 ? (
                       <div className="py-20 text-center flex flex-col items-center gap-6 bg-surface-low/50 rounded-[40px] border border-dashed border-outline-variant/30">
                          <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center shadow-inner">
                            <Info className="w-10 h-10 text-on-surface-variant/20" />
                          </div>
                          <p className="text-sm font-black text-on-surface-variant/40 uppercase tracking-widest">{productQuery.length < 2 ? 'Inicie la búsqueda de activos' : 'Sin coincidencias en el registro'}</p>
                       </div>
                    ) : (
                       searchResults.map(p => (
                          <button 
                             key={p.id}
                             className="w-full text-left p-6 hover:bg-primary/[0.03] rounded-[32px] flex items-center gap-6 border-2 border-transparent hover:border-primary/20 transition-all group active:scale-[0.98] bg-surface-low"
                             onClick={() => addProduct(p)}
                          >
                             <div className="w-16 h-16 bg-card rounded-[20px] overflow-hidden shadow-sm flex items-center justify-center flex-shrink-0 border border-outline-variant/30 group-hover:border-primary/40 transition-colors">
                                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-8 h-8 text-on-surface-variant/20" />}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                   <p className="text-base font-black text-foreground tracking-tight truncate group-hover:text-primary transition-colors">{p.name}</p>
                                   <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-1 rounded-lg uppercase tracking-widest border border-primary/10">{p.sku}</span>
                                </div>
                                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 truncate">{p.description || 'Stock de Almacén General'}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Costo Estimado</p>
                                <p className="text-lg font-black text-primary group-hover:scale-110 transition-transform tracking-tighter">{fmtCurrency(p.purchasePrice || 0)}</p>
                             </div>
                             <ChevronRight className="w-5 h-5 text-on-surface-variant/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                          </button>
                       ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary-rgb), 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(var(--primary-rgb), 0.2); }
      `}</style>
    </div>
  );
}


