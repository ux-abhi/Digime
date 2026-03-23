import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function AnalyticsPage() {
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

  // Recent conversations
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, visitor_id, visitor_name, message_count, started_at, last_message_at")
    .eq("chatbot_id", chatbot.id)
    .order("started_at", { ascending: false })
    .limit(20);

  // Recent leads
  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, email, context, created_at")
    .eq("chatbot_id", chatbot.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div>
      <h1 className="font-[var(--font-display)] text-2xl font-700 text-[var(--color-ink)] mb-2">
        Analytics
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-8">
        See how visitors interact with your chatbot.
      </p>

      {/* Leads */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-3">
          🎯 Recent Leads ({leads?.length || 0})
        </h2>
        {leads && leads.length > 0 ? (
          <div className="space-y-2">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    {lead.name}
                  </p>
                  <span className="text-xs text-[var(--color-ink-faint)]">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-brand)]">{lead.email}</p>
                {lead.context && (
                  <p className="text-xs text-[var(--color-ink-muted)] mt-1">
                    {lead.context}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-8 text-center">
            <p className="text-sm text-[var(--color-ink-muted)]">No leads yet. They&apos;ll show up here when visitors share their info.</p>
          </div>
        )}
      </div>

      {/* Conversations */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-3">
          💬 Recent Conversations ({conversations?.length || 0})
        </h2>
        {conversations && conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    {conv.visitor_name || `Visitor ${conv.visitor_id.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    {conv.message_count} messages
                  </p>
                </div>
                <span className="text-xs text-[var(--color-ink-faint)]">
                  {new Date(conv.started_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-8 text-center">
            <p className="text-sm text-[var(--color-ink-muted)]">No conversations yet. Share your chatbot to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
