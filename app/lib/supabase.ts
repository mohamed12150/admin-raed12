import { supabase } from "./supabaseClient";

// ============ PRODUCTS ============
export async function getProducts(categoryId?: string) {
  let query = supabase
    .from("products")
    .select(`
      id,
      category_id,
      name_ar,
      name_en,
      description_ar,
      price,
      old_price,
      image_url,
      is_active,
      stock,
      rating,
      review_count,
      categories(id, name_ar, name_en)
    `);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      categories(id, name_ar, name_en)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createProduct(product: any) {
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, product: any) {
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name_ar,
      name_en,
      price,
      image_url,
      stock,
      category_id,
      categories(name_ar)
    `)
    .or(`name_ar.ilike.%${query}%,name_en.ilike.%${query}%,description_ar.ilike.%${query}%`)
    .limit(20);

  if (error) throw error;
  return data;
}

// ============ CATEGORIES ============
export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCategory(category: any) {
  const { data, error } = await supabase
    .from("categories")
    .insert([category])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, category: any) {
  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Get product count per category
export async function getCategoryWithProductCount() {
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("position", { ascending: true });

  if (error) throw error;

  return data?.map((cat: any) => ({
    ...cat,
    productCount: cat.products?.[0]?.count || 0,
  })) || [];
}

// ============ ORDERS ============
export async function getOrders(status?: string) {
  let query = supabase.from("orders").select(
    `
    id,
    user_id,
    total_amount,
    status,
    payment_method,
    phone,
    city,
    address,
    created_at
  `
  );

  if (status) {
    query = query.eq("status", status);
  }

  const { data: orders, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
  
  if (!orders || orders.length === 0) return [];

  // Manually fetch profiles
  const userIds = Array.from(new Set(orders.map((o: any) => o.user_id).filter(Boolean)));
  
  let profilesMap: Record<string, any> = {};
  
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role")
      .in("id", userIds);
      
    if (profiles) {
      profilesMap = profiles.reduce((acc: any, profile: any) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
    }
  }

  // Combine data
  return orders.map((order: any) => ({
    ...order,
    profiles: profilesMap[order.user_id] || null,
  }));
}

export async function getOrderById(id: string) {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  if (!order) return null;

  // Manually fetch items مع ربطها بالمنتجات لعرض الاسم حتى لو لم يُخزن في order_items
  const { data: items } = await supabase
    .from("order_items")
    .select(`
      *,
      products (
        name_ar,
        name_en
      )
    `)
    .eq("order_id", id);

  // Manually fetch profile
  let profile = null;
  if (order.user_id) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role")
      .eq("id", order.user_id)
      .single();
    profile = data;
  }

  return {
    ...order,
    order_items: items || [],
    profiles: profile,
  };
}

export async function getAllOrderItems() {
  const { data, error } = await supabase
    .from("order_items")
    .select(`
      *,
      products (
        name_ar,
        name_en
      )
    `);

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select();

  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function searchOrders(query: string) {
  // Search by exact ID (if UUID) or phone/address
  let dbQuery = supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      user_id,
      phone
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  // Check if query is a valid UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);
  
  if (isUUID) {
    dbQuery = dbQuery.eq("id", query);
  } else {
    dbQuery = dbQuery.or(`phone.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`);
  }

  const { data: orders, error } = await dbQuery;

  if (error) throw error;
  if (!orders || orders.length === 0) return [];

  // Fetch user details for these orders
  const userIds = Array.from(new Set(orders.map((o: any) => o.user_id).filter(Boolean)));
  let profilesMap: Record<string, any> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .in("id", userIds);
      
    if (profiles) {
      profilesMap = profiles.reduce((acc: any, profile: any) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
    }
  }

  return orders.map((order: any) => ({
    ...order,
    profiles: profilesMap[order.user_id] || null,
  }));
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from("orders").delete().eq("id", id);

  if (error) throw error;
}

// ============ USERS (PROFILES) ============
export async function getProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProfileById(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(id: string, profile: any) {
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function searchCustomers(query: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(20);

  if (error) throw error;
  return data;
}

// ============ CUTTING METHODS ============
export async function getCuttingMethods() {
  const { data, error } = await supabase
    .from("cutting_methods")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCuttingMethodById(id: number) {
  const { data, error } = await supabase
    .from("cutting_methods")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCuttingMethod(method: any) {
  const { data, error } = await supabase
    .from("cutting_methods")
    .insert([method])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCuttingMethod(id: number, method: any) {
  const { data, error } = await supabase
    .from("cutting_methods")
    .update(method)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCuttingMethod(id: number) {
  const { error } = await supabase
    .from("cutting_methods")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============ APP SETTINGS ============
export async function getAppSettings() {
  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .single(); // Assuming only one row

  if (error && error.code !== 'PGRST116') throw error; // Ignore no rows error
  return data;
}

export async function updateAppSettings(settings: any) {
  // Check if settings exist
  const { data: existing } = await supabase.from("app_settings").select("id").single();
  
  let result;
  if (existing) {
    result = await supabase
      .from("app_settings")
      .update(settings)
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from("app_settings")
      .insert([settings])
      .select()
      .single();
  }

  if (result.error) throw result.error;
  return result.data;
}

export async function updateAppStatus(isActive: boolean) {
  const { data: existing } = await supabase.from("app_settings").select("id").single();
  
  if (!existing) throw new Error("Settings not found");

  const { data, error } = await supabase
    .from("app_settings")
    .update({ is_app_active: isActive })
    .eq("id", existing.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============ BANNERS ============
export async function getBanners() {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getBannerById(id: string) {
  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBanner(banner: any) {
  const { data, error } = await supabase
    .from("banners")
    .insert([banner])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBanner(id: string, banner: any) {
  const { data, error } = await supabase
    .from("banners")
    .update(banner)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBanner(id: string) {
  const { error } = await supabase
    .from("banners")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============ PRODUCT CUTTING METHODS ============
export async function linkProductCuttingMethods(productId: string, methodIds: number[]) {
  if (!methodIds || methodIds.length === 0) return;

  const records = methodIds.map(id => ({
    product_id: productId,
    cutting_method_id: id
  }));

  const { error } = await supabase
    .from("product_cutting_methods")
    .insert(records);

  if (error) throw error;
}

export async function getProductCuttingMethods(productId: string) {
  const { data, error } = await supabase
    .from("product_cutting_methods")
    .select("cutting_method_id")
    .eq("product_id", productId);

  if (error) throw error;
  return data?.map((item: any) => item.cutting_method_id) || [];
}

// ============ STORAGE ============
export async function uploadImage(file: File, bucket: string = "products") {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}
