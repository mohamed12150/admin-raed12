"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !isAuthPage) {
      window.location.href = "/login";
      return;
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [isAuthPage]);

  const handleLogout = () => {
    if (confirm("هل أنت متأكد من تسجيل الخروج؟")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (isAuthPage) {
    return (
      <html lang="ar" dir="rtl">
        <body className="antialiased bg-[#fafafa] text-[#1e293b]">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased bg-[#fdfdfd] text-[#1e293b]">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <aside className="w-72 bg-white border-l border-slate-100 flex-shrink-0 hidden lg:flex flex-col shadow-sm z-20">
            <div className="h-20 flex items-center px-8 border-b border-red-50">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="الرائد للذبائح" className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900">الرائد <span className="text-red-600">للذبائح</span></h1>
                </div>
              </div>
            </div>

            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto font-bold">
              <NavItem href="/" icon="🏠" label="الرئيسية" />
              <NavItem href="/orders" icon="🛍️" label="الطلبات" badge="3" />
              <NavItem href="/products" icon="🥩" label="المنتجات" />
              <NavItem href="/categories" icon="📑" label="الأقسام" />
              <NavItem href="/customers" icon="👥" label="العملاء" />
              <NavItem href="/banners" icon="🖼️" label="الإعلانات" />
              <NavItem href="/cutting-methods" icon="🔪" label="طرق التقطيع" />
              <NavItem href="/reports" icon="📊" label="التقارير" />
              <NavItem href="/settings" icon="⚙️" label="الإعدادات" />
            </div>

            <div className="p-4 border-t border-slate-50">
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 w-full text-right group hover:bg-red-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold border-2 border-white group-hover:bg-red-600 group-hover:text-white transition-colors">
                  {user && (user.full_name || user.name) ? (user.full_name || user.name)[0] : "م"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{user ? (user.full_name || user.name || user.email || "محمد المشرف") : "محمد المشرف"}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">تسجيل الخروج</p>
                </div>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8">
              <div className="flex items-center gap-4">
                <form onSubmit={handleSearch} className="relative hidden md:block">
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 pointer-events-none">🔍</span>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث سريع..." 
                    className="w-80 bg-slate-50 border border-slate-100 rounded-xl py-2.5 pr-10 pl-4 text-sm outline-none focus:ring-2 focus:ring-red-500/10 transition-all" 
                  />
                </form>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/orders" className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-95">طلب جديد</Link>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto bg-[#fafafa] p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label, badge = null }: any) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
        isActive 
        ? "bg-red-600 text-white shadow-lg shadow-red-100" 
        : "text-slate-600 hover:bg-red-50 hover:text-red-600"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-sm flex-1">{label}</span>
      {badge && (
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
          isActive ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
        }`}>
          {badge}
        </span>
      )}
    </Link>
  );
}
