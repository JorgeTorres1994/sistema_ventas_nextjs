"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import ProductForm from '@/components/products/ProductForm';
import { getProductById } from '@/lib/api';

export default function EditProductPage() {
  const params = useParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      getProductById(params.id as string)
        .then((data) => setInitialData(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

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
              <span className="text-gray-900">Editar Producto</span>
            </nav>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Editar Producto</h1>
          </div>
        </header>

        <main className="flex-1 overflow-hidden bg-white m-8 rounded-3xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="h-full flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <ProductForm isEdit={true} initialData={initialData} />
          )}
        </main>
      </div>
    </div>
  );
}
