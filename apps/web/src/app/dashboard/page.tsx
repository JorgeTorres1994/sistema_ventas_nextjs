"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import StatsCards from '@/components/dashboard/StatsCards';
import SalesChart from '@/components/dashboard/SalesChart';
import RevenueDonut from '@/components/dashboard/RevenueDonut';
import RecentOrders from '@/components/dashboard/RecentOrders';
import { getDashboardData } from '@/lib/api';

import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-12">
            {/* KPI Cards */}
            <StatsCards kpis={data?.kpis} isLoading={isLoading} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 flex flex-col h-full">
                <SalesChart data={data?.salesOverTime || []} isLoading={isLoading} />
              </div>
              <div className="flex flex-col h-full">
                <RevenueDonut data={data?.revenueBreakdown || []} isLoading={isLoading} />
              </div>
            </div>

            {/* Recent Orders Section */}
            <RecentOrders orders={data?.recentOrders || []} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}

