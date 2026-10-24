import { apiClient } from '../api/client';

export interface PostChannelTargetItem {
  id: string;
  channel_id?: string;
  channel_title?: string;
  channel_username?: string;
  telegram_channel_id?: number;
  channel?: {
    id: string;
    telegram_channel_id: number;
    title: string;
    username?: string | null;
  };
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  telegram_message_id?: number | null;
  sent_at?: string | null;
  error_message?: string | null;
}

export interface PostMediaAttachmentItem {
  id?: string;
  media_url: string;
  media_type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  file_size?: number;
  order?: number;
}

export interface PostItem {
  id: string;
  content: string;
  text_content?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';
  formatting_mode: 'HTML' | 'MARKDOWN' | 'PLAIN';
  pin_message: boolean;
  scheduled_for?: string | null;
  published_at?: string | null;
  post_to_linkedin?: boolean;
  linkedin_post_urn?: string | null;
  error_summary?: string | null;
  targets: PostChannelTargetItem[];
  media_attachments: PostMediaAttachmentItem[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedPostsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PostItem[];
}

export interface CreatePostPayload {
  content?: string;
  text_content?: string;
  channel_ids?: string[];
  target_channel_ids?: string[];
  post_to_linkedin?: boolean;
  formatting_mode?: 'HTML' | 'MARKDOWN' | 'PLAIN';
  pin_message?: boolean;
  scheduled_for?: string | null;
  publish_now?: boolean;
  media_attachments?: Array<{
    media_url: string;
    media_type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    file_size?: number;
    order?: number;
  }>;
}

export interface UpdatePostPayload {
  content?: string;
  text_content?: string;
  channel_ids?: string[];
  target_channel_ids?: string[];
  post_to_linkedin?: boolean;
  formatting_mode?: 'HTML' | 'MARKDOWN' | 'PLAIN';
  silent?: boolean;
  disable_web_page_preview?: boolean;
  pin_message?: boolean;
  scheduled_for?: string | null;
  media_attachments?: Array<{
    media_url: string;
    media_type: 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    file_name?: string;
    file_size?: number;
    order?: number;
  }>;
}

export interface PostQueryParams {
  status?: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';
  channel_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export const postService = {
  async getPosts(params?: PostQueryParams): Promise<PaginatedPostsResponse> {
    const response = await apiClient.get<any>('/posts/', { params });
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

  async getPost(id: string): Promise<PostItem> {
    const response = await apiClient.get<PostItem>(`/posts/${id}/`);
    return response.data;
  },

  async createPost(payload: CreatePostPayload): Promise<PostItem> {
    const response = await apiClient.post<PostItem>('/posts/', payload);
    return response.data;
  },

  async updatePost(id: string, payload: UpdatePostPayload): Promise<PostItem> {
    const response = await apiClient.patch<PostItem>(`/posts/${id}/`, payload);
    return response.data;
  },

  async publishPostNow(id: string): Promise<{ message: string; post: PostItem; result: any }> {
    const response = await apiClient.post<{ message: string; post: PostItem; result: any }>(
      `/posts/${id}/publish-now/`
    );
    return response.data;
  },

  async cancelScheduledPost(id: string): Promise<{ message: string; post: PostItem }> {
    const response = await apiClient.post<{ message: string; post: PostItem }>(
      `/posts/${id}/cancel-schedule/`
    );
    return response.data;
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}/`);
  },
};
