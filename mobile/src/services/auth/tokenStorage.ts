import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'postly_auth_token';
const USER_KEY = 'postly_user_data';

export const tokenStorage = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to read auth token from secure storage:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    } catch (error) {
      console.error('Failed to write auth token to secure storage:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.warn('Failed to delete auth token from secure storage:', error);
    }
  },

  async getUserData<T>(): Promise<T | null> {
    try {
      let raw: string | null = null;
      if (Platform.OS === 'web') {
        raw = typeof localStorage !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
      } else {
        raw = await SecureStore.getItemAsync(USER_KEY);
      }
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Failed to read user data from secure storage:', error);
      return null;
    }
  },

  async setUserData<T>(data: T): Promise<void> {
    try {
      const raw = JSON.stringify(data);
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.setItem(USER_KEY, raw);
        return;
      }
      await SecureStore.setItemAsync(USER_KEY, raw, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    } catch (error) {
      console.error('Failed to write user data to secure storage:', error);
    }
  },

  async removeUserData(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') localStorage.removeItem(USER_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
      console.warn('Failed to delete user data from secure storage:', error);
    }
  },

  async clearAll(): Promise<void> {
    await this.removeToken();
    await this.removeUserData();
  },
};
