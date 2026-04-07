"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Chatbot } from "@/lib/types";

const PRESET_COLORS = ["#E8571A", "#2563EB", "#7C3AED", "#DC2626", "#059669", "#D97706", "#EC4899", "#1A1A1A"];

export default function SettingsPage() {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        avatar_url: chatbot.avatar_url || null,
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

  async function uploadAvatar(file: File) {
    if (!chatbot) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${chatbot.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      update("avatar_url", data.publicUrl + "?t=" + Date.now());
    } else {
      console.error("Avatar upload error:", error);
    }
    setUploadingAvatar(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!chatbot) return null;

  return (
    <div className="animate-fade-in">
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
          className={`text-sm font-semibold px-5 py-2.5 rounded-[var(--radius-md)] transition-all disabled:opacity-50 shadow-sm ${
            saved
              ? "bg-[var(--color-success)] text-white"
              : "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-dark)] shadow-[var(--color-brand)]/20"
          }`}
        >
          {saved ? "✓ Saved" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6">
        {/* General */}
        <section className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
          <h2 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <span className="text-lg">⚙️</span> General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5">
                Chatbot Name
              </label>
              <input
                type="text"
                value={chatbot.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2.5 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5">
                Portfolio URL
              </label>
              <input
                type="url"
                value={chatbot.portfolio_url || ""}
                onChange={(e) => update("portfolio_url", e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2.5 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10 transition-all placeholder:text-[var(--color-ink-faint)]"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5">
              Avatar Photo
            </label>
            <div className="flex items-center gap-4">
              {/* Circle preview */}
              <div
                className="relative w-16 h-16 rounded-full border-2 border-dashed border-[var(--color-border)] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[var(--color-brand)] transition-colors group shrink-0"
                onClick={() => fileInputRef.current?.click()}
                title="Click to upload photo"
              >
                {chatbot.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={chatbot.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-[var(--color-ink-faint)]">
                    {(chatbot.name || "A")[0].toUpperCase()}
                  </span>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-xs font-medium text-[var(--color-brand)] hover:underline disabled:opacity-50"
                >
                  {uploadingAvatar ? "Uploading..." : "Upload photo"}
                </button>
                {chatbot.avatar_url && (
                  <button
                    type="button"
                    onClick={() => update("avatar_url", null)}
                    className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] transition-colors"
                  >
                    Remove
                  </button>
                )}
                <p className="text-[10px] text-[var(--color-ink-faint)]">JPG, PNG, WebP · Max 2MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }}
              />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
          <h2 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <span className="text-lg">🎨</span> Appearance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5">
                Accent Color
              </label>
              <div className="flex items-center gap-2 mb-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => update("accent_color", color)}
                    className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                      chatbot.accent_color === color ? "border-[var(--color-ink)] scale-110 shadow-md" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
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
                  className="flex-1 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2.5 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] transition-colors font-[var(--font-mono)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5">
                Personality
              </label>
              <select
                value={chatbot.personality || "professional"}
                onChange={(e) => update("personality", e.target.value)}
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2.5 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] transition-colors"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="playful">Playful</option>
                <option value="formal">Formal</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5">
              Greeting Message
            </label>
            <textarea
              rows={2}
              value={chatbot.greeting}
              onChange={(e) => update("greeting", e.target.value)}
              className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2.5 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10 transition-all resize-none"
            />
          </div>
        </section>

        {/* Widget Preview */}
        <section className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
          <h2 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <span className="text-lg">👁️</span> Widget Preview
          </h2>
          <div className="bg-[var(--color-surface-sunken)] rounded-[var(--radius-lg)] p-6 flex justify-center">
            <div className="w-[320px] bg-white rounded-2xl shadow-xl border border-[var(--color-border)] overflow-hidden">
              {/* Preview header */}
              <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]" style={{ background: `linear-gradient(135deg, ${chatbot.accent_color}08, ${chatbot.accent_color}04)` }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden" style={{ backgroundColor: chatbot.accent_color }}>
                  {chatbot.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={chatbot.avatar_url} alt={chatbot.name} className="w-full h-full object-cover" />
                  ) : (
                    (chatbot.name || "A")[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-ink)]">{chatbot.name}</p>
                  <p className="text-[10px] text-[var(--color-ink-faint)]">AI Assistant</p>
                </div>
              </div>
              {/* Preview messages */}
              <div className="p-4 space-y-2.5 min-h-[120px]">
                <div className="bg-[var(--color-surface-sunken)] text-[var(--color-ink)] text-xs px-3 py-2 rounded-xl rounded-bl-sm max-w-[85%] leading-relaxed">
                  {chatbot.greeting || "Hey! How can I help you?"}
                </div>
              </div>
              {/* Preview input */}
              <div className="p-3 border-t border-[var(--color-border)] flex gap-2">
                <div className="flex-1 bg-[var(--color-surface-sunken)] rounded-lg px-3 py-2 text-xs text-[var(--color-ink-faint)]">
                  Type a message...
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: chatbot.accent_color }}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cal.com Integration */}
        <section className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
          <h2 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-1 flex items-center gap-2">
            <span className="text-lg">📅</span> Cal.com Booking
          </h2>
          <p className="text-xs text-[var(--color-ink-muted)] mb-4">
            Let visitors book calls directly in the chat.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5">
                Cal.com Username
              </label>
              <input
                type="text"
                value={chatbot.cal_username || ""}
                onChange={(e) => update("cal_username", e.target.value)}
                placeholder="your-username"
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2.5 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10 transition-all placeholder:text-[var(--color-ink-faint)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5">
                Event Slug
              </label>
              <input
                type="text"
                value={chatbot.cal_slug || ""}
                onChange={(e) => update("cal_slug", e.target.value)}
                placeholder="30-min-quick-call"
                className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2.5 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10 transition-all placeholder:text-[var(--color-ink-faint)]"
              />
            </div>
          </div>
        </section>

        {/* Activate — Toggle Switch */}
        <section className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] flex items-center gap-2">
                <span className="text-lg">{chatbot.is_active ? "🟢" : "⚪"}</span> Chatbot Status
              </h2>
              <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
                {chatbot.is_active ? "Your chatbot is live and accepting conversations." : "Activate your chatbot to start receiving visitors."}
              </p>
            </div>
            <button
              onClick={() => update("is_active", !chatbot.is_active)}
              className={`relative w-12 h-7 rounded-full transition-all duration-200 ${
                chatbot.is_active ? "bg-[var(--color-success)]" : "bg-[var(--color-border-strong)]"
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-200 ${
                  chatbot.is_active ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
