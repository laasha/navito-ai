// services/geminiService.ts
// Safe Gemini client via Cloudflare Worker proxy.

const PROXY_URL = import.meta.env.VITE_GEMINI_PROXY_URL || "";

export type AiResult = { text?: string; error?: string };

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

// ----------------- BASE -----------------
export async function generateTextSafe(prompt: string): Promise<AiResult> {
  return callProxy(prompt);
}

// ----------------- GOALS / TASKS -----------------
export async function generateGoalResources(goal: string, context: string = ""): Promise<AiResult> {
  const prompt = `
შექმენი 3–5 ნაბიჯიანი გეგმა მიზნისთვის და თითო ნაბიჯთან მიუთითე 1–2 კონკრეტული რესურსი (სახელი+მოკლე ახსნა).
მიზანი: "${goal}"
კონტექსტი: "${context}"
დაამატე ბოლოს ერთი მცირე სტარტის რჩევა.
`;
  return callProxy(prompt);
}

export async function generateNextStepForGoal(
  goalTitle: string,
  context: { progress?: string; obstacles?: string } | null = null
): Promise<AiResult> {
  const prompt = `
მომეცი მხოლოდ ერთი, ძალიან კონკრეტული შემდეგი ნაბიჯი მიზნისთვის.
მიზანი: "${goalTitle}"
მდგომარეობა/პროგრესი: ${JSON.stringify(context ?? {}, null, 2)}

ფორმატი:
- შემდეგი ნაბიჯი: <ერთი წინადადება, ქმედითი>
- რატომ ახლა: <მოკლე მიზეზი>
- ხანგრძლივობა: <დაახლ. წუთებში>
`;
  return callProxy(prompt);
}

export async function decomposeGoal(goal: string): Promise<AiResult> {
  const prompt = `დაყავი მიზანი "${goal}" 4–6 მცირე, შესრულებად ნაბიჯად და თითოეულზე მიეცი მოკლე თაიმლაინი.`;
  return callProxy(prompt);
}

export async function planShortSchedule(context: string): Promise<AiResult> {
  const prompt = `დამიგეგმე მოკლე დღე/კვირა ამ კონტექსტით:\n${context}\nგამოიტანე ბულეტებად, მაქს 8 ამოცანა.`;
  return callProxy(prompt);
}

export async function generateDailyBriefing(
  context: { date?: string; tasks?: any[]; goals?: any[] } = {}
): Promise<AiResult> {
  const prompt = `
მომიმზადე „დღის ბრიფინგი“.
თარიღი: ${context.date ?? "—"}
ამოცანები: ${JSON.stringify(context.tasks ?? [])}
მიზნები: ${JSON.stringify(context.goals ?? [])}

გამოტანის ფორმატი:
- მთავარი ფოკუსი დღეს
- 3 მთავარი ამოცანა
- პატარა შთაგონება/რჩევა
`;
  return callProxy(prompt);
}

// ----------------- NATURAL INPUT / PARSING -----------------
export async function parseNaturalLanguageInput(raw: string): Promise<AiResult> {
  const prompt = `
დამიმუშავე ტექსტი სტრუქტურირებულად. ტექსტი: """${raw}"""
გამომიტანე მოკლე პუნქტებად:
- ტიპი (task/goal/event/note)
- სათაური
- თარიღი/დედლაინი (თუ ჩანს; ISO ან ბუნებრივი აღწერა)
- პრიორიტეტი (low/med/high) თუ ჩანს
- ქვე-საფეხურები (თუ ჩანს)
`;
  return callProxy(prompt);
}

// ----------------- MIND / BODY / MOOD -----------------
export async function analyzeMindBodyConnection(entries: any): Promise<AiResult> {
  const prompt = `
ეს არის მომხმარებლის „გონება/სხეული“ ჩანაწერების მოკლე სია.
გააკეთე ანალიზი და 3–5 კონკრეტული რეკომენდაცია (ძილი, სტრესი, მოძრაობა, კვება, განწყობა).
ჩანაწერები:
${JSON.stringify(entries ?? {}, null, 2)}
`;
  return callProxy(prompt);
}

export async function findTimelinePatterns(
  timeline: Array<{ date?: string; mood?: string; energy?: string; note?: string }> = []
): Promise<AiResult> {
  const prompt = `
მომიძებნე ნიმუშები ქრონოლოგიურ ჩანაწერებში (მუდი/ენერგია/შენიშვნები).
გამოიტანე მოკლე პუნქტებად: პატერნი + 1 რეკომენდაცია თითოაზე.
ჩანაწერები:
${JSON.stringify(timeline ?? [], null, 2)}
`;
  return callProxy(prompt);
}

export async function generateFutureMoodProjection(
  recent: Array<{ date?: string; mood?: string; energy?: string; note?: string }> = []
): Promise<AiResult> {
  const prompt = `
უახლოესი 2 კვირის "მუდის პროგნოზი" შექმენი ამ ბოლო ჩანაწერების მიხედვით.
გამოიტანე მოკლე კალენდარული შეჯამება + 3 რჩევა, რაც დაეხმარება პოზიტიურ ტენდენციას.
ჩანაწერები:
${JSON.stringify(recent ?? [], null, 2)}
`;
  return callProxy(prompt);
}

// ----------------- INSIGHTS / COACHING -----------------
export async function getAIHintForExercise(
  slug: string,
  currentData: any,
  extra: string | null = null
): Promise<AiResult> {
  const prompt = `
ვარჯიშო: ${slug}
მიმდინარე მონაცემები: ${JSON.stringify(currentData ?? {}, null, 2)}
დამატებით: ${extra ?? "—"}
მომეცი 3–5 ხაზიანი მოკლე ჰინტი გასაგრძელებლად.
`;
  return callProxy(prompt);
}

export async function generateProactiveInsight(
  context: { habits?: any; mood?: any; tasks?: any; goals?: any; schedule?: any } = {}
): Promise<AiResult> {
  const prompt = `
დააგენერირე ერთი „პრაქტიკული პროაქტიული ინსაიტი“ კვირის კონტექსტზე დაყრდნობით.
კონტექსტი:
${JSON.stringify(context ?? {}, null, 2)}

გამოტანის ფორმატი:
- ინსაიტი: <ერთი ძლიერი წინადადება, ქმედებითი ტონით>
- რატომ: <ერთი-ორი წინადადება>
- პატარა ნაბიჯი დღეს: <კონკრეტული 5–15 წთ საქმე>
`;
  return callProxy(prompt);
}

export async function findRelatedHabits(
  current: { title?: string; tags?: string[]; recentNotes?: string } = {}
): Promise<AiResult> {
  const prompt = `
მომიძებნე 3–6 "შესაბამისი ჩვევა" ამ კონტექსტისთვის:
${JSON.stringify(current ?? {}, null, 2)}

ფორმატი:
- ჩვევა: <დასახელება> — რატომ ეხმარება (1 წინადადება)
`;
  return callProxy(prompt);
}

// ----------------- EVENING / REFLECTION -----------------
export async function generateEveningReflectionPrompt(
  context: { wins?: string[]; challenges?: string[]; mood?: string } = {}
): Promise<AiResult> {
  const prompt = `
დამიწერე საღამოს მოკლე რეფლექსიის პრომპტი ამ დღის კონტექსტზე:
მიღწევები: ${JSON.stringify(context.wins ?? [])}
სირთულეები: ${JSON.stringify(context.challenges ?? [])}
განწყობა: ${context.mood ?? "—"}

გამოტანის ფორმატი:
- 3 სწრაფი კითხვა დღეზე
- 1 მადლიერების პუნქტი
- 1 პატარა გეგმად ქცევადი ნაბიჯი ხვალისთვის
`;
  return callProxy(prompt);
}

// ----------------- EXTRA HELPERS (რათა აღარ აგდოს export errors) -----------------
export async function generateWeeklyOverview(context: any = {}): Promise<AiResult> {
  const prompt = `გადააქციე ეს კონტექსტი მოკლე weekly overview-ად (ბულეტები, მაქს 8):\n${JSON.stringify(context, null, 2)}`;
  return callProxy(prompt);
}
export async function suggestHabitStacking(baseHabit: string): Promise<AiResult> {
  const prompt = `მომეცი 3–5 habit stacking იდეა ჩვევისთვის "${baseHabit}", თითოეულზე 1 წინადადებიანი ახსნა.`;
  return callProxy(prompt);
}
export async function classifyLifeItem(text: string): Promise<AiResult> {
  const prompt = `დააკლასიფიცირე ჩანაწერი (task/goal/event/note) და მიუწერე მოკლე მიზეზი: """${text}"""`;
  return callProxy(prompt);
}
export async function suggestMicroHabits(context: string): Promise<AiResult> {
  const prompt = `მომეცი 4–6 „მიკრო-ჩვევა“ ამ კონტექსტისთვის (ერთი წინადადება თითო): ${context}`;
  return callProxy(prompt);
}
export async function recommendBreathingExercise(context: string = ""): Promise<AiResult> {
  const prompt = `დაარეკომენდირე 1 სუნთქვითი სავარჯიშო ამ კონტექსტისთვის (დეტალური ნაბიჯები, 2–3 წთ): ${context}`;
  return callProxy(prompt);
}
export async function craftAffirmations(topic: string): Promise<AiResult> {
  const prompt = `შეადგინე 5 მოკლე, რეალისტური დადებითი აფირმაცია თემაზე: "${topic}"`;
  return callProxy(prompt);
}
export async function generateWeeklyPlan(goals: any[] = [], events: any[] = []): Promise<AiResult> {
  const prompt = `შექმენი მოკლე კვირის გეგმა ამ მიზნებსა და ღონისძიებებზე დაყრდნობით:\n${JSON.stringify({ goals, events }, null, 2)}`;
  return callProxy(prompt);
}
export async function createHabitPlan(habit: string, difficulty: "easy"|"medium"|"hard" = "easy"): Promise<AiResult> {
  const prompt = `შექმენი 7-დღიანი გეგმა ჩვევისთვის "${habit}" (${difficulty}) — ყოველდღე 1 მცირე ნაბიჯი.`;
  return callProxy(prompt);
}
export async function evaluateTaskLoad(tasks: any[] = []): Promise<AiResult> {
  const prompt = `შეაფასე მაქსიმუმ 10 ამოცანის დატვირთვა და მოარჩინე 3 მთავარი. სია:\n${JSON.stringify(tasks, null, 2)}`;
  return callProxy(prompt);
}
export async function proposeReflectionQuestions(context: string = ""): Promise<AiResult> {
  const prompt = `მომეცი 5 მოკლე რეფლექციის კითხვა ამ კონტექსტისთვის: ${context}`;
  return callProxy(prompt);
}
