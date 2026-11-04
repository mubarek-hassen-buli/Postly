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

function normalizePostItem(post: any): PostItem {
  if (!post || typeof post !== 'object') return post;
  const resolvedContent = post.text_content ?? post.content ?? '';
  return {
    ...post,
    content: resolvedContent,
    text_content: resolvedContent,
  };
}

export const postService = {
  async getPosts(params?: PostQueryParams): Promise<PaginatedPostsResponse> {
    const response = await apiClient.get<any>('/posts/', { params });
    if (Array.isArray(response.data)) {
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data.map(normalizePostItem),
      };
    }
    const rawResults = response.data?.results || [];
    return {
      count: response.data?.count ?? rawResults.length,
      next: response.data?.next || null,
      previous: response.data?.previous || null,
      results: rawResults.map(normalizePostItem),
    };
  },

  async getPost(id: string): Promise<PostItem> {
    const response = await apiClient.get<any>(`/posts/${id}/`);
    return normalizePostItem(response.data);
  },

  async createPost(payload: CreatePostPayload): Promise<PostItem> {
    const response = await apiClient.post<any>('/posts/', payload);
    return normalizePostItem(response.data);
  },

  async updatePost(id: string, payload: UpdatePostPayload): Promise<PostItem> {
    const response = await apiClient.patch<any>(`/posts/${id}/`, payload);
    return normalizePostItem(response.data);
  },

  async publishPostNow(id: string): Promise<{ message: string; post: PostItem; result: any }> {
    const response = await apiClient.post<{ message: string; post: any; result: any }>(
      `/posts/${id}/publish-now/`
    );
    return {
      ...response.data,
      post: normalizePostItem(response.data?.post),
    };
  },

  async cancelScheduledPost(id: string): Promise<{ message: string; post: PostItem }> {
    const response = await apiClient.post<{ message: string; post: any }>(
      `/posts/${id}/cancel-schedule/`
    );
    return {
      ...response.data,
      post: normalizePostItem(response.data?.post),
    };
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}/`);
  },
};
