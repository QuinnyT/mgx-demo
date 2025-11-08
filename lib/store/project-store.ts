import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (data: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectInput) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ projects: data || [], loading: false });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ loading: false });
    }
  },

  createProject: async (projectData: CreateProjectInput) => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            user_id: user.id,
            name: projectData.name,
            description: projectData.description || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        projects: [data, ...state.projects],
        loading: false,
      }));

      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateProject: async (id: string, projectData: UpdateProjectInput) => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('projects')
        .update({
          ...projectData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Refresh projects list
      await get().fetchProjects();
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ loading: true });
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },
}));