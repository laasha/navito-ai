

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { LifeItem, Habit, UserSettings, AppContextType, ChatMessage, LegacyEntry, Program, BiometricData, UserDataBundle, SupabaseUser, Annotation } from '../types';
import * as dataService from '../services/dataService';
import { supabase } from '../services/supabaseClient';
import dayjs from 'dayjs';
import { fetchMockWearableData } from '../services/wearableService';
import { useToast } from './ToastContext';
import { getInitialUserDataBundle } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State slices
  const [lifeItems, setLifeItems] = useState<LifeItem[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(dataService.DEFAULT_USER_SETTINGS);
  const [chatHistory, _setChatHistory] = useState<ChatMessage[]>([]);
  const [legacyEntries, setLegacyEntries] = useState<LegacyEntry[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [lastQuarterlyReviewDate, _setLastQuarterlyReviewDate] = useState<string | null>(null);
  const [biometricData, setBiometricData] = useState<BiometricData[]>([]);

  // App mode states
  const [isLoading, setIsLoading] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isRoutineMode, setIsRoutineMode] = useState(false);
  
  // Derived/Helper states
  const [pinnedGoalId, setPinnedGoalId] = useState<string | null>(null);
  const [storyFocusId, setStoryFocusId] = useState<string | null>(null);

  // Auth State
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { addToast } = useToast();
  
  const saveTimeoutRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef(true);

  // --- Auth & Data Loading ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setIsLoading(true);
        const currentUser = session?.user || null;
        setUser(currentUser);
        setIsAuthenticated(!!currentUser);

        if (currentUser) {
            try {
                const [userData, wearableData] = await Promise.all([
                    dataService.loadUserData(currentUser.id),
                    fetchMockWearableData()
                ]);
                
                setLifeItems(userData.lifeItems);
                setHabits(userData.habits);
                setUserSettings(userData.userSettings);
                _setChatHistory(userData.chatHistory);
                setLegacyEntries(userData.legacyEntries);
                setAnnotations(userData.annotations || []);
                setActiveProgram(userData.activeProgram);
                _setLastQuarterlyReviewDate(userData.lastQuarterlyReviewDate);
                setBiometricData(wearableData);
                isInitialLoadRef.current = true;
            } catch (error: any) {
                addToast(`მონაცემების ჩატვირთვისას შეცდომა: ${error.message}`, 'error');
            }
        } else {
            // Clear all user-specific data on logout
            const defaultData = dataService.getInitialUserDataBundle();
            setLifeItems(defaultData.lifeItems);
            setHabits(defaultData.habits);
            setUserSettings(defaultData.userSettings);
            _setChatHistory(defaultData.chatHistory);
            setLegacyEntries(defaultData.legacyEntries);
            setAnnotations(defaultData.annotations);
            setActiveProgram(defaultData.activeProgram);
            _setLastQuarterlyReviewDate(defaultData.lastQuarterlyReviewDate);
            setBiometricData([]);
        }
        setIsLoading(false);
    });

    return () => {
        subscription.unsubscribe();
    };
  }, [addToast]);
  
  // --- Debounced Save to Cloud ---
  const saveDataToCloud = useCallback(() => {
    if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        return;
    }
    if (!user) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        const dataBundle: UserDataBundle = {
            lifeItems, habits, userSettings, chatHistory, legacyEntries, annotations, activeProgram, lastQuarterlyReviewDate
        };
        await dataService.saveUserData(user.id, dataBundle);
        console.log("Data saved to cloud/local store.");
      } catch (error: any) {
        addToast(`მონაცემების შენახვისას შეცდომა: ${error.message}`, 'error');
      }
    }, 1500); // Debounce for 1.5 seconds
  }, [user, lifeItems, habits, userSettings, chatHistory, legacyEntries, annotations, activeProgram, lastQuarterlyReviewDate, addToast]);
  
  // Trigger save whenever data changes
  useEffect(() => { saveDataToCloud(); }, [saveDataToCloud]);
  
  // Recalculate pinned goal ID when lifeItems change
  useEffect(() => {
    const initiallyPinned = lifeItems.find(i => i.isPinned);
    setPinnedGoalId(initiallyPinned ? initiallyPinned.id : null);
  }, [lifeItems]);


  // --- Auth Actions ---
  const signup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
        await dataService.createInitialUserData(data.user.id);
        addToast("წარმატებული რეგისტრაცია! გთხოვთ, შეამოწმოთ იმეილი დასადასტურებლად.", "success");
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) addToast(`გამოსვლისას შეცდომა: ${error.message}`, 'error');
  };
  
  // --- Data Mutation Actions (update state then trigger save) ---

  const addOrUpdateLifeItem = useCallback(async (item: Partial<LifeItem>) => {
    setLifeItems(currentItems => {
        const now = dayjs().toISOString();
        if (item.id) {
          return currentItems.map(i => i.id === item.id ? { ...i, ...item, updatedAt: now } as LifeItem : i);
        } else {
          const newItem: LifeItem = {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: '', type: 'event', category: 'personal', mood: 0,
            ...item,
            dateISO: item.dateISO || now,
            createdAt: now, updatedAt: now,
            payload: item.payload || {},
          };
          return [...currentItems, newItem];
        }
    });
  }, []);

  const removeLifeItem = useCallback(async (itemId: string) => {
    setLifeItems(currentItems => currentItems.filter(i => i.id !== itemId));
  }, []);

    const removeAllUserData = useCallback(async () => {
        const initialData = getInitialUserDataBundle();
        setLifeItems(initialData.lifeItems);
        setHabits(initialData.habits);
        setUserSettings(initialData.userSettings);
        _setChatHistory(initialData.chatHistory);
        setLegacyEntries(initialData.legacyEntries);
        setAnnotations(initialData.annotations);
        setActiveProgram(initialData.activeProgram);
        _setLastQuarterlyReviewDate(initialData.lastQuarterlyReviewDate);
    }, []);

  const saveHabits = useCallback(async (updatedHabits: Habit[]) => setHabits(updatedHabits), []);
  const saveUserSettings = useCallback(async (updatedSettings: UserSettings) => setUserSettings(updatedSettings), []);
  const addChatMessage = useCallback(async (message: ChatMessage) => _setChatHistory(h => [...h, message]), []);
  const setChatHistory = useCallback(async (history: ChatMessage[]) => _setChatHistory(history), []);
  
  const addLegacyEntry = useCallback(async (entry: Partial<LegacyEntry>) => {
        const newEntry: LegacyEntry = {
            id: `legacy_${Date.now()}`, question: '', answer: '',
            ...entry, dateISO: dayjs().toISOString(),
        };
        setLegacyEntries(e => [...e, newEntry]);
    }, []);

    const addOrUpdateAnnotation = useCallback(async (annotation: Partial<Annotation>) => {
        setAnnotations(current => {
          if (annotation.id) {
            return current.map(a => a.id === annotation.id ? { ...a, ...annotation } as Annotation : a);
          } else {
            const newAnnotation: Annotation = {
              id: `anno_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              dateISO: dayjs().toISOString(),
              text: '',
              ...annotation
            };
            return [...current, newAnnotation];
          }
        });
      }, []);
    
    const removeAnnotation = useCallback(async (annotationId: string) => {
        setAnnotations(current => current.filter(a => a.id !== annotationId));
    }, []);
    
  const setLastQuarterlyReviewDate = useCallback(async (date: string) => _setLastQuarterlyReviewDate(date), []);
  
  const handleImportData = useCallback(async (data: { lifeItems: LifeItem[], habits: Habit[], userSettings: UserSettings, legacyEntries?: LegacyEntry[] }) => {
    if (!user) {
        addToast("მონაცემების იმპორტისთვის საჭიროა ავტორიზაცია.", "error");
        return;
    }
    try {
        await dataService.handleDataImport(user.id, data);
        const reloadedData = await dataService.loadUserData(user.id);
        setLifeItems(reloadedData.lifeItems);
        setHabits(reloadedData.habits);
        setUserSettings(reloadedData.userSettings);
        setLegacyEntries(reloadedData.legacyEntries);
    } catch (error: any) {
        addToast(error.message, 'error');
    }
  }, [user, addToast]);
  
  const togglePinnedGoal = useCallback(async (goalId: string) => {
    setLifeItems(currentItems => {
        const isUnpinning = pinnedGoalId === goalId;
        return currentItems.map(i => ({...i, isPinned: (i.id === goalId && !isUnpinning) ? true : false }));
    });
  }, [pinnedGoalId]);

  const activateProgram = useCallback(async (program: Omit<Program, 'id' | 'isActive' | 'startDate' | 'checkins'>) => {
    const today = dayjs();
    let newHabits = [...habits];
    let newLifeItems = [...lifeItems];

    program.components.forEach(component => {
        if (component.type === 'habit' && !newHabits.some(h => h.name.toLowerCase() === component.title.toLowerCase())) {
            newHabits.push({ id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, name: component.title, log: [] });
        } else if (component.type !== 'habit') {
            const now = dayjs().toISOString();
            newLifeItems.push({
                id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, title: component.title, type: component.type,
                dateISO: today.add(component.week, 'week').endOf('week').toISOString(), category: 'personal', mood: 0,
                payload: { details: component.details, fromProgram: program.name }, createdAt: now, updatedAt: now,
            });
        }
    });

    const newActiveProgram: Program = { ...program, id: `prog_${Date.now()}`, isActive: true, startDate: today.toISOString(), checkins: [] };
    setActiveProgram(newActiveProgram);
    setHabits(newHabits);
    setLifeItems(newLifeItems);
  }, [habits, lifeItems]);
  
  const completeProgramCheckin = useCallback(async (programId: string, week: number, feedback: string) => {
      if (!activeProgram || activeProgram.id !== programId) return;
      const newCheckin = { week, feedback, completedAt: dayjs().toISOString() };
      const updatedProgram = { ...activeProgram, checkins: [...activeProgram.checkins, newCheckin] };
      setActiveProgram(updatedProgram);
  }, [activeProgram]);

  // --- Read-only/Derived data getters ---
  const getLifeItemById = useCallback((itemId: string) => lifeItems.find(i => i.id === itemId), [lifeItems]);
  
  const getStoryItems = useCallback((startItemId: string): LifeItem[] => {
    const storyItemsMap = new Map<string, LifeItem>();
    const queue: string[] = [startItemId];
    const visited = new Set<string>([startItemId]);
    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentItem = lifeItems.find(i => i.id === currentId);
        if (currentItem) {
            storyItemsMap.set(currentId, currentItem);
            lifeItems.forEach(item => { if(item.connections?.includes(currentId) && !visited.has(item.id)) { queue.push(item.id); visited.add(item.id); }});
            currentItem.connections?.forEach(connectedId => { if (!visited.has(connectedId)) { queue.push(connectedId); visited.add(connectedId); }});
        }
    }
    return Array.from(storyItemsMap.values()).sort((a, b) => dayjs(a.dateISO).valueOf() - dayjs(b.dateISO).valueOf());
  }, [lifeItems]);

  const findLatestExerciseItem = useCallback((slug: string): LifeItem | null => {
    const relevantItems = lifeItems
      .filter(item => item.payload?.slug === slug)
      .sort((a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf());
    return relevantItems.length > 0 ? relevantItems[0] : null;
  }, [lifeItems]);

  const syncWearableData = useCallback(async () => {
    const wearableData = await fetchMockWearableData();
    setBiometricData(wearableData);
    addToast('Wearable data synced.', 'info');
  }, [addToast]);
  
  const toggleZenMode = useCallback(() => setIsZenMode(prev => !prev), []);


  const value: AppContextType = {
    lifeItems, habits, userSettings, chatHistory, legacyEntries, annotations, isLoading, pinnedGoalId, addOrUpdateLifeItem,
    removeLifeItem, removeAllUserData, getLifeItemById, getStoryItems, saveHabits, saveUserSettings, addChatMessage,
    setChatHistory, addLegacyEntry, findLatestExerciseItem, handleImportData, togglePinnedGoal,
    isZenMode, toggleZenMode, storyFocusId, setStoryFocusId, user, isAuthenticated, login, signup,
    logout, activateProgram, isRoutineMode, setIsRoutineMode, activeProgram, completeProgramCheckin,
    lastQuarterlyReviewDate, setLastQuarterlyReviewDate, biometricData, syncWearableData,
    addOrUpdateAnnotation, removeAnnotation
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};