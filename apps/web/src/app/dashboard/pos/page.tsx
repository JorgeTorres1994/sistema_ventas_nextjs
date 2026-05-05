"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import PosTopBar from '@/components/pos/PosTopBar';
import PosProductGrid from '@/components/pos/PosProductGrid';
import PosCartPanel from '@/components/pos/PosCartPanel';
import { getProducts, createSale, createQuotation, getActiveCategories } from '@/lib/api';
import { toast } from 'sonner';
import { useSettings } from '@/components/SettingsProvider';
import { ShoppingCart } from 'lucide-react';

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

export default function PosPage() {
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
  
  // Promotions & Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [couponCode, setCouponCode] = useState('');
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [customerPoints, setCustomerPoints] = useState(0);

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
  }, []);

  const { settings } = useSettings();

  const [documentType, setDocumentType] = useState('BOLETA');

  const handleCompleteSale = async () => {
    setIsProcessing(true);
    try {
      const itemsPayload = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));
      
      const subtotal = cart.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);
      const taxRate = (settings?.taxRate || 18) / 100; 
      const total = subtotal + (subtotal * taxRate);

      const result = await createSale(
        itemsPayload, 
        paymentMethod, 
        total, 
        documentType,
        selectedCustomerId,
        couponCode,
        pointsToRedeem
      );
      
      toast.success('¡Venta completada con éxito!', {
        description: `Total procesado: S/ ${total.toFixed(2)}`,
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

  const [showMobileCart, setShowMobileCart] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden relative transition-all duration-300">
        <PosTopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Main Workspace: Product Grid */}
          <div className="flex-1 h-full overflow-hidden">
            <PosProductGrid 
              products={products} 
              isLoading={isLoading} 
              onAddToCart={handleAddToCart}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              categories={categories}
            />
          </div>
          
          {/* Sidebar: Cart Panel */}
          {/* On mobile, this will be an overlay/sliding panel */}
          <div 
            className={`
              fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-10
              transition-transform duration-300 transform
              ${showMobileCart ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            `}
          >
            {/* Overlay for mobile */}
            {showMobileCart && (
              <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm lg:hidden"
                onClick={() => setShowMobileCart(false)}
              />
            )}
            
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
              pointsToRedeem={pointsToRedeem}
              setPointsToRedeem={setPointsToRedeem}
              customerPoints={customerPoints}
              onClearCart={handleClearCart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCompleteSale={handleCompleteSale}
              onGenerateQuotation={handleGenerateQuotation}
              isProcessing={isProcessing}
              onCloseMobile={() => setShowMobileCart(false)}
            />
          </div>

          {/* Floating Cart Button for Mobile */}
          <button
            onClick={() => setShowMobileCart(true)}
            className="lg:hidden fixed bottom-6 right-6 z-40 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center animate-bounce active:scale-90 transition-transform"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </div>
          </button>
        </main>
      </div>
    </div>
  );
}
