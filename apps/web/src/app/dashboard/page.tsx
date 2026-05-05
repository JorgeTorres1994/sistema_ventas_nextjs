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
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden transition-all duration-300">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* KPI Cards */}
            <StatsCards kpis={data?.kpis} isLoading={isLoading} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
