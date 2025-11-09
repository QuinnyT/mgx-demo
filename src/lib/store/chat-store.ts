import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Conversation, Message } from '@/types';

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  fetchConversations: () => Promise<void>;
  createConversation: (title: string) => Promise<Conversation>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, role?: 'user' | 'assistant') => Promise<void>;
  subscribeToMessages: (conversationId: string) => () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
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
            : conversation
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
                  : conversation
              ),
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));

