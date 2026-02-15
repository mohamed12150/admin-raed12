 "use client";
 
 import { useSearchParams } from "next/navigation";
 import { useEffect, useState } from "react";
 import Link from "next/link";
 import { searchProducts, searchOrders, searchCustomers } from "@/app/lib/supabase";
 
 export default function SearchClient() {
   const searchParams = useSearchParams();
   const query = searchParams.get("q") || "";
   
   const [loading, setLoading] = useState(false);
   const [products, setProducts] = useState<any[]>([]);
   const [orders, setOrders] = useState<any[]>([]);
   const [customers, setCustomers] = useState<any[]>([]);
 
   useEffect(() => {
     if (!query) return;
 
     const fetchData = async () => {
       setLoading(true);
       try {
         const [prodData, ordData, custData] = await Promise.all([
           searchProducts(query),
           searchOrders(query),
           searchCustomers(query)
         ]);
         
         setProducts(prodData || []);
         setOrders(ordData || []);
         setCustomers(custData || []);
       } catch (error) {
         console.error("Search error:", error);
       } finally {
         setLoading(false);
       }
     };
 
     fetchData();
   }, [query]);
 
   if (!query) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
         <span className="text-6xl mb-4">🔍</span>
         <p className="text-xl font-bold">أدخل كلمة للبحث...</p>
       </div>
     );
   }
 
   if (loading) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
         <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
         <p className="text-slate-400 font-bold">جاري البحث...</p>
       </div>
     );
   }
 
   const hasResults = products.length > 0 || orders.length > 0 || customers.length > 0;
 
   return (
     <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div>
         <h2 className="text-3xl font-black text-slate-900">نتائج البحث</h2>
         <p className="text-slate-500 font-bold">نتائج البحث عن: "{query}"</p>
       </div>
 
       {!hasResults && (
         <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-12 text-center">
             <span className="text-4xl block mb-4">🤷‍♂️</span>
             <p className="text-slate-500 font-bold text-lg">لم يتم العثور على أي نتائج مطابقة.</p>
         </div>
       )}
 
       {products.length > 0 && (
         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
           <h3 className="text-xl font-black text-slate-900 border-b border-slate-50 pb-4 flex items-center gap-2">
             <span>🥩</span> المنتجات ({products.length})
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {products.map((product) => (
               <Link 
                 key={product.id} 
                 href={`/products/${product.id}`}
                 className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-red-100 hover:bg-red-50/30 transition-all group"
               >
                 <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                   {product.image_url ? (
                     <img src={product.image_url} alt={product.name_ar} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-2xl">🥩</div>
                   )}
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900 group-hover:text-red-700 transition-colors">{product.name_ar}</h4>
                   <p className="text-sm text-slate-500">{product.categories?.name_ar}</p>
                   <p className="text-sm font-black text-red-600 mt-1">{product.price} ر.س</p>
                 </div>
               </Link>
             ))}
           </div>
         </div>
       )}
 
       {orders.length > 0 && (
         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
           <h3 className="text-xl font-black text-slate-900 border-b border-slate-50 pb-4 flex items-center gap-2">
             <span>🛍️</span> الطلبات ({orders.length})
           </h3>
           <div className="space-y-3">
             {orders.map((order) => (
               <Link 
                 key={order.id} 
                 href={`/orders/${order.id}`}
                 className="block p-4 rounded-2xl border border-slate-100 hover:border-red-100 hover:bg-red-50/30 transition-all"
               >
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">
                       #{order.id.slice(0, 4)}
                     </div>
                     <div>
                       <p className="font-bold text-slate-900">طلب من {order.profiles?.full_name || order.profiles?.phone || "ضيف"}</p>
                       <p className="text-sm text-slate-500" dir="ltr">{new Date(order.created_at).toLocaleDateString("ar-SA")}</p>
                     </div>
                   </div>
                   <div className="text-left">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                       order.status === 'completed' ? 'bg-green-100 text-green-700' :
                       order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                       order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                       'bg-slate-100 text-slate-700'
                     }`}>
                       {order.status === 'pending' ? 'قيد الانتظار' :
                        order.status === 'processing' ? 'جاري التجهيز' :
                        order.status === 'completed' ? 'مكتمل' :
                        order.status === 'cancelled' ? 'ملغي' : order.status}
                     </span>
                     <p className="text-sm font-black text-slate-900 mt-1">{order.total_amount} ر.س</p>
                   </div>
                 </div>
               </Link>
             ))}
           </div>
         </div>
       )}
 
       {customers.length > 0 && (
         <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
           <h3 className="text-xl font-black text-slate-900 border-b border-slate-50 pb-4 flex items-center gap-2">
             <span>👥</span> العملاء ({customers.length})
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {customers.map((customer) => (
               <div 
                 key={customer.id} 
                 className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50"
               >
                 <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold">
                   {customer.full_name ? customer.full_name[0] : "?"}
                 </div>
                 <div className="flex-1 min-w-0">
                   <h4 className="font-bold text-slate-900 truncate">{customer.full_name || "بدون اسم"}</h4>
                   <p className="text-sm text-slate-500 truncate" dir="ltr">{customer.phone || customer.email || "لا يوجد رقم"}</p>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}
     </div>
   );
 }
