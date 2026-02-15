"use client";

import { useEffect, useState } from "react";
import { getAppSettings, updateAppSettings, updateAppStatus } from "@/app/lib/supabase";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    delivery_fee: "",
    tax_percentage: "",
    contact_phone: "",
    is_app_active: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAppSettings();
      if (data) {
        setFormData({
          delivery_fee: data.delivery_fee?.toString() || "0",
          tax_percentage: data.tax_percentage?.toString() || "0",
          contact_phone: data.contact_phone || "",
          is_app_active: data.is_app_active ?? true
        });
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      // Don't show error if it's just empty settings
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newState = e.target.checked;
    // Update UI immediately
    setFormData(prev => ({ ...prev, is_app_active: newState }));
    setToggling(true);
    
    try {
      await updateAppStatus(newState);
      setSuccess(newState ? "تم تفعيل التطبيق" : "تم إيقاف التطبيق");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error toggling status:", err);
      setError(err.message || "فشل تغيير حالة التطبيق");
      // Revert UI if failed
      setFormData(prev => ({ ...prev, is_app_active: !newState }));
    } finally {
      setToggling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Validate inputs
      const deliveryFee = parseFloat(formData.delivery_fee);
      const taxPercentage = parseFloat(formData.tax_percentage);

      if (isNaN(deliveryFee)) throw new Error("يرجى إدخال رسوم توصيل صحيحة");
      if (isNaN(taxPercentage)) throw new Error("يرجى إدخال نسبة ضريبة صحيحة");

      await updateAppSettings({
        delivery_fee: deliveryFee,
        tax_percentage: taxPercentage,
        contact_phone: formData.contact_phone,
        is_app_active: formData.is_app_active
      });

      setSuccess("تم حفظ الإعدادات بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setError(err.message || "فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-900">إعدادات التطبيق</h2>
        <p className="text-slate-500 font-bold">التحكم في الرسوم والضرائب وحالة التطبيق</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl font-bold text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl font-bold text-center">
            {success}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <h3 className="font-black text-lg border-b border-slate-50 pb-4">الإعدادات المالية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">رسوم التوصيل (ر.س)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
                      value={formData.delivery_fee}
                      onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">نسبة الضريبة (%)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10" 
                      value={formData.tax_percentage}
                      onChange={(e) => setFormData({ ...formData, tax_percentage: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-black text-lg border-b border-slate-50 pb-4">التواصل والحالة</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">رقم التواصل للدعم</label>
                    <input 
                      type="text" 
                      placeholder="9665..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/10 text-left ltr" 
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">حالة التطبيق</p>
                      <p className="text-xs text-slate-500 font-bold">عند الإيقاف، لن يتمكن العملاء من الطلب</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {toggling && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>}
                      <span className={`text-xs font-bold ${formData.is_app_active ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.is_app_active ? 'يعمل' : 'متوقف'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.is_app_active}
                          disabled={toggling}
                          onChange={handleStatusToggle}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 peer-disabled:opacity-50"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                <button 
                  disabled={saving}
                  type="submit" 
                  className="w-full bg-red-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
