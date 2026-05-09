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
  <div className="bg-card rounded-2xl p-6 shadow-sm border border-outline-variant flex flex-col justify-between transition-all hover:border-primary/20">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center border border-outline-variant/10 shadow-inner`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
        isNegative ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
      }`}>
        {change}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h3 className="text-2xl font-black text-foreground leading-none tracking-tighter">{value}</h3>
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
