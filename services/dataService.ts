





import { supabase } from './supabaseClient';
import { UserDataBundle, UserSettings, LifeItem, Habit, LegacyEntry } from '../types';
import { DEFAULT_USER_SETTINGS, getInitialUserDataBundle } from '../constants';

const TABLE_NAME = 'user_data';

export { getInitialUserDataBundle, DEFAULT_USER_SETTINGS };

export const loadUserData = async (userId: string): Promise<UserDataBundle> => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('data')
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') { // "pg_rest" error for "0 rows"
            console.log('No existing data for user, returning initial bundle.');
            return getInitialUserDataBundle();
        }
        console.error('Error loading user data:', error);
        throw error;
    }
    
    // Merge loaded settings with defaults to ensure new properties are present
    const loadedBundle = data.data as UserDataBundle;
    loadedBundle.userSettings = {
        ...DEFAULT_USER_SETTINGS,
        ...(loadedBundle.userSettings || {}),
        categories: loadedBundle.userSettings?.categories || DEFAULT_USER_SETTINGS.categories,
        notifications: loadedBundle.userSettings?.notifications || DEFAULT_USER_SETTINGS.notifications,
        values: loadedBundle.userSettings?.values || DEFAULT_USER_SETTINGS.values,
        userName: loadedBundle.userSettings?.userName || DEFAULT_USER_SETTINGS.userName,
        userQuote: loadedBundle.userSettings?.userQuote || DEFAULT_USER_SETTINGS.userQuote,
        aiPersonality: loadedBundle.userSettings?.aiPersonality || DEFAULT_USER_SETTINGS.aiPersonality,
        theme: loadedBundle.userSettings?.theme || DEFAULT_USER_SETTINGS.theme,
        timelineColor: loadedBundle.userSettings?.timelineColor || DEFAULT_USER_SETTINGS.timelineColor,
    };

    return loadedBundle;
};

export const saveUserData = async (userId: string, dataBundle: UserDataBundle): Promise<void> => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .upsert([{ user_id: userId, data: dataBundle as any, updated_at: new Date().toISOString() }]);
    
    if (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
};

export const createInitialUserData = async (userId: string): Promise<void> => {
    const initialData = getInitialUserDataBundle();
    const { error } = await supabase
        .from(TABLE_NAME)
        .insert([{ user_id: userId, data: initialData as any, updated_at: new Date().toISOString() }]);

    if (error) {
        console.error('Error creating initial user data:', error);
        throw error;
    }
};

export const handleDataImport = async (userId: string, data: { lifeItems: LifeItem[], habits: Habit[], userSettings: UserSettings, legacyEntries?: LegacyEntry[] }) => {
    const currentData = await loadUserData(userId);
    const newBundle: UserDataBundle = {
        ...currentData,
        lifeItems: data.lifeItems || [],
        habits: data.habits || [],
        userSettings: data.userSettings || DEFAULT_USER_SETTINGS,
        legacyEntries: data.legacyEntries || [],
    };
    await saveUserData(userId, newBundle);
};