"use client";

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProductForm from '@/components/products/ProductForm';

export default function NewProductPage() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        {/* Top Header */}
        <header className="px-4 py-4 sm:px-8 sm:py-6 bg-card border-b border-outline-variant/30 flex items-center justify-between shrink-0">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 sm:mb-2">
              <span className="hidden sm:inline">Inventario</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-on-surface-variant">Productos</span>
              <span>/</span>
              <span className="text-on-surface-variant">Nuevo Registro</span>
            </nav>
            <h1 className="text-xl sm:text-3xl font-black text-foreground tracking-tight leading-none">Agregar Nuevo Producto</h1>
          </div>
        </header>

        <main className="flex-1 overflow-hidden bg-background sm:p-8">
           <div className="h-full bg-card sm:rounded-[40px] sm:border sm:border-outline-variant sm:shadow-sm overflow-hidden">
              <ProductForm isEdit={false} />
           </div>
        </main>
      </div>
    </div>
  );
}

