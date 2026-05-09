import React from 'react';
import { useSettings } from '@/components/SettingsProvider';
import { 
    Trash2, X, Image as ImageIcon, Minus, Plus, 
    CreditCard, Wallet, Banknote, CheckCircle2,
    ShoppingCart, FileText, Ticket, Star, User, ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCustomers } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  imageUrl?: string;
  category?: { name: string };
  isActive?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface PosCartPanelProps {
  cart: CartItem[];
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  documentType: string;
  setDocumentType: (type: string) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;
  couponCode: string;
  setCouponCode: (code: string) => void;
  onApplyCoupon: () => void;
  appliedDiscount: number;
  subtotal: number;
  taxAmount: number;
  finalTotal: number;
  onClearCart: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCompleteSale: () => void;
  onGenerateQuotation: () => void;
  isProcessing: boolean;
}

export default function PosCartPanel({
  cart,
  paymentMethod,
  setPaymentMethod,
  documentType,
  setDocumentType,
  selectedCustomerId,
  setSelectedCustomerId,
  couponCode,
  setCouponCode,
  onApplyCoupon,
  appliedDiscount,
  subtotal,
  taxAmount,
  finalTotal,
  onClearCart,
  onUpdateQuantity,
  onRemoveItem,
  onCompleteSale,
  onGenerateQuotation,
  isProcessing
}: PosCartPanelProps) {
  const { settings, paymentMethods } = useSettings();
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    getCustomers({ page: 1, limit: 100, isActive: true })
      .then(res => setCustomers(res.data))
      .catch(console.error);
  }, []);

  const taxPercent = settings?.taxRate || 18;

  return (
    <div className="w-full lg:w-[420px] shrink-0 bg-surface-low flex flex-col h-full border-l border-outline-variant shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10 relative overflow-hidden transition-all">
      
      {/* Header - Sticky */}
      <div className="px-4 lg:px-8 py-3 lg:py-6 flex items-center justify-between bg-card lg:bg-card border-b lg:border-none border-outline-variant relative z-30 shrink-0">
        <h2 className="text-lg lg:text-xl font-bold text-foreground">Carrito Activo</h2>
        <button 
          onClick={onClearCart}
          disabled={cart.length === 0 || isProcessing}
          className="flex items-center gap-1.5 text-rose-500 font-bold text-[9px] lg:text-[10px] uppercase tracking-widest hover:text-rose-700 disabled:opacity-50 transition-colors"
        >
          <Trash2 className="w-3 lg:w-3.5 h-3 lg:h-3.5" />
          Vaciar
        </button>
      </div>

      {/* Main Scrollable Content: List + Totals + Selectors */}
      <div className="flex-1 overflow-y-auto hide-scrollbar z-20 flex flex-col">
        
        {/* Cart Items List */}
        <div className="px-4 lg:px-8 py-4 space-y-3 lg:space-y-4">
          {cart.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-on-surface-variant">
              <ShoppingCart className="w-10 lg:w-12 h-10 lg:h-12 mb-4 opacity-10" />
              <p className="font-bold uppercase text-[9px] lg:text-[10px] tracking-widest">Carrito vacío</p>
            </div>
          ) : (
            cart.map((item) => {
              const itemPrice = Number(item.product.price);
              const lineTotal = itemPrice * item.quantity;
              
              return (
                <div key={item.product.id} className="bg-card rounded-2xl p-3 lg:p-4 flex gap-3 lg:gap-4 shadow-sm border border-outline-variant relative group animate-in fade-in slide-in-from-bottom-2">
                  <button 
                    onClick={() => onRemoveItem(item.product.id)}
                    className="absolute top-2 right-2 text-on-surface-variant/30 hover:text-rose-500 lg:opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-12 lg:w-16 h-12 lg:h-16 rounded-xl bg-surface-low shrink-0 overflow-hidden flex items-center justify-center border border-outline-variant/30">
                     {item.product.imageUrl ? (
                       <img src={item.product.imageUrl} alt={item.product.name} className="object-cover w-full h-full" />
                     ) : (
                       <ImageIcon className="w-5 lg:w-6 h-5 lg:h-6 text-outline-variant" />
                     )}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center min-w-0 pr-4">
                    <h4 className="font-bold text-foreground text-xs lg:text-sm truncate uppercase tracking-tight" title={item.product.name}>
                      {item.product.name}
                    </h4>
                    <p className="text-[9px] lg:text-[10px] text-on-surface-variant font-black mb-2 lg:mb-3 uppercase tracking-wider">
                      S/ {itemPrice.toFixed(2)}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 lg:gap-4 bg-surface-low rounded-lg px-2 py-0.5 lg:py-1 border border-outline-variant">
                        <button onClick={() => onUpdateQuantity(item.product.id, -1)} className="text-on-surface-variant hover:text-foreground font-bold p-0.5 lg:p-1 transition-colors"><Minus className="w-2.5 lg:w-3 h-2.5 lg:h-3" /></button>
                        <span className="font-black text-[10px] lg:text-xs w-3 lg:w-4 text-center text-foreground">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.product.id, 1)} disabled={item.quantity >= item.product.stock} className="text-on-surface-variant hover:text-foreground font-bold p-0.5 lg:p-1 disabled:opacity-30 transition-colors"><Plus className="w-2.5 lg:w-3 h-2.5 lg:h-3" /></button>
                      </div>
                      <div className="font-black text-foreground text-xs lg:text-sm tracking-tight">S/ {lineTotal.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Totals & Selectors Area */}
        <div className="bg-surface-low px-4 lg:px-8 pt-4 lg:pt-6 pb-6 border-t border-outline-variant rounded-t-[24px] lg:rounded-t-[32px]">
          {/* Totals - More balanced */}
          <div className="space-y-1 lg:space-y-2 mb-4 lg:mb-6">
            <div className="flex justify-between items-center text-[8px] lg:text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
              <span>Subtotal + IGV</span>
              <span className="text-foreground">S/ {(subtotal + taxAmount).toFixed(2)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between items-center text-[8px] lg:text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <span>Descuento</span>
                <span className="font-black">- S/ {appliedDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-end border-t border-outline-variant pt-2 lg:pt-3 mt-1 lg:mt-2">
              <span className="text-[9px] lg:text-xs font-black text-foreground uppercase tracking-[0.2em] mb-1 lg:mb-1.5">Total Neto</span>
              <span className="text-xl lg:text-3xl font-black text-foreground tracking-tighter leading-none">S/ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Grid Selectors */}
          <div className="grid grid-cols-2 gap-2 lg:gap-4 mb-4">
            <div>
              <p className="text-[7px] lg:text-[9px] font-black tracking-[0.2em] text-on-surface-variant uppercase mb-1 flex items-center gap-1"><User className="w-2 h-2 lg:w-3 lg:h-3" /> Cliente</p>
              <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} className="w-full pl-2 lg:pl-3 py-1.5 lg:py-2.5 bg-card border border-outline-variant rounded-lg text-[9px] lg:text-xs font-bold shadow-sm outline-none focus:border-primary transition-colors text-foreground"><option value="">Consumidor Final</option>{customers.map(c => (<option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>))}</select>
            </div>
            <div>
              <p className="text-[7px] lg:text-[9px] font-black tracking-[0.2em] text-on-surface-variant uppercase mb-1 flex items-center gap-1"><FileText className="w-2 h-2 lg:w-3 lg:h-3" /> Comprobante</p>
              <div className="flex gap-1 p-1 bg-card/50 rounded-lg border border-outline-variant">
                {['BOLETA', 'FACTURA'].map((type) => (
                  <button 
                    key={type} 
                    onClick={() => setDocumentType(type)} 
                    className={`flex-1 py-1.5 lg:py-2.5 rounded-lg text-[7px] lg:text-[9px] font-black uppercase tracking-widest border transition-all ${documentType === type ? 'bg-primary border-primary text-on-primary shadow-md' : 'bg-transparent border-transparent text-on-surface-variant hover:bg-card/50'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-2">
            <p className="text-[7px] lg:text-[9px] font-black tracking-[0.2em] text-on-surface-variant uppercase mb-1.5 flex items-center gap-1"><Banknote className="w-2 h-2 lg:w-3 lg:h-3" /> Medio de Pago</p>
            <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
              {paymentMethods.filter(m => m.isActive).map((method) => {
                const methodKey = method.name === 'Efectivo' ? 'CASH' : method.name === 'Tarjeta' ? 'CARD' : 'DIGITAL';
                const Icon = method.name === 'Efectivo' ? Banknote : method.name === 'Tarjeta' ? CreditCard : Wallet;
                return (<button key={method.id} onClick={() => setPaymentMethod(methodKey)} className={`flex flex-col items-center justify-center p-1.5 lg:p-3 rounded-lg border transition-all ${paymentMethod === methodKey ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-outline-variant bg-card text-on-surface-variant shadow-sm hover:border-primary/30'}`}><Icon className="w-3.5 lg:w-4 h-3.5 lg:h-4 mb-0.5 lg:mb-1.5" /><span className="text-[6px] lg:text-[9px] font-black uppercase tracking-tighter lg:tracking-widest">{method.name}</span></button>);
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Sticky at the very bottom */}
      <div className="p-3 lg:p-8 bg-card border-t border-outline-variant lg:border-none relative z-40 shrink-0">
        <div className="flex flex-col gap-1.5 lg:gap-3">
          <button 
            onClick={onCompleteSale}
            disabled={cart.length === 0 || isProcessing}
            className="w-full h-11 lg:h-20 bg-primary hover:opacity-90 disabled:bg-surface-low disabled:text-on-surface-variant/30 transition-all rounded-lg lg:rounded-[24px] flex items-center justify-center gap-2 lg:gap-4 text-on-primary font-black shadow-lg shadow-primary/20 active:scale-[0.98] group"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                 <div className="w-4 lg:w-6 h-4 lg:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 <span className="uppercase tracking-[0.1em] text-[10px] lg:text-xs">Procesando</span>
              </div>
            ) : (
              <>
                <CheckCircle2 className="w-4 lg:w-6 h-4 lg:h-6 group-hover:scale-110 transition-transform" />
                <span className="uppercase tracking-[0.1em] lg:tracking-[0.2em] text-[11px] lg:text-sm font-black">Completar Venta</span>
              </>
            )}
          </button>

          <button 
            onClick={onGenerateQuotation}
            disabled={cart.length === 0 || isProcessing}
            className="w-full h-10 lg:h-12 bg-card hover:bg-surface-low disabled:bg-surface-low disabled:text-on-surface-variant/30 transition-all rounded-lg flex items-center justify-center gap-2 text-foreground font-black text-[10px] lg:text-xs border border-outline-variant uppercase tracking-widest active:scale-[0.98]"
          >
             <FileText className="w-4 h-4 text-primary" />
             Generar Cotización
          </button>
        </div>
      </div>
    </div>
  );
}
