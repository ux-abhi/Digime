import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, data } = await request.json();
    if (!id || !data) {
      return NextResponse.json({ error: "Missing id or data" }, { status: 400 });
    }

    // Verify the entry belongs to a chatbot owned by this user
    const { data: entry } = await supabase
      .from("knowledge_entries")
      .select("id, chatbot_id, chatbots!inner(user_id)")
      .eq("id", id)
      .single();

    if (!entry || (entry.chatbots as unknown as { user_id: string }).user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: updated, error } = await supabase
      .from("knowledge_entries")
      .update({
        data,
        token_count: Math.ceil(JSON.stringify(data).length / 4),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Knowledge update error:", error);
      return NextResponse.json({ error: "Failed to update entry" }, { status: 500 });
    }

    return NextResponse.json({ entry: updated });
  } catch (error) {
    console.error("Knowledge PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
