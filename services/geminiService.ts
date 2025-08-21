// src/services/geminiService.ts
// Safe client for GitHub Pages — never crashes without a key.
// Calls your Cloudflare Worker proxy instead of using the SDK in the browser.

const PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL || ""; // <-- set in .env.production

export type AiResult = { text?: string; error?: string };

/** Low-level helper you can use anywhere */
export async function generateTextSafe(prompt: string): Promise<AiResult> {
  try {
    if (!PROXY_URL) {
      // keep the UI alive, just show a friendly message
      return { error: "Gemini proxy URL is not set." };
    }
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      return { error: `Proxy error: ${msg}` };
    }
    const data = await res.json();
    if (data?.error) return { error: String(data.error) };
    return { text: String(data?.text ?? "") };
  } catch (e: any) {
    return { error: String(e?.message || e) };
  }
}

/**
 * Adapter to keep existing imports working:
 * components that used `getAIHintForExercise(slug, data, null)` will still work.
 */
export async function getAIHintForExercise(
  slug: string,
  currentData: any,
  _unused: any
): Promise<string> {
  const prompt =
    `გთხოვ, მომწერო მოკლე, პრაქტიკული მინიშნება სავარჯიშოზე "${slug}". ` +
    `აი მონაცემები JSON-ში: ${JSON.stringify(currentData)}`;
  const r = await generateTextSafe(prompt);
  if (r.error) return `⚠️ ${r.error}`;
  return r.text ?? "";
}
