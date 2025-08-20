import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { get, set, del } from 'idb-keyval';
import { UserDataBundle } from '../types';

export interface Database {
  public: {
    Tables: {
      user_data: {
        Row: {
          user_id: string;
          updated_at: string;
          data: UserDataBundle;
        };
        Insert: {
          user_id: string;
          updated_at?: string;
          data: UserDataBundle;
        };
        Update: {
          user_id?: string;
          updated_at?: string;
          data?: UserDataBundle;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// --- Mock Supabase Client for Offline/Local Mode ---
const createMockSupabase = (): SupabaseClient<Database> => {
    let onAuthStateChangeCallback: ((event: string, session: any) => void) | null = null;
    
    const notifyAuthStateChange = (event: string, session: any) => {
        if (onAuthStateChangeCallback) {
            onAuthStateChangeCallback(event, session);
        }
    };
    
    // Consistent key generation for user credentials
    const getUserCredentialsKey = (email: string) => `mock_user_credentials_${email}`;

    const mockAuth = {
        onAuthStateChange: (callback: (event: string, session: any) => void) => {
            onAuthStateChangeCallback = callback;
            // Immediately check for a stored session
            get('mock_session').then(session => {
                notifyAuthStateChange(session ? 'INITIAL_SESSION' : 'SIGNED_OUT', session);
            });
            return { data: { subscription: { unsubscribe: () => { onAuthStateChangeCallback = null; } } } };
        },
        signUp: async ({ email, password }: any) => {
            const userCredentialsKey = getUserCredentialsKey(email);
            
            const existingUser = await get(userCredentialsKey);
            if (existingUser) {
                return { data: { user: null, session: null }, error: { message: 'მომხმარებელი ამ ელ.ფოსტით უკვე რეგისტრირებულია.' } };
            }

            const userId = `mock_user_id_${Date.now()}`;
            await set(userCredentialsKey, { email, password, id: userId });
            
            const user = { id: userId, email };
            const session = { user };
            await set('mock_session', session);
            notifyAuthStateChange('SIGNED_IN', session);
            return { data: { user, session }, error: null };
        },
        signInWithPassword: async ({ email, password }: any) => {
            const userCredentialsKey = getUserCredentialsKey(email);
            const user = await get(userCredentialsKey);

            if (user && user.password === password) {
                const sessionUser = { id: user.id, email: user.email };
                const session = { user: sessionUser };
                await set('mock_session', session);
                notifyAuthStateChange('SIGNED_IN', session);
                return { data: { session, user: sessionUser }, error: null };
            }
            return { data: { user: null, session: null }, error: { message: 'ელ.ფოსტა ან პაროლი არასწორია.' } };
        },
        signOut: async () => {
            await del('mock_session');
            notifyAuthStateChange('SIGNED_OUT', null);
            return { error: null };
        }
    };

    const mockDb = {
        from: (tableName: string) => ({
            select: (columns: string) => ({
                eq: (column: string, value: string) => ({
                    single: async () => {
                        if (tableName === 'user_data' && column === 'user_id') {
                            const data = await get(`user_data_${value}`);
                            if (data) {
                                return { data: { data }, error: null };
                            }
                            return { data: null, error: { message: 'No row found', code: 'PGRST116' } };
                        }
                        return { data: null, error: { message: 'Query not mocked' } };
                    }
                })
            }),
            upsert: async (records: any[]) => {
                 if (tableName === 'user_data' && Array.isArray(records) && records.length > 0) {
                    const record = records[0];
                    if (record.user_id) {
                        try {
                            await set(`user_data_${record.user_id}`, record.data);
                            return { error: null };
                        } catch (e: any) {
                             return { error: { message: e.message || 'Error writing to IndexedDB' } };
                        }
                    }
                 }
                 return { error: { message: 'Upsert not mocked or invalid data' } };
            },
            insert: async (records: any[]) => {
                 if (tableName === 'user_data' && Array.isArray(records) && records.length > 0) {
                     const record = records[0];
                     if (record.user_id) {
                         try {
                            await set(`user_data_${record.user_id}`, record.data);
                            return { error: null };
                         } catch (e: any) {
                             return { error: { message: e.message || 'Error writing to IndexedDB' } };
                         }
                     }
                 }
                 return { error: { message: 'Insert not mocked or invalid data' } };
            }
        })
    };

    return {
        auth: mockAuth,
        ...mockDb
    } as unknown as SupabaseClient<Database>;
};


const initializeSupabase = (): SupabaseClient<Database> => {
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const client = createClient<Database>(supabaseUrl, supabaseAnonKey);
       if (client.auth) {
        console.info("Supabase backend configured successfully.");
        return client;
      }
    } catch (error) {
      console.error("Error initializing Supabase client, falling back to mock:", error);
    }
  }
  
  // Intentionally removed the console.log message about falling back to the mock backend
  // to avoid confusion for the user, as this is the intended behavior in this environment.
  return createMockSupabase();
};

export const supabase = initializeSupabase();