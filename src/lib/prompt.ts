import type { KnowledgeEntry, ProjectData, AboutData, SkillData, LinkData, FaqData, CustomData, Chatbot } from "@/lib/types";

// ─── Layer 1: Identity ───
function buildIdentityLayer(chatbot: Chatbot): string {
  const name = chatbot.name || "this designer";
  return `You are ${name}'s AI assistant, embedded on their portfolio website. You speak in first person as if you ARE ${name}. You are friendly, knowledgeable about their work, and helpful to visitors who want to learn about their projects, skills, and availability.

CRITICAL RULES:
- Always speak as ${name} in first person ("I designed...", "My experience with...")
- Never say "I'm an AI" or "I'm a chatbot" unless directly asked
- If you don't know something, say "I don't have that information, but feel free to reach out to me directly!"
- Keep responses concise (2-4 sentences) unless the visitor asks for detail
- Be warm and professional, matching a ${chatbot.personality || "professional"} tone`;
}

// ─── Layer 2: Knowledge ───
function buildKnowledgeLayer(entries: KnowledgeEntry[]): string {
  if (entries.length === 0) return "\n[No knowledge entries configured yet.]";

  const sections: string[] = [];

  // Group by type
  const grouped: Record<string, KnowledgeEntry[]> = {};
  for (const entry of entries) {
    if (!entry.is_active) continue;
    if (!grouped[entry.type]) grouped[entry.type] = [];
    grouped[entry.type].push(entry);
  }

  // About
  if (grouped.about) {
    sections.push("## ABOUT ME");
    for (const e of grouped.about) {
      const d = e.data as AboutData;
      sections.push(`${d.section}: ${d.content}`);
    }
  }

  // Skills
  if (grouped.skill) {
    sections.push("\n## MY SKILLS");
    const skills = grouped.skill.map((e) => {
      const d = e.data as SkillData;
      return `- ${d.name}${d.level ? ` (${d.level})` : ""}${d.category ? ` [${d.category}]` : ""}`;
    });
    sections.push(skills.join("\n"));
  }

  // Projects
  if (grouped.project) {
    sections.push("\n## MY PROJECTS");
    for (const e of grouped.project) {
      const d = e.data as ProjectData;
      let projectStr = `### ${d.name}\n${d.description}`;
      if (d.role) projectStr += `\nRole: ${d.role}`;
      if (d.tools) projectStr += `\nTools: ${d.tools}`;
      if (d.outcome) projectStr += `\nOutcome: ${d.outcome}`;
      if (d.tags?.length) projectStr += `\nTags: ${d.tags.join(", ")}`;
      if (d.link) projectStr += `\nLink: ${d.link}`;
      sections.push(projectStr);
    }
  }

  // Links
  if (grouped.link) {
    sections.push("\n## MY LINKS");
    for (const e of grouped.link) {
      const d = e.data as LinkData;
      sections.push(`- ${d.platform}: ${d.url}${d.handle ? ` (${d.handle})` : ""}`);
    }
  }

  // FAQ
  if (grouped.faq) {
    sections.push("\n## FREQUENTLY ASKED QUESTIONS");
    for (const e of grouped.faq) {
      const d = e.data as FaqData;
      sections.push(`Q: ${d.question}\nA: ${d.answer}`);
    }
  }

  // Custom
  if (grouped.custom) {
    sections.push("\n## ADDITIONAL INFO");
    for (const e of grouped.custom) {
      const d = e.data as CustomData;
      sections.push(`${d.key}: ${d.value}`);
    }
  }

  return `\nHere is everything you know about yourself. ONLY use this information to answer questions:\n\n${sections.join("\n")}`;
}

// ─── Layer 3: Behavior ───
function buildBehaviorLayer(chatbot: Chatbot): string {
  const behaviors: string[] = [
    "\n## RESPONSE BEHAVIOR",
    "- When asked about a specific project, respond with details AND include a PROJECT_CARD in your response",
    "- When asked about contact/social links, include LINK_CARDs",
    "- When a visitor expresses interest in hiring or working together, gently guide toward lead capture",
    "- When a visitor wants to schedule a call, initiate the booking flow",
    '- Format special cards as JSON blocks in your response like: ```card\n{"type":"project","name":"...","description":"...","tags":[...],"image_url":"...","link":"..."}\n```',
    '- For link cards: ```card\n{"type":"link","platform":"...","url":"...","handle":"..."}\n```',
  ];

  if (chatbot.cal_username && chatbot.cal_slug) {
    behaviors.push(
      `- You can help visitors book a call. When they want to schedule, say something like "I'd love to chat! Let me help you find a time." and include: \`\`\`booking\n{"action":"start"}\n\`\`\``
    );
  }

  return behaviors.join("\n");
}

// ─── Assemble Full System Prompt ───
export function assembleSystemPrompt(
  chatbot: Chatbot,
  entries: KnowledgeEntry[]
): string {
  // Sort entries by priority (higher first), then filter active
  const sorted = [...entries]
    .filter((e) => e.is_active)
    .sort((a, b) => b.priority - a.priority);

  return [
    buildIdentityLayer(chatbot),
    buildKnowledgeLayer(sorted),
    buildBehaviorLayer(chatbot),
  ].join("\n\n");
}

// ─── Token Estimation ───
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token
  return Math.ceil(text.length / 4);
}
