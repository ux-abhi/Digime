"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { KnowledgeEntry, KnowledgeEntryType } from "@/lib/types";

const TYPE_CONFIG: Record<KnowledgeEntryType, { label: string; emoji: string; fields: string[] }> = {
  about: { label: "About", emoji: "👤", fields: ["section", "content"] },
  project: { label: "Project", emoji: "🎨", fields: ["name", "description", "tags", "role", "tools", "outcome", "image_url", "link"] },
  skill: { label: "Skill", emoji: "⚡", fields: ["name", "level", "category"] },
  link: { label: "Link", emoji: "🔗", fields: ["platform", "url", "handle"] },
  faq: { label: "FAQ", emoji: "❓", fields: ["question", "answer"] },
  custom: { label: "Custom", emoji: "📌", fields: ["key", "value"] },
};

interface Props {
  chatbotId: string;
  entries: KnowledgeEntry[];
}

export function KnowledgeEditor({ chatbotId, entries: initialEntries }: Props) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(initialEntries);
  const [addingType, setAddingType] = useState<KnowledgeEntryType | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  async function handleAdd() {
    if (!addingType) return;
    setSaving(true);

    // Parse tags as array if present
    const data = { ...formData };
    if (data.tags) {
      (data as Record<string, unknown>).tags = data.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
    }

    const { data: newEntry, error } = await supabase
      .from("knowledge_entries")
      .insert({
        chatbot_id: chatbotId,
        type: addingType,
        data,
        token_count: Math.ceil(JSON.stringify(data).length / 4),
        priority: entries.filter((e) => e.type === addingType).length,
      })
      .select()
      .single();

    if (newEntry) {
      setEntries([...entries, newEntry as KnowledgeEntry]);
      setAddingType(null);
      setFormData({});
    }
    if (error) console.error("Error adding entry:", error);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("knowledge_entries").delete().eq("id", id);
    if (!error) {
      setEntries(entries.filter((e) => e.id !== id));
    }
  }

  // Group entries by type
  const grouped: Record<string, KnowledgeEntry[]> = {};
  for (const e of entries) {
    if (!grouped[e.type]) grouped[e.type] = [];
    grouped[e.type].push(e);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-700 text-[var(--color-ink)]">
            Knowledge Base
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {entries.length} entries • This is what your chatbot knows
          </p>
        </div>
      </div>

      {/* Add New */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(TYPE_CONFIG) as KnowledgeEntryType[]).map((type) => (
          <button
            key={type}
            onClick={() => { setAddingType(type); setFormData({}); }}
            className="text-xs font-medium bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-3 py-1.5 rounded-full hover:border-[var(--color-brand)]/30 transition-colors"
          >
            {TYPE_CONFIG[type].emoji} Add {TYPE_CONFIG[type].label}
          </button>
        ))}
      </div>

      {/* Add Form */}
      {addingType && (
        <div className="bg-[var(--color-surface-raised)] border-2 border-[var(--color-brand)]/20 rounded-[var(--radius-lg)] p-5 mb-6">
          <h3 className="font-semibold text-[var(--color-ink)] mb-3">
            {TYPE_CONFIG[addingType].emoji} New {TYPE_CONFIG[addingType].label}
          </h3>
          <div className="space-y-3">
            {TYPE_CONFIG[addingType].fields.map((field) => {
              const isLong = ["content", "description", "answer", "value"].includes(field);
              return (
                <div key={field}>
                  <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1 capitalize">
                    {field.replace("_", " ")}
                    {field === "tags" && <span className="text-[var(--color-ink-faint)]"> (comma-separated)</span>}
                    {field === "level" && <span className="text-[var(--color-ink-faint)]"> (beginner/intermediate/advanced/expert)</span>}
                  </label>
                  {isLong ? (
                    <textarea
                      rows={3}
                      value={formData[field] || ""}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] transition-colors resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field] || ""}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] transition-colors"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="text-sm font-medium bg-[var(--color-brand)] text-white px-4 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-dark)] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => { setAddingType(null); setFormData({}); }}
              className="text-sm font-medium text-[var(--color-ink-muted)] px-4 py-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-sunken)] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Entries List */}
      {Object.keys(TYPE_CONFIG).map((type) => {
        const typeEntries = grouped[type] || [];
        if (typeEntries.length === 0) return null;
        const config = TYPE_CONFIG[type as KnowledgeEntryType];

        return (
          <div key={type} className="mb-6">
            <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-3">
              {config.emoji} {config.label} ({typeEntries.length})
            </h2>
            <div className="space-y-2">
              {typeEntries.map((entry) => {
                const data = entry.data as Record<string, unknown>;
                const title =
                  (data.name as string) ||
                  (data.section as string) ||
                  (data.platform as string) ||
                  (data.question as string) ||
                  (data.key as string) ||
                  "Entry";
                const subtitle =
                  (data.description as string) ||
                  (data.content as string) ||
                  (data.url as string) ||
                  (data.answer as string) ||
                  (data.value as string) ||
                  "";

                return (
                  <div
                    key={entry.id}
                    className="bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--color-ink)] truncate">
                        {title}
                      </p>
                      {subtitle && (
                        <p className="text-xs text-[var(--color-ink-muted)] line-clamp-2 mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] transition-colors shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {entries.length === 0 && !addingType && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-sm text-[var(--color-ink-muted)]">
            No knowledge entries yet. Add your first one above!
          </p>
        </div>
      )}
    </div>
  );
}
