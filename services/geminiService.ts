// services/geminiService.ts
// Safe Gemini client via Cloudflare Worker proxy.
// ბრაუზერში API key არ გვჭირდება; თუ PROXY_URL არაა, ვაბრუნებთ შეცდომას და UI არ კრაშდება.

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

/** ყველაზე დაბალი დონის ჰელპერი */
export async function generateTextSafe(prompt: string): Promise<AiResult> {
  return callProxy(prompt);
}

/** LifeItemEditModal.tsx — რესურსები/ნაბიჯები მიზნისთვის */
export async function generateGoalResources(goal: string, context: string = ""): Promise<AiResult> {
  const prompt = `
შექმენი 3–5 ნაბიჯიანი გეგმა მიზნისთვის და თითო ნაბიჯთან ჩამოთვალე 1–2 კონკრეტული რესურსი.
მიზანი: "${goal}"
კონტექსტი: "${context}"
დაამატე მოკლე სტარტის რჩევა ბოლოს.
`;
  return callProxy(prompt);
}

/** Exercise ჰინტი */
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

/** Natural input parser — components/NaturalInputModal.tsx */
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

/** Mind–Body ანალიზი — components/home/MindBodyConnectionWidget.tsx */
export async function analyzeMindBodyConnection(entries: any): Promise<AiResult> {
  const prompt = `
ეს არის მომხმარებლის „გონება-ხელიერი/სხეული“ ჩანაწერების მოკლე ცხრილი/სია.
გააკეთე ანალიზი და 3–5 კონკრეტული რეკომენდაცია.
შესაძლო კავშირები (ძილი, სტრესი, მოძრაობა, კვება, განწყობა) მოკლედ მიუთითე.
ჩანაწერები:
${JSON.stringify(entries ?? {}, null, 2)}
`;
  return callProxy(prompt);
}

/** დღე/კვირის მოკლე გეგმის გენერაცია */
export async function planShortSchedule(context: string): Promise<AiResult> {
  const prompt = `დამიგეგმე მოკლე დღე/კვირა ამ კონტექსტით:\n${context}\nგამოიტანე ბულეტებით, მაქს 8 ამოცანა.`;
  return callProxy(prompt);
}

/** ზოგადი „დავყოთ ნაბიჯებად“ ჰელპერი */
export async function decomposeGoal(goal: string): Promise<AiResult> {
  const prompt = `დაყავი მიზანი "${goal}" 4–6 მცირე, შესრულებად ნაბიჯად და თითოეულს მიეცი მოკლე თაიმლაინი.`;
  return callProxy(prompt);
}

/** Next step გენერატორი — components/home/NextStepWidget.tsx ითხოვს */
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
- ხანგრძლივობა: <დაახლ. დრო წუთებში>
`;
  return callProxy(prompt);
}

/** Proactive Insight — components/home/AiInsightWidget.tsx ითხოვს */
export async function generateProactiveInsight(
  context: {
    habits?: any;
    mood?: any;
    tasks?: any;
    goals?: any;
    schedule?: any;
  } = {}
): Promise<AiResult> {
  const prompt = `
დააგენერირე ერთი „პრაქტიკული პროაქტიული ინსაიტი“ მომხმარებლის კვირის კონტექსტზე დაყრდნობით.
კონტექსტი:
${JSON.stringify(context ?? {}, null, 2)}

გამოტანის ფორმატი:
- ინსაიტი: <ერთი ძლიერი წინადადება, ქმედებითი ტონით>
- რატომ: <ერთ–ორ წინადადებაში ახსნა>
- პატარა ნაბიჯი დღეს: <კონკრეტული 5–15 წთ საქმე>
`;
  return callProxy(prompt);
}
