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
      <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-sm h-[420px] animate-pulse flex flex-col">
        <div className="w-48 h-6 bg-gray-200 rounded mb-2"></div>
        <div className="w-64 h-4 bg-gray-200 rounded mb-8"></div>
        <div className="flex-1 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border-none text-white p-3 rounded-lg shadow-xl text-sm">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-blue-400">Current: ${payload[0].value}</p>
          <p className="text-gray-400">Previous: ${payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-sm h-[420px] flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#111827] mb-1">Sales Analytics Over Time</h2>
          <p className="text-[15px] text-[#6B7280]">Gross volume vs. previous month</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span className="text-sm font-medium text-[#4B5563]">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#E5E7EB]"></span>
            <span className="text-sm font-medium text-[#4B5563]">Previous</span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} 
              dy={10}
            />
            <YAxis 
              hide={true} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            
            <Line 
              type="monotone" 
              dataKey="current" 
              stroke="#2563EB" 
              strokeWidth={5} 
              dot={false}
              activeDot={{ r: 6, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="previous" 
              stroke="#E5E7EB" 
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
