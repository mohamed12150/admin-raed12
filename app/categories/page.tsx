"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategoryWithProductCount, deleteCategory } from "@/app/lib/supabase";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getCategoryWithProductCount();
        setCategories(data || []);
      } catch (err: any) {
        setError(err?.message || "فشل تحميل التصنيفات");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (categoryId: string) => {
    if (!confirm("هل تريد حذف هذا التصنيف؟")) return;
    try {
      await deleteCategory(categoryId);
      setCategories(categories.filter((c) => c.id !== categoryId));
    } catch (err: any) {
      setError(err?.message || "فشل حذف التصنيف");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إدارة التصنيفات</h2>
          <p className="text-slate-500 font-bold">تنظيم المنتجات في أقسام رئيسية</p>
        </div>
        <Link href="/categories/add" className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-100">إضافة قسم</Link>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center text-center space-y-4 hover:border-red-200 transition-colors">
              <div className="w-20 h-20 bg-red-600 rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-red-100 overflow-hidden text-white relative">
                {cat.image_url ? (
                  <img 
                    src={cat.image_url} 
                    alt={cat.name_ar} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>📦</span>
                )}
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900">{cat.name_ar}</h3>
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{cat.name_en}</p>
              </div>
              <div className="bg-slate-50 px-4 py-1 rounded-full text-xs font-black text-slate-500">
                {cat.productCount || 0} منتج
              </div>
              <div className="flex gap-4 pt-4">
                <Link href={`/categories/${cat.id}`} className="text-sm font-bold text-red-600 hover:underline">تعديل</Link>
                <button onClick={() => handleDelete(cat.id)} className="text-sm font-bold text-slate-400 hover:text-red-600">حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && categories.length === 0 && (
        <div className="text-center py-20 text-slate-400 font-bold">
          لا توجد تصنيفات حالياً
        </div>
      )}
    </div>
  );
}
