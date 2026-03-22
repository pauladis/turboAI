import { create } from 'zustand';
import { authAPI } from './api';

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  note_count: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category: number | null;
  category_name?: string;
  category_color?: string;
  created_at: string;
  last_edited: string;
}

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, password2: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      
      const userResponse = await authAPI.getMe();
      set({ user: userResponse.data, loading: false });
    } catch (error: any) {
      // Don't set error in store - let the page handle it
      // Just re-throw so the page can extract the detailed error
      set({ loading: false });
      throw error;
    }
  },

  register: async (email: string, username: string, password: string, password2: string) => {
    set({ loading: true, error: null });
    try {
      await authAPI.register({ email, username, password, password2 });
      set({ loading: false });
    } catch (error: any) {
      // Don't set error in store - let the page handle it
      // Just re-throw so the page can extract the detailed error
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null });
  },

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    try {
      const response = await authAPI.getMe();
      set({ user: response.data });
    } catch (error) {
      set({ user: null });
    }
  },
}));

interface NotesStore {
  notes: Note[];
  categories: Category[];
  selectedCategory: number | null;
  loading: boolean;
  fetchNotes: (categoryId?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createDefaults: () => Promise<void>;
  setSelectedCategory: (id: number | null) => void;
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  notes: [],
  categories: [],
  selectedCategory: null,
  loading: false,

  fetchNotes: async (categoryId?: number) => {
    set({ loading: true });
    // Will be implemented in components
  },

  fetchCategories: async () => {
    // Will be implemented in components
  },

  createDefaults: async () => {
    // Will be implemented in components
  },

  setSelectedCategory: (id) => set({ selectedCategory: id }),
}));
