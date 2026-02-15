"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getCuttingMethodById, updateCuttingMethod } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function EditCuttingMethodPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name_ar: ""
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const method = await getCuttingMethodById(id);

      if (method) {
        setFormData({
          name_ar: method.name_ar || ""
        });
      } else {
        setError("طريقة التقطيع غير موجودة");
      }
    } catch (err: any) {
      console.error("Error fetching cutting method:", err);
      setError(err.message || "فشل تحميل بيانات طريقة التقطيع");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateCuttingMethod(id, {
        name_ar: formData.name_ar
      });

      alert("تم تحديث طريقة التقطيع بنجاح!");
      router.push("/cutting-methods");
    } catch (err: any) {
      console.error("Error updating cutting method:", err);
      setError(err.message || "فشل تحديث طريقة التقطيع");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/cutting-methods" className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
          ⬅️
        </Link>
        <div>
          <h2 className="text-3xl font-black text-slate-900">تعديل طريقة التقطيع</h2>
          <p className="text-slate-500 font-bold">تعديل بيانات طريقة التقطيع</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-bold text-center">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">الاسم</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
          <Link href="/cutting-methods" className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all">إلغاء</Link>
          <button 
            disabled={saving}
            type="submit" 
            className="bg-red-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
}
