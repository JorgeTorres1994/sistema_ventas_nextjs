import React, { useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, PackageSearch, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  imageUrl?: string;
  category?: { id: string, name: string };
  isActive?: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface PosProductGridProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product) => void;
  selectedCategoryId: string | 'all';
  setSelectedCategoryId: (categoryId: string | 'all') => void;
  categories: Category[];
}

export default function PosProductGrid({ 
  products, 
  isLoading, 
  onAddToCart,
  selectedCategoryId,
  setSelectedCategoryId,
  categories
}: PosProductGridProps) {
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 200 : scrollLeft + 200;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f9f9ff] px-4 lg:px-8 py-4 lg:py-6 overflow-hidden">
      
      {/* Category Scroller in POS */}
      <div className="relative flex items-center gap-2 mb-8 shrink-0">
        <button 
          onClick={() => scroll('left')}
          className="p-2 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 transition-all shrink-0 z-10"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 flex-1"
        >
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              selectedCategoryId === 'all' 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-200'
            }`}
          >
            Todos
          </button>
          
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                selectedCategoryId === cat.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white border-gray-100 text-gray-700 hover:border-indigo-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="p-2 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 transition-all shrink-0 z-10"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
             <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
             <p className="font-black text-[10px] uppercase tracking-widest">Cargando catálogo...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-400 py-20 flex flex-col items-center">
            <PackageSearch className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in duration-500">
            {products.map(product => {
              const priceNumber = Number(product.price);
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 10;
              
              let badgeText = "EN STOCK";
              let badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
              
              if (isOutOfStock) {
                badgeText = "SIN STOCK";
                badgeColor = "bg-rose-50 text-rose-600 border-rose-100";
              } else if (isLowStock) {
                badgeText = "BAJO STOCK";
                badgeColor = "bg-amber-50 text-amber-600 border-amber-100";
              }

              return (
                <div 
                  key={product.id}
                  onClick={() => !isOutOfStock && onAddToCart(product)}
                  className={`bg-white rounded-[32px] p-4 transition-all duration-300 border group relative flex flex-col
                    ${!isOutOfStock 
                      ? 'cursor-pointer hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 border-gray-100 hover:border-indigo-100' 
                      : 'opacity-60 grayscale-[0.8] cursor-not-allowed border-gray-100'
                    }
                  `}
                >
                  <div className="relative aspect-square w-full rounded-3xl bg-gray-50/50 mb-4 overflow-hidden flex items-center justify-center border border-gray-50">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <LayoutGrid className="w-8 h-8 text-gray-200" />
                    )}
                    
                    <div className={`absolute top-2 left-2 lg:top-3 lg:left-auto lg:right-3 px-1.5 py-0.5 lg:px-2.5 lg:py-1 rounded-full text-[7px] lg:text-[8px] font-black tracking-tighter lg:tracking-widest border ${badgeColor}`}>
                      {badgeText}
                    </div>
                  </div>

                  <div className="px-1 flex flex-col flex-1">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 truncate">
                      {product.category?.name || 'General'}
                    </p>
                    <h3 className="font-black text-gray-900 text-sm mb-4 leading-tight line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Precio</span>
                        <span className="font-black text-gray-900 text-lg tracking-tight">
                          S/ {priceNumber.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-10 h-10 bg-gray-50 group-hover:bg-indigo-600 group-hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-sm">
                         <Plus className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
