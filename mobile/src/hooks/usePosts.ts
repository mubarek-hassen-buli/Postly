import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  postService,
  CreatePostPayload,
  PaginatedPostsResponse,
  PostItem,
  PostQueryParams,
  UpdatePostPayload,
} from '../services/posts/postService';
import { ANALYTICS_QUERY_KEY } from './useAnalytics';
import { DashboardAnalyticsData } from '../services/analytics/analyticsService';

export const POSTS_QUERY_KEY = ['posts'];

export function usePosts(params?: PostQueryParams) {
  return useQuery({
    queryKey: [...POSTS_QUERY_KEY, params],
    queryFn: () => postService.getPosts(params),
    placeholderData: (previousData) => previousData,
  });
}

export function usePost(id: string | null) {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => (id ? postService.getPost(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostPayload) => postService.createPost(payload),
    onSuccess: (newPost: PostItem) => {
      // Optimistically insert newly created post at the head of all cached feeds
      queryClient.setQueriesData<PaginatedPostsResponse>(
        { queryKey: POSTS_QUERY_KEY },
        (oldData) => {
          if (!oldData) return oldData;
          if (oldData.results.some((p) => p.id === newPost.id)) return oldData;
          return {
            ...oldData,
            count: oldData.count + 1,
            results: [newPost, ...oldData.results],
          };
        }
      );
      queryClient.setQueryData(['post', newPost.id], newPost);

      // Reconcile with server in background
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEY });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePostPayload }) =>
      postService.updatePost(id, payload),
    onSuccess: (updatedPost: PostItem) => {
      // Update matching post in all cached post lists
      queryClient.setQueriesData<PaginatedPostsResponse>(
        { queryKey: POSTS_QUERY_KEY },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            results: oldData.results.map((p) =>
              p.id === updatedPost.id ? updatedPost : p
            ),
          };
        }
      );
      queryClient.setQueryData(['post', updatedPost.id], updatedPost);

      // Reconcile with server in background
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEY });
    },
  });
}

export function usePublishPostNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.publishPostNow(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: POSTS_QUERY_KEY });

      const previousPostsQueries = queryClient.getQueriesData<PaginatedPostsResponse>({
        queryKey: POSTS_QUERY_KEY,
      });

      // Optimistically flip status to PUBLISHING
      queryClient.setQueriesData<PaginatedPostsResponse>(
        { queryKey: POSTS_QUERY_KEY },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            results: oldData.results.map((p) =>
              p.id === postId ? { ...p, status: 'PUBLISHING' as const } : p
            ),
          };
        }
      );

      return { previousPostsQueries };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousPostsQueries) {
        context.previousPostsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEY });
    },
  });
}

export function useCancelScheduledPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.cancelScheduledPost(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: POSTS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: ANALYTICS_QUERY_KEY });

      const previousPostsQueries = queryClient.getQueriesData<PaginatedPostsResponse>({
        queryKey: POSTS_QUERY_KEY,
      });
      const previousAnalyticsQueries = queryClient.getQueriesData<DashboardAnalyticsData>({
        queryKey: ANALYTICS_QUERY_KEY,
      });

      // Optimistically flip status to CANCELLED and clear scheduled_for
      queryClient.setQueriesData<PaginatedPostsResponse>(
        { queryKey: POSTS_QUERY_KEY },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            results: oldData.results.map((p) =>
              p.id === postId
                ? { ...p, status: 'CANCELLED' as const, scheduled_for: null }
                : p
            ),
          };
        }
      );

      // Optimistically decrement scheduled_queue_count
      queryClient.setQueriesData<DashboardAnalyticsData>(
        { queryKey: ANALYTICS_QUERY_KEY },
        (oldData) => {
          if (!oldData || !oldData.summary) return oldData;
          return {
            ...oldData,
            summary: {
              ...oldData.summary,
              scheduled_queue_count: Math.max(0, oldData.summary.scheduled_queue_count - 1),
            },
          };
        }
      );

      return { previousPostsQueries, previousAnalyticsQueries };
    },
    onError: (_err, _postId, context) => {
      if (context?.previousPostsQueries) {
        context.previousPostsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousAnalyticsQueries) {
        context.previousAnalyticsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEY });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onMutate: async (postId: string) => {
      // 1. Cancel active outgoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: POSTS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: ANALYTICS_QUERY_KEY });

      // 2. Snapshot previous cache states
      const previousPostsQueries = queryClient.getQueriesData<PaginatedPostsResponse>({
        queryKey: POSTS_QUERY_KEY,
      });
      const previousAnalyticsQueries = queryClient.getQueriesData<DashboardAnalyticsData>({
        queryKey: ANALYTICS_QUERY_KEY,
      });

      // Find status of deleted post for analytics adjustment
      let deletedPostStatus: string | undefined;
      for (const [, queryData] of previousPostsQueries) {
        const found = queryData?.results?.find((p) => p.id === postId);
        if (found) {
          deletedPostStatus = found.status;
          break;
        }
      }

      // 3. Optimistically remove post from all post queries immediately
      queryClient.setQueriesData<PaginatedPostsResponse>(
        { queryKey: POSTS_QUERY_KEY },
        (oldData) => {
          if (!oldData) return oldData;
          const filtered = oldData.results.filter((p) => p.id !== postId);
          const removedCount = oldData.results.length - filtered.length;
          return {
            ...oldData,
            count: Math.max(0, oldData.count - removedCount),
            results: filtered,
          };
        }
      );

      // 4. Optimistically update analytics counters
      queryClient.setQueriesData<DashboardAnalyticsData>(
        { queryKey: ANALYTICS_QUERY_KEY },
        (oldAnalytics) => {
          if (!oldAnalytics || !oldAnalytics.summary) return oldAnalytics;
          const summary = { ...oldAnalytics.summary };
          summary.total_broadcasts = Math.max(0, summary.total_broadcasts - 1);
          if (deletedPostStatus === 'PUBLISHED') {
            summary.published_count = Math.max(0, summary.published_count - 1);
          } else if (deletedPostStatus === 'SCHEDULED') {
            summary.scheduled_queue_count = Math.max(0, summary.scheduled_queue_count - 1);
          } else if (deletedPostStatus === 'FAILED') {
            summary.failed_count = Math.max(0, summary.failed_count - 1);
          } else if (deletedPostStatus === 'DRAFT') {
            summary.draft_count = Math.max(0, summary.draft_count - 1);
          }
          return {
            ...oldAnalytics,
            summary,
          };
        }
      );

      return { previousPostsQueries, previousAnalyticsQueries };
    },
    onError: (_err, _postId, context) => {
      // Rollback to prior snapshot if mutation fails
      if (context?.previousPostsQueries) {
        context.previousPostsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousAnalyticsQueries) {
        context.previousAnalyticsQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Reconcile with ground-truth backend state in background
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEY });
    },
  });
}
