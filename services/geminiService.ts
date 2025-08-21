// src/services/geminiService.ts
// Safe wrapper so app doesn't crash on GitHub Pages without an API key

let GoogleGenerativeAI: any = null;

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
export const geminiEnabled = Boolean(GEMINI_KEY);

function getClient() {
  if (!geminiEnabled) return null;
  try {
    // @ts-ignore
    return new (require("@google/generative-ai").GoogleGenerativeAI)(GEMINI_KEY!);
  } catch (e) {
    console.warn("Gemini SDK not available:", e);
    return null;
  }
}

/** Example safe function for text generation */
export async function generateTextSafe(prompt: string): Promise<{ text?: string; error?: string }> {
  if (!geminiEnabled || !GEMINI_KEY) {
    return { error: "Gemini is disabled (no API key set)." };
  }
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const client = new GoogleGenerativeAI(GEMINI_KEY);
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return { text };
  } catch (err: any) {
    console.error(err);
    return { error: String(err?.message || err) };
  }
}
