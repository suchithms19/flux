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
      // Store current path before redirect if not already set
      if (loginType === 'normal' && !localStorage.getItem('redirectAfterLogin')) {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
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
      localStorage.removeItem('redirectAfterLogin');
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
      
      // Store user data
      set({ user: data, isLoading: false, error: null });

      // Check loginType and handle routing
      const loginType = localStorage.getItem('loginType');
      
      // Handle mentor routing
      if (loginType === 'mentor') {
        localStorage.removeItem('loginType');
        if (data.role === 'mentor') {
          if (data.mentorStatus === 'approved') {
            return { ...data, redirect: '/mentor/dashboard' };
          } else if (data.mentorStatus === 'pending') {
            return { ...data, redirect: '/mentor/inreview' };
          }
        }
        return { ...data, redirect: '/mentor/onboard' };
      }
      
      // Handle normal user routing
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        return { ...data, redirect: redirectPath };
      }
      
      // Default redirect for normal users
      return { ...data, redirect: '/browse' };
    } catch (error) {
      set({ error: error.message, isLoading: false, user: null });
      return { redirect: '/login' };
    }
  },
}));

export default useAuthStore; 