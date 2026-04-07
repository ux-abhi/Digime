"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Pencil } from "lucide-react";
import type { KnowledgeEntry, KnowledgeEntryType } from "@/lib/types";

const TYPE_CONFIG: Record<KnowledgeEntryType, { label: string; emoji: string; fields: string[]; color: string }> = {
  about: { label: "About", emoji: "👤", fields: ["section", "content"], color: "border-l-green-400" },
  project: { label: "Project", emoji: "🎨", fields: ["name", "description", "tags", "role", "tools", "outcome", "image_url", "link"], color: "border-l-blue-400" },
  skill: { label: "Skill", emoji: "⚡", fields: ["name", "level", "category"], color: "border-l-violet-400" },
  link: { label: "Link", emoji: "🔗", fields: ["platform", "url", "handle"], color: "border-l-orange-400" },
  faq: { label: "FAQ", emoji: "❓", fields: ["question", "answer"], color: "border-l-yellow-400" },
  custom: { label: "Custom", emoji: "📌", fields: ["key", "value"], color: "border-l-gray-400" },
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const supabase = createClient();

  async function handleAdd() {
    if (!addingType) return;
    setSaving(true);

    const data = { ...formData };
    if (data.tags) {
      (data as Record<string, unknown>).tags = data.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
    }

    if (editingId) {
      // Update existing entry via API
      const res = await fetch("/api/knowledge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, data }),
      });
      const result = await res.json();
      if (result.entry) {
        setEntries(entries.map((e) => e.id === editingId ? result.entry as KnowledgeEntry : e));
        setAddingType(null);
        setFormData({});
        setEditingId(null);
      }
    } else {
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
    }
    setSaving(false);
  }

  function handleEditClick(entry: KnowledgeEntry) {
    setEditingId(entry.id);
    setAddingType(entry.type);
    // Convert data to string form for form fields (tags array → comma string)
    const raw = entry.data as unknown as Record<string, unknown>;
    const stringified: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      stringified[k] = Array.isArray(v) ? v.join(", ") : String(v ?? "");
    }
    setFormData(stringified);
    // Scroll to form
    requestAnimationFrame(() => {
      document.querySelector(".dm-knowledge-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleDelete(id: string) {
    setConfirmDeleteId(null);
    setDeletingId(id);
    const { error } = await supabase.from("knowledge_entries").delete().eq("id", id);
    if (!error) {
      setEntries(entries.filter((e) => e.id !== id));
    }
    setDeletingId(null);
  }

  // Group entries by type
  const grouped: Record<string, KnowledgeEntry[]> = {};
  for (const e of entries) {
    if (!grouped[e.type]) grouped[e.type] = [];
    grouped[e.type].push(e);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-700 text-[var(--color-ink)]">
            Knowledge Base
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {entries.length} entries &bull; This is what your chatbot knows
          </p>
        </div>
      </div>

      {/* Add New — pill buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(TYPE_CONFIG) as KnowledgeEntryType[]).map((type) => (
          <button
            key={type}
            onClick={() => { setAddingType(type); setFormData({}); }}
            className={`text-xs font-medium bg-[var(--color-surface-raised)] border px-4 py-2 rounded-full transition-all hover:shadow-md hover:-translate-y-0.5 ${
              addingType === type
                ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5 text-[var(--color-brand)] shadow-sm shadow-[var(--color-brand)]/10"
                : "border-[var(--color-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-brand)]/30 hover:text-[var(--color-ink)]"
            }`}
          >
            {TYPE_CONFIG[type].emoji} Add {TYPE_CONFIG[type].label}
          </button>
        ))}
      </div>

      {/* Add / Edit Form */}
      {addingType && (
        <div className="dm-knowledge-form animate-fade-in-up bg-[var(--color-surface-raised)] border-2 border-[var(--color-brand)]/20 rounded-[var(--radius-lg)] p-6 mb-6">
          <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-4 flex items-center gap-2">
            <span className="text-lg">{TYPE_CONFIG[addingType].emoji}</span>
            {editingId ? `Edit ${TYPE_CONFIG[addingType].label}` : `New ${TYPE_CONFIG[addingType].label}`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TYPE_CONFIG[addingType].fields.map((field) => {
              const isLong = ["content", "description", "answer", "value"].includes(field);
              return (
                <div key={field} className={isLong ? "md:col-span-2" : ""}>
                  <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5 capitalize">
                    {field.replace("_", " ")}
                    {field === "tags" && <span className="text-[var(--color-ink-faint)]"> (comma-separated)</span>}
                    {field === "level" && <span className="text-[var(--color-ink-faint)]"> (beginner/intermediate/advanced/expert)</span>}
                  </label>
                  {isLong ? (
                    <>
                      <textarea
                        rows={3}
                        value={formData[field] || ""}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2.5 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10 transition-all resize-none"
                      />
                      <p className="text-[10px] text-[var(--color-ink-faint)] mt-1 text-right">
                        {(formData[field] || "").length} chars
                      </p>
                    </>
                  ) : (
                    <input
                      type="text"
                      value={formData[field] || ""}
                      onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      className="w-full text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink)] px-3 py-2.5 rounded-[var(--radius-md)] outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10 transition-all"
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-5">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="text-sm font-semibold bg-[var(--color-brand)] text-white px-5 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-brand-dark)] transition-all disabled:opacity-50 shadow-sm shadow-[var(--color-brand)]/20"
            >
              {saving ? "Saving..." : editingId ? "Update Entry" : "Save Entry"}
            </button>
            <button
              onClick={() => { setAddingType(null); setFormData({}); setEditingId(null); }}
              className="text-sm font-medium text-[var(--color-ink-muted)] px-5 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-sunken)] transition-colors"
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
            <h2 className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
              <span>{config.emoji}</span> {config.label}
              <span className="text-xs font-normal text-[var(--color-ink-faint)]">({typeEntries.length})</span>
            </h2>
            <div className="space-y-2">
              {typeEntries.map((entry) => {
                const data = entry.data as unknown as Record<string, unknown>;
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
                    className={`bg-[var(--color-surface-raised)] border border-[var(--color-border)] border-l-[3px] ${config.color} rounded-[var(--radius-md)] p-4 flex items-start justify-between gap-3 hover:shadow-sm transition-all ${
                      deletingId === entry.id ? "opacity-50 scale-[0.98]" : ""
                    }`}
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
                    <div className="flex items-center gap-1 shrink-0">
                      {confirmDeleteId === entry.id ? (
                        <>
                          <span className="text-xs text-[var(--color-danger)] font-medium mr-1">Delete?</span>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-xs font-semibold text-white bg-[var(--color-danger)] px-2 py-1 rounded-md hover:opacity-90 transition-opacity"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs font-medium text-[var(--color-ink-muted)] px-2 py-1 rounded-md hover:bg-[var(--color-surface-sunken)] transition-colors"
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditClick(entry)}
                            className="text-[var(--color-ink-faint)] hover:text-[var(--color-brand)] transition-colors p-1 rounded-md hover:bg-[var(--color-brand)]/5"
                            aria-label="Edit entry"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(entry.id)}
                            className="text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] transition-colors p-1 rounded-md hover:bg-[var(--color-danger)]/5"
                            aria-label="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {entries.length === 0 && !addingType && (
        <div className="text-center py-20 animate-fade-in-up">
          <div className="text-5xl mb-4">
            <span className="inline-block animate-float">🧠</span>
          </div>
          <h3 className="font-[var(--font-display)] font-700 text-[var(--color-ink)] mb-2">
            No knowledge entries yet
          </h3>
          <p className="text-sm text-[var(--color-ink-muted)] max-w-sm mx-auto">
            Add your projects, skills, and info so your chatbot can speak intelligently about your work.
          </p>
        </div>
      )}
    </div>
  );
}
