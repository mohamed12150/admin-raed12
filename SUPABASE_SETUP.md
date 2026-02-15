# Supabase Configuration

الحقول التالية مطلوبة في `.env.local` أو في متغيرات البيئة الخاصة بك:

## البيئة المحلية

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ovaedwrjwpehdickfdxc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_uWrRDdzjPyDt5uITxwGh6g_DGKXno_r
```

## جداول قاعدة البيانات (التحديث الجديد)

### 1. `profiles` (المستخدمين)
- **RLS**: true
- **FK**: auth.users.id
- الحقول:
  - `id` (uuid): المعرف (مرتبط بـ auth.users)
  - `full_name` (text): الاسم الكامل
  - `phone` (text): رقم الجوال
  - `role` (text): الصلاحية (مثلاً: customer, admin)
  - `created_at` (timestamp): تاريخ التسجيل

### 2. `categories` (التصنيفات)
- **RLS**: false
- الحقول:
  - `id` (text): المعرف (مثلاً: camel, sheep)
  - `name_ar` (text): الاسم بالعربي
  - `name_en` (text): الاسم بالإنجليزية
  - `image_url` (text): رابط صورة القسم
  - `position` (int): ترتيب العرض

### 3. `products` (المنتجات)
- **RLS**: true
- **FK**: categories.id (category_id)
- الحقول:
  - `id` (uuid): معرف المنتج
  - `category_id` (text): القسم (مرتبط بـ categories.id)
  - `name_ar` (text): اسم المنتج (عربي)
  - `name_en` (text): اسم المنتج (إنجليزي)
  - `description_ar` (text): الوصف (عربي)
  - `price` (decimal): السعر الحالي
  - `old_price` (decimal): السعر القديم (للخصومات)
  - `image_url` (text): الصورة الرئيسية
  - `is_active` (boolean): حالة التوفر (true/false)
  - `stock` (integer): الكمية المتوفرة (اختياري)
  - `rating` (decimal): التقييم (مثلاً 4.9)
  - `review_count` (int): عدد التقييمات

### 4. `orders` (الطلبات)
- **RLS**: true
- **FK**: profiles.id (user_id)
- الحقول:
  - `id` (uuid): رقم الطلب
  - `user_id` (uuid): العميل (مرتبط بـ profiles.id)
  - `status` (text): الحالة (pending, processing, shipped, delivered, cancelled)
  - `total_amount` (decimal): إجمالي المبلغ
  - `payment_method` (text): طريقة الدفع (cash, etc.)
  - `phone` (text): رقم للتواصل
  - `city` (text): المدينة
  - `address` (text): العنوان التفصيلي
  - `created_at` (timestamp): تاريخ الطلب

### 5. `order_items` (تفاصيل الطلب)
- **RLS**: true
- **FK**: orders.id (order_id), products.id (product_id)
- الحقول:
  - `id` (uuid): معرف العنصر
  - `order_id` (uuid): رقم الطلب (مرتبط بـ orders.id)
  - `product_id` (uuid): المنتج (مرتبط بـ products.id)
  - `name_ar` (text): اسم المنتج وقت الطلب
  - `qty` (int): الكمية
  - `unit_price` (decimal): سعر الحبة
  - `subtotal` (decimal): المجموع (الكمية × السعر)
  - `metadata` (jsonb): تفاصيل إضافية (الوزن، طريقة التقطيع)

### 6. `cutting_methods` (خيارات التقطيع)
- **RLS**: false
- الحقول:
  - `id` (serial): معرف الخيار
  - `name_ar` (text): الاسم بالعربي (مثلاً: ثلاجة، مفطح)
  - `name_en` (text): الاسم بالإنجليزية

### 7. `app_settings` (إعدادات التطبيق)
- **RLS**: false
- الحقول:
  - `id` (int): معرف وحيد (1)
  - `delivery_fee` (decimal): رسوم التوصيل
  - `tax_percentage` (decimal): نسبة الضريبة (مثلاً 15.0)
  - `is_app_active` (boolean): حالة التطبيق (لإيقافه للصيانة)
  - `contact_phone` (text): رقم التواصل للدعم

### 8. `banners` (العروض الخاصة)
- **RLS**: false
- الحقول:
  - `id` (uuid): المعرف
  - `image_url` (text): صورة العرض
  - `title_ar` (text): العنوان
  - `is_active` (boolean): تفعيل العرض
  - `display_order` (int): ترتيب الظهور

## ملاحظات مهمة

- جميع الجداول الحساسة (مع RLS: true) يجب أن تكون محمية بـ Row Level Security.
- تأكد من تفعيل CORS في Supabase.
