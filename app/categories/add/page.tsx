"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { createCategory, uploadImage } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

export default function AddCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name_ar: "",
    name_en: "",
    position: 0
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.id) {
      setError("يجب إدخال معرف للقسم (مثلاً: sheep)");
      setLoading(false);
      return;
    }

    try {
      let image_url = "";
      if (selectedFile) {
        image_url = await uploadImage(selectedFile);
      }

      await createCategory({
        id: formData.id.toLowerCase().replace(/\s+/g, '_'),
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        image_url: image_url || null,
        position: formData.position || 0
      });

      alert("تمت إضافة القسم بنجاح!");
      router.push("/categories");
    } catch (err: any) {
      console.error("Error adding category:", err);
      setError(err.message || "فشل إضافة القسم.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/categories" className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
          ⬅️
        </Link>
        <div>
          <h2 className="text-3xl font-black text-slate-900">إضافة قسم جديد</h2>
          <p className="text-slate-500 font-bold">تنظيم المنتجات تحت مسمى جديد</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-bold text-center">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">المعرف (ID)</label>
            <input 
              required 
              type="text" 
              placeholder="مثلاً: sheep" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10 ltr"
              style={{ direction: 'ltr' }} 
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            />
            <p className="text-[10px] text-slate-400 font-bold">يجب أن يكون بالإنجليزية وبدون مسافات</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">الترتيب</label>
            <input 
              type="number" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">الاسم بالعربي</label>
            <input 
              required 
              type="text" 
              placeholder="مثلاً: غنم" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
              value={formData.name_ar}
              onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">الاسم بالإنجليزي</label>
            <input 
              required 
              type="text" 
              placeholder="Example: Sheep" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <label className="text-sm font-bold text-slate-700">صورة القسم</label>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-[2rem] h-48 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden relative"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <span className="text-4xl mb-2">🖼️</span>
                <span className="text-xs font-bold text-slate-400">ارفع صورة للقسم</span>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
          <Link href="/categories" className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all">إلغاء</Link>
          <button 
            disabled={loading}
            type="submit" 
            className="bg-red-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "حفظ القسم"}
          </button>
        </div>
      </form>
    </div>
  );
}
