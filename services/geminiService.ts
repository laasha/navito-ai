// services/geminiService.ts
// Safe Gemini client via Cloudflare Worker proxy.
// ბრაუზერში API key არასდროს უნდა იყოს. ყველაფერი მიდის შენს Cloudflare Worker-ზე.
// თუ VITE_GEMINI_PROXY_URL გამოტოვებულია, ვაბრუნებთ შეცდომის ტექსტს და UI არ კრაშდება.

const PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL || "";

export type AiResult = { text?: string; error?: string };

// ---------- Internal helper ----------
async function callProxy(prompt: string): Promise<AiResult> {
  try {
    if (!PROXY_URL) return { error: "Gemini proxy URL is not set." };

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

// ---------- Generic ----------
export async function generateTextSafe(prompt: string): Promise<AiResult> {
  return callProxy(prompt);
}

// ---------- Goals / Tasks / Planning ----------
export async function generateGoalResources(goal: string, context: string = ""): Promise<AiResult> {
  const prompt = `შექმენი 3–5 ნაბიჯიანი გეგმა მიზნისთვის "${goal}". კონტექსტი: ${context}`;
  return callProxy(prompt);
}

export async function generateNextStepForGoal(
  goalTitle: string,
  context: { progress?: string; obstacles?: string } | null = null
): Promise<AiResult> {
  const prompt = `მომეცი ერთი ძალიან კონკრეტული შემდეგი ნაბიჯი "${goalTitle}" მიზნისთვის. კონტექსტი: ${JSON.stringify(context ?? {})}`;
  return callProxy(prompt);
}

export async function decomposeGoal(goal: string): Promise<AiResult> {
  const prompt = `დაყავი მიზანი "${goal}" 4–6 მცირე ნაბიჯად, მოკლე თაიმლაინით.`;
  return callProxy(prompt);
}

export async function planShortSchedule(context: string): Promise<AiResult> {
  const prompt = `დამიგეგმე მოკლე დღე/კვირა. კონტექსტი:\n${context}\n(ბულეტები, მაქს 8 პუნქტი)`;
  return callProxy(prompt);
}

export async function generateDailyBriefing(context: { date?: string; tasks?: any[]; goals?: any[] } = {}): Promise<AiResult> {
  const prompt = `დღის ბრიფინგი: ${JSON.stringify(context ?? {}, null, 2)} (ფოკუსი, 3 მთავარი ამოცანა, ერთი რჩევა)`;
  return callProxy(prompt);
}

export async function generateWeeklyOverview(context: any = {}): Promise<AiResult> {
  const prompt = `Weekly overview (ბულეტები, მაქს 8):\n${JSON.stringify(context, null, 2)}`;
  return callProxy(prompt);
}

export async function generateWeeklyPlan(goals: any[] = [], events: any[] = []): Promise<AiResult> {
  const prompt = `შექმენი მოკლე კვირის გეგმა მიზნებსა და ღონისძიებებზე დაყრდნობით:\n${JSON.stringify({ goals, events }, null, 2)}`;
  return callProxy(prompt);
}

export async function evaluateTaskLoad(tasks: any[] = []): Promise<AiResult> {
  const prompt = `შეაფასე დატვირთვა და გამოარჩიე 3 მთავარი ამოცანა. სია:\n${JSON.stringify(tasks, null, 2)}`;
  return callProxy(prompt);
}

// ---------- Natural input / Parsing ----------
export async function parseNaturalLanguageInput(raw: string): Promise<AiResult> {
  const prompt = `სტრუქტურირებული გაშიფვრა ტექსტისთვის:\n"""${raw}""" (ტიპი, სათაური, თარიღი, პრიორიტეტი, ქვე-საფეხურები)`;
  return callProxy(prompt);
}

export async function classifyLifeItem(text: string): Promise<AiResult> {
  const prompt = `დააკლასიფიცირე (task/goal/event/note) და მიუწერე მოკლე მიზეზი:\n"""${text}"""`;
  return callProxy(prompt);
}

// ---------- Mind / Body / Mood ----------
export async function analyzeMindBodyConnection(entries: any): Promise<AiResult> {
  const prompt = `გონება/სხეულის ჩანაწერების ანალიზი და 3–5 რეკომენდაცია:\n${JSON.stringify(entries ?? {}, null, 2)}`;
  return callProxy(prompt);
}

export async function findTimelinePatterns(
  timeline: Array<{ date?: string; mood?: string; energy?: string; note?: string }> = []
): Promise<AiResult> {
  const prompt = `იპოვე ნიმუშები დროის ხაზში და თითოაზე ერთი რეკომენდაცია:\n${JSON.stringify(timeline ?? [], null, 2)}`;
  return callProxy(prompt);
}

export async function generateFutureMoodProjection(
  recent: Array<{ date?: string; mood?: string; energy?: string; note?: string }> = []
): Promise<AiResult> {
  const prompt = `უახლოესი 2 კვირის განწყობის პროგნოზი + 3 რჩევა:\n${JSON.stringify(recent ?? [], null, 2)}`;
  return callProxy(prompt);
}

// ---------- Insights / Coaching ----------
export async function getAIHintForExercise(
  slug: string,
  currentData: any,
  extra: string | null = null
): Promise<AiResult> {
  const prompt = `ვარჯიში: ${slug}\nმონაცემები: ${JSON.stringify(currentData ?? {}, null, 2)}\nდამატებით: ${extra ?? "—"}\nმიეცი 3–5 ხაზიანი ჰინტი.`;
  return callProxy(prompt);
}

export async function generateProactiveInsight(
  context: { habits?: any; mood?: any; tasks?: any; goals?: any; schedule?: any } = {}
): Promise<AiResult> {
  const prompt = `ერთი პროაქტიული ინსაიტი (რატომ + 5–15 წთ ქმედება):\n${JSON.stringify(context ?? {}, null, 2)}`;
  return callProxy(prompt);
}

export async function findRelatedHabits(
  current: { title?: string; tags?: string[]; recentNotes?: string } = {}
): Promise<AiResult> {
  const prompt = `იპოვე 3–6 შესაბამისი ჩვევა ამ კონტექსტისთვის:\n${JSON.stringify(current ?? {}, null, 2)}`;
  return callProxy(prompt);
}

export async function suggestHabitStacking(baseHabit: string): Promise<AiResult> {
  const prompt = `3–5 habit stacking იდეა "${baseHabit}" ჩვევისთვის, თითო 1 წინადადება.`;
  return callProxy(prompt);
}

export async function suggestMicroHabits(context: string): Promise<AiResult> {
  const prompt = `4–6 მიკრო-ჩვევა ამ კონტექსტისთვის (1 წინადადება თითო): ${context}`;
  return callProxy(prompt);
}

// ---------- Routines / Reflection ----------
export async function generateEveningReflectionPrompt(
  context: { wins?: string[]; challenges?: string[]; mood?: string } = {}
): Promise<AiResult> {
  const prompt = `საღამოს რეფლექსიის პრომპტი (3 კითხვა, ერთი მადლიერება, ნაბიჯი ხვალისთვის):\n${JSON.stringify(context ?? {}, null, 2)}`;
  return callProxy(prompt);
}

export async function recommendBreathingExercise(context: string = ""): Promise<AiResult> {
  const prompt = `ერთი სუნთქვითი სავარჯიშო დეტალურად (2–3 წთ): ${context}`;
  return callProxy(prompt);
}

export async function craftAffirmations(topic: string): Promise<AiResult> {
  const prompt = `5 მოკლე, რეალისტური აფირმაცია თემაზე: "${topic}"`;
  return callProxy(prompt);
}

// ---------- Reviews (Monthly / Quarterly etc.) ----------
export async function generateQuarterlyReview(context: any = {}): Promise<AiResult> {
  const prompt = `კვარტალური რევიუ (მიღწევები, what worked/what didn't, ფოკუსი Q+1):\n${JSON.stringify(context ?? {}, null, 2)}`;
  return callProxy(prompt);
}

export async function generateMonthlyReview(context: any = {}): Promise<AiResult> {
  const prompt = `თვიური რევიუ (მოკლე შეჯამება, 3 გაკვეთილი, 3 პრიორიტეტი შემდეგ თვეზე):\n${JSON.stringify(context ?? {}, null, 2)}`;
  return callProxy(prompt);
}

export async function generateWeeklyReview(context: any = {}): Promise<AiResult> {
  const prompt = `კვირის რევიუ (შეჯამება, 3 highlight, 3 ფრიქცია, 3 next):\n${JSON.stringify(context ?? {}, null, 2)}`;
  return callProxy(prompt);
}

export async function summarizeJournalEntries(entries: any[] = []): Promise<AiResult> {
  const prompt = `დაასუმმე ჟურნალის ჩანაწერები + 3 takeaway:\n${JSON.stringify(entries ?? [], null, 2)}`;
  return callProxy(prompt);
}

// ---------- Wellness Plans ----------
export async function createStressReliefPlan(context: any = {}): Promise<AiResult> {
  const prompt = `სტრესის შემცირების 5-პუნქტიანი გეგმა, ყოველდღიური პატარა ნაბიჯებით:\n${JSON.stringify(context ?? {}, null, 2)}`;
  return callProxy(prompt);
}

export async function createSleepImprovementPlan(context: any = {}): Promise<AiResult> {
  const prompt = `ძილის გაუმჯობესების 7-დღიანი მცირე ნაბიჯები:\n${JSON.stringify(context ?? {}, null, 2)}`;
  return callProxy(prompt);
}

export async function createFocusPlan(context: any = {}): Promise<AiResult> {
  const prompt = `ფოკუსის გაუმჯობესების გეგმა (დაუსაბუთებელი გადამრთველები, დისტრაქციების შემცირება, პლან-ბლოკები):\n${JSON.stringify(context ?? {}, null, 2)}`;
  return callProxy(prompt);
}

// ---------- Education / Lessons (შენთვის, როგორც მასწავლებლისთვის სასარგებლო) ----------
export async function outlineLessonPlan(topic: string, grade: string = "2nd"): Promise<AiResult> {
  const prompt = `გაკვეთილის მოკლე გეგმა თემაზე "${topic}", კლასი: ${grade}. მიზნები, აქტივობები, შეფასება.`;
  return callProxy(prompt);
}

export async function proposeReflectionQuestions(context: string = ""): Promise<AiResult> {
  const prompt = `5 მოკლე რეფლექსიის კითხვა ამ კონტექსტისთვის: ${context}`;
  return callProxy(prompt);
}

export async function generateWeeklyPlan(goals: any[] = [], events: any[] = []): Promise<AiResult> {
  const prompt = `კვირის გეგმა (მიზნები+ივენთები):\n${JSON.stringify({ goals, events }, null, 2)}`;
  return callProxy(prompt);
}

export async function createHabitPlan(habit: string, difficulty: "easy" | "medium" | "hard" = "easy"): Promise<AiResult> {
  const prompt = `7-დღიანი გეგმა ჩვევისთვის "${habit}" (${difficulty}). ყოველდღე 1 პატარა ნაბიჯი.`;
  return callProxy(prompt);
}
