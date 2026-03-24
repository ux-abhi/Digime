"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Copy, Check, ExternalLink } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
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

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const embedCode = bot
    ? `<script src="${process.env.NEXT_PUBLIC_APP_URL || ""}/widget.js?id=${bot.id}" defer></script>`
    : "";

  // No chatbot yet — show setup
  if (!bot) {
    return (
      <div className="animate-fade-in-up">
        <h1 className="font-[var(--font-display)] text-2xl font-700 text-[var(--color-ink)] mb-2">
          Welcome to DigiMe
        </h1>
        <p className="text-[var(--color-ink-muted)] mb-8">
          Let&apos;s set up your AI portfolio chatbot.
        </p>

        <div className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-12 text-center">
          <div className="text-6xl mb-5 animate-float">🤖</div>
          <h2 className="font-[var(--font-display)] text-xl font-700 text-[var(--color-ink)] mb-2">
            Create your first chatbot
          </h2>
          <p className="text-sm text-[var(--color-ink-muted)] mb-8 max-w-sm mx-auto leading-relaxed">
            Your AI twin will answer questions about your work, show project
            cards, capture leads, and book calls.
          </p>
          <button
            onClick={createChatbot}
            disabled={creating}
            className="bg-[var(--color-brand)] text-white text-sm font-semibold px-8 py-3 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-dark)] transition-all disabled:opacity-50 shadow-lg shadow-[var(--color-brand)]/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            {creating ? "Creating..." : "Create Chatbot"}
          </button>
        </div>
      </div>
    );
  }

  const checklist = [
    { label: "Create chatbot", done: true },
    { label: "Add knowledge (3+ entries)", done: knowledgeCount >= 3 },
    { label: "Customize appearance", done: bot.accent_color !== "#E8571A" || bot.greeting !== "Hey! How can I help you?" },
    { label: "Activate chatbot", done: bot.is_active },
    { label: "Embed on your site", done: false },
  ];
  const showChecklist = !checklist.every(c => c.done);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-700 text-[var(--color-ink)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {bot.name} &bull;{" "}
            <span className={bot.is_active ? "text-[var(--color-success)]" : "text-[var(--color-ink-faint)]"}>
              {bot.is_active ? "● Live" : "○ Inactive"}
            </span>
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="text-sm font-medium text-[var(--color-ink-muted)] border border-[var(--color-border)] px-4 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-sunken)] hover:border-[var(--color-border-strong)] transition-all"
        >
          Settings
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Conversations", value: stats.conversations, icon: "💬", bg: "bg-blue-50" },
          { label: "Leads Captured", value: stats.leads, icon: "🎯", bg: "bg-green-50" },
          { label: "Knowledge Entries", value: knowledgeCount, icon: "🧠", bg: "bg-violet-50" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`animate-fade-in-up stagger-${i + 1} bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 relative overflow-hidden group hover:border-[var(--color-brand)]/20 hover:shadow-md transition-all`}
          >
            <div className="absolute -right-3 -bottom-3 text-6xl opacity-[0.06] group-hover:opacity-[0.1] transition-opacity">
              {stat.icon}
            </div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-medium text-[var(--color-ink-faint)] uppercase tracking-wide">
                {stat.label}
              </span>
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center text-base`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-semibold text-[var(--color-ink)] relative z-10">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Getting Started Checklist */}
      {showChecklist && (
        <div className="animate-fade-in-up stagger-4 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 mb-8">
          <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-3 flex items-center gap-2">
            🚀 Getting Started
          </h3>
          <div className="space-y-2">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                {item.done ? (
                  <div className="w-5 h-5 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[var(--color-success)]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border-strong)]" />
                )}
                <span className={item.done ? "text-[var(--color-ink-faint)] line-through" : "text-[var(--color-ink)]"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/knowledge"
          className="animate-fade-in-up stagger-4 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--color-brand)]/30 hover:shadow-md transition-all group"
        >
          <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-1 group-hover:text-[var(--color-brand)] transition-colors flex items-center gap-2">
            📝 Manage Knowledge
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Add projects, skills, FAQs, and links your chatbot knows about.
          </p>
        </Link>
        <Link
          href="/dashboard/analytics"
          className="animate-fade-in-up stagger-5 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--color-brand)]/30 hover:shadow-md transition-all group"
        >
          <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-1 group-hover:text-[var(--color-brand)] transition-colors flex items-center gap-2">
            📈 View Analytics
            <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-[var(--color-ink-muted)]">
            See conversations, leads, and what visitors are asking.
          </p>
        </Link>
      </div>

      {/* Embed Code */}
      <div className="animate-fade-in-up stagger-6 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)]">
            🔌 Embed Code
          </h3>
          <span className="text-[10px] font-semibold bg-[var(--color-brand)]/10 text-[var(--color-brand)] px-2.5 py-0.5 rounded-full uppercase tracking-wide">
            Framer Plugin Available
          </span>
        </div>
        <p className="text-sm text-[var(--color-ink-muted)] mb-3">
          Add this to your website. Using Framer? Install the DigiMe plugin instead.
        </p>
        <div className="relative group">
          <pre className="bg-[var(--color-surface-sunken)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 text-xs font-[var(--font-mono)] text-[var(--color-ink)] overflow-x-auto">
            {embedCode}
          </pre>
          <button
            onClick={() => handleCopy(embedCode)}
            className="absolute top-2 right-2 flex items-center gap-1.5 text-xs bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-2.5 py-1.5 rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-brand)]/30 transition-all"
          >
            {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
          </button>
        </div>
      </div>
    </div>
  );
}
