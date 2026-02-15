"use client";

import { useEffect, useState } from "react";
import { getProfiles } from "../lib/supabase";
import { supabase } from "../lib/supabaseClient";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      
      const data = await getProfiles();
      setCustomers(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "فشل تحميل العملاء");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold text-sm">جاري تحميل العملاء...</p>
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-black text-slate-900">العملاء</h2>
            <p className="text-slate-500 font-bold">قائمة بجميع العملاء المسجلين في التطبيق</p>
        </div>
        <button 
          onClick={fetchCustomers}
          className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm"
        >
          🔄 تحديث القائمة
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-bold text-center">
          {error}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-right">
            <thead className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-50">
                <tr>
                <th className="px-8 py-5">الاسم</th>
                <th className="px-8 py-5">رقم الهاتف</th>
                <th className="px-8 py-5">الدور</th>
                <th className="px-8 py-5">تاريخ التسجيل</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {customers.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-8 py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-4xl">👥</span>
                            <p className="text-slate-500 font-bold">لا يوجد عملاء مسجلين حالياً</p>
                        </div>
                    </td>
                </tr>
                ) : (
                customers.map((customer) => (
                    <tr key={customer.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                                {customer.full_name ? customer.full_name[0] : "?"}
                            </div>
                            {customer.full_name || "غير محدد"}
                        </div>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-600" dir="ltr">{customer.phone || "غير محدد"}</td>
                    <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                        customer.role === 'admin' 
                            ? 'bg-purple-50 text-purple-600' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                        {customer.role === 'admin' ? 'مسؤول' : 'عميل'}
                        </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-500 text-sm">
                        {new Date(customer.created_at).toLocaleDateString("ar-SA", {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
