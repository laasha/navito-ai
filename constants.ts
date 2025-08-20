import { UserSettings, UserDataBundle } from './types';

export const DEFAULT_CATEGORIES: UserSettings['categories'] = [
    { id: "personal", name: "პირადი", color: "#3B82F6" },
    { id: "relationship", name: "ურთიერთობები", color: "#EC4899" },
    { id: "learning", name: "სწავლა", color: "#F97316" },
    { id: "impact", name: "გავლენა", color: "#10B981" },
    { id: "work", name: "სამსახური", color: "#6366F1" },
    { id: "other", name: "სხვა", color: "#A855F7" }
];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  categories: DEFAULT_CATEGORIES,
  notifications: { weeklyDigest: false },
  values: [],
  userName: 'მომხმარებელი',
  userQuote: '"მოგზაურობა იწყება ერთი ნაბიჯით."',
  aiPersonality: 'coach',
  theme: 'dark',
  timelineColor: '#00F6FF', // Default brand color
};

export const getInitialUserDataBundle = (): UserDataBundle => ({
    lifeItems: [],
    habits: [],
    userSettings: DEFAULT_USER_SETTINGS,
    chatHistory: [],
    legacyEntries: [],
    annotations: [],
    activeProgram: null,
    lastQuarterlyReviewDate: null,
});