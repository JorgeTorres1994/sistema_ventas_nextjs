"use client";

import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import ProductForm from '@/components/products/ProductForm';

export default function NewProductPage() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-hidden">
        {/* Top Header */}
        <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              <span>Gestión de Inventario</span>
              <span>/</span>
              <span>Productos</span>
              <span>/</span>
              <span className="text-gray-900">Agregar Nuevo Producto</span>
            </nav>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Agregar Nuevo Producto</h1>
          </div>
        </header>

        <main className="flex-1 overflow-hidden bg-white m-8 rounded-3xl shadow-sm border border-gray-100">
           <ProductForm isEdit={false} />
        </main>
      </div>
    </div>
  );
}
