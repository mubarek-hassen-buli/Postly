import { apiClient } from '../api/client';

export interface NotificationLogItem {
  id: string;
  title: string;
  body: string;
  event_type: 'POST_PUBLISHED' | 'POST_FAILED' | 'SESSION_REVOKED' | 'SYSTEM_ALERT';
  data: Record<string, any>;
  is_read: boolean;
  delivered: boolean;
  created_at: string;
}

export interface PaginatedNotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NotificationLogItem[];
}

export interface DeviceItem {
  id: string;
  expo_push_token: string;
  device_type: 'IOS' | 'ANDROID' | 'WEB' | 'OTHER';
  device_name: string;
  is_active: boolean;
  last_seen_at: string;
  created_at: string;
}

export const notificationService = {
  async registerDevice(
    expoPushToken: string,
    deviceType?: 'IOS' | 'ANDROID' | 'WEB' | 'OTHER',
    deviceName?: string
  ): Promise<DeviceItem> {
    const response = await apiClient.post<DeviceItem>('/notifications/devices/', {
      expo_push_token: expoPushToken.trim(),
      device_type: deviceType || 'OTHER',
      device_name: deviceName || '',
    });
    return response.data;
  },

  async unregisterDevice(expoPushToken: string): Promise<{ message: string; deactivated: boolean }> {
    const response = await apiClient.post<{ message: string; deactivated: boolean }>(
      '/notifications/devices/unregister/',
      { expo_push_token: expoPushToken.trim() }
    );
    return response.data;
  },

  async getNotifications(params?: { unread_only?: boolean; page?: number }): Promise<PaginatedNotificationsResponse> {
    const response = await apiClient.get<PaginatedNotificationsResponse>('/notifications/', {
      params,
    });
    return response.data;
  },

  async markNotificationsRead(notificationIds?: string[]): Promise<{ message: string; updated_count: number }> {
    const response = await apiClient.post<{ message: string; updated_count: number }>(
      '/notifications/mark-read/',
      { notification_ids: notificationIds || [] }
    );
    return response.data;
  },
};
