// src/services/geminiService.ts
// Safe client for GitHub Pages. Never crashes UI without a key.
// It calls your proxy (Cloudflare Worker) instead of using the SDK in the browser.

const PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL || ""; // set later

export async function generateTextSafe(prompt: string): Promise<{ text?: string; error?: string }> {
  try {
    if (!PROXY_URL) {
      // no proxy configured — keep UI alive
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
    if (data.error) return { error: String(data.error) };
    return { text: String(data.text ?? "") };
  } catch (e: any) {
    return { error: String(e?.message || e) };
  }
}
