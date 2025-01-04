import { create } from 'zustand';
import axios from 'axios';

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async () => {
    try {
      window.location.href = 'http://localhost:3000/api/auth/google';
    } catch (error) {
      set({ error: error.message });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await axios.get('http://localhost:3000/api/auth/logout', { 
        withCredentials: true 
      });
      set({ user: null, isLoading: false });
      // Clear any stored data
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      set({ error: error.message, isLoading: false });
      // Still clear user data and redirect even if there's an error
      set({ user: null });
      window.location.href = '/login';
    }
  },

  getCurrentUser: async () => {
    if (get().isLoading || get().user) {
      return get().user;
    }

    try {
      set({ isLoading: true });
      const { data } = await axios.get('http://localhost:3000/api/auth/current-user', {
        withCredentials: true
      });
      set({ user: data, isLoading: false, error: null });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false, user: null });
      return null;
    }
  },
}));

export default useAuthStore; 