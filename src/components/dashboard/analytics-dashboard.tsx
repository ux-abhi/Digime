"use client";

import { useState } from "react";
import type { Message } from "@/lib/types";

interface ConvRow {
  id: string;
  visitor_id: string;
  visitor_name: string | null;
  message_count: number;
  started_at: string;
  last_message_at: string;
  messages: Message[];
}

interface LeadRow {
  id: string;
  name: string;
  email: string;
  context: string | null;
  created_at: string;
}

interface Props {
  stats: {
    conversations: number;
    messages: number;
    leads: number;
    bookings: number;
  };
  conversations: ConvRow[];
  leads: LeadRow[];
}

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

function exportLeadsCsv(leads: LeadRow[]) {
  const rows = [
    ["Name", "Email", "Context", "Date"],
    ...leads.map((l) => [
      l.name,
      l.email,
      l.context || "",
      new Date(l.created_at).toLocaleDateString(),
    ]),
  ];
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leads.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const STAT_CARDS = [
  { key: "conversations", label: "Conversations", icon: "💬", bg: "bg-blue-50" },
  { key: "messages", label: "Messages", icon: "✉️", bg: "bg-violet-50" },
  { key: "leads", label: "Leads", icon: "🎯", bg: "bg-green-50" },
  { key: "bookings", label: "Bookings", icon: "📅", bg: "bg-orange-50" },
] as const;

export function AnalyticsDashboard({ stats, conversations, leads }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      <h1 className="font-[var(--font-display)] text-2xl font-700 text-[var(--color-ink)] mb-2">
        Analytics
      </h1>
      <p className="text-sm text-[var(--color-ink-muted)] mb-8">
        See how visitors interact with your chatbot.
      </p>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map((card, i) => (
          <div
            key={card.key}
            className={`animate-fade-in-up stagger-${i + 1} bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 relative overflow-hidden group hover:border-[var(--color-brand)]/20 hover:shadow-md transition-all`}
          >
            <div className="absolute -right-3 -bottom-3 text-6xl opacity-[0.06] group-hover:opacity-[0.1] transition-opacity">
              {card.icon}
            </div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-medium text-[var(--color-ink-faint)] uppercase tracking-wide">
                {card.label}
              </span>
              <div className={`w-8 h-8 ${card.bg} rounded-lg flex items-center justify-center text-base`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-semibold text-[var(--color-ink)] relative z-10">
              {stats[card.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Leads */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide flex items-center gap-2">
            <span>🎯</span> Leads
            <span className="text-xs font-normal text-[var(--color-ink-faint)]">
              ({leads.length})
            </span>
          </h2>
          {leads.length > 0 && (
            <button
              onClick={() => exportLeadsCsv(leads)}
              className="text-xs font-medium text-[var(--color-ink-muted)] border border-[var(--color-border)] px-3 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--color-surface-sunken)] hover:border-[var(--color-border-strong)] transition-all"
            >
              Export CSV
            </button>
          )}
        </div>

        {leads.length > 0 ? (
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
            <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-1">
              No leads yet
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-xs mx-auto">
              When visitors share their info through your chatbot, they&apos;ll appear here.
            </p>
          </div>
        )}
      </div>

      {/* Conversations */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
          <span>💬</span> Conversations
          <span className="text-xs font-normal text-[var(--color-ink-faint)]">
            ({conversations.length})
          </span>
        </h2>

        {conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const isExpanded = expandedId === conv.id;
              return (
                <div
                  key={conv.id}
                  className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden hover:shadow-sm hover:border-[var(--color-brand)]/15 transition-all"
                >
                  {/* Row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : conv.id)}
                    className="w-full p-4 flex items-center justify-between text-left"
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
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-[var(--color-ink-faint)]">
                        {timeAgo(conv.started_at)}
                      </span>
                      <span
                        className="text-xs text-[var(--color-ink-faint)] transition-transform duration-200"
                        style={{ display: "inline-block", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                      >
                        ▾
                      </span>
                    </div>
                  </button>

                  {/* Expanded thread */}
                  {isExpanded && (
                    <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-surface-sunken)]">
                      {conv.messages && conv.messages.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {conv.messages.map((msg, i) => (
                            <div
                              key={i}
                              className={`flex flex-col gap-0.5 ${msg.role === "user" ? "items-end" : "items-start"}`}
                            >
                              <span className="text-[10px] font-medium text-[var(--color-ink-faint)] px-1">
                                {msg.role === "user" ? "Visitor" : "Bot"}
                              </span>
                              <div
                                className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                  msg.role === "user"
                                    ? "bg-[var(--color-brand)] text-white rounded-br-sm"
                                    : "bg-white border border-[var(--color-border)] text-[var(--color-ink)] rounded-bl-sm"
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--color-ink-faint)] text-center py-4">
                          No message history available.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-12 text-center">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-1">
              No conversations yet
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-xs mx-auto">
              Share your chatbot link to start getting conversations!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
