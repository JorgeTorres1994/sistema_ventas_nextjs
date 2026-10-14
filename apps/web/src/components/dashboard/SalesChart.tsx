"use client";

import React, { useState } from 'react';
import { 
  BarChart,
  Bar,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

interface SalesChartProps {
  data: { day: string; current: number; previous: number }[];
  isLoading: boolean;
}

const SalesChart = ({ data, isLoading }: SalesChartProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-outline-variant shadow-sm h-[450px] animate-pulse flex flex-col">
        <div className="w-48 h-6 bg-surface-low rounded mb-2"></div>
        <div className="w-64 h-4 bg-surface-low rounded mb-8"></div>
        <div className="flex-1 bg-surface-low rounded-xl"></div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentVal = Number(payload[0]?.value || 0);
      const prevVal = Number(payload[1]?.value || 0);
      const diff = currentVal - prevVal;
      const pct = prevVal > 0 ? ((diff / prevVal) * 100).toFixed(1) : '0.0';

      return (
        <div className="bg-card/95 border border-outline-variant text-foreground p-4 rounded-2xl shadow-2xl text-xs space-y-2 backdrop-blur-md min-w-[200px]">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
            <span className="font-black text-sm text-foreground">Día {label}</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              diff >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {diff >= 0 ? '+' : ''}{pct}%
            </span>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-primary font-bold">
              <span className="w-2.5 h-2.5 rounded-md bg-primary shadow-sm" /> Actual:
            </span>
            <span className="font-black text-sm text-foreground">
              S/ {currentVal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
              <span className="w-2.5 h-2.5 rounded-md bg-outline-variant/60" /> Anterior:
            </span>
            <span className="font-bold text-xs text-on-surface-variant">
              S/ {prevVal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card rounded-2xl p-6 border border-outline-variant shadow-sm h-full min-h-[450px] flex flex-col transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight mb-1">Análisis de Ventas</h2>
          <p className="text-sm font-medium text-on-surface-variant">Volumen bruto vs. mes anterior</p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          {/* Indicadores de Leyenda */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-primary shadow-sm"></span>
              <span className="text-foreground">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-outline-variant opacity-60"></span>
              <span className="text-on-surface-variant">Anterior</span>
            </div>
          </div>

          {/* Selector de visualización (Barras / Líneas) */}
          <div className="bg-surface-low border border-outline-variant/50 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartType === 'bar' 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'text-on-surface-variant hover:text-foreground'
              }`}
              title="Vista en Barras"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Barras</span>
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                chartType === 'line' 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'text-on-surface-variant hover:text-foreground'
              }`}
              title="Vista en Líneas"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Líneas</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart 
              data={data} 
              margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
              barGap={4}
              barCategoryGap="25%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--on-surface-variant)', fontSize: 11, fontWeight: 700 }} 
                dy={10}
              />
              <YAxis hide={true} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--primary)', opacity: 0.06 }} />
              
              <Bar 
                dataKey="current" 
                name="Actual"
                fill="var(--primary)" 
                radius={[8, 8, 0, 0]} 
                maxBarSize={32}
              />
              <Bar 
                dataKey="previous" 
                name="Anterior"
                fill="var(--outline-variant)" 
                radius={[8, 8, 0, 0]} 
                maxBarSize={32}
                opacity={0.45}
              />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--on-surface-variant)', fontSize: 11, fontWeight: 700 }} 
                dy={10}
              />
              <YAxis hide={true} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--primary)', strokeWidth: 1, strokeDasharray: '3 3' }} />
              
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="var(--primary)" 
                strokeWidth={4} 
                dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: 'var(--card)' }}
                activeDot={{ r: 7, fill: 'var(--primary)', stroke: 'var(--card)', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="previous" 
                stroke="var(--outline-variant)" 
                strokeWidth={3} 
                strokeDasharray="4 4"
                dot={{ r: 3, fill: 'var(--outline-variant)', strokeWidth: 1, stroke: 'var(--card)' }}
                activeDot={{ r: 5, fill: 'var(--outline-variant)', stroke: 'var(--card)', strokeWidth: 2 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
