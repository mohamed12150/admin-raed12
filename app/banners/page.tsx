"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBanners, deleteBanner } from "@/app/lib/supabase";

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getBanners();
      setBanners(data || []);
    } catch (err: any) {
      setError(err.message || "فشل تحميل العروض");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    try {
      await deleteBanner(id);
      setBanners(banners.filter((b) => b.id !== id));
    } catch (err: any) {
      setError(err.message || "فشل حذف العرض");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إدارة العروض</h2>
          <p className="text-slate-500 font-bold">التحكم في البنرات والعروض الترويجية في التطبيق</p>
        </div>
        <Link href="/banners/add" className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-100 flex items-center gap-2">
          <span>+</span>
          <span>إضافة عرض جديد</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:border-red-200 transition-all group">
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {banner.image_url ? (
                  <img 
                    src={banner.image_url} 
                    alt={banner.title_ar} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <span className="text-4xl">🖼️</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${banner.is_active ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}>
                    {banner.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-slate-600 shadow-sm">
                    ترتيب: {banner.display_order}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-black text-lg text-slate-900 mb-4">{banner.title_ar || "بدون عنوان"}</h3>
                
                <div className="flex justify-end gap-2 border-t border-slate-50 pt-4">
                  <Link href={`/banners/${banner.id}`} className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="تعديل">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>
                  <button onClick={() => handleDelete(banner.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors" title="حذف">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && banners.length === 0 && (
        <div className="text-center py-20 text-slate-400 font-bold">
          لا توجد عروض حالياً
        </div>
      )}
    </div>
  );
}
