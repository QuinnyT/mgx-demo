import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: { username?: string }) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const supabase = createClient();
    
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, initialized: true });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
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
      set({ user: data.user });
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, metadata?: { username?: string }) => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      set({ user: data.user });
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      const supabase = createClient();
      
      // 使用 Supabase 默认的回调 URL
      // 不指定 redirectTo，让 Supabase 使用项目配置的 Site URL
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // 移除自定义 redirectTo，使用 Supabase Dashboard 中配置的 Site URL
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
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
      set({ user: null });
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setUser: (user: User | null) => set({ user }),
}));