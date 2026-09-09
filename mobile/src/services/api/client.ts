import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { tokenStorage } from '../auth/tokenStorage';

const getFallbackApiUrl = (): string => {
  // Dynamically extract development host IP from Expo bundler
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:8000/api/v1`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || getFallbackApiUrl();

export interface ApiErrorContract {
  code: string;
  message: string;
  details?: unknown;
}

export class NormalizedApiError extends Error {
  code: string;
  statusCode?: number;
  details?: unknown;

  constructor(message: string, code = 'UNKNOWN_ERROR', statusCode?: number, details?: unknown) {
    super(message);
    this.name = 'NormalizedApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Knox Bearer Token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize Errors and handle 401s
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as { error?: ApiErrorContract; message?: string; detail?: string } | undefined;

    // Handle core Postly Knox session expiration (do not wipe for external integration errors)
    const isIntegrationRoute = error.config?.url?.includes('/integrations/');
    if (status === 401 && !isIntegrationRoute) {
      await tokenStorage.clearAll();
    }

    const message = data?.error?.message || data?.message || data?.detail || error.message || 'Network request failed';
    const code = data?.error?.code || (status === 401 ? 'UNAUTHORIZED' : 'NETWORK_ERROR');
    const details = data?.error?.details || data;

    return Promise.reject(new NormalizedApiError(message, code, status, details));
  }
);
