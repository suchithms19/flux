import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL;

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (loginType = 'normal') => {
    try {
      // Store login type in localStorage
      localStorage.setItem('loginType', loginType);
      window.location.href = `${API_URL}/auth/google`;
    } catch (error) {
      set({ error: error.message });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      
      // Clear all stored data first
      localStorage.removeItem('user');
      localStorage.removeItem('loginType');
      localStorage.removeItem('mentorSignUpFlow');
      set({ user: null });

      // Then logout from server
      await axios.get(`${API_URL}/auth/logout`, { 
        withCredentials: true 
      });
      
      set({ isLoading: false });
      
      // Finally redirect
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      set({ error: error.message, isLoading: false });
      // Still redirect on error
      window.location.href = '/';
    }
  },

  getCurrentUser: async () => {
    if (get().isLoading || get().user) {
      return get().user;
    }

    try {
      set({ isLoading: true });
      const { data } = await axios.get(`${API_URL}/auth/current-user`, {
        withCredentials: true
      });
      
      // Check loginType and handle mentor routing
      const loginType = localStorage.getItem('loginType');
      if (loginType === 'mentor') {
        if (data.role === 'mentor' && data.mentorStatus === 'approved') {
          window.location.href = '/mentor/dashboard';
        } else if (data.mentorStatus === 'pending') {
          window.location.href = '/mentor/inreview';
        } else if (data.mentorStatus === 'not_applied') {
          window.location.href = '/mentor/onboard';
        }
        localStorage.removeItem('loginType');
      }

      set({ user: data, isLoading: false, error: null });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false, user: null });
      return null;
    }
  },
}));

export default useAuthStore; 