"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

const data = [
  {
    category: "الحاشي",
    products: [
      "حاشي كامل 75 كيلو",
      "حاشي بالكيلو",
      "ربع حاش 18 كيلو",
      "نصف حاشي 35 كيلو",
      "كبدة حاشي بالكيلو",
      "عرض خاص 5 ك مفروم حاشي بلدي"
    ]
  },
  {
    category: "العجل",
    products: [
      "عجل بلدى كامل 80 كيلو",
      "نص عجل بلدى 40 كيلو",
      "ربع عجل بلدى 20 كيلو",
      "كيلوعجل 75 ريال بدون عظم",
      "بوكس مفروم عجل 5 كيلو",
      "مفروم عجل بالكيلو",
      "بوكس مفروم عجل 10 كيلو"
    ]
  },
  {
    category: "الأغنام",
    products: [
      "ربع ذبيحة حرى وسط",
      "خروف حري جذع من 22 الي 24",
      "نصف خروف حري وسط",
      "خروف حري لباني من 10 الي 12 ك",
      "نصف خروف حري لباني",
      "سواكني حمري جذع 22 كيلو الي 24",
      "نصف سواكني حمري",
      "تيس بلدى الوزن بعد الذبح 12 كيلو",
      "نصف تيس",
      "نعيمي بلدي جذع وسط",
      "نصف جذع نعيمي وسط",
      "نعيمي هرفي لباني 12 كيلو",
      "نصف نعيمي لباني",
      "كبدة غنم كاملة",
      "خروف سواكني مرابي وزن بعد اذبح 20 كيلو",
      "بوكس التوفير مفروم غنم ٥ ك",
      "حري هرفي وسط 16ك",
      "نعيمي صغير طيب 17 كيلو",
      "حري بلدي جبر من 25 الي 27 ك",
      "سواكني جذع مرابي 24 ك وافي الشروط",
      "عقيقة حري طائفي 20 ك واكثر وافي الشروط",
      "نعيمي بلدي جذع وسط وزن 22 ك وافي الشروط"
    ]
  }
];

export default function SeedPage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const runSeed = async () => {
    setLoading(true);
    setStatus("جاري البدء...");
    console.log("Starting seeding process...");
    try {
      for (const item of data) {
        setStatus(`جاري إضافة قسم: ${item.category}`);
        console.log(`Adding category: ${item.category}`);
        
        // 1. Insert Category
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .insert([{ 
            id: item.category === "الحاشي" ? "camel" : item.category === "العجل" ? "calf" : "sheep",
            name_ar: item.category, 
            name_en: item.category === "الحاشي" ? "Camel" : item.category === "العجل" ? "Calf" : "Sheep",
            position: item.category === "الحاشي" ? 1 : item.category === "العجل" ? 2 : 3
          }])
          .select()
          .single();

        // Handle error if category already exists (ignore unique constraint violation)
        let categoryId;
        if (catError) {
          if (catError.code === '23505') { // Unique violation
             const { data: existingCat } = await supabase.from("categories").select("id").eq("name_ar", item.category).single();
             categoryId = existingCat?.id;
             console.log(`Category ${item.category} already exists with ID: ${categoryId}`);
          } else {
            console.error(`Error adding category ${item.category}:`, catError);
            setStatus(`خطأ في إضافة القسم ${item.category}: ${catError.message}`);
            continue;
          }
        } else {
          categoryId = catData.id;
        }

        if (!categoryId) {
           console.error(`Could not resolve category ID for ${item.category}`);
           continue;
        }

        console.log(`Category ID: ${categoryId}`);

        // 2. Insert Products
        for (const productTitle of item.products) {
          // Check if product exists
          const { data: existingProd } = await supabase.from("products").select("id").eq("name_ar", productTitle).single();
          if (existingProd) {
             console.log(`Product ${productTitle} already exists`);
             continue;
          }

          setStatus(`جاري إضافة منتج: ${productTitle} في قسم ${item.category}`);
          
          const { error: prodError } = await supabase
            .from("products")
            .insert([{
              name_ar: productTitle,
              name_en: productTitle, // Placeholder
              description_ar: `وصف تجريبي لـ ${productTitle}`,
              price: Math.floor(Math.random() * 500) + 100, // Random price 100-600
              category_id: categoryId,
              is_active: true,
              stock: 50
            }]);

          if (prodError) {
            console.error(`Error adding product ${productTitle}:`, prodError);
          } else {
            console.log(`Product ${productTitle} added successfully`);
          }
        }
      }
      setStatus("تمت إضافة المنتجات والأقسام بنجاح!");
    } catch (err: any) {
      console.error("Critical error during seeding:", err);
      setStatus(`حدث خطأ فادح: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const seedOrders = async () => {
    setLoading(true);
    setStatus("جاري إنشاء طلبات تجريبية...");
    try {
      // 1. Get a user (try current user or fetch any profile)
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;

      if (!userId) {
        const { data: profiles } = await supabase.from("profiles").select("id").limit(1);
        if (profiles && profiles.length > 0) {
          userId = profiles[0].id;
        }
      }

      if (!userId) {
        throw new Error("لا يوجد مستخدمين في النظام لربط الطلبات بهم. يرجى التسجيل أولاً.");
      }

      // 2. Get some products
      const { data: products } = await supabase.from("products").select("id, name_ar, price").limit(10);
      if (!products || products.length === 0) {
        throw new Error("لا يوجد منتجات. يرجى تشغيل 'إضافة المنتجات' أولاً.");
      }

      // 3. Create Orders
      const statuses = ["جديد", "تحت التجهيز", "في الطريق", "مكتمل", "ملغي"];
      
      for (let i = 0; i < 5; i++) {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: userId,
            status: randomStatus,
            total_amount: 0, // Will update later
            payment_method: Math.random() > 0.5 ? "cash" : "online",
            phone: "0500000000",
            city: "الرياض",
            address: "حي الملقا، شارع رقم 5",
            created_at: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString() // Random time in past
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // 4. Create Order Items
        let total = 0;
        const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items
        
        for (let j = 0; j < numItems; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const qty = Math.floor(Math.random() * 2) + 1;
          const subtotal = product.price * qty;
          total += subtotal;

          await supabase.from("order_items").insert({
            order_id: order.id,
            product_id: product.id,
            name_ar: product.name_ar,
            qty: qty,
            unit_price: product.price,
            subtotal: subtotal,
            metadata: { weight: "12kg", cutting: "ثلاجة" }
          });
        }

        // Update order total
        await supabase.from("orders").update({ total_amount: total }).eq("id", order.id);
      }

      setStatus("تم إنشاء 5 طلبات تجريبية بنجاح!");
    } catch (err: any) {
      console.error("Error seeding orders:", err);
      setStatus(`خطأ في إنشاء الطلبات: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 text-center space-y-6">
      <h1 className="text-2xl font-bold mb-4">إدارة البيانات التجريبية</h1>
      
      {status && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 max-w-md mx-auto">
          {status}
        </div>
      )}

      <div className="flex flex-col gap-4 max-w-md mx-auto">
        <button
          onClick={runSeed}
          disabled={loading}
          className="bg-slate-800 text-white px-8 py-4 rounded-xl font-bold disabled:opacity-50 hover:bg-slate-900 transition-colors"
        >
          {loading ? "جاري العمل..." : "1. إضافة المنتجات والأقسام (Products)"}
        </button>

        <button
          onClick={seedOrders}
          disabled={loading}
          className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold disabled:opacity-50 hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
        >
          {loading ? "جاري العمل..." : "2. إضافة طلبات تجريبية (Orders)"}
        </button>
      </div>
      
      <p className="text-slate-400 text-sm mt-8">
        ملاحظة: تأكد من تسجيل الدخول قبل إضافة الطلبات
      </p>
    </div>
  );
}
