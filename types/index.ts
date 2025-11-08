// User types
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Project types
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

// Conversation types
export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Message types
export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface CreateMessageInput {
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
}

// Auth types
export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}