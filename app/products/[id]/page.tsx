"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { getProductById, updateProduct, uploadImage, getCategories } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    description_ar: "",
    price: "",
    old_price: "",
    category_id: "",
    stock: "",
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [product, cats] = await Promise.all([
        getProductById(id),
        getCategories()
      ]);

      setCategories(cats || []);

      if (product) {
        setFormData({
          name_ar: product.name_ar || "",
          name_en: product.name_en || "",
          description_ar: product.description_ar || "",
          price: product.price?.toString() || "",
          old_price: product.old_price?.toString() || "",
          category_id: product.category_id || "",
          stock: product.stock?.toString() || "0",
          is_active: product.is_active ?? true
        });
        if (product.image_url) {
          setPreviewUrl(product.image_url);
        }
      } else {
        setError("المنتج غير موجود");
      }
    } catch (err: any) {
      console.error("Error fetching product:", err);
      setError(err.message || "فشل تحميل بيانات المنتج");
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
        image_url = await uploadImage(selectedFile, "products");
      }

      await updateProduct(id, {
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        description_ar: formData.description_ar,
        price: parseFloat(formData.price),
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        category_id: formData.category_id,
        image_url: image_url,
        stock: parseInt(formData.stock) || 0,
        is_active: formData.is_active
      });

      alert("تم تحديث المنتج بنجاح!");
      router.push("/products");
    } catch (err: any) {
      console.error("Error updating product:", err);
      setError(err.message || "فشل تحديث المنتج");
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/products" className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
          ⬅️
        </Link>
        <div>
          <h2 className="text-3xl font-black text-slate-900">تعديل المنتج</h2>
          <p className="text-slate-500 font-bold">تعديل تفاصيل المنتج الحالي</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-bold text-center">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">اسم المنتج (عربي)</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">اسم المنتج (إنجليزي)</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10 text-left" 
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">السعر</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">السعر السابق</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
                  value={formData.old_price}
                  onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">القسم</label>
              <select 
                required
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">اختر القسم</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">الكمية المتوفرة</label>
              <input 
                type="number" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">الوصف</label>
              <textarea 
                rows={4}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10 resize-none" 
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">صورة المنتج</label>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-[2rem] h-64 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden relative"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="text-4xl mb-2">🖼️</span>
                    <span className="text-xs font-bold text-slate-400">اضغط لرفع صورة</span>
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
                متاح للبيع
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-slate-50">
          <Link href="/products" className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all">إلغاء</Link>
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
