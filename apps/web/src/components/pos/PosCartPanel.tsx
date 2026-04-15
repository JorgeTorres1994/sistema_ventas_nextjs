import { useSettings } from '@/components/SettingsProvider';

export default function PosCartPanel({
  cart,
  paymentMethod,
  setPaymentMethod,
  onClearCart,
  onUpdateQuantity,
  onRemoveItem,
  onCompleteSale,
  isProcessing
}: PosCartPanelProps) {
  const { settings, paymentMethods } = useSettings();

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);
  const taxPercent = settings?.taxRate || 18;
  const taxAmount = subtotal * (taxPercent / 100);
  const total = subtotal + taxAmount;

  return (
    <div className="w-[420px] shrink-0 bg-gray-50 flex flex-col h-full border-l border-gray-100 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10 relative">
      
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between bg-gray-50 border-white relative z-20">
        <h2 className="text-xl font-bold text-gray-900">Active Cart</h2>
        <button 
          onClick={onClearCart}
          disabled={cart.length === 0 || isProcessing}
          className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-wide hover:text-red-700 disabled:opacity-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
          Clear Cart
        </button>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4 hide-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-4 opacity-30">shopping_cart</span>
            <p className="font-medium">Your cart is empty.</p>
          </div>
        ) : (
          cart.map((item) => {
            const itemPrice = Number(item.product.price);
            const lineTotal = itemPrice * item.quantity;
            
            return (
              <div key={item.product.id} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-gray-100 relative group animate-fade-in-up">
                
                <button 
                  onClick={() => onRemoveItem(item.product.id)}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all pointer-events-auto"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>

                <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center border border-gray-50">
                   {item.product.imageUrl ? (
                     <img src={item.product.imageUrl} alt={item.product.name} className="object-cover w-full h-full mix-blend-multiply" />
                   ) : (
                     <span className="material-symbols-outlined text-gray-300">image</span>
                   )}
                </div>
                
                <div className="flex-1 flex flex-col justify-center min-w-0 pr-4">
                  <h4 className="font-bold text-gray-900 text-sm truncate" title={item.product.name}>
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mb-3">
                    ${itemPrice.toFixed(2)} / unit
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 bg-gray-100/80 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="text-gray-500 hover:text-gray-900 font-bold p-1 rounded-md transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">remove</span>
                      </button>
                      <span className="font-bold text-sm w-4 text-center select-none text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="text-gray-500 hover:text-gray-900 font-bold p-1 rounded-md disabled:opacity-30 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                      </button>
                    </div>
                    
                    <div className="font-extrabold text-gray-900 text-base">
                      ${lineTotal.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-[#f2f4fb] px-8 pt-6 pb-8 border-t border-gray-200/60 rounded-t-[32px] mt-auto relative z-20">
        
        {/* Totals */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-sm font-medium text-gray-500">
            <span>Subtotal</span>
            <span className="font-bold text-gray-700">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-medium text-gray-500">
            <span>Tax ({taxPercent}%)</span>
            <span className="font-bold text-gray-700">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-end pt-3">
            <span className="text-xl font-bold text-gray-900 leading-none">Total</span>
            <span className="text-[40px] font-extrabold text-gray-900 leading-none tracking-tight">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">Payment Method</p>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.filter(m => m.isActive).map((method) => {
              const methodKey = method.name === 'Efectivo' ? 'CASH' : method.name === 'Tarjeta' ? 'CARD' : 'DIGITAL';
              const icon = method.name === 'Efectivo' ? 'payments' : method.name === 'Tarjeta' ? 'credit_card' : 'account_balance_wallet';
              
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(methodKey)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-colors ${paymentMethod === methodKey ? 'border-primary bg-primary/5 text-primary' : 'border-white bg-white text-gray-600 hover:border-gray-200 shadow-sm'}`}
                >
                  <span className="material-symbols-outlined mb-1">{icon}</span>
                  <span className="text-[11px] font-bold">{method.name === 'Billetera Digital' ? 'Digital' : method.name === 'Tarjeta' ? 'Card' : 'Cash'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Checkout Button */}
        <button 
          onClick={onCompleteSale}
          disabled={cart.length === 0 || isProcessing}
          className="w-full h-16 bg-primary hover:bg-primary-container disabled:bg-gray-300 disabled:opacity-80 transition-colors rounded-2xl flex items-center justify-center gap-3 text-white font-bold text-lg shadow-[0_8px_30px_rgba(0,75,202,0.3)] disabled:shadow-none active:scale-[0.98]"
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Complete Sale
            </>
          )}
        </button>
      </div>

    </div>
  );
}
