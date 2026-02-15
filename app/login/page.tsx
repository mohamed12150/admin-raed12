"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message || "فشل تسجيل الدخول. تأكد من البيانات.");
        setLoading(false);
        return;
      }

      if (data?.session) {
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, is_admin")
          .eq("id", data.user.id)
          .single();
        
        if (profileError || (profile.role !== "admin" && !profile.is_admin)) {
          await supabase.auth.signOut();
          setError("عذراً، هذا الحساب لا يملك صلاحيات الدخول للوحة التحكم.");
          setLoading(false);
          return;
        }

        // store token and user similarly to previous behaviour
        localStorage.setItem("token", data.session.access_token || "");
        localStorage.setItem("user", JSON.stringify(data.user || {}));
        window.location.href = "/";
      } else {
        setError("فشل تسجيل الدخول. تأكد من البيانات.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "حدث خطأ في الاتصال بالـ Supabase.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-in fade-in duration-500">
        <div className="text-center">
          <img 
            src="/logo.svg" 
            alt="الرائد للذبائح" 
            className="w-48 h-auto mx-auto mb-6 object-contain"
          />
          <h2 className="text-3xl font-black text-slate-900">تسجيل الدخول</h2>
          <p className="text-slate-500 font-bold mt-2 text-sm italic">مرحباً بك في لوحة تحكم الرائد للذبائح</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-bold text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">البريد الإلكتروني</label>
            <input 
              required 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zbiha.com" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-red-500/5 transition-all text-sm font-bold text-slate-900" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">كلمة المرور</label>
              <a href="#" className="text-[10px] font-black text-red-600 hover:underline">نسيت كلمة المرور؟</a>
            </div>
            <input 
              required 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-5 outline-none focus:ring-4 focus:ring-red-500/5 transition-all text-sm font-bold text-slate-900" 
            />
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-red-100 hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "جاري التحقق..." : "دخول للوحة التحكم"}
          </button>
        </form>
      </div>
    </div>
  );
}
