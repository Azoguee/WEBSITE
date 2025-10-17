"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Metrics {
  totalSales: number;
  ordersToday: number;
  activeProducts: number;
  lowStockAlerts: number;
}

interface ChartData {
  orderStatusDistribution: { status: string; _count: { status: number } }[];
  topSellingProducts: { name: string; sales: number }[];
  revenueTrend: { name: string; revenue: number }[];
}

interface Activity {
    type: string;
    id: string;
    status?: string;
    createdAt: string;
    adminUser?: { name: string };
    name?: string;
    email?: string;
}

// StatCard Component
const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <span className="text-2xl">{icon}</span>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [activityFeed, setActivityFeed] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsRes, chartDataRes, activityRes] = await Promise.all([
          fetch('/api/admin/dashboard/metrics'),
          fetch('/api/admin/dashboard/chart-data'),
          fetch('/api/admin/dashboard/recent-activity'),
        ]);
        const metricsData = await metricsRes.json();
        const chartDataData = await chartDataRes.json();
        const activityData = await activityRes.json();
        setMetrics(metricsData);
        setChartData(chartDataData);
        setActivityFeed(activityData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Sales" value={metrics?.totalSales ?? 0} icon="💰" />
        <StatCard title="Orders Today" value={metrics?.ordersToday ?? 0} icon="📦" />
        <StatCard title="Active Products" value={metrics?.activeProducts ?? 0} icon="🏷️" />
        <StatCard title="Low Stock Alerts" value={metrics?.lowStockAlerts ?? 0} icon="⚠️" />
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 grid gap-8">
            <Card>
            <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData?.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
                </ResponsiveContainer>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData?.topSellingProducts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="sales" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {activityFeed.map((item, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                            {item.type === 'NEW_ORDER' && <span>📦 New Order #{item.id.substring(0, 6)} - Status: {item.status}</span>}
                            {item.type === 'STOCK_CHANGE' && <span>📝 {item.adminUser?.name} updated a product.</span>}
                            {item.type === 'NEW_CUSTOMER' && <span>👤 New customer: {item.name} ({item.email})</span>}
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
