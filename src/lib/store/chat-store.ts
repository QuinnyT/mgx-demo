import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type {
  Conversation,
  Message,
  GeneratedProject,
  GeneratedProjectVersion,
} from '@/types';

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  projectVersions: Record<string, GeneratedProjectVersion[]>;
  loading: boolean;
  fetchConversations: () => Promise<void>;
  createConversation: (title: string) => Promise<Conversation>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, role?: 'user' | 'assistant') => Promise<void>;
  subscribeToMessages: (conversationId: string) => () => void;
  fetchProjectVersions: (conversationId: string) => Promise<void>;
  saveProjectVersion: (
    conversationId: string,
    project: GeneratedProject,
  ) => Promise<GeneratedProjectVersion>;
  updateProjectVersion: (
    versionId: string,
    conversationId: string,
    project: GeneratedProject,
  ) => Promise<GeneratedProjectVersion>;
  generateProject: (prompt: string) => Promise<GeneratedProjectVersion>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  projectVersions: {},
  loading: false,

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      set({ conversations: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ loading: false });
    }
  },

  createConversation: async (title: string) => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            user_id: user.id,
            title,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        conversations: [data, ...state.conversations],
        currentConversation: data,
        loading: false,
        projectVersions: {
          ...state.projectVersions,
          [data.id]: [],
        },
      }));

      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation, messages: [] });
    if (conversation) {
      get().fetchMessages(conversation.id);
    }
  },

  fetchMessages: async (conversationId: string) => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set({ messages: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ loading: false });
    }
  },

  sendMessage: async (content: string, role: 'user' | 'assistant' = 'user') => {
    const { currentConversation } = get();
    if (!currentConversation) throw new Error('No conversation selected');

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: currentConversation.id,
            user_id: user.id,
            content,
            role,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        messages: state.messages.some((message) => message.id === data.id)
          ? state.messages
          : [...state.messages, data],
        conversations: state.conversations.map((conversation) =>
          conversation.id === currentConversation.id
            ? { ...conversation, updated_at: data.created_at }
            : conversation,
        ),
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  subscribeToMessages: (conversationId: string) => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          set((state) => {
            const incoming = payload.new as Message;
            const alreadyExists = state.messages.some((message) => message.id === incoming.id);

            if (alreadyExists) {
              return state;
            }

            return {
              messages: [...state.messages, incoming],
              conversations: state.conversations.map((conversation) =>
                conversation.id === conversationId
                  ? { ...conversation, updated_at: incoming.created_at }
                  : conversation,
              ),
            };
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  fetchProjectVersions: async (conversationId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('project_versions')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set((state) => ({
        projectVersions: {
          ...state.projectVersions,
          [conversationId]: (data as GeneratedProjectVersion[]) ?? [],
        },
      }));
    } catch (error) {
      console.error('Error fetching project versions:', error);
      throw error;
    }
  },

  saveProjectVersion: async (conversationId: string, project: GeneratedProject) => {
    try {
      const supabase = createClient();
      const payload = {
        conversation_id: conversationId,
        summary: project.summary,
        files: project.files,
      };

      const { data, error } = await supabase
        .from('project_versions')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const version = data as GeneratedProjectVersion;

      set((state) => {
        const existing = state.projectVersions[conversationId] ?? [];
        return {
          projectVersions: {
            ...state.projectVersions,
            [conversationId]: [version, ...existing],
          },
        };
      });

      return version;
    } catch (error) {
      console.error('Error saving project version:', error);
      throw error;
    }
  },

  updateProjectVersion: async (versionId: string, conversationId: string, project: GeneratedProject) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('project_versions')
        .update({
          summary: project.summary,
          files: project.files,
        })
        .eq('id', versionId)
        .eq('conversation_id', conversationId)
        .select()
        .single();

      if (error) throw error;

      const version = data as GeneratedProjectVersion;

      set((state) => ({
        projectVersions: {
          ...state.projectVersions,
          [conversationId]: (state.projectVersions[conversationId] ?? []).map((existing) =>
            existing.id === versionId ? version : existing,
          ),
        },
      }));

      return version;
    } catch (error) {
      console.error('Error updating project version:', error);
      throw error;
    }
  },

  generateProject: async (prompt: string) => {
    const { currentConversation, saveProjectVersion } = get();
    if (!currentConversation) throw new Error('No conversation selected');

    const supabase = createClient();
    const response = await supabase.functions.invoke('generate-project', {
      body: { prompt },
    });
    console.log('generate-project response', response);
    const { data, error } = response;

    if (error) {
      try {
        const rawResponse = (error as { context?: { response?: Response } }).context?.response;
        if (rawResponse && !rawResponse.bodyUsed) {
          const text = await rawResponse.text();
          console.error('generate-project error body', text);
        }
      } catch (err) {
        console.error('Failed to read error response body', err);
      }
      throw error;
    }

    const project = data as GeneratedProject;
    const version = await saveProjectVersion(currentConversation.id, project);
    return version;
  },
}));

