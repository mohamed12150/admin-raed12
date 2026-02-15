"use client";

import { useEffect, useState } from "react";
import { getOrders, getProducts, getProfiles } from "@/app/lib/supabase";
import Link from "next/link";

export default function Home() {
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrders: 0,
    productsCount: 0,
    customersCount: 0
  });
  const [latestOrders, setLatestOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [orders, products, profiles] = await Promise.all([
          getOrders(),
          getProducts(),
          getProfiles()
        ]);

        const totalSales = orders?.reduce((acc: number, order: any) => 
          order.status === "مكتمل" ? acc + (order.total_amount || 0) : acc, 0) || 0;
        
        const activeOrders = orders?.filter((o: any) => 
          ["جديد", "تحت التجهيز", "في الطريق"].includes(o.status)).length || 0;

        setStats({
          totalSales,
          activeOrders,
          productsCount: products?.length || 0,
          customersCount: profiles?.length || 0
        });

        setLatestOrders(orders?.slice(0, 5) || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">نظرة عامة</h2>
          <p className="text-slate-500 mt-1 font-bold">إحصائيات الأداء لمتجر ذبيحة</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <button className="px-5 py-2 rounded-xl text-sm font-black bg-red-600 text-white shadow-md shadow-red-100">الكل</button>
        </div>
      </div>

      {/* Stats - Red & White Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="إجمالي المبيعات" value={stats.totalSales.toLocaleString()} subValue="من الطلبات المكتملة" icon="💰" color="red" />
        <StatCard label="الطلبات النشطة" value={stats.activeOrders.toString()} subValue="قيد المعالجة والتوصيل" icon="🚚" color="slate" />
        <StatCard label="إجمالي المنتجات" value={stats.productsCount.toString()} subValue="منتج مسجل" icon="🥩" color="red" />
        <StatCard label="العملاء المسجلين" value={stats.customersCount.toString()} subValue="عميل" icon="👥" color="slate" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Orders Table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">أحدث الطلبات</h3>
              <Link href="/orders" className="text-sm font-black text-red-600 hover:text-red-700 transition-colors">مشاهدة الكل</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-50">
                    <th className="px-8 py-5">رقم الطلب</th>
                    <th className="px-8 py-5">العميل</th>
                    <th className="px-8 py-5 text-center">الحالة</th>
                    <th className="px-8 py-5">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {latestOrders.map((order) => (
                    <OrderRow 
                      key={order.id}
                      id={order.id} 
                      name={order.profiles?.full_name || order.phone || "مجهول"} 
                      status={order.status} 
                      amount={order.total_amount?.toLocaleString()} 
                    />
                  ))}
                </tbody>
              </table>
              {latestOrders.length === 0 && (
                <div className="p-10 text-center text-slate-400 font-bold">لا توجد طلبات حديثة</div>
              )}
            </div>
          </div>
        </div>

        {/* Categories & Actions */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
            <h3 className="font-black text-lg mb-6 border-b border-slate-50 pb-4">توزيع المبيعات</h3>
            <div className="space-y-6">
              <p className="text-sm text-slate-500 font-bold text-center">سيتم تفعيل الرسوم البيانية قريباً</p>
            </div>
          </div>

          <div className="bg-red-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-red-200 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-xl font-black mb-2">إدارة المتجر</h4>
              <p className="text-red-100 text-sm mb-6 font-bold">تحكم في الأسعار والمنتجات والتصنيفات من مكان واحد.</p>
              <Link href="/products" className="block w-full bg-white text-center text-red-600 font-black py-4 rounded-2xl hover:bg-red-50 transition-all shadow-lg active:scale-95">
                تعديل الأسعار الآن
              </Link>
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-500 rounded-full blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon, color }: any) {
  const isRed = color === "red";
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${isRed ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
          {icon}
        </div>
        <span className="text-[10px] font-black px-2 py-1 bg-slate-50 text-slate-400 rounded-lg uppercase tracking-tighter">مباشر</span>
      </div>
      <h3 className="text-slate-400 text-sm font-bold mb-1">{label}</h3>
      <div className="flex items-baseline gap-1">
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        <span className="text-xs font-bold text-slate-400">ر.س</span>
      </div>
      <p className={`text-xs font-black mt-3 ${subValue.includes('+') || subValue.includes('مكتمل') ? 'text-red-600' : 'text-slate-400'}`}>{subValue}</p>
    </div>
  );
}

function OrderRow({ id, name, status, amount }: any) {
  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'جديد': return 'bg-green-50 text-green-600 border-green-100';
      case 'تحت التجهيز': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'في الطريق': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'مكتمل': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'ملغي': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-8 py-6 font-black text-slate-900" title={id}>
        #{id.slice(0, 8)}
      </td>
      <td className="px-8 py-6 font-bold text-slate-700">{name}</td>
      <td className="px-8 py-6 text-center">
        <span className={`px-3 py-1.5 rounded-xl text-[11px] font-black border ${getStatusStyle(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-8 py-6 font-black text-slate-900">{amount} ر.س</td>
    </tr>
  );
}
