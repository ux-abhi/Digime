"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Chatbot } from "@/lib/types";

interface Props {
  chatbot: Chatbot | null;
  stats: { conversations: number; leads: number; messages: number };
  knowledgeCount: number;
  userId: string;
}

export function DashboardOverview({ chatbot, stats, knowledgeCount, userId }: Props) {
  const [creating, setCreating] = useState(false);
  const [bot, setBot] = useState<Chatbot | null>(chatbot);
  const supabase = createClient();

  async function createChatbot() {
    setCreating(true);
    const { data, error } = await supabase
      .from("chatbots")
      .insert({ user_id: userId, name: "My Chatbot" })
      .select()
      .single();

    if (data) setBot(data as Chatbot);
    if (error) console.error("Error creating chatbot:", error);
    setCreating(false);
  }

  const embedCode = bot
    ? `<script src="${process.env.NEXT_PUBLIC_APP_URL || ""}/widget.js?id=${bot.id}" defer></script>`
    : "";

  // No chatbot yet — show setup
  if (!bot) {
    return (
      <div>
        <h1 className="font-[var(--font-display)] text-2xl font-700 text-[var(--color-ink)] mb-2">
          Welcome to DigiMe
        </h1>
        <p className="text-[var(--color-ink-muted)] mb-8">
          Let&apos;s set up your AI portfolio chatbot.
        </p>

        <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-10 text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="text-lg font-semibold text-[var(--color-ink)] mb-2">
            Create your first chatbot
          </h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-6 max-w-sm mx-auto">
            Your AI twin will answer questions about your work, show project
            cards, capture leads, and book calls.
          </p>
          <button
            onClick={createChatbot}
            disabled={creating}
            className="bg-[var(--color-brand)] text-white text-sm font-medium px-6 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Chatbot"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-700 text-[var(--color-ink)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {bot.name} •{" "}
            <span className={bot.is_active ? "text-[var(--color-success)]" : "text-[var(--color-ink-faint)]"}>
              {bot.is_active ? "● Live" : "○ Inactive"}
            </span>
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="text-sm font-medium text-[var(--color-ink-muted)] border border-[var(--color-border)] px-4 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-sunken)] transition-colors"
        >
          Settings
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Conversations", value: stats.conversations, icon: "💬" },
          { label: "Leads Captured", value: stats.leads, icon: "🎯" },
          { label: "Knowledge Entries", value: knowledgeCount, icon: "🧠" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[var(--color-ink-faint)] uppercase tracking-wide">
                {stat.label}
              </span>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="text-3xl font-semibold text-[var(--color-ink)]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/knowledge"
          className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--color-brand)]/30 transition-colors group"
        >
          <h3 className="font-semibold text-[var(--color-ink)] mb-1 group-hover:text-[var(--color-brand)] transition-colors">
            📝 Manage Knowledge
          </h3>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Add projects, skills, FAQs, and links your chatbot knows about.
          </p>
        </Link>
        <Link
          href="/dashboard/analytics"
          className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--color-brand)]/30 transition-colors group"
        >
          <h3 className="font-semibold text-[var(--color-ink)] mb-1 group-hover:text-[var(--color-brand)] transition-colors">
            📈 View Analytics
          </h3>
          <p className="text-sm text-[var(--color-ink-muted)]">
            See conversations, leads, and what visitors are asking.
          </p>
        </Link>
      </div>

      {/* Embed Code */}
      <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
        <h3 className="font-semibold text-[var(--color-ink)] mb-1">
          🔌 Embed Code
        </h3>
        <p className="text-sm text-[var(--color-ink-muted)] mb-3">
          Add this to your website. Using Framer? Install the DigiMe plugin instead.
        </p>
        <div className="relative">
          <pre className="bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 text-xs font-[var(--font-mono)] text-[var(--color-ink)] overflow-x-auto">
            {embedCode}
          </pre>
          <button
            onClick={() => navigator.clipboard.writeText(embedCode)}
            className="absolute top-2 right-2 text-xs bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-2 py-1 rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
