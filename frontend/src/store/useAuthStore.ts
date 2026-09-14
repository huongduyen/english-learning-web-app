import { create } from 'zustand';
import { User, AuthResponse } from '../types/auth';
import { LoginFormValues, RegisterFormValues } from '../lib/validations/auth';
import {
  apiClient,
  getStoredAccessToken,
  getStoredRefreshToken,
  setStoredTokens,
  clearStoredTokens,
  refreshSessionTokens,
  ApiError,
} from '../lib/api-client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  login: (credentials: LoginFormValues) => Promise<void>;
  register: (payload: RegisterFormValues) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: getStoredAccessToken(),
  refreshToken: getStoredRefreshToken(),
  isAuthenticated: !!getStoredAccessToken(),
  isLoading: true,
  isRefreshing: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      setStoredTokens(response.accessToken, response.refreshToken);

      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Login failed';
      set({ isLoading: false, error: errorMessage });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        level: payload.level,
        targetLevel: payload.targetLevel || payload.level,
      });

      setStoredTokens(response.accessToken, response.refreshToken);

      set({
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Registration failed';
      set({ isLoading: false, error: errorMessage });
      throw err;
    }
  },

  refreshSession: async () => {
    set({ isRefreshing: true });
    try {
      const newAccessToken = await refreshSessionTokens();
      if (!newAccessToken) {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isRefreshing: false,
        });
        return false;
      }

      // Re-fetch current user profile with the new token
      const user = await apiClient.get<User>('/users/me');
      set({
        user,
        accessToken: newAccessToken,
        refreshToken: getStoredRefreshToken(),
        isAuthenticated: true,
        isRefreshing: false,
      });
      return true;
    } catch {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isRefreshing: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      if (get().accessToken) {
        await apiClient.post('/auth/logout', {});
      }
    } catch {
      // Ignore errors on logout endpoint
    } finally {
      clearStoredTokens();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  updateUser: (user: User) => {
    set({ user });
  },

  initAuth: async () => {
    const token = getStoredAccessToken();
    const refreshToken = getStoredRefreshToken();

    if (!token && !refreshToken) {
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await apiClient.get<User>('/users/me');
      set({
        user,
        accessToken: token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch {
      // apiClient will have attempted refresh if 401; if still failing, clear
      clearStoredTokens();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

// Listen for global session expiration dispatched by apiClient
if (typeof window !== 'undefined') {
  window.addEventListener('auth:session-expired', () => {
    useAuthStore.getState().logout();
  });
}
