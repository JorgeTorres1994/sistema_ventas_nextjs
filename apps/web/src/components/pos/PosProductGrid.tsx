import React, { useMemo } from 'react';

interface Product {
  id: string;
  name: string;
  price: string | number;
  stock: number;
  imageUrl?: string;
  category?: { name: string };
  isActive?: boolean;
}

interface PosProductGridProps {
  products: Product[];
  isLoading: boolean;
  onAddToCart: (product: Product) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export default function PosProductGrid({ 
  products, 
  isLoading, 
  onAddToCart,
  selectedCategory,
  setSelectedCategory
}: PosProductGridProps) {
  
  // Extract unique categories dynamically from loaded products
  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category?.name) cats.add(p.category.name);
    });
    return ['All', ...Array.from(cats)].slice(0, 6); // Up to 6 elements for design limits
  }, [products]);

  // Filter products by selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products;
    return products.filter(p => p.category?.name === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f9f9ff] px-8 py-6 overflow-hidden">
      
      {/* Category Chips */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 shrink-0 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border ${
              selectedCategory === cat 
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {isLoading ? (
          <div className="text-center text-gray-500 py-20 animate-pulse">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-20 flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inventory_2</span>
            <p>No products found matching criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const priceNumber = Number(product.price);
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 10;
              
              // Handle badge logic
              let badgeText = "IN STOCK";
              let badgeColor = "bg-primary-container/20 text-primary";
              
              if (isOutOfStock) {
                badgeText = "OUT OF STOCK";
                badgeColor = "bg-gray-800 text-white";
              } else if (isLowStock) {
                badgeText = "LOW STOCK";
                badgeColor = "bg-yellow-100 text-yellow-800";
              }

              return (
                <div 
                  key={product.id}
                  onClick={() => !isOutOfStock && onAddToCart(product)}
                  className={`bg-white rounded-2xl p-4 transition-all duration-200 border border-gray-100 relative group
                    ${!isOutOfStock ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary/30' : 'opacity-70 grayscale-[0.8] cursor-not-allowed'}
                  `}
                >
                  <div className="relative aspect-square w-full rounded-xl bg-gray-50 mb-4 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full mix-blend-multiply" />
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 text-4xl">image</span>
                    )}
                    
                    {/* Badge */}
                    <div className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${badgeColor}`}>
                      {badgeText}
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug line-clamp-2" title={product.name}>
                    {product.name}
                  </h3>
                  
                  <div className="flex items-end gap-2 mt-auto pt-2">
                    <span className="font-extrabold text-primary text-xl">
                      ${priceNumber.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase mb-1 truncate">
                      SKU: PRD-{product.id.substring(0,4)}
                    </span>
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
