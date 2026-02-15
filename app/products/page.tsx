"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts, deleteProduct, getCategories } from "@/app/lib/supabase";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async (categoryId?: string) => {
    try {
      setLoading(true);
      setError("");
      
      console.log("--- Starting Fetch ---");
      
      // Fetch categories first to see if it fails
      let categoriesData;
      try {
        console.log("Fetching categories...");
        categoriesData = await getCategories();
        console.log("Categories success:", categoriesData);
      } catch (catErr: any) {
        console.error("Categories fetch failed:", {
          message: catErr.message,
          details: catErr.details,
          hint: catErr.hint,
          code: catErr.code
        });
        throw new Error(`خطأ في جلب الأقسام: ${catErr.message}`);
      }

      // Fetch products
      let productsData;
      try {
        console.log("Fetching products for category:", categoryId);
        productsData = await getProducts(categoryId);
        console.log("Products success:", productsData);
      } catch (prodErr: any) {
        console.error("Products fetch failed:", {
          message: prodErr.message,
          details: prodErr.details,
          hint: prodErr.hint,
          code: prodErr.code
        });
        throw new Error(`خطأ في جلب المنتجات: ${prodErr.message}`);
      }
      
      setCategories(categoriesData || []);
      setProducts(productsData || []);
    } catch (err: any) {
      console.error("Final catch error:", err);
      setError(err?.message || "فشل تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedCategory ?? undefined);
  }, [selectedCategory]);

  const handleCategoryChange = (id: string | null) => {
    setSelectedCategory(id);
    setLoading(true); // Force loading state while fetching filtered data
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("هل تريد حذف هذا المنتج؟")) return;
    try {
      await deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
    } catch (err: any) {
      setError(err?.message || "فشل حذف المنتج");
    }
  };

  const getProductDisplay = (product: any) => {
    const fullTitle = product.name_ar || product.name_en || "بدون عنوان";
    // Check if metadata has specific details, otherwise use description
    const weight = product.metadata?.weight || ""; 
    return { name: fullTitle, weight };
  };

  const filteredProducts = selectedCategory 
    ? products.filter((p: any) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900">إدارة المنتجات</h2>
          <p className="text-slate-500 font-bold">إضافة وتعديل المنتجات المعروضة في التطبيق</p>
        </div>
        <Link href="/products/add" className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-100 flex items-center gap-2">
          <span>+</span>
          <span>إضافة منتج جديد</span>
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar min-h-[50px]">
        {categories.length > 0 && (
          <button 
            onClick={() => handleCategoryChange(null)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
              selectedCategory === null 
              ? "bg-red-600 text-white shadow-lg shadow-red-100" 
              : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            الكل
          </button>
        )}
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
              selectedCategory === cat.id 
              ? "bg-red-600 text-white shadow-lg shadow-red-100" 
              : "bg-white text-slate-500 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            {cat.name_ar}
          </button>
        ))}
        {!loading && categories.length === 0 && (
          <div className="text-xs text-slate-400 bg-slate-50 px-4 py-2 rounded-full">
            لا توجد أقسام متاحة
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-bold text-center">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div key={product.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:border-red-200 transition-all group shadow-sm">
              <div className="aspect-square bg-slate-100 relative overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name_ar || "منتج"} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-300">
                   <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                 </div>
               )}
               <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                 <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-red-600 shadow-sm">
                   {product.categories?.name_ar || "بدون قسم"}
                 </span>
                 <span className={`px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${product.is_active ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}>
                   {product.is_active ? 'متاح' : 'غير متاح'}
                 </span>
               </div>
               <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm">
                 الكمية: {product.stock || 0}
               </div>
             </div>
             
             <div className="p-6">
                 {(() => {
                   const { name, weight } = getProductDisplay(product);
                   return (
                     <>
                       <h3 className="font-bold text-slate-800 mb-1 line-clamp-1 group-hover:text-red-600 transition-colors text-right text-lg">
                         {name}
                       </h3>
                       {weight && (
                         <div className="text-slate-500 text-sm font-medium mb-2 text-right bg-slate-100 inline-block px-2 py-1 rounded-md">
                           {weight}
                         </div>
                       )}
                       <p className="text-slate-400 text-xs mb-4 line-clamp-2 min-h-[20px] text-right">
                         {product.description_ar || product.name_en || ""}
                       </p>
                     </>
                   );
                 })()}
                 
                 <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                   <div className="text-right">
                     <span className="text-[10px] text-slate-400 block mb-0.5">السعر</span>
                     <span className="text-lg font-black text-red-600">{product.price || 0} ر.س</span>
                   </div>
                  <div className="flex gap-2">
                    <Link href={`/products/${product.id}`} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">✏️</Link>
                    <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && products.length === 0 && (
        <div className="text-center py-20 text-slate-400 font-bold">
          لا توجد منتجات حالياً
        </div>
      )}
    </div>
  );
}
