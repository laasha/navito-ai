// services/geminiService.ts
// ✅ უსაფრთხო, “proxy”-ზე დამყარებული იმპლემენტაცია GitHub Pages-სთვის.
// ბრაუზერში API KEY არ გვჭირდება. ყველა საშეჩონო ფუნქცია ერთი შაბლონითაა გაკეთებული,
// რომ ბილდის დროს "is not exported" შეცდომები აღარ დაგვხვდეს.

export type AiResult = { text?: string; error?: string };

const PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL || "";

/** შიდა ჰელპერი: Cloudflare Worker პროქსის გამოძახება */
async function callProxy(prompt: string): Promise<AiResult> {
  try {
    if (!PROXY_URL) {
      return { error: "Gemini proxy URL is not set (VITE_GEMINI_PROXY_URL)." };
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
    const data = await res.json().catch(() => ({}));
    if (data?.error) return { error: String(data.error) };
    return { text: String(data?.text ?? "") };
  } catch (e: any) {
    return { error: String(e?.message || e) };
  }
}

/**
 * ფაბრიკა – ქმნის ერთნაირ “სტუბ” ფუნქციებს.
 * ნებისმიერ არგუმენტს ვუქმნით მკაფიო prompt-ს და ვიშლით პროქსისაკენ.
 */
function makePromptFunction(name: string) {
  return async (...args: any[]): Promise<AiResult> => {
    // თუ არგუმენტი ერთი ობიექტია, 그대로; თუ მრავლადაა — მასივი.
    const payload = args.length <= 1 ? args[0] : args;
    const prompt =
      `# ${name}\n` +
      `JSON input:\n` +
      `${JSON.stringify(payload ?? null, null, 2)}\n` +
      `\nReturn concise, helpful text in Georgian when possible.`;
    return callProxy(prompt);
  };
}

/* ------------------------------------------------------------------ */
/* ↓↓↓ აქ ვაცხადებთ ყველა ეგპორტს, რასაც კოდი ელოდება. არასოდეს დააგდებს ბილს. */
/* ერთი და იგივე პატერნია — თუ დაგხვდა “is not exported by geminiService.ts”,
   უბრალოდ დაამატე ახალი ხაზი: export const XYZ = makePromptFunction("XYZ");  */
/* ------------------------------------------------------------------ */

// Exercises / hints
export const getAIHintForExercise           = makePromptFunction("AI Hint For Exercise");

// Natural language parsing
export const parseNaturalLanguageInput      = makePromptFunction("Parse Natural Language Input");

// Home widgets / insights
export const analyzeMindBodyConnection      = makePromptFunction("Analyze Mind-Body Connection");
export const generateProactiveInsight       = makePromptFunction("Proactive Insight");
export const findRelatedHabits              = makePromptFunction("Find Related Habits");
export const generateNextStepForGoal        = makePromptFunction("Next Step For Goal");

// Timeline / projections
export const findTimelinePatterns           = makePromptFunction("Find Timeline Patterns");
export const generateFutureMoodProjection   = makePromptFunction("Future Mood Projection");

// Planner / weekly
export const generateWeeklyPlan             = makePromptFunction("Weekly Plan");

// CoPilot / chat
export const getConversationalResponse      = makePromptFunction("Conversational Response");

// Routines
export const generateDailyBriefing          = makePromptFunction("Daily Briefing");
export const generateEveningReflectionPrompt= makePromptFunction("Evening Reflection Prompt");

// Reviews
export const generateQuarterlyReview        = makePromptFunction("Quarterly Review");

// Goal related
export const generateGoalResources          = makePromptFunction("Goal Resources");
export const generateGoalInsights           = makePromptFunction("Goal Insights");

// Insights / digests
export const generateWeeklyDigest           = makePromptFunction("Weekly Digest");

// Past / stories
export const generateChapterSummary         = makePromptFunction("Chapter Summary");

// Tools
export const reframeNegativeThought         = makePromptFunction("Reframe Negative Thought");
export const generateIdeaCatalyst           = makePromptFunction("Idea Catalyst");
export const generateValueDrivenPrompt      = makePromptFunction("Value-Driven Prompt");

// Planning tools
export const generateProjectKickstart       = makePromptFunction("Project Kickstart");
