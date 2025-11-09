export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface GeneratedFile {
  name: string;
  language?: string;
  content: string;
}

export interface GeneratedProject {
  summary: string;
  files: GeneratedFile[];
}

export interface CreateMessageInput {
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
}

import type { Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

