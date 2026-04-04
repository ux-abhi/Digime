import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { assembleSystemPrompt } from "@/lib/prompt";
import { chatCompletion, type ChatMessage } from "@/lib/groq";
import type { Chatbot, KnowledgeEntry, Message, PlanType } from "@/lib/types";
import { PLAN_LIMITS } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatbot_id, visitor_id, message, conversation_id } = body;

    if (!chatbot_id || !visitor_id || !message) {
      return NextResponse.json(
        { error: "Missing required fields: chatbot_id, visitor_id, message" },
        { status: 400, headers: corsHeaders() }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch chatbot config
    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .select("*")
      .eq("id", chatbot_id)
      .eq("is_active", true)
      .single();

    if (chatbotError || !chatbot) {
      return NextResponse.json({ error: "Chatbot not found or inactive" }, { status: 404, headers: corsHeaders() });
    }

    // 1b. Rate limiting — check plan conversation limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", (chatbot as Chatbot).user_id)
      .single();

    const plan = (profile?.plan || "free") as PlanType;
    const limits = PLAN_LIMITS[plan];

    if (limits.max_conversations_per_month !== Infinity) {
      const firstOfMonth = new Date();
      firstOfMonth.setDate(1);
      firstOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("chatbot_id", chatbot_id)
        .gte("started_at", firstOfMonth.toISOString());

      if ((count || 0) >= limits.max_conversations_per_month) {
        return NextResponse.json(
          {
            error: "Monthly conversation limit reached. Please upgrade your plan.",
            upgrade: true,
            limit: limits.max_conversations_per_month,
          },
          { status: 429, headers: corsHeaders() }
        );
      }
    }

    // 2. Fetch knowledge entries
    const { data: knowledge } = await supabase
      .from("knowledge_entries")
      .select("*")
      .eq("chatbot_id", chatbot_id)
      .eq("is_active", true)
      .order("priority", { ascending: false });

    // 3. Build system prompt
    const systemPrompt = assembleSystemPrompt(
      chatbot as Chatbot,
      (knowledge || []) as KnowledgeEntry[]
    );

    // 4. Get or create conversation
    let convId = conversation_id;
    let existingMessages: Message[] = [];

    if (convId) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("messages")
        .eq("id", convId)
        .single();
      if (conv) {
        existingMessages = conv.messages || [];
      }
    } else {
      // Create new conversation
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({
          chatbot_id,
          visitor_id,
          source: "widget",
          messages: [],
          message_count: 0,
        })
        .select("id")
        .single();
      convId = newConv?.id;
    }

    // 5. Build message history for AI
    const aiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add conversation history (last 10 messages for context window)
    const recentMessages = existingMessages.slice(-10);
    for (const msg of recentMessages) {
      aiMessages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    // Add current message
    aiMessages.push({ role: "user", content: message });

    // 6. Get AI response
    const aiResponse = await chatCompletion(aiMessages);

    // 7. Save messages to conversation
    const now = new Date().toISOString();
    const newMessages = [
      ...existingMessages,
      { role: "user" as const, content: message, timestamp: now },
      { role: "assistant" as const, content: aiResponse, timestamp: now },
    ];

    await supabase
      .from("conversations")
      .update({
        messages: newMessages,
        message_count: newMessages.length,
        last_message_at: now,
      })
      .eq("id", convId);

    // 8. Update chatbot conversation count
    await supabase.rpc("increment_conversations", { bot_id: chatbot_id }).then(null, () => {
      // Fallback: direct update
      supabase
        .from("chatbots")
        .update({ total_conversations: (chatbot as Chatbot).total_conversations + 1 })
        .eq("id", chatbot_id);
    });

    // 9. Log analytics event
    await supabase.from("analytics_events").insert([
      { chatbot_id, event_type: "message_sent", visitor_id, conversation_id: convId },
      { chatbot_id, event_type: "message_received", visitor_id, conversation_id: convId },
    ]);

    return NextResponse.json({
      response: aiResponse,
      conversation_id: convId,
    }, {
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// CORS preflight
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
