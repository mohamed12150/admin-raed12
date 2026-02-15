"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { getCategories, createProduct, uploadImage, getCuttingMethods, linkProductCuttingMethods } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [cuttingMethods, setCuttingMethods] = useState<any[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<number[]>([]);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    category_id: "",
    description_ar: "",
    price: "",
    old_price: "",
    stock: "100",
    is_active: true
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [cats, methods] = await Promise.all([
          getCategories(),
          getCuttingMethods()
        ]);
        
        setCategories(cats || []);
        setCuttingMethods(methods || []);

        if (cats && cats.length > 0) {
          setFormData(prev => ({ ...prev, category_id: cats[0].id }));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, []);

  const handleMethodToggle = (id: number) => {
    setSelectedMethods(prev => 
      prev.includes(id) 
        ? prev.filter(m => m !== id)
        : [...prev, id]
    );
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
    setLoading(true);
    setError("");

    try {
      let image_url = "";
      if (selectedFile) {
        image_url = await uploadImage(selectedFile);
      }

      const newProduct = await createProduct({
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        description_ar: formData.description_ar,
        price: parseFloat(formData.price),
        old_price: formData.old_price ? parseFloat(formData.old_price) : null,
        category_id: formData.category_id,
        image_url: image_url || null,
        stock: parseInt(formData.stock) || 0,
        is_active: formData.is_active,
        rating: 5.0, // Default rating
        review_count: 0
      });

      if (newProduct && selectedMethods.length > 0) {
        await linkProductCuttingMethods(newProduct.id, selectedMethods);
      }

      alert("تمت إضافة المنتج بنجاح!");
      router.push("/products");
    } catch (err: any) {
      console.error("Error adding product:", err);
      setError(err.message || "فشل إضافة المنتج. تأكد من إعدادات Supabase Storage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/products" className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
          ⬅️
        </Link>
        <div>
          <h2 className="text-3xl font-black text-slate-900">إضافة منتج جديد</h2>
          <p className="text-slate-500 font-bold">أدخل تفاصيل المنتج ليظهر في التطبيق</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {error && (
          <div className="md:col-span-2 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-bold text-center">
            {error}
          </div>
        )}
        <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-black text-lg border-b border-slate-50 pb-4">المعلومات الأساسية</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">اسم المنتج (عربي)</label>
              <input 
                required 
                type="text" 
                placeholder="مثلاً: ذبيحة نعيمي" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
                value={formData.name_ar}
                onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">اسم المنتج (إنجليزي)</label>
              <input 
                type="text" 
                placeholder="Ex: Naimi Sheep" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">القسم</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
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
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700">وصف المنتج</label>
              <textarea 
                rows={4} 
                placeholder="اكتب وصفاً تفصيلياً للمنتج..." 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10"
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-black text-lg border-b border-slate-50 pb-4">السعر والصورة</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">السعر الأساسي (ر.س)</label>
              <input 
                required 
                type="number" 
                placeholder="0.00" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">السعر قبل الخصم (اختياري)</label>
              <input 
                type="number" 
                placeholder="0.00" 
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
                value={formData.old_price}
                onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
              />
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
                className="border-2 border-dashed border-slate-200 rounded-[2rem] h-40 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden relative"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="text-3xl mb-2">📸</span>
                    <span className="text-xs font-bold text-slate-400">اضغط لرفع الصورة</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-black text-lg border-b border-slate-50 pb-4">خيارات التقطيع المتاحة</h3>
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {cuttingMethods.length === 0 ? (
               <p className="text-sm text-slate-400">لا توجد طرق تقطيع مضافة.</p>
            ) : (
              cuttingMethods.map((method) => (
                <div key={method.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                  <input 
                    type="checkbox" 
                    id={`method-${method.id}`}
                    className="w-5 h-5 accent-red-600"
                    checked={selectedMethods.includes(method.id)}
                    onChange={() => handleMethodToggle(method.id)}
                  />
                  <label htmlFor={`method-${method.id}`} className="text-sm font-bold text-slate-700 cursor-pointer w-full">
                    {method.name_ar}
                  </label>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-black text-lg border-b border-slate-50 pb-4">الحالة</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="is_active"
                className="w-5 h-5 accent-red-600"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer">
                المنتج متاح للطلب
              </label>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-4 pt-4">
          <Link href="/products" className="px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all">إلغاء</Link>
          <button 
            disabled={loading}
            type="submit" 
            className="bg-red-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "حفظ المنتج"}
          </button>
        </div>
      </form>
    </div>
  );
}
