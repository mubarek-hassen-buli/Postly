import { apiClient } from '../api/client';
import { UserProfile } from '../../store/useAuthStore';

export interface SendCodeResponse {
  phone_code_hash: string;
  phone_number: string;
  is_code_via_app: boolean;
  message: string;
}

export interface VerifyCodeResponse {
  status?: 'AUTHENTICATED' | 'PENDING_PASSWORD';
  auth_state?: 'AUTHENTICATED' | 'PENDING_PASSWORD' | 'PENDING_CODE' | 'UNAUTHENTICATED';
  requires_password?: boolean;
  message: string;
  token?: string;
  user?: UserProfile;
  telegram_user?: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
}

export interface VerifyPasswordResponse {
  message: string;
  token: string;
  user: UserProfile;
  telegram_user?: {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
}

export const authService = {
  async sendCode(phoneNumber: string): Promise<SendCodeResponse> {
    const response = await apiClient.post<SendCodeResponse>('/auth/telegram/send-code/', {
      phone_number: phoneNumber.trim(),
    });
    return response.data;
  },

  async verifyCode(phoneNumber: string, phoneCodeHash: string, code: string): Promise<VerifyCodeResponse> {
    const response = await apiClient.post<VerifyCodeResponse>('/auth/telegram/verify-code/', {
      phone_number: phoneNumber.trim(),
      phone_code_hash: phoneCodeHash,
      code: code.trim(),
    });
    return response.data;
  },

  async verifyPassword(password: string, phoneNumber?: string): Promise<VerifyPasswordResponse> {
    const payload: { password: string; phone_number?: string } = { password };
    if (phoneNumber) {
      payload.phone_number = phoneNumber.trim();
    }
    const response = await apiClient.post<VerifyPasswordResponse>('/auth/telegram/verify-password/', payload);
    return response.data;
  },

  async disconnectTelegram(): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/telegram/disconnect/');
    return response.data;
  },

  async getMe(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/auth/me/');
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout/');
  },
};
