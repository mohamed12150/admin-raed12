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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Call Supabase Edge Function (API key is stored securely in Supabase secrets)
    const response = await fetch(`${supabaseUrl}/functions/v1/clever-handler`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ title, body, url }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Edge Function Error (${response.status}): ${JSON.stringify(result)}`);
    }

    // Save to notifications history
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
