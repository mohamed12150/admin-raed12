"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCuttingMethods, deleteCuttingMethod } from "@/app/lib/supabase";

export default function CuttingMethodsPage() {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCuttingMethods();
      setMethods(data || []);
    } catch (err: any) {
      setError(err.message || "فشل تحميل طرق التقطيع");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف طريقة التقطيع هذه؟")) return;
    try {
      await deleteCuttingMethod(id);
      setMethods(methods.filter((m) => m.id !== id));
    } catch (err: any) {
      setError(err.message || "فشل حذف طريقة التقطيع");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">طرق التقطيع</h2>
          <p className="text-slate-500 font-bold">خيارات التقطيع المتاحة للعملاء</p>
        </div>
        <Link href="/cutting-methods/add" className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-100 flex items-center gap-2">
          <span>+</span>
          <span>إضافة جديد</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-bold text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-50">
                  <th className="px-8 py-5">المعرف</th>
                  <th className="px-8 py-5">الاسم</th>
                  <th className="px-8 py-5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {methods.map((method) => (
                  <tr key={method.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-400">#{method.id}</td>
                    <td className="px-8 py-6 font-black text-slate-900">{method.name_ar}</td>
                    <td className="px-8 py-6 text-center flex items-center justify-center gap-2">
                      <Link href={`/cutting-methods/${method.id}`} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-sm">
                        تعديل
                      </Link>
                      <button onClick={() => handleDelete(method.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors font-bold text-sm">
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {methods.length === 0 && (
              <div className="p-20 text-center font-bold text-slate-400">
                لا توجد طرق تقطيع مضافة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
