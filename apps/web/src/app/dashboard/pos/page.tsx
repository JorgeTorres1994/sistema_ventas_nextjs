"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import PosTopBar from '@/components/pos/PosTopBar';
import PosProductGrid from '@/components/pos/PosProductGrid';
import PosCartPanel from '@/components/pos/PosCartPanel';
import { getProducts, createSale, createQuotation, getActiveCategories, validateCoupon } from '@/lib/api';
import { toast } from 'sonner';
import { useSettings } from '@/components/SettingsProvider';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  imageUrl?: string;
  category?: { id: string, name: string };
  isActive?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

import { LayoutGrid, ShoppingCart } from 'lucide-react';

export default function PosPage() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<'products' | 'cart'>('products');
  
  // Products & Global search state
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all'>('all');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentType, setDocumentType] = useState('BOLETA');
  
  // Promotions & Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Calculate Totals
  const calculateTotals = useCallback(() => {
    const subtotal = cart.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);
    const taxRate = (settings?.taxRate || 18) / 100;
    const taxAmount = subtotal * taxRate;
    const totalBeforeDiscount = subtotal + taxAmount;
    const finalTotal = Math.max(0, totalBeforeDiscount - appliedDiscount);
    
    return { subtotal, taxAmount, totalBeforeDiscount, finalTotal };
  }, [cart, settings, appliedDiscount]);

  const { subtotal, taxAmount, finalTotal } = calculateTotals();

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      setAppliedDiscount(0);
      return;
    }
    
    try {
      const subtotalVal = cart.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);
      const coupon = await validateCoupon(couponCode, subtotalVal);
      
      let discount = 0;
      if (coupon.type === 'PERCENTAGE') {
        discount = (subtotalVal * Number(coupon.value)) / 100;
      } else {
        discount = Number(coupon.value);
      }
      
      setAppliedDiscount(discount);
      toast.success(`Cupón "${couponCode}" aplicado: -S/ ${discount.toFixed(2)}`);
    } catch (error: any) {
      setAppliedDiscount(0);
      setCouponCode('');
      toast.error(error.response?.data?.message || 'Cupón no válido');
    }
  };

  // Load Categories
  useEffect(() => {
    getActiveCategories()
      .then(data => setCategories(data))
      .catch(err => console.error("Error loading categories for POS", err));
  }, []);

  // Debounce logic for Search
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await getProducts({ 
          page: 1, 
          limit: 100, 
          search: searchQuery,
          categoryId: selectedCategoryId === 'all' ? undefined : selectedCategoryId 
        });
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategoryId]);

  // Cart Handlers
  const handleAddToCart = useCallback((product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error(`Límite de stock alcanzado para ${product.name}`);
        return;
      }
      setCart(prev => prev.map(item => 
        item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart(prev => [...prev, { product, quantity: 1 }]);
    }
    toast.success(`"${product.name}" añadido al carrito`, {
      icon: '🛒',
      duration: 1500
    });
  }, [cart]);

  const handleUpdateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.product.stock));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  }, []);

  const handleRemoveItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter(item => item.product.id !== productId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCart([]);
    setAppliedDiscount(0);
    setCouponCode('');
  }, []);

  const handleCompleteSale = async () => {
    // 1. Mandatory Customer Validation
    if (!selectedCustomerId) {
      toast.error('Cliente Requerido', {
        description: 'Debes seleccionar un cliente para procesar la venta.',
        icon: '👤'
      });
      return;
    }

    if (cart.length === 0) {
      toast.error('Carrito vacío', { description: 'Agrega productos para continuar.' });
      return;
    }

    setIsProcessing(true);
    try {
      const itemsPayload = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));
      
      const { finalTotal } = calculateTotals();

      const result = await createSale(
        itemsPayload, 
        paymentMethod, 
        finalTotal, 
        documentType,
        selectedCustomerId,
        couponCode,
        0 // pointsToRedeem deprecated
      );
      
      toast.success('¡Venta completada con éxito!', {
        description: `Total procesado: S/ ${finalTotal.toFixed(2)}`,
        action: {
          label: 'Ver Comprobante',
          onClick: () => {
            window.location.href = `/dashboard/sales?open=${result.id}`;
          }
        }
      });
      handleClearCart();
      const freshProducts = await getProducts({ 
        page: 1, 
        limit: 100, 
        search: searchQuery,
        categoryId: selectedCategoryId === 'all' ? undefined : selectedCategoryId 
      });
      setProducts(freshProducts.data);
      
    } catch (error: any) {
      console.error('Checkout failed:', error);
      const errorMsg = error.response?.data?.message || 'Error en la transacción. ¿Está abierta la caja?';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateQuotation = async () => {
    setIsProcessing(true);
    try {
      const itemsPayload = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));
      
      await createQuotation({
        items: itemsPayload,
        customerId: selectedCustomerId || null,
        notes: 'Generado desde POS',
        expirationDays: 15
      });
      
      toast.success('¡Cotización generada con éxito!', {
        description: 'Puedes verla en el módulo de Cotizaciones',
        icon: '📄'
      });
      handleClearCart();
    } catch (error: any) {
      console.error('Quotation failed:', error);
      toast.error('Error al generar cotización');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 w-full lg:w-[calc(100%-256px)] overflow-hidden relative">
        <PosTopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Mobile Tab View Logic */}
          <div className={`flex-1 overflow-hidden ${activeTab === 'products' ? 'block' : 'hidden lg:block'}`}>
            <PosProductGrid 
              products={products} 
              isLoading={isLoading} 
              onAddToCart={handleAddToCart}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              categories={categories}
            />
          </div>
          
          <div className={`w-full lg:w-[420px] lg:flex-none shrink-0 ${activeTab === 'cart' ? 'flex flex-1' : 'hidden lg:flex'} flex-col h-full overflow-hidden`}>
            <PosCartPanel 
              cart={cart}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              documentType={documentType}
              setDocumentType={setDocumentType}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              onApplyCoupon={handleApplyCoupon}
              appliedDiscount={appliedDiscount}
              subtotal={subtotal}
              taxAmount={taxAmount}
              finalTotal={finalTotal}
              onClearCart={handleClearCart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCompleteSale={handleCompleteSale}
              onGenerateQuotation={handleGenerateQuotation}
              isProcessing={isProcessing}
            />
          </div>
        </main>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden flex border-t border-outline-variant bg-white shrink-0 z-50">
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex flex-col items-center gap-1 ${activeTab === 'products' ? 'text-primary bg-primary/5' : 'text-on-surface-variant'}`}
          >
            <LayoutGrid className="w-5 h-5" />
            Catálogo
          </button>
          <button 
            onClick={() => setActiveTab('cart')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex flex-col items-center gap-1 relative ${activeTab === 'cart' ? 'text-primary bg-primary/5' : 'text-on-surface-variant'}`}
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute top-3 right-1/3 w-4 h-4 bg-rose-500 text-on-primary rounded-full text-[8px] flex items-center justify-center animate-pulse">
                {cart.length}
              </span>
            )}
            Carrito
          </button>
        </div>
      </div>
    </div>
  );
}
