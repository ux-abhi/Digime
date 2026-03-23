import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { KnowledgeEditor } from "@/components/dashboard/knowledge-editor";

export default async function KnowledgePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: chatbots } = await supabase
    .from("chatbots")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  const chatbot = chatbots?.[0];
  if (!chatbot) redirect("/dashboard");

  const { data: entries } = await supabase
    .from("knowledge_entries")
    .select("*")
    .eq("chatbot_id", chatbot.id)
    .order("type")
    .order("priority", { ascending: false });

  return <KnowledgeEditor chatbotId={chatbot.id} entries={entries || []} />;
}
