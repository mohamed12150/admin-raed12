"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "@/app/lib/supabase";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("الكل");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const status = filter === "الكل" ? undefined : filter;
      const data = await getOrders(status);
      setOrders(data || []);
    } catch (err: any) {
      setError(err?.message || "فشل تحميل الطلبات");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err: any) {
      setError(err?.message || "فشل تحديث حالة الطلب");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إدارة الطلبات</h2>
          <p className="text-slate-500 font-bold">إدارة وتتبع طلبات العملاء وتحديث حالاتها</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50">تصدير Excel</button>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-100">تحديث القائمة</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex gap-4 overflow-x-auto">
          {["الكل", "جديد", "تحت التجهيز", "في الطريق", "مكتمل", "ملغي"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-black whitespace-nowrap ${
                  filter === tab
                    ? "bg-red-600 text-white"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 m-6 rounded-xl font-bold text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-50">
                  <th className="px-6 py-5">رقم الطلب</th>
                  <th className="px-6 py-5">العميل</th>
                  <th className="px-6 py-5">الموقع</th>
                  <th className="px-6 py-5">المجموع</th>
                  <th className="px-6 py-5 text-center">الحالة</th>
                  <th className="px-6 py-5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors text-right">
                    <td className="px-6 py-6 font-black text-slate-900 text-xs">
                      #{order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-bold text-slate-900 leading-tight">
                        {order.profiles?.full_name || "مجهول"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">
                        {order.phone || order.profiles?.phone || "لا يوجد رقم"}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-bold text-slate-800 text-sm">
                        {order.city || "غير محدد"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 line-clamp-1 max-w-[150px]" title={order.address}>
                        {order.address || "لا يوجد عنوان"}
                      </p>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-black text-slate-900">{order.total_amount} ر.س</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">
                        {order.payment_method || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black border cursor-pointer outline-none transition-colors ${
                          order.status === 'جديد' ? 'bg-green-50 text-green-600 border-green-100' :
                          order.status === 'تحت التجهيز' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          order.status === 'في الطريق' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          order.status === 'مكتمل' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                          'bg-red-50 text-red-600 border-red-100'
                        }`}
                      >
                        <option value="جديد">جديد</option>
                        <option value="تحت التجهيز">تجهيز</option>
                        <option value="في الطريق">توصيل</option>
                        <option value="مكتمل">مكتمل</option>
                        <option value="ملغي">ملغي</option>
                      </select>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <Link
                        href={`/orders/${order.id}`}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600 inline-block transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="p-20 text-center font-bold text-slate-400">
                لا توجد طلبات حالياً
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
