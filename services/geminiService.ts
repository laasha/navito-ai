// services/geminiService.ts
// -------------------------------------------------------------------
// ✅ Safe, proxy-based Gemini service for GitHub Pages builds
// - არაფერს არ აჩერებს თუ KEY / Proxy არაა დაყენებული
// - ყველა კომპონენტში იმპორტირებული AI-ფუნქცია არსებობს და აბრუნებს {text|error}
// - ერთი შაბლონით მარტივად დაემატება ახალი სახელიც, თუ დაგჭირდება
// -------------------------------------------------------------------

export type AiResult = { text?: string; error?: string };

// Cloudflare Worker proxy, რომელიც უკვე გაქვს გაშვებული.
// .env.production-ში უნდა იყოს: VITE_GEMINI_PROXY_URL=https://...workers.dev
const PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL || "";

/** ერთიანი დაბალდონის ქოლი proxy-ზე (არ ყრის შეცდომას UI-ში) */
async function callProxy(
  prompt: string,
  payload: Record<string, any> = {}
): Promise<AiResult> {
  try {
    if (!PROXY_URL) {
      return { error: "Gemini proxy URL is not set (VITE_GEMINI_PROXY_URL)." };
    }
    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, ...payload }),
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      return { error: `Proxy error: ${msg}` };
    }
    const data = await res.json().catch(() => ({}));
    if (data?.error) return { error: String(data.error) };
    const text = typeof data?.text === "string" ? data.text : JSON.stringify(data);
    return { text };
  } catch (e: any) {
    return { error: String(e?.message || e) };
  }
}

/** სწრაფი შაბლონი: ქმნის ფუნქციას, რომელიც აგენერირებს prompt-ს და Proxy-ს ეძახის */
function makePromptFunction(name: string) {
  return async function (input: any = {}): Promise<AiResult> {
    const pretty = (() => {
      try { return JSON.stringify(input ?? {}, null, 2); }
      catch { return String(input); }
    })();
    const prompt = `${name}:\n${pretty}`;
    return callProxy(prompt);
  };
}

// -------------------------------------------------------------------
// ⚙️ აქედან ქვევით — ყველა ის სახელი, რასაც კომპონენტები იმპორტებენ.
// ნებისმიერ ახალ შეცდომაზე („XYZ is not exported…“) უბრალოდ დაამატე:
//   export const XYZ = makePromptFunction("XYZ");
// და commit.
// -------------------------------------------------------------------

// Exercises / hints
export const getAIHintForExercise = async (slug: string, currentData: any = null) =>
  callProxy(`Exercise hint for "${slug}"\n${JSON.stringify(currentData ?? {}, null, 2)}`);

// Tools & prompts
export const reframeNegativeThought       = makePromptFunction("Cognitive Reframe");
export const generateValueDrivenPrompt    = makePromptFunction("Value-Driven Prompt");
export const generateIdeaCatalyst         = makePromptFunction("Idea Catalyst");

// Planning / reviews / digests
export const generateProjectKickstart     = makePromptFunction("Project Kickstart");
export const generateWeeklyPlan           = makePromptFunction("Weekly Plan");
export const generateWeeklyDigest         = makePromptFunction("Weekly Digest");
export const generateWeeklyDigestReport   = generateWeeklyDigest; // alias
export const generateQuarterlyReview      = makePromptFunction("Quarterly Review");

// Routines
export const generateDailyBriefing        = makePromptFunction("Daily Briefing");
export const generateEveningReflectionPrompt = makePromptFunction("Evening Reflection");

// Home widgets / insights
export const generateProactiveInsight     = makePromptFunction("Proactive Insight");
export const generateNextStepForGoal      = makePromptFunction("Next Step For Goal");
export const analyzeMindBodyConnection    = makePromptFunction("Mind-Body Connection");
export const findRelatedHabits            = makePromptFunction("Related Habits");

// Timeline / past
export const findTimelinePatterns         = makePromptFunction("Timeline Patterns");
export const generateFutureMoodProjection = makePromptFunction("Future Mood Projection");
export const generateChaptersSummary      = makePromptFunction("Story Chapters Summary");

// Natural language / chat
export const parseNaturalLanguageInput    = makePromptFunction("Parse Natural Language Input");
export const getConversationalResponse    = makePromptFunction("Conversational Response");

// Goals / resources
export const generateGoalResources        = makePromptFunction("Goal Resources");

// 👇 სურვილის შემთხვევაში შეგიძლია გამოიყენო ეს გენერალური ფუნქცია პირდაპირაც
export async function generateTextSafe(prompt: string): Promise<AiResult> {
  if (!prompt || !prompt.trim()) return { error: "Empty prompt." };
  return callProxy(prompt);
}
