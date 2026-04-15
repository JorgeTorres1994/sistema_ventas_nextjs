"use client";

import React from 'react';
import { Search, Bell } from 'lucide-react';

const TopBar = () => {
  return (
    <header className="h-[88px] border-b border-[#E5E7EB] bg-white flex items-center justify-between px-8 w-full">
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-[#9CA3AF]" />
        </div>
        <input
          type="text"
          placeholder="Buscar analíticas..."
          className="block w-full pl-10 pr-3 py-2.5 border-none bg-[#F9FAFB] rounded-lg text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#4B5563]">Últimos 7 días</span>
          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-full px-4 py-1.5 text-sm font-medium text-[#111827]">
            {new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - {new Date().toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        
        <div className="w-px h-8 bg-[#E5E7EB]"></div>

        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5 text-[#4B5563]" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white translate-x-0.5 -translate-y-0.5"></span>
        </div>

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right">
            <p className="text-sm font-semibold text-[#111827]">Alex Rivera</p>
            <p className="text-xs text-[#6B7280]">Administrador</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-200 overflow-hidden border border-[#E5E7EB]">
            {/* Avatar Placeholder since it's just a UI match */}
            <svg viewBox="0 0 36 36" fill="none" role="img" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
              <mask id="mask__beam" maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
                <rect width="36" height="36" rx="72" fill="#FFFFFF"></rect>
              </mask>
              <g mask="url(#mask__beam)">
                <rect width="36" height="36" fill="#fcd34d"></rect>
                <rect x="0" y="0" width="36" height="36" transform="translate(6 -4) rotate(49 18 18) scale(1)" fill="#fbbf24" rx="36"></rect>
                <path d="M15 19c2 1 4 1 6 0" stroke="#000000" fill="none" strokeLinecap="round"></path>
                <rect x="11" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect>
                <rect x="23" y="14" width="1.5" height="2" rx="1" stroke="none" fill="#000000"></rect>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
