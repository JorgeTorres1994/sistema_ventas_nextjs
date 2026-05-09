"use client";

import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface SalesChartProps {
  data: { day: string; current: number; previous: number }[];
  isLoading: boolean;
}

const SalesChart = ({ data, isLoading }: SalesChartProps) => {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-outline-variant shadow-sm h-[450px] animate-pulse flex flex-col">
        <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
        <div className="w-64 h-4 bg-gray-200 rounded mb-8"></div>
        <div className="flex-1 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-outline-variant text-foreground p-3 rounded-lg shadow-xl text-sm">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-primary">Actual: S/ {payload[0].value}</p>
          <p className="text-on-surface-variant">Anterior: S/ {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-outline-variant shadow-sm h-full min-h-[450px] flex flex-col transition-all">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Análisis de Ventas</h2>
          <p className="text-[15px] text-on-surface-variant">Volumen bruto vs. mes anterior</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary"></span>
            <span className="text-sm font-medium text-secondary">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-outline-variant"></span>
            <span className="text-sm font-medium text-secondary">Anterior</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--on-surface-variant)', fontSize: 12, fontWeight: 600 }} 
              dy={10}
            />
            <YAxis 
              hide={true} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="var(--primary)" 
              strokeWidth={5} 
              dot={false}
              activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--surface-container-lowest)', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="previous" 
              stroke="var(--outline-variant)" 
              strokeWidth={5} 
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
