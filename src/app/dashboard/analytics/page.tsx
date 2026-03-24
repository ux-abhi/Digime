import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

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

  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, visitor_id, visitor_name, message_count, started_at, last_message_at")
    .eq("chatbot_id", chatbot.id)
    .order("started_at", { ascending: false })
    .limit(20);

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
        <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
          <span>🎯</span> Recent Leads
          <span className="text-xs font-normal text-[var(--color-ink-faint)]">({leads?.length || 0})</span>
        </h2>
        {leads && leads.length > 0 ? (
          <div className="space-y-2">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 hover:shadow-sm hover:border-[var(--color-brand)]/15 transition-all"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(lead.name?.[0] || "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">
                      {lead.name}
                    </p>
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-xs text-[var(--color-brand)] hover:underline"
                    >
                      {lead.email}
                    </a>
                  </div>
                  <span className="text-xs text-[var(--color-ink-faint)] shrink-0">
                    {timeAgo(lead.created_at)}
                  </span>
                </div>
                {lead.context && (
                  <p className="text-xs text-[var(--color-ink-muted)] ml-12 leading-relaxed">
                    {lead.context}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-12 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-1">No leads yet</h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-xs mx-auto">
              When visitors share their info through your chatbot, they&apos;ll appear here.
            </p>
          </div>
        )}
      </div>

      {/* Conversations */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
          <span>💬</span> Recent Conversations
          <span className="text-xs font-normal text-[var(--color-ink-faint)]">({conversations?.length || 0})</span>
        </h2>
        {conversations && conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 flex items-center justify-between hover:shadow-sm hover:border-[var(--color-brand)]/15 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-surface-sunken)] flex items-center justify-center text-sm font-semibold text-[var(--color-ink-muted)]">
                    {(conv.visitor_name?.[0] || conv.visitor_id?.[0] || "V").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-ink)]">
                      {conv.visitor_name || `Visitor ${conv.visitor_id.slice(0, 8)}`}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)] px-2 py-0.5 rounded-full">
                        💬 {conv.message_count}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-[var(--color-ink-faint)]">
                  {timeAgo(conv.started_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-12 text-center">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-1">No conversations yet</h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-xs mx-auto">
              Share your chatbot link to start getting conversations!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
