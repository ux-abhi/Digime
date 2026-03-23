"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Chatbot } from "@/lib/types";

export default function SettingsPage() {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("chatbots")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (data) setChatbot(data as Chatbot);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!chatbot) return;
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("chatbots")
      .update({
        name: chatbot.name,
        portfolio_url: chatbot.portfolio_url,
        accent_color: chatbot.accent_color,
        greeting: chatbot.greeting,
        suggested_questions: chatbot.suggested_questions,
        cal_username: chatbot.cal_username,
        cal_slug: chatbot.cal_slug,
        personality: chatbot.personality,
        is_active: chatbot.is_active,
      })
      .eq("id", chatbot.id);

    if (!error) setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  }

  function update(field: string, value: unknown) {
    if (!chatbot) return;
    setChatbot({ ...chatbot, [field]: value });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[var(--color-ink-muted)]">Loading...</p>
      </div>
    );
  }

  if (!chatbot) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-700 text-[var(--color-ink)]">
            Settings
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Configure your chatbot appearance and behavior.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-medium bg-[var(--color-brand)] text-white px-5 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-50"
        >
          {saved ? "✓ Saved" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* General */}
        <section className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
          <h2 className="font-semibold text-[var(--color-ink)] mb-4">General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1">
                Chatbot Name
              </label>
              <input
                type="text"
                value={chatbot.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1">
                Portfolio URL
              </label>
              <input
                type="url"
                value={chatbot.portfolio_url || ""}
                onChange={(e) => update("portfolio_url", e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] transition-colors placeholder:text-[var(--color-ink-faint)]"
              />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
          <h2 className="font-semibold text-[var(--color-ink)] mb-4">Appearance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={chatbot.accent_color}
                  onChange={(e) => update("accent_color", e.target.value)}
                  className="w-10 h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] cursor-pointer"
                />
                <input
                  type="text"
                  value={chatbot.accent_color}
                  onChange={(e) => update("accent_color", e.target.value)}
                  className="flex-1 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] transition-colors font-[var(--font-mono)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1">
                Personality
              </label>
              <select
                value={chatbot.personality || "professional"}
                onChange={(e) => update("personality", e.target.value)}
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] transition-colors"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="playful">Playful</option>
                <option value="formal">Formal</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1">
              Greeting Message
            </label>
            <textarea
              rows={2}
              value={chatbot.greeting}
              onChange={(e) => update("greeting", e.target.value)}
              className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] transition-colors resize-none"
            />
          </div>
        </section>

        {/* Cal.com Integration */}
        <section className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
          <h2 className="font-semibold text-[var(--color-ink)] mb-1">Cal.com Booking</h2>
          <p className="text-xs text-[var(--color-ink-muted)] mb-4">
            Let visitors book calls directly in the chat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1">
                Cal.com Username
              </label>
              <input
                type="text"
                value={chatbot.cal_username || ""}
                onChange={(e) => update("cal_username", e.target.value)}
                placeholder="your-username"
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] transition-colors placeholder:text-[var(--color-ink-faint)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1">
                Event Slug
              </label>
              <input
                type="text"
                value={chatbot.cal_slug || ""}
                onChange={(e) => update("cal_slug", e.target.value)}
                placeholder="30-min-quick-call"
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] transition-colors placeholder:text-[var(--color-ink-faint)]"
              />
            </div>
          </div>
        </section>

        {/* Activate */}
        <section className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[var(--color-ink)]">Chatbot Status</h2>
              <p className="text-xs text-[var(--color-ink-muted)]">
                {chatbot.is_active ? "Your chatbot is live and accepting conversations." : "Activate your chatbot to start receiving visitors."}
              </p>
            </div>
            <button
              onClick={() => update("is_active", !chatbot.is_active)}
              className={`text-sm font-medium px-4 py-2 rounded-[var(--radius-md)] transition-colors ${
                chatbot.is_active
                  ? "bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20"
                  : "bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)] hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)]"
              }`}
            >
              {chatbot.is_active ? "● Active" : "○ Activate"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
