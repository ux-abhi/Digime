import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { DashboardOverview } from "@/components/dashboard/overview";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch user's chatbot (or null if none yet)
  const { data: chatbots } = await supabase
    .from("chatbots")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const chatbot = chatbots?.[0] || null;

  // Fetch stats if chatbot exists
  let stats = { conversations: 0, leads: 0, messages: 0 };
  if (chatbot) {
    const { count: convCount } = await supabase
      .from("conversations")
      .select("*", { count: "exact", head: true })
      .eq("chatbot_id", chatbot.id);

    const { count: leadCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("chatbot_id", chatbot.id);

    stats = {
      conversations: convCount || 0,
      leads: leadCount || 0,
      messages: chatbot.total_conversations || 0,
    };
  }

  // Fetch knowledge count
  let knowledgeCount = 0;
  if (chatbot) {
    const { count } = await supabase
      .from("knowledge_entries")
      .select("*", { count: "exact", head: true })
      .eq("chatbot_id", chatbot.id);
    knowledgeCount = count || 0;
  }

  return (
    <DashboardOverview
      chatbot={chatbot}
      stats={stats}
      knowledgeCount={knowledgeCount}
      userId={user.id}
    />
  );
}
