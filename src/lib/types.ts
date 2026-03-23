// ─── DigiMe Database Types ───
// Generated from Supabase schema

export type PlanType = "free" | "pro" | "agency";
export type KnowledgeEntryType = "project" | "about" | "skill" | "link" | "faq" | "custom";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type AnalyticsEventType =
  | "page_view" | "widget_open" | "message_sent" | "message_received"
  | "card_click" | "lead_captured" | "booking_started" | "booking_completed" | "voice_input";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  plan: PlanType;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  framer_user_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chatbot {
  id: string;
  user_id: string;
  name: string;
  portfolio_url: string | null;
  accent_color: string;
  greeting: string;
  suggested_questions: string[];
  cal_username: string | null;
  cal_slug: string | null;
  avatar_url: string | null;
  personality: string | null;
  is_active: boolean;
  total_conversations: number;
  total_leads: number;
  created_at: string;
  updated_at: string;
}

// ─── Knowledge Entry Data Shapes ───
export interface ProjectData {
  name: string;
  description: string;
  tags?: string[];
  image_url?: string;
  link?: string;
  role?: string;
  tools?: string;
  outcome?: string;
}

export interface AboutData {
  section: string;
  content: string;
}

export interface SkillData {
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  category?: string;
}

export interface LinkData {
  platform: string;
  url: string;
  handle?: string;
}

export interface FaqData {
  question: string;
  answer: string;
}

export interface CustomData {
  key: string;
  value: string;
}

export type KnowledgeData = ProjectData | AboutData | SkillData | LinkData | FaqData | CustomData;

export interface KnowledgeEntry {
  id: string;
  chatbot_id: string;
  type: KnowledgeEntryType;
  data: KnowledgeData;
  token_count: number;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  card?: ProjectCard | LinkCard;
}

export interface ProjectCard {
  type: "project";
  name: string;
  description: string;
  tags?: string[];
  image_url?: string;
  link?: string;
}

export interface LinkCard {
  type: "link";
  platform: string;
  url: string;
  handle?: string;
}

export interface Conversation {
  id: string;
  chatbot_id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  source: string;
  messages: Message[];
  message_count: number;
  started_at: string;
  last_message_at: string;
  ended_at: string | null;
}

export interface Lead {
  id: string;
  chatbot_id: string;
  conversation_id: string | null;
  name: string;
  email: string;
  context: string | null;
  source: string;
  notified: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  chatbot_id: string;
  conversation_id: string | null;
  cal_booking_id: string | null;
  visitor_name: string;
  visitor_email: string;
  slot: string;
  status: BookingStatus;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  chatbot_id: string;
  event_type: AnalyticsEventType;
  metadata: Record<string, unknown>;
  visitor_id: string | null;
  conversation_id: string | null;
  created_at: string;
}

// ─── Plan Limits ───
export const PLAN_LIMITS: Record<PlanType, {
  max_chatbots: number;
  max_conversations_per_month: number;
  max_knowledge_entries: number;
  max_tokens: number;
  features: string[];
}> = {
  free: {
    max_chatbots: 1,
    max_conversations_per_month: 50,
    max_knowledge_entries: 20,
    max_tokens: 4000,
    features: ["project_cards", "link_cards", "custom_colors", "basic_analytics"],
  },
  pro: {
    max_chatbots: 1,
    max_conversations_per_month: Infinity,
    max_knowledge_entries: 100,
    max_tokens: 12000,
    features: [
      "project_cards", "link_cards", "custom_colors", "full_analytics",
      "cal_booking", "lead_capture", "email_notifications", "voice_input",
      "remove_branding",
    ],
  },
  agency: {
    max_chatbots: 5,
    max_conversations_per_month: Infinity,
    max_knowledge_entries: 200,
    max_tokens: 24000,
    features: [
      "project_cards", "link_cards", "custom_colors", "full_analytics",
      "cal_booking", "lead_capture", "email_notifications", "voice_input",
      "remove_branding", "whitelabel", "analytics_export", "priority_support",
    ],
  },
};
