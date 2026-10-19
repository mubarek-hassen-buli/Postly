import { create } from 'zustand';
import { tokenStorage } from '../services/auth/tokenStorage';
import { sqliteStorage } from '../services/storage/sqliteStorage';
import { apiClient } from '../services/api/client';
import { queryClient } from '../services/api/queryClient';

export interface TelegramSessionInfo {
  telegram_user_id: number | null;
  username: string | null;
  phone_number: string;
  auth_state: 'IDLE' | 'PENDING_CODE' | 'PENDING_PASSWORD' | 'AUTHENTICATED' | 'REVOKED' | 'FAILED';
  has_active_session: boolean;
}

export interface UserProfile {
  id: string;
  phone_number: string;
  username?: string | null;
  first_name?: string;
  last_name?: string;
  avatar_url?: string | null;
  telegram_session?: TelegramSessionInfo | null;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  login: (token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  checkAuthStatus: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,

  login: async (token: string, user: UserProfile) => {
    await tokenStorage.setToken(token);
    await tokenStorage.setUserData(user);
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      const token = get().token;
      if (token) {
        // Fire-and-forget API logout
        apiClient.post('/auth/logout/').catch(() => {});
      }
    } finally {
      await tokenStorage.clearAll();
      await sqliteStorage.clear();
      queryClient.clear();
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: UserProfile) => {
    tokenStorage.setUserData(user);
    set({ user });
  },

  checkAuthStatus: async () => {
    set({ isLoading: true });
    try {
      const token = await tokenStorage.getToken();
      if (!token) {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
        return false;
      }

      // Pre-read cached user data for immediate offline availability
      const cachedUser = await tokenStorage.getUserData<UserProfile>();

      try {
        // Validate token with backend /api/v1/auth/me/
        const response = await apiClient.get<UserProfile>('/auth/me/');
        const freshUser = response.data;
        await tokenStorage.setUserData(freshUser);

        set({
          token,
          user: freshUser,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
        return true;
      } catch (error: unknown) {
        const isAuthError = (error as { statusCode?: number })?.statusCode === 401;
        if (isAuthError) {
          console.warn('Auth token rejected with 401. Logging out.');
          await tokenStorage.clearAll();
          await sqliteStorage.clear();
          queryClient.clear();
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
          return false;
        }

        // Network or offline error: keep user authenticated using cached profile
        console.warn('Backend /auth/me/ unreachable. Maintaining session in offline mode.');
        set({
          token,
          user: cachedUser,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
        return true;
      }
    } catch (error) {
      console.warn('Unexpected error in checkAuthStatus:', error);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      return false;
    }
  },
}));
