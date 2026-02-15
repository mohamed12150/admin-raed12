"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { getBannerById, updateBanner, uploadImage } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title_ar: "",
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const banner = await getBannerById(id);

      if (banner) {
        setFormData({
          title_ar: banner.title_ar || "",
          is_active: banner.is_active ?? true,
          display_order: banner.display_order || 0
        });
        if (banner.image_url) {
          setPreviewUrl(banner.image_url);
        }
      } else {
        setError("العرض غير موجود");
      }
    } catch (err: any) {
      console.error("Error fetching banner:", err);
      setError(err.message || "فشل تحميل بيانات العرض");
    } finally {
      setLoading(false);
    }
  };

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
    setSaving(true);
    setError("");

    try {
      let image_url = previewUrl;

      if (selectedFile) {
        image_url = await uploadImage(selectedFile, "banners");
      }

      await updateBanner(id, {
        title_ar: formData.title_ar,
        image_url: image_url,
        is_active: formData.is_active,
        display_order: formData.display_order
      });

      alert("تم تحديث العرض بنجاح!");
      router.push("/banners");
    } catch (err: any) {
      console.error("Error updating banner:", err);
      setError(err.message || "فشل تحديث العرض");
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
        <Link href="/banners" className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
          ⬅️
        </Link>
        <div>
          <h2 className="text-3xl font-black text-slate-900">تعديل العرض</h2>
          <p className="text-slate-500 font-bold">تعديل تفاصيل البنر الترويجي</p>
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
            <label className="text-sm font-bold text-slate-700">عنوان العرض (اختياري)</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
              value={formData.title_ar}
              onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">ترتيب الظهور</label>
            <input 
              type="number" 
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">صورة العرض</label>
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
                  <span className="text-xs font-bold text-slate-400">اضغط لرفع الصورة</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="is_active"
              className="w-5 h-5 accent-red-600"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer">
              تفعيل العرض
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
          <Link href="/banners" className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all">إلغاء</Link>
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
