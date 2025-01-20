import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL;

const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  lastBalanceUpdate: 0, // Track last balance update time

  login: async (loginType = 'normal') => {
    try {
      // Store login type in localStorage
      localStorage.setItem('loginType', loginType);
      // Store current path before redirect if not already set
      if (loginType === 'normal' && !localStorage.getItem('redirectAfterLogin')) {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      window.location.href = `${API_URL}/auth/google${loginType === 'mentor' ? '?type=mentor' : ''}`;
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
      set({ isLoading: true, error: null });
      const response = await axios.get(`${API_URL}/auth/current-user`, {
        withCredentials: true
      });
      
      // Store user data
      set({ user: response.data, isLoading: false });

      // Check loginType and handle routing
      const loginType = localStorage.getItem('loginType');
      
      // Handle mentor routing
      if (loginType === 'mentor') {
        localStorage.removeItem('loginType');
        if (response.data.role === 'mentor') {
          if (response.data.mentorStatus === 'approved') {
            return { ...response.data, redirect: '/mentor' };
          } else if (response.data.mentorStatus === 'pending') {
            return { ...response.data, redirect: '/mentor/inreview' };
          }
        }
        return { ...response.data, redirect: '/mentor/onboard' };
      }
      
      // Handle normal user routing
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        return { ...response.data, redirect: redirectPath };
      }
      
      // Default redirect for normal users
      return { ...response.data, redirect: '/browse' };
    } catch (error) {
      set({ error: error.message, isLoading: false, user: null });
      return { redirect: '/login' };
    }
  },

  updateBalance: async () => {
    try {
      // Get current state
      const state = useAuthStore.getState();
      const now = Date.now();

      // Only update if more than 5 seconds have passed since last update
      if (now - state.lastBalanceUpdate < 5000) {
        return;
      }

      const response = await axios.get(`${API_URL}/payments/wallet-balance`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        set(state => ({
          user: state.user ? { ...state.user, balance: response.data.balance } : null,
          lastBalanceUpdate: now
        }));
      }
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  },
}));

export default useAuthStore; 