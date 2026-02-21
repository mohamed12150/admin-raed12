"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getOrderById, updateOrderStatus } from "@/app/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const params = useParams();
  const orderId = typeof params?.id === "string" ? params.id : Array.isArray((params as any)?.id) ? (params as any).id[0] : undefined;

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  const handleDownloadInvoiceImage = () => {
    if (!order || typeof document === "undefined") return;
    const items = order.order_items || [];
    const width = 900;
    const baseHeight = 420;
    const rowHeight = 60;
    const height = baseHeight + items.length * rowHeight;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    ctx.fillStyle = "#b91c1c";
    ctx.fillRect(20, 20, width - 40, 90);

    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px system-ui";
    ctx.fillText("الرائد للذبائح", width - 40, 70);

    ctx.textAlign = "left";
    ctx.font = "18px system-ui";
    ctx.fillText("فاتورة طلب", 40, 70);

    ctx.fillStyle = "#0f172a";
    ctx.font = "18px system-ui";
    ctx.fillText(`رقم الطلب: ${order.id.slice(0, 8)}`, 40, 130);

    const createdAt = new Date(order.created_at);
    const dateText = createdAt.toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    ctx.fillText(`التاريخ: ${dateText}`, 40, 160);

    ctx.fillText(`العميل: ${order.profiles?.full_name || "غير مسجل"}`, 40, 190);
    ctx.fillText(`الجوال: ${order.phone || order.profiles?.phone || "غير متوفر"}`, 40, 220);

    const city = order.city || "";
    const address = order.address || "";
    ctx.fillText(`المدينة: ${city || "غير محددة"}`, 40, 250);
    ctx.fillText(`العنوان: ${address || "لا يوجد عنوان تفصيلي"}`, 40, 280);

    const statusText = `حالة الطلب: ${order.status || "غير معروفة"}`;
    const paymentText =
      order.payment_method === "cash"
        ? "طريقة الدفع: عند الاستلام"
        : order.payment_method === "online"
        ? "طريقة الدفع: إلكترونية"
        : `طريقة الدفع: ${order.payment_method || "غير محددة"}`;

    ctx.fillText(statusText, 40, 310);
    ctx.fillText(paymentText, 40, 340);

    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 280);
    ctx.lineTo(width - 40, 280);
    ctx.stroke();

    ctx.font = "bold 18px system-ui";
    ctx.fillText("المنتج", 40, 380);
    ctx.fillText("الكمية", width / 2, 380);
    ctx.fillText("الإجمالي", width - 180, 380);

    ctx.beginPath();
    ctx.moveTo(40, 390);
    ctx.lineTo(width - 40, 390);
    ctx.stroke();

    ctx.font = "16px system-ui";
    let y = 420;
    items.forEach((item: any) => {
      const productName =
        item.name_ar ||
        item.products?.name_ar ||
        item.metadata?.productName ||
        item.metadata?.name ||
        "منتج غير معروف";

      const quantity =
        item.qty ??
        item.quantity ??
        item.metadata?.quantity ??
        item.metadata?.qty ??
        1;

      const subtotal = item.subtotal || 0;
      const cutting =
        (item.metadata?.cutting as string | undefined) ||
        (item.metadata?.cut_method as string | undefined) ||
        (item.metadata?.cut as string | undefined) ||
        (item.metadata?.cutType as string | undefined) ||
        (item.metadata?.cutting_method as string | undefined) ||
        (item.metadata?.cuttingName as string | undefined);

      ctx.fillText(String(productName).slice(0, 30), 40, y);
      ctx.fillText(String(quantity), width / 2, y);
      ctx.fillText(`${subtotal.toLocaleString()} ر.س`, width - 220, y);

      if (cutting) {
        ctx.font = "14px system-ui";
        ctx.fillStyle = "#6b7280";
        ctx.fillText(`التقطيع: ${String(cutting).slice(0, 40)}`, 40, y + 22);
        ctx.fillStyle = "#0f172a";
        ctx.font = "16px system-ui";
      }

      y += rowHeight;
    });

    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(width - 40, y);
    ctx.stroke();

    ctx.font = "bold 20px system-ui";
    ctx.fillText(
      `الإجمالي النهائي: ${order.total_amount?.toLocaleString() || 0} ر.س`,
      40,
      y + 40
    );

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `invoice-${order.id.slice(0, 8)}.png`;
    link.click();
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    try {
      setUpdating(true);
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      alert("تم تحديث حالة الطلب بنجاح");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("فشل تحديث الحالة");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-black text-slate-900">الطلب غير موجود</h2>
        <Link href="/orders" className="text-red-600 hover:underline font-bold">العودة للطلبات</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/orders" className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">⬅️</Link>
          <div>
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              تفاصيل الطلب 
              <span className="text-lg text-slate-400 font-normal">#{order.id.slice(0, 8)}</span>
            </h2>
            <p className="text-slate-500 font-bold">
              {new Date(order.created_at).toLocaleDateString('ar-SA', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
                hour: '2-digit', minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDownloadInvoiceImage}
            className="bg-white border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            تحميل الفاتورة كصورة
          </button>
          <div className="relative group">
            <button className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all flex items-center gap-2">
              <span>{order.status}</span>
              <span className="text-xs">▼</span>
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block z-10">
              {['جديد', 'تحت التجهيز', 'في الطريق', 'مكتمل', 'ملغي'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={updating}
                  className={`block w-full text-right px-4 py-3 text-sm font-bold hover:bg-slate-50 transition-colors ${order.status === status ? 'bg-red-50 text-red-600' : 'text-slate-700'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Items */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 font-black text-lg text-slate-900">المنتجات المطلوبة</div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">المنتج</th>
                    <th className="px-8 py-4">التفاصيل</th>
                    <th className="px-8 py-4">الكمية</th>
                    <th className="px-8 py-4">السعر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {order.order_items?.map((item: any) => {
                    const productName =
                      item.name_ar ||
                      item.products?.name_ar ||
                      item.metadata?.productName ||
                      item.metadata?.name ||
                      "منتج غير معروف";

                    const quantity =
                      item.qty ??
                      item.quantity ??
                      item.metadata?.quantity ??
                      item.metadata?.qty ??
                      1;

                    const cuttingType =
                      item.metadata?.cutting ||
                      item.metadata?.cut_method ||
                      item.metadata?.cut ||
                      item.metadata?.cutType ||
                      item.metadata?.cutting_method ||
                      item.metadata?.cuttingName;

                    return (
                      <tr key={item.id}>
                        <td className="px-8 py-6 font-bold text-slate-900">{productName}</td>
                        <td className="px-8 py-6 text-sm text-slate-500 font-bold">
                          {item.metadata?.weight && <div>الوزن: {item.metadata.weight}</div>}
                          {cuttingType && <div>التقطيع: {cuttingType}</div>}
                          {item.metadata?.notes && (
                            <div className="text-red-500 mt-1">ملاحظة: {item.metadata.notes}</div>
                          )}
                        </td>
                        <td className="px-8 py-6 font-black">{quantity}</td>
                        <td className="px-8 py-6 font-black text-red-600">
                          {item.subtotal?.toLocaleString()} ر.س
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="p-8 bg-slate-50/30 flex justify-end border-t border-slate-50">
              <div className="text-left space-y-2">
                <p className="text-slate-400 font-bold">الإجمالي النهائي</p>
                <p className="text-3xl font-black text-slate-900">{order.total_amount?.toLocaleString()} ر.س</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Customer Info */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-lg border-b border-slate-50 pb-4">معلومات العميل</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">الاسم</p>
                <p className="font-black text-slate-900">{order.profiles?.full_name || "غير مسجل"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">رقم الجوال</p>
                <p className="font-black text-slate-900 ltr text-right">{order.phone || order.profiles?.phone || "غير متوفر"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">عنوان التوصيل</p>
                <p className="font-bold text-slate-600 text-sm leading-relaxed">
                  {order.city && <span className="block mb-1 text-slate-800">{order.city}</span>}
                  {order.address || "لا يوجد عنوان تفصيلي"}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-lg border-b border-slate-50 pb-4">طريقة الدفع</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl">💵</span>
              <p className="font-black text-slate-900">
                {order.payment_method === 'cash' ? 'الدفع عند الاستلام' : 
                 order.payment_method === 'online' ? 'دفع إلكتروني' : order.payment_method}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
