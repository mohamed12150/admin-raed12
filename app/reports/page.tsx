"use client";

import { useEffect, useState } from "react";
import { getOrders, getAllOrderItems } from "@/app/lib/supabase";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    averageOrderValue: 0,
    totalOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orders, orderItems] = await Promise.all([
        getOrders(),
        getAllOrderItems()
      ]);

      processData(orders || [], orderItems || []);
    } catch (error) {
      console.error("Error fetching reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (orders: any[], items: any[]) => {
    // 1. Sales over time (Last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const salesByDate = last7Days.map(date => {
      const dayOrders = orders.filter(o => 
        o.created_at.startsWith(date) && o.status !== 'cancelled'
      );
      return {
        date: new Date(date).toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric' }),
        sales: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        orders: dayOrders.length
      };
    });

    setSalesData(salesByDate);

    // 2. Top Products
    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    
    items.forEach(item => {
      const productId = item.product_id;
      const productName = item.products?.name_ar || "منتج غير معروف";
      
      if (!productSales[productId]) {
        productSales[productId] = { name: productName, quantity: 0, revenue: 0 };
      }
      
      productSales[productId].quantity += item.quantity;
      productSales[productId].revenue += item.price * item.quantity;
    });

    const top5 = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setTopProducts(top5);

    // 3. Status Distribution
    const statusCounts: Record<string, number> = {};
    orders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    setStatusDistribution(statusData);

    // 4. General Stats
    const completed = orders.filter(o => o.status === 'completed');
    const totalRev = completed.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    
    setStats({
      totalRevenue: totalRev,
      totalOrders: orders.length,
      completedOrders: completed.length,
      averageOrderValue: completed.length > 0 ? totalRev / completed.length : 0
    });
  };

  const COLORS = ['#dc2626', '#f87171', '#fca5a5', '#fee2e2', '#94a3b8'];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-900">التقارير والإحصائيات</h2>
        <p className="text-slate-500 font-bold">تحليل أداء المتجر والمبيعات</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-bold text-sm mb-1">إجمالي الإيرادات</p>
          <p className="text-3xl font-black text-red-600">{stats.totalRevenue.toLocaleString()} ر.س</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-bold text-sm mb-1">متوسط قيمة الطلب</p>
          <p className="text-3xl font-black text-slate-900">{Math.round(stats.averageOrderValue).toLocaleString()} ر.س</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-bold text-sm mb-1">إجمالي الطلبات</p>
          <p className="text-3xl font-black text-slate-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-bold text-sm mb-1">نسبة الإكمال</p>
          <p className="text-3xl font-black text-green-600">
            {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">المبيعات (آخر 7 أيام)</h3>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  cursor={{stroke: '#dc2626', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="sales" stroke="#dc2626" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6">حالات الطلب</h3>
          <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6">المنتجات الأكثر مبيعاً</h3>
        <div className="h-[300px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} />
              <Tooltip cursor={{fill: '#fef2f2'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="quantity" fill="#dc2626" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
