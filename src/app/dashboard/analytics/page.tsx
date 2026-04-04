import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export default async function AnalyticsPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: chatbots } = await supabase
    .from("chatbots")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  const chatbot = chatbots?.[0];
  if (!chatbot) redirect("/dashboard");

  // All conversations (lightweight) for total message count
  const { data: allConvs } = await supabase
    .from("conversations")
    .select("message_count")
    .eq("chatbot_id", chatbot.id);

  const totalMessages =
    allConvs?.reduce((sum, c) => sum + (c.message_count || 0), 0) ?? 0;

  // Bookings count
  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("chatbot_id", chatbot.id);

  // Recent conversations WITH messages field for expandable thread (limit 20)
  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      "id, visitor_id, visitor_name, message_count, started_at, last_message_at, messages"
    )
    .eq("chatbot_id", chatbot.id)
    .order("started_at", { ascending: false })
    .limit(20);

  // Leads — limit 50 to support CSV export
  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, email, context, created_at")
    .eq("chatbot_id", chatbot.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const stats = {
    conversations: allConvs?.length ?? 0,
    messages: totalMessages,
    leads: leads?.length ?? 0,
    bookings: totalBookings ?? 0,
  };

  return (
    <AnalyticsDashboard
      stats={stats}
      conversations={(conversations ?? []) as Parameters<typeof AnalyticsDashboard>[0]["conversations"]}
      leads={leads ?? []}
    />
  );
}
