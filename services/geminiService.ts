// services/geminiService.ts
// -------------------------------------------------------------------
// ✅ Safe, proxy-based AI service for GitHub Pages
// - ბრაუზერში API KEY არ გვჭირდება.
// - ყველა მოთხოვნადი ფუნქცია ექსპორტირებულია ერთნაირი შაბლონით (stub).
// - თუ ENV არ არის, UI არ კრაშდება — აბრუნებს { error }.
// -------------------------------------------------------------------

export type AiResult = { text?: string; error?: string };

// შენს .env.production-ში უნდა გეწყოს:
// VITE_GEMINI_PROXY_URL=https://<your-worker>.<your-subdomain>.workers.dev
const PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL || "";

/** ერთიანი დაბალდონის ქოლი proxy-ზე */
async function callProxy(prompt: string, extra: Record<string, any> = {}): Promise<AiResult> {
  try {
    if (!PROXY_URL) return { error: "Gemini proxy URL is not set (VITE_GEMINI_PROXY_URL)." };

    const res = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, ...extra }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      return { error: `Proxy error: ${msg}` };
    }

    const data = await res.json().catch(() => ({}));
    if (data?.error) return { error: String(data.error) };

    // ჩვეულებრივ ველი "text" — მაგრამ თუ არა, მაინც ვაბრუნებთ რაღაცას
    const text = typeof data?.text === "string" ? data.text : JSON.stringify(data);
    return { text };
  } catch (e: any) {
    return { error: String(e?.message || e) };
  }
}

/** ქარხანა: ქმნის ერთნაირ ფუნქციებს, რომლებსაც უბრალოდ prompt-ის ტექსტი აქვთ */
function makePromptFunction(name: string) {
  return async (...args: any[]): Promise<AiResult> => {
    const payload = args.length <= 1 ? args[0] : args; // 1 ობიექტი ან მასივი
    let json = "null";
    try { json = JSON.stringify(payload ?? null, null, 2); } catch {}
    const prompt =
`# ${name}
JSON input:
${json}

Return a concise, practical answer in Georgian if possible.`;
    return callProxy(prompt);
  };
}

/* ------------------------------------------------------------------ */
/*   EXPORT-ები — აქ ჩამოთვლილია ყველა ხშირად მოხმობადი სახელი.      */
/*   თუ Actions-ში გახდება წითელი "X is not exported..."               */
/*   უბრალოდ დაუმატე ერთხაზიანად: export const X = makePromptFunction("X"); */
/* ------------------------------------------------------------------ */

// Base / generic
export async function generateTextSafe(prompt: string): Promise<AiResult> { return callProxy(prompt); }
export const getConversationalResponse       = makePromptFunction("Conversational Response");

// Exercises / hints
export const getAIHintForExercise            = makePromptFunction("AI Hint For Exercise");

// Natural language
export const parseNaturalLanguageInput       = makePromptFunction("Parse Natural Language Input");
export const classifyLifeItem                = makePromptFunction("Classify Life Item");

// Goals / planning
export const generateGoalResources           = makePromptFunction("Goal Resources");
export const generateNextStepForGoal         = makePromptFunction("Next Step For Goal");
export const decomposeGoal                   = makePromptFunction("Decompose Goal");
export const planShortSchedule               = makePromptFunction("Plan Short Schedule");
export const evaluateTaskLoad                = makePromptFunction("Evaluate Task Load");
export const generateProjectKickstart        = makePromptFunction("Project Kickstart");

// Routines
export const generateDailyBriefing           = makePromptFunction("Daily Briefing");
export const generateEveningReflectionPrompt = makePromptFunction("Evening Reflection Prompt");

// Insights / coaching
export const generateProactiveInsight        = makePromptFunction("Proactive Insight");
export const findRelatedHabits               = makePromptFunction("Find Related Habits");
export const suggestHabitStacking            = makePromptFunction("Habit Stacking Ideas");
export const suggestMicroHabits              = makePromptFunction("Micro Habits");

// Mind / body / mood
export const analyzeMindBodyConnection       = makePromptFunction("Analyze Mind-Body Connection");
export const findTimelinePatterns            = makePromptFunction("Find Timeline Patterns");
export const generateFutureMoodProjection    = makePromptFunction("Future Mood Projection");

// Reviews / reports
export const generateWeeklyOverview          = makePromptFunction("Weekly Overview");
export const generateWeeklyPlan              = makePromptFunction("Weekly Plan");
export const generateWeeklyReview            = makePromptFunction("Weekly Review");
export const generateMonthlyReview           = makePromptFunction("Monthly Review");
export const generateQuarterlyReview         = makePromptFunction("Quarterly Review");
export const summarizeJournalEntries         = makePromptFunction("Summarize Journal Entries");
export const generateWeeklyDigest            = makePromptFunction("Weekly Digest");
export const generateGoalInsights            = makePromptFunction("Goal Insights");

// Life wheel (🔴 ახალი, რომლის გამოც ახლა ჩამოვარდა ბილდი)
export const generateLifeWheelAnalysis       = makePromptFunction("Life Wheel Analysis");

// Wellness / tools
export const recommendBreathingExercise      = makePromptFunction("Breathing Exercise");
export const createStressReliefPlan          = makePromptFunction("Stress Relief Plan");
export const createSleepImprovementPlan      = makePromptFunction("Sleep Improvement Plan");
export const createFocusPlan                 = makePromptFunction("Focus Improvement Plan");
export const craftAffirmations               = makePromptFunction("Affirmations");

// Past / stories
export const generateChapterSummary          = makePromptFunction("Chapter Summary");
export const generateChaptersSummary         = makePromptFunction("Chapters Summary");

// Education / lessons (შენს პროფილსაც წაადგება)
export const outlineLessonPlan               = makePromptFunction("Lesson Plan Outline");
export const proposeReflectionQuestions      = makePromptFunction("Reflection Questions");

// ────────────────────────────────────────────────────────────────
// OPTIONAL (თუ Actions-ში სხვა სახელიც გამოჩნდება, უბრალოდ დაამატე აქ):
// export const NEW_NAME = makePromptFunction("NEW_NAME");
// ────────────────────────────────────────────────────────────────
