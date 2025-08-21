// services/geminiService.ts
// Safe Gemini client for GitHub Pages: the browser talks ONLY to your Cloudflare Worker.
// No API key in the browser. If PROXY_URL is missing, we return a friendly error
// instead of crashing the UI.

const PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL || "";

export type AiResult = { text?: string; error?: string };

async function callProxy(prompt: string): Promise<AiResult> {
  try {
    if (!PROXY_URL) {
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

/** Lowest-level helper you can re-use anywhere */
export async function generateTextSafe(prompt: string): Promise<AiResult> {
  return callProxy(prompt);
}

/** Used by LifeItemEditModal.tsx – returns learning/resources suggestions for a goal */
export async function generateGoalResources(goal: string, context: string = ""): Promise<AiResult> {
  const prompt = `
შენი ამოცანაა მისცე გეგმა და რესურსები მიზნისთვის.
მიზანი: "${goal}"
კონტექსტი: "${context}"

მომეცი მოკლე actionable სია:
- 3-5 ნაბიჯი
- თითო ნაბიჯთან 1-2 ლინკი/რესურსი (სახელით)
- ერთი პატარა რჩევა დასაწყებად.
`;
  return callProxy(prompt);
}

/** Optional helper used სხვა კომპონენტებში – იღებს AI ჰინტს სავარჯიშოსთვის */
export async function getAIHintForExercise(
  slug: string,
  currentData: any,
  extra: string | null = null
): Promise<AiResult> {
  const prompt = `
ვარჯიშო (${slug})თვის მომეცი მოკლე ჰინტი, რომ მომხმარებელმა გააგრძელოს.
მიმდინარე ინფორმაცია: ${JSON.stringify(currentData ?? {}, null, 2)}
დამატებით: ${extra ?? "არაფერი"}

გამოიტანე მაქსიმუმ 5 ხაზში, მარტივად.
`;
  return callProxy(prompt);
}
