import React from 'react';

interface PosTopBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function PosTopBar({ searchQuery, setSearchQuery }: PosTopBarProps) {
  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 shrink-0">
      <div className="text-xl font-bold text-gray-900 tracking-tight">Architect POS</div>
      
      <div className="flex-1 max-w-2xl px-12">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Search products or SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 outline-none text-sm text-gray-900"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-gray-500">
        <button className="hover:text-gray-900 transition-colors"><span className="material-symbols-outlined">notifications</span></button>
        <button className="hover:text-gray-900 transition-colors"><span className="material-symbols-outlined">settings</span></button>
        <button className="hover:text-gray-900 transition-colors"><span className="material-symbols-outlined">help</span></button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold ml-2 shadow-sm">
          A
        </div>
      </div>
    </div>
  );
}
