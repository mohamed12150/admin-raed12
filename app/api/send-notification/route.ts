import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { title, body, url } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: "العنوان والرسالة مطلوبان" }, { status: 400 });
    }

    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
      return NextResponse.json({ error: "OneSignal غير مُعدّ. أضف ONESIGNAL_APP_ID و ONESIGNAL_REST_API_KEY" }, { status: 500 });
    }

    const payload: any = {
      app_id: appId,
      included_segments: ["All"],
      headings: { ar: title, en: title },
      contents: { ar: body, en: body },
    };

    if (url) {
      payload.url = url;
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.errors?.[0] || "فشل الإرسال");
    }

    // Save to Supabase notifications history
    await supabase.from("notifications_log").insert([{
      title,
      body,
      recipients: result.recipients || 0,
      onesignal_id: result.id,
    }]);

    return NextResponse.json({ success: true, recipients: result.recipients });
  } catch (err: any) {
    console.error("Send notification error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("notifications_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
