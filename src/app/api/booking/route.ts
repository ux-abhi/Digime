import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatbot_id, conversation_id, visitor_id, visitor_name, visitor_email, slot } = body;

    if (!chatbot_id || !visitor_name || !visitor_email) {
      return NextResponse.json(
        { error: "Missing required fields: chatbot_id, visitor_name, visitor_email" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const supabase = createAdminClient();

    // Fetch chatbot with cal.com config
    const { data: chatbot } = await supabase
      .from("chatbots")
      .select("id, cal_username, cal_slug")
      .eq("id", chatbot_id)
      .eq("is_active", true)
      .single();

    if (!chatbot) {
      return NextResponse.json(
        { error: "Chatbot not found or inactive" },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (!chatbot.cal_username || !chatbot.cal_slug) {
      return NextResponse.json(
        { error: "Booking not configured for this chatbot" },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Insert booking record
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        chatbot_id,
        conversation_id: conversation_id || null,
        visitor_name,
        visitor_email,
        slot: slot || "",
        status: "pending",
      })
      .select("id")
      .single();

    if (bookingError) {
      console.error("Booking insert error:", bookingError);
      return NextResponse.json(
        { error: "Failed to save booking" },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Build Cal.com booking URL
    const calUrl = `https://cal.com/${chatbot.cal_username}/${chatbot.cal_slug}?name=${encodeURIComponent(visitor_name)}&email=${encodeURIComponent(visitor_email)}`;

    // Log analytics event
    await supabase.from("analytics_events").insert({
      chatbot_id,
      event_type: "booking_started",
      visitor_id: visitor_id || null,
      conversation_id: conversation_id || null,
      metadata: { visitor_name, visitor_email, slot },
    });

    return NextResponse.json(
      { success: true, booking_id: booking.id, cal_url: calUrl },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Booking API error:", error);
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
