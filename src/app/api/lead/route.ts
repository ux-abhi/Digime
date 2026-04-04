import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatbot_id, conversation_id, visitor_id, name, email, context } = body;

    if (!chatbot_id || !name || !email) {
      return NextResponse.json(
        { error: "Missing required fields: chatbot_id, name, email" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const supabase = createAdminClient();

    // Verify chatbot exists
    const { data: chatbot } = await supabase
      .from("chatbots")
      .select("id, total_leads")
      .eq("id", chatbot_id)
      .eq("is_active", true)
      .single();

    if (!chatbot) {
      return NextResponse.json(
        { error: "Chatbot not found or inactive" },
        { status: 404, headers: corsHeaders() }
      );
    }

    // Insert lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        chatbot_id,
        conversation_id: conversation_id || null,
        name,
        email,
        context: context || null,
        source: "widget",
        notified: false,
      })
      .select("id")
      .single();

    if (leadError) {
      console.error("Lead insert error:", leadError);
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Increment total_leads on chatbot
    await supabase
      .from("chatbots")
      .update({ total_leads: (chatbot.total_leads || 0) + 1 })
      .eq("id", chatbot_id);

    // Log analytics event
    await supabase.from("analytics_events").insert({
      chatbot_id,
      event_type: "lead_captured",
      visitor_id: visitor_id || null,
      conversation_id: conversation_id || null,
      metadata: { name, email },
    });

    return NextResponse.json(
      { success: true, lead_id: lead.id },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
