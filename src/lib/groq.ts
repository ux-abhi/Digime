import Groq from "groq-sdk";

function getGroqClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// Model rotation: try each in order, fall back on rate limit / error
const MODELS = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "qwen/qwen3-32b",
];

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatCompletion(
  messages: ChatMessage[],
  maxTokens: number = 1024
): Promise<string> {
  let lastError: unknown;

  for (const model of MODELS) {
    try {
      const response = await getGroqClient().chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        top_p: 0.9,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error: unknown) {
      lastError = error;
      const status = (error as { status?: number })?.status;
      // Rate limit or model unavailable — try next model
      if (status === 429 || status === 503) {
        console.warn(`Model ${model} unavailable (${status}), trying next...`);
        continue;
      }
      // Other error — don't retry
      throw error;
    }
  }

  console.error("All models failed:", lastError);
  throw new Error("All AI models are currently unavailable. Please try again.");
}
