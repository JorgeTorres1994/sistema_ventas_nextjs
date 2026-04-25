"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import PosTopBar from '@/components/pos/PosTopBar';
import PosProductGrid from '@/components/pos/PosProductGrid';
import PosCartPanel from '@/components/pos/PosCartPanel';
import { getProducts, createSale } from '@/lib/api';
import { toast } from 'sonner';
import { useSettings } from '@/components/SettingsProvider';

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

export default function PosPage() {
  // Products & Global search state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isProcessing, setIsProcessing] = useState(false);

  // Debounce logic for Search
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await getProducts(1, 100, searchQuery);
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
  }, [searchQuery]);

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

      await createSale(itemsPayload, paymentMethod, total, documentType);
      
      toast.success('¡Venta completada con éxito!', {
        description: `Total procesado: S/ ${total.toFixed(2)}`,
      });
      handleClearCart();
      const freshProducts = await getProducts(1, 100, searchQuery);
      setProducts(freshProducts.data);
      
    } catch (error: any) {
      console.error('Checkout failed:', error);
      const errorMsg = error.response?.data?.message || 'Error en la transacción. ¿Está abierta la caja?';
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-hidden relative">
        <PosTopBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Main Workspace: Product Grid */}
          <PosProductGrid 
            products={products} 
            isLoading={isLoading} 
            onAddToCart={handleAddToCart}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          
          {/* Sidebar: Cart Panel */}
          <PosCartPanel 
            cart={cart}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            documentType={documentType}
            setDocumentType={setDocumentType}
            onClearCart={handleClearCart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCompleteSale={handleCompleteSale}
            isProcessing={isProcessing}
          />
        </main>
      </div>
    </div>
  );
}
