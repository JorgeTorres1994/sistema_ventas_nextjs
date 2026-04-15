import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  RefreshCcw 
} from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  change: string;
  isNegative?: boolean;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const SummaryCard = ({ 
  title, 
  value, 
  change, 
  isNegative, 
  icon: Icon, 
  iconBg, 
  iconColor 
}: SummaryCardProps) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className={`px-2 py-1 rounded-md text-xs font-bold ${
        isNegative ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
      }`}>
        {change}
      </div>
    </div>
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-black text-gray-900 leading-none">{value}</h3>
    </div>
  </div>
);

interface SalesSummaryProps {
  stats: {
    totalRevenue: number;
    transactionCount: number;
    avgSale: number;
    returns: number;
  };
}

export default function SalesSummary({ stats }: SalesSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-12">
      <SummaryCard 
        title="Ingresos Totales" 
        value={`S/ ${stats.totalRevenue.toFixed(2)}`}
        change="+12.5%"
        icon={TrendingUp}
        iconBg="bg-indigo-50"
        iconColor="text-indigo-600"
      />
      <SummaryCard 
        title="Transacciones" 
        value={stats.transactionCount.toString()}
        change="+4.2%"
        icon={ShoppingBag}
        iconBg="bg-orange-50"
        iconColor="text-orange-600"
      />
      <SummaryCard 
        title="Venta Promedio" 
        value={`S/ ${stats.avgSale.toFixed(2)}`}
        change="-2.1%"
        isNegative
        icon={DollarSign}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      />
      <SummaryCard 
        title="Cancelaciones" 
        value={stats.returns.toString()}
        change="-8.5%"
        icon={RefreshCcw}
        iconBg="bg-rose-50"
        iconColor="text-rose-600"
      />
    </div>
  );
}
