import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Supabase webhook sends the new record inside body.record
    const record = body.record || body;
    const orderId = record.id?.toString().substring(0, 8) || "جديد";
    const amount = record.total_amount || "";
    const city = record.city || "";

    const payload = JSON.stringify({
      title: "🛍️ طلب جديد!",
      body: `طلب #${orderId} - ${amount} ر.س${city ? ` - ${city}` : ""}`,
      url: `/orders/${record.id}`,
      tag: `order-${record.id}`,
    });

    // Get all subscriptions
    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("subscription");

    if (error) throw error;
    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    // Send to all subscriptions, remove expired ones
    const results = await Promise.allSettled(
      subs.map((row: any) =>
        webpush.sendNotification(row.subscription, payload)
      )
    );

    // Clean up expired subscriptions
    const expiredEndpoints: string[] = [];
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        const endpoint = subs[i].subscription?.endpoint;
        if (endpoint) expiredEndpoints.push(endpoint);
      }
    });

    if (expiredEndpoints.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("endpoint", expiredEndpoints);
    }

    const sent = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ sent });
  } catch (err: any) {
    console.error("Push notification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
