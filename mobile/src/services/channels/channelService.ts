import { apiClient } from '../api/client';

export interface ChannelItem {
  id: string;
  telegram_channel_id: number;
  title: string;
  username?: string | null;
  about?: string;
  photo_url?: string | null;
  member_count: number;
  is_creator: boolean;
  can_post_messages: boolean;
  can_edit_messages: boolean;
  can_delete_messages: boolean;
  can_pin_messages: boolean;
  is_broadcast: boolean;
  is_selected_by_user: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedChannelsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChannelItem[];
}

export interface ChannelStatsResponse {
  channel_id: string;
  telegram_channel_id: number;
  title: string;
  username?: string | null;
  member_count: number;
  can_post_messages: boolean;
  total_posts_targeted: number;
  successful_posts: number;
  failed_posts: number;
  pending_posts: number;
  last_published_at: string | null;
}

export interface ChannelQueryParams {
  selected_only?: boolean;
  can_post_only?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export const channelService = {
  async getChannels(params?: ChannelQueryParams): Promise<PaginatedChannelsResponse> {
    const response = await apiClient.get<any>('/channels/', {
      params,
    });
    if (Array.isArray(response.data)) {
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data,
      };
    }
    return {
      count: response.data?.count ?? (response.data?.results?.length || 0),
      next: response.data?.next || null,
      previous: response.data?.previous || null,
      results: response.data?.results || [],
    };
  },

  async syncChannels(): Promise<{ message: string; count: number }> {
    const response = await apiClient.post<any>('/channels/sync/');
    return {
      message: response.data?.message || 'Channels synchronized',
      count: response.data?.synced_count ?? response.data?.count ?? 0,
    };
  },

  async getChannel(id: string): Promise<ChannelItem> {
    const response = await apiClient.get<ChannelItem>(`/channels/${id}/`);
    return response.data;
  },

  async toggleChannelSelection(id: string): Promise<{ id: string; is_selected_by_user: boolean; message: string }> {
    const response = await apiClient.patch<{ id: string; is_selected_by_user: boolean; message: string }>(
      `/channels/${id}/toggle-selection/`
    );
    return response.data;
  },

  async getChannelStats(id: string): Promise<ChannelStatsResponse> {
    const response = await apiClient.get<ChannelStatsResponse>(`/channels/${id}/stats/`);
    return response.data;
  },
};
