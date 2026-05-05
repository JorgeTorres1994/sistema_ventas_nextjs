import React from 'react';
import { useSettings } from '@/components/SettingsProvider';
import { 
    Trash2, X, Image as ImageIcon, Minus, Plus, 
    CreditCard, Wallet, Banknote, CheckCircle2,
    ShoppingCart, FileText, Ticket, Star, User
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
  pointsToRedeem: number;
  setPointsToRedeem: (points: number) => void;
  customerPoints: number;
  onClearCart: () => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCompleteSale: () => void;
  onGenerateQuotation: () => void;
  isProcessing: boolean;
  onCloseMobile?: () => void;
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
  pointsToRedeem,
  setPointsToRedeem,
  customerPoints,
  onClearCart,
  onUpdateQuantity,
  onRemoveItem,
  onCompleteSale,
  onGenerateQuotation,
  isProcessing,
  onCloseMobile
}: PosCartPanelProps) {
  const { settings, paymentMethods } = useSettings();
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    getCustomers({ page: 1, limit: 100, isActive: true })
      .then(res => setCustomers(res.data))
      .catch(console.error);
  }, []);

  // Calculations
  const subtotal = cart.reduce((acc: number, item: CartItem) => acc + (Number(item.product.price) * item.quantity), 0);
  const taxPercent = settings?.taxRate || 18;
  const taxAmount = subtotal * (taxPercent / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="w-full sm:w-[420px] ml-auto shrink-0 bg-gray-50 flex flex-col h-full border-l border-gray-100 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10 relative">
      
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 flex items-center justify-between bg-gray-50 border-white relative z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Carrito</h2>
        </div>
        <button 
          onClick={onClearCart}
          disabled={cart.length === 0 || isProcessing}
          className="flex items-center gap-1.5 text-red-500 font-bold text-[10px] uppercase tracking-widest hover:text-red-700 disabled:opacity-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Vaciar Carrito</span>
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4 hide-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <ShoppingCart className="w-12 h-12 mb-4 opacity-10" />
            <p className="font-bold uppercase text-[10px] tracking-widest">Carrito vacío</p>
          </div>
        ) : (
          cart.map((item) => {
            const itemPrice = Number(item.product.price);
            const lineTotal = itemPrice * item.quantity;
            
            return (
              <div key={item.product.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-gray-100 relative group animate-in fade-in slide-in-from-bottom-2">
                
                <button 
                  onClick={() => onRemoveItem(item.product.id)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center border border-gray-50">
                   {item.product.imageUrl ? (
                     <img src={item.product.imageUrl} alt={item.product.name} className="object-cover w-full h-full" />
                   ) : (
                     <ImageIcon className="w-6 h-6 text-gray-300" />
                   )}
                </div>
                
                <div className="flex-1 flex flex-col justify-center min-w-0 pr-4">
                  <h4 className="font-bold text-gray-900 text-sm truncate uppercase tracking-tight" title={item.product.name}>
                    {item.product.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-black mb-3 uppercase tracking-wider">
                    S/ {itemPrice.toFixed(2)} / unidad
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-2 py-1 border border-gray-100">
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="text-gray-400 hover:text-gray-900 font-bold p-1 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-black text-xs w-4 text-center select-none text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="text-gray-400 hover:text-gray-900 font-bold p-1 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="font-black text-gray-900 text-sm tracking-tight">
                      S/ {lineTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-[#f8f9fc] px-8 pt-8 pb-10 border-t border-gray-200/60 rounded-t-[40px] mt-auto relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
        
        {/* Totals */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Subtotal de Operación</span>
            <span className="text-gray-900">S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Impuestos ({taxPercent}%)</span>
            <span className="text-gray-900">S/ {taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-end pt-2">
            <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] leading-none mb-2">Total Neto</span>
            <span className="text-[40px] font-black text-gray-900 leading-none tracking-tighter">
              S/ {total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Customer Selection */}
        <div className="mb-6">
          <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-4 flex items-center gap-2">
             <User className="w-3 h-3" /> Cliente
          </p>
          <div className="relative">
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-900 appearance-none outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all shadow-sm"
            >
              <option value="">Consumidor Final (Sin DNI/RUC)</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.dni}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Document Type Selection */}
        <div className="mb-6">
          <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-4 flex items-center gap-2">
             <FileText className="w-3 h-3" /> Tipo de Comprobante
          </p>
          <div className="flex gap-2">
            {['BOLETA', 'FACTURA'].map((type) => (
              <button
                key={type}
                onClick={() => setDocumentType(type)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                  documentType === type 
                    ? 'bg-gray-900 border-gray-900 text-white shadow-lg' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-10">
          <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-4 flex items-center gap-2">
             <Banknote className="w-3 h-3" /> Medio de Pago
          </p>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.filter(m => m.isActive).map((method) => {
              const methodKey = method.name === 'Efectivo' ? 'CASH' : method.name === 'Tarjeta' ? 'CARD' : 'DIGITAL';
              const Icon = method.name === 'Efectivo' ? Banknote : method.name === 'Tarjeta' ? CreditCard : Wallet;
              
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(methodKey)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                      paymentMethod === methodKey 
                        ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-md' 
                        : 'border-white bg-white text-gray-400 hover:border-gray-100 hover:text-gray-600 shadow-sm'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{method.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Coupons & Loyalty */}
        <div className="mb-6 grid grid-cols-2 gap-4">
           <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-3 flex items-center gap-2">
                 <Ticket className="w-3 h-3" /> Cupón
              </p>
              <input 
                type="text" 
                placeholder="Código"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold placeholder:text-gray-300 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
           </div>
           <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-3 flex items-center gap-2">
                 <Star className="w-3 h-3 text-amber-500" /> Puntos ({customerPoints})
              </p>
              <input 
                type="number" 
                placeholder="Canjear"
                value={pointsToRedeem || ''}
                onChange={(e) => setPointsToRedeem(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold placeholder:text-gray-300 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
           </div>
        </div>

        {/* Checkout Button */}
        <button 
          onClick={onCompleteSale}
          disabled={cart.length === 0 || isProcessing}
          className="w-full h-20 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition-all rounded-[24px] flex items-center justify-center gap-4 text-white font-black text-lg shadow-xl shadow-blue-100 active:scale-[0.98] group"
        >
          {isProcessing ? (
            <div className="flex items-center gap-3">
               <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
               <span className="uppercase tracking-[0.2em] text-xs">Procesando...</span>
            </div>
          ) : (
            <>
              <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="uppercase tracking-[0.2em] text-sm">Completar Transacción</span>
            </>
          )}
        </button>

        <button 
          onClick={onGenerateQuotation}
          disabled={cart.length === 0 || isProcessing}
          className="w-full mt-4 h-12 bg-white hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-300 transition-all rounded-xl flex items-center justify-center gap-3 text-gray-700 font-black text-xs border border-gray-200 uppercase tracking-widest active:scale-[0.98]"
        >
           <FileText className="w-4 h-4 text-blue-600" />
           Generar Cotización (Proforma)
        </button>
      </div>

    </div>
  );
}
