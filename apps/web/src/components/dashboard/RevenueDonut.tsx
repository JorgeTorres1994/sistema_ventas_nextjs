"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RevenueDonutProps {
  data: { name: string; value: number }[];
  isLoading: boolean;
}

const COLORS = ['#2563EB', '#8B5CF6', '#10B981', '#CBD5E1'];

const RevenueDonut = ({ data, isLoading }: RevenueDonutProps) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-sm h-[420px] animate-pulse flex flex-col">
        <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
        <div className="w-32 h-4 bg-gray-200 rounded mb-8"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full border-[16px] border-gray-100"></div>
        </div>
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border-none text-white p-3 rounded-lg shadow-xl text-sm">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-gray-300">
            S/ {payload[0].value.toLocaleString('es-PE')} 
            ({((payload[0].value / total) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-sm h-[450px] flex flex-col">
      <div>
        <h2 className="text-xl font-bold text-[#111827] mb-1">Desglose de Ingresos</h2>
        <p className="text-[14px] text-[#6B7280]">Por canal de venta</p>
      </div>

      <div className="flex-1 relative min-h-[180px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-black text-[#111827]">
            S/ {(total / 1000).toFixed(0)}k
          </span>
          <span className="text-[8px] font-black text-[#6B7280] tracking-[0.2em] uppercase">TOTAL</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3">
        {data.map((item, idx) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={idx} className="flex items-center justify-between bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-[11px] font-bold text-[#4B5563] truncate uppercase tracking-tight">{
                  item.name === 'POS Terminal' ? 'POS' :
                  item.name === 'Online Shop' ? 'Online' :
                  item.name === 'Mobile App' ? 'App' : item.name
                }</span>
              </div>
              <span className="text-[11px] font-black text-[#111827]">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueDonut;
