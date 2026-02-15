# لوحة تحكم زبائح - Dashboard

تطبيق Next.js للتحكم الكامل بمنصة زبائح - إدارة المنتجات والتصنيفات والطلبات.

## المتطلبات

- Node.js 18+
- npm أو yarn

## التجهيز السريع

### 1. تثبيت الاعتماديات

```bash
cd standalone-admin
npm install
```

### 2. إعداد الـ Environment

انسخ المتغيرات التالية في ملف `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ovaedwrjwpehdickfdxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_uWrRDdzjPyDt5uITxwGh6g_DGKXno_r
```

راجع ملف `SUPABASE_SETUP.md` للمزيد من التفاصيل حول إعداد Supabase.

### 3. تشغيل الخادم الإنمائي

```bash
npm run dev
```

ثم اتجه إلى http://localhost:3000 في متصفحك.

## الصفحات المتاحة

- **الصفحة الرئيسية** (`/`) - ملخص الإحصائيات
- **المنتجات** (`/products`) - عرض وإدارة المنتجات
- **التصنيفات** (`/categories`) - عرض وإدارة التصنيفات
- **الطلبات** (`/orders`) - عرض وإدارة الطلبات
- **تسجيل الدخول** (`/login`) - تسجيل الدخول عبر Supabase Auth

## الميزات

✅ تسجيل دخول آمن عبر Supabase Auth  
✅ إدارة المنتجات (إضافة، تعديل، حذف)  
✅ إدارة التصنيفات (إضافة، تعديل، حذف)  
✅ إدارة الطلبات وتحديث الحالات  
✅ واجهة ويب ديناميكية مع Tailwind CSS  
✅ دعم اللغة العربية الكامل  

## الهندسة المعمارية

- **Frontend**: Next.js 15+ (TypeScript)
- **Database**: Supabase (PostgreSQL + REST API)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Storage**: Supabase Storage (للصور)

## الملفات الرئيسية

- `app/lib/supabase.ts` - دوال الـ CRUD مع Supabase
- `app/lib/supabaseClient.ts` - عميل Supabase
- `app/login/page.tsx` - صفحة تسجيل الدخول
- `app/products/page.tsx` - صفحة المنتجات
- `app/categories/page.tsx` - صفحة التصنيفات
- `app/orders/page.tsx` - صفحة الطلبات

## الترخيص

خاص بـ Zbiha Project

