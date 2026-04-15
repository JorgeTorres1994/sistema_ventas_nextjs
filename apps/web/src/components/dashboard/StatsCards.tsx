"use client";

import React from 'react';
import { DollarSign, ShoppingBag, Target, BarChart2, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsProps {
  kpis: {
    revenue: number;
    revenueGrowth: number;
    orders: number;
    ordersGrowth: number;
    conversionRate: number;
    conversionRateGrowth: number;
    avgOrderValue: number;
    avgOrderGrowth: number;
  };
  isLoading: boolean;
}

const StatsCards = ({ kpis, isLoading }: StatsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(kpis?.revenue || 0),
      growth: parseFloat((kpis?.revenueGrowth || 0).toFixed(1)),
      icon: DollarSign,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Orders',
      value: (kpis?.orders || 0).toLocaleString(),
      growth: parseFloat((kpis?.ordersGrowth || 0).toFixed(1)),
      icon: ShoppingBag,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Conversion Rate',
      value: `${kpis?.conversionRate || 0}%`,
      growth: parseFloat((kpis?.conversionRateGrowth || 0).toFixed(1)),
      icon: Target,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Avg. Order Value',
      value: formatCurrency(kpis?.avgOrderValue || 0),
      growth: parseFloat((kpis?.avgOrderGrowth || 0).toFixed(1)),
      icon: BarChart2,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-sm animate-pulse">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="w-16 h-6 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-32 h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
              card.growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {card.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>{Math.abs(card.growth)}%</span>
            </div>
          </div>
          <div>
            <p className="text-[15px] font-medium text-[#6B7280] mb-1">{card.title}</p>
            <h3 className="text-[28px] font-bold text-[#111827] leading-none">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
