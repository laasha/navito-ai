

// import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface SupabaseUser {
  id: string;
  email?: string;
}

export type LifeItemType = 'event' | 'goal' | 'exercise' | 'financial';

// New interface for AI Pattern Detector
export interface TimelinePattern {
    startDateISO: string;
    endDateISO: string;
    description: string;
    type: 'positive' | 'negative' | 'insight';
}

// New interface for Future Mood Projection
export interface ProjectedMoodPoint {
    dateISO: string;
    mood: number; // -5 to 5
}

// New interface for Annotations
export interface Annotation {
    id: string;
    dateISO: string;
    text: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface CoreValue {
  id: string;
  value: string;
  reason: string;
}

export interface GeneratedValuesResponse {
  values: CoreValue[];
}

export interface UserSettings {
  categories: Category[];
  notifications: {
    weeklyDigest: boolean;
  };
  values: CoreValue[];
  // New Personalization fields
  userName: string;
  userQuote: string;
  aiPersonality: 'coach' | 'analyst' | 'friend';
  theme: 'dark' | 'light';
  timelineColor: string;
}

export interface Habit {
  id:string;
  name: string;
  log: string[]; // array of 'YYYY-MM-DD' date strings
}

export interface Subtask {
    text: string;
    completed: boolean;
}

export interface Area {
    name: string;
    value: number;
}

export interface LifeItemPayload {
    slug?: string;
    details?: string;
    alignedValues?: string[];
    // SWOT
    strengths?: string;
    weaknesses?: string;
    opportunities?: string;
    threats?: string;
    // Daily Log
    notes?: string;
    gratitude?: string;
    // SMART Decompose
    goalTitle?: string;
    specific?: string;
    measurable?: string;
    achievable?: string;
    relevant?: string;
    // Life Wheel
    areas?: Area[];
    insight?: string;
    // Energy Log
    morning?: number;
    afternoon?: number;
    evening?: number;
    // Fear Setting
    goal?: string;
    define?: string;
    prevent?: string;
    repair?: string;
    // from program
    fromProgram?: string;
    // life-chapter
    endDateISO?: string;
    // value-prompt & evening-reflection
    question?: string;
    answer?: string;
    value?: string;
    // decision-journal
    decision?: string;
    context?: string;
    outcome?: string;
    // Intensity Log
    intensity?: number; // -5 (burnout) to +5 (flow)
    // Anticipation for future events
    anticipation?: number; // -5 (anxiety) to +5 (excitement)
    // Feature: Relationship Layer
    people?: string[];
    // Feature: Financial Layer
    amount?: number;
    transactionType?: 'income' | 'expense';
}

export interface LifeItem {
  id: string;
  title: string;
  dateISO: string;
  type: LifeItemType;
  category: string;
  mood: number; // -5 to 5
  payload: LifeItemPayload;
  subtasks?: Subtask[];
  connections?: string[];
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LegacyEntry {
    id: string;
    question: string;
    answer: string;
    dateISO: string;
}

export interface ToastAction {
    label: string;
    onClick: () => void;
}

export interface User {
    email: string;
}

export interface BiometricData {
    dateISO: string; // YYYY-MM-DD
    sleepHours: number;
    avgHeartRate: number;
    steps: number;
}

export interface AppContextType {
  lifeItems: LifeItem[];
  habits: Habit[];
  userSettings: UserSettings;
  chatHistory: ChatMessage[];
  legacyEntries: LegacyEntry[];
  annotations: Annotation[];
  isLoading: boolean;
  pinnedGoalId: string | null;
  addOrUpdateLifeItem: (item: Partial<LifeItem>) => Promise<void>;
  removeLifeItem: (itemId: string) => Promise<void>;
  removeAllUserData: () => Promise<void>;
  getLifeItemById: (itemId: string) => LifeItem | undefined;
  getStoryItems: (startItemId: string) => LifeItem[];
  saveHabits: (updatedHabits: Habit[]) => Promise<void>;
  saveUserSettings: (updatedSettings: UserSettings) => Promise<void>;
  addChatMessage: (message: ChatMessage) => Promise<void>;
  setChatHistory: (history: ChatMessage[]) => Promise<void>;
  addLegacyEntry: (entry: Partial<LegacyEntry>) => Promise<void>;
  findLatestExerciseItem: (slug: string) => LifeItem | null;
  handleImportData: (data: { lifeItems: LifeItem[], habits: Habit[], userSettings: UserSettings, legacyEntries?: LegacyEntry[] }) => Promise<void>;
  togglePinnedGoal: (goalId: string) => Promise<void>;
  isZenMode: boolean;
  toggleZenMode: () => void;
  storyFocusId: string | null;
  setStoryFocusId: (id: string | null) => void;
  user: SupabaseUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  activateProgram: (program: Omit<Program, 'id' | 'isActive' | 'startDate' | 'checkins'>) => Promise<void>;
  isRoutineMode: boolean;
  setIsRoutineMode: (isRoutine: boolean) => void;
  activeProgram: Program | null;
  completeProgramCheckin: (programId: string, week: number, feedback: string) => Promise<void>;
  lastQuarterlyReviewDate: string | null;
  setLastQuarterlyReviewDate: (date: string) => Promise<void>;
  biometricData: BiometricData[];
  syncWearableData: () => Promise<void>;
  addOrUpdateAnnotation: (annotation: Partial<Annotation>) => Promise<void>;
  removeAnnotation: (annotationId: string) => Promise<void>;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    text: string;
}

export interface LifeItemEditModalProps {
    itemToEdit?: LifeItem;
    initialData?: Partial<LifeItem>;
}

export interface ProactiveInsight {
    type: 'mood' | 'goal' | 'habit' | 'general' | 'reflection' | 'experiment';
    text: string;
    action?: {
        type: 'start_habit_experiment';
        habitName: string;
        durationDays: number;
    };
}

export interface ThematicReview {
    theme: string;
    narrative: string;
    prompt: string;
}

export type SpecificInsightType = 'mood_habit' | 'goal_progress';

export interface ParsedNaturalInput {
    title: string;
    type: LifeItemType;
    dateISO: string;
    details: string;
    category: string;
}

export interface SmartDecompositionResponse {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    subtasks: string[];
}

export interface SystemComponent {
    type: 'habit' | 'task' | 'reflection';
    title: string;
    details: string;
}

export interface PersonalSystem {
    name: string;
    description: string;
    components: SystemComponent[];
}

export interface Scenario {
    name: string;
    description: string;
    milestones: { title: string; duration: string; }[];
    potentialChallenges: string[];
    firstSteps: string[];
}

export interface SummarizedContent {
    title: string;
    summary: string;
    actionableTasks: string[];
    keyConcepts: string[];
}

export interface ProgramComponent {
    type: 'habit' | 'goal' | 'exercise';
    week: number;
    title: string;
    details: string;
}

export interface ProgramCheckin {
    week: number;
    completedAt: string;
    feedback: string;
}

export interface Program {
    id: string;
    name: string;
    description: string;
    durationWeeks: number;
    components: ProgramComponent[];
    isActive: boolean;
    startDate: string;
    checkins: ProgramCheckin[];
}

export interface DailyBriefing {
    greeting: string;
    focus_statement: string;
    motivational_prompt: string;
}

export interface QuarterlyReviewReport {
    title: string;
    period: string;
    summary: string;
    keyAchievements: string[];
    keyChallenges: string[];
    valueAlignment: {
        value: string;
        narrative: string;
        score: number; // 1-10
    }[];
    suggestedFocusAreas: string[];
}

export interface EpochGoal {
    title: string;
    reason: string;
    firstSteps: string[];
}

export interface InsightCorrelation {
    finding: string;
    evidence: string;
    strength: 'strong' | 'moderate' | 'weak';
}

export interface HolisticCorrelationReport {
    positiveCorrelations: InsightCorrelation[];
    negativeCorrelations: InsightCorrelation[];
    keyInsight: string;
}

export interface MoodHabitCorrelation {
    positive: { habitName: string; effectDescription: string }[];
    negative: { habitName: string; effectDescription: string }[];
    summary: string;
}

export interface GoalInsightReport {
    completionRate: number; // percentage
    avgCompletionTimeDays: number;
    mostSuccessfulCategory: string;
    leastSuccessfulCategory: string;
    keyInsight: string;
}

export interface LifeWheelTrend {
    area: string;
    startValue: number;
    endValue: number;
    trend: 'improving' | 'declining' | 'stable';
}

export interface LifeWheelAnalysis {
    trends: LifeWheelTrend[];
    narrativeSummary: string;
}

export interface MindBodyInsight {
    insight: string;
}

export interface RelatedHabitsResponse {
    relatedHabits: string[];
}

export interface SearchResultItem {
    id: string;
    title: string;
    dateISO: string;
    type: LifeItemType;
    snippet: string; // A short relevant snippet generated by the AI
}

export interface UniversalSearchResponse {
    summary: string;
    sourceItems: SearchResultItem[];
}

export interface ValuePromptResponse {
    prompt: string;
}

export interface CognitiveReframesResponse {
    reframes: string[];
}

export interface StoicPromptResponse {
    prompt: string;
}

export interface ProjectPremortemResponse {
    risks: string[];
}

export interface Highlight {
    date: string;
    title: string;
    reason: string;
}

export interface HighlightReelResponse {
    highlights: Highlight[];
}

export interface IdeaCatalystResponse {
    ideas: string[];
}

// Represents the structure of the data blob stored in Supabase
export interface UserDataBundle {
    lifeItems: LifeItem[];
    habits: Habit[];
    userSettings: UserSettings;
    chatHistory: ChatMessage[];
    legacyEntries: LegacyEntry[];
    annotations: Annotation[];
    activeProgram: Program | null;
    lastQuarterlyReviewDate: string | null;
}


// --- New Planning Tool Types ---

export interface GoalLadderResponse {
    steps: {
        title: string;
        subSteps: string[];
    }[];
}

export interface IdealWeekResponse {
    schedule: {
        day: string; 
        focus: string;
        activities: string[];
    }[];
}

export interface SkillPlanResponse {
    planName: string;
    phases: {
        phaseTitle: string;
        duration: string;
        activities: string[];
    }[];
}

export interface ProjectKickstartResponse {
    projectName: string;
    brief: string;
    keyTasks: string[];
    timeline: {
        phase: string;
        tasks: string[];
    }[];
}

export interface HabitStackResponse {
    stacks: {
        currentHabit: string;
        newHabit: string;
        suggestion: string;
    }[];
}

export interface AntiGoalResponse {
    antiGoals: {
        antiGoal: string;
        preventativeActions: string[];
    }[];
}

export interface ResourceCuratorResponse {
    resources: {
        type: 'სტატია' | 'ვიდეო' | 'ხელსაწყო' | 'კურსი';
        title: string;
        description: string;
    }[];
}

export interface WeeklyDigestReport {
    weekTitle: string;
    summary: string;
    keyAchievements: string[];
    areasForReflection: string[];
    productivityScore: number; // 1-10
    balanceScore: number; // 1-10
}

export interface ToolSuggestion {
    slug: string; // e.g., 'cognitive-reframer'
    name: string; // e.g., 'აზრის რეფრეიმინგი'
    reasoning: string; // e.g., 'რადგან ბოლო დღეებში დაბალი განწყობა დააფიქსირეთ.'
}

export interface ToolSuggestionResponse {
    suggestions: ToolSuggestion[];
}