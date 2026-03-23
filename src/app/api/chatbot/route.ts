import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// GET /api/chatbot?id=xxx — public endpoint for widget
export async function GET(request: NextRequest) {
  const chatbotId = request.nextUrl.searchParams.get("id");

  if (!chatbotId) {
    return NextResponse.json({ error: "Missing chatbot id" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: chatbot, error } = await supabase
    .from("chatbots")
    .select("id, name, accent_color, greeting, suggested_questions, avatar_url, personality, cal_username, cal_slug")
    .eq("id", chatbotId)
    .eq("is_active", true)
    .single();

  if (error || !chatbot) {
    return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
  }

  // Check if owner has pro/agency plan (for feature gating)
  const { data: profile } = await supabase
    .from("chatbots")
    .select("user_id")
    .eq("id", chatbotId)
    .single();

  let plan = "free";
  if (profile?.user_id) {
    const { data: user } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", profile.user_id)
      .single();
    plan = user?.plan || "free";
  }

  return NextResponse.json({
    ...chatbot,
    plan,
    features: {
      booking: plan !== "free" && chatbot.cal_username && chatbot.cal_slug,
      lead_capture: plan !== "free",
      voice_input: plan !== "free",
      show_branding: plan === "free",
    },
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control": "public, max-age=60",
    },
  });
}
