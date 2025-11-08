import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const supabase = createClient();
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    
    set({
      user: session?.user as User | null,
      session,
      initialized: true,
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        user: session?.user as User | null,
        session,
      });
    });
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user as User,
        session: data.session,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      set({
        user: data.user as User,
        session: data.session,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));