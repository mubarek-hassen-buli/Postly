import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  postService,
  CreatePostPayload,
  PostQueryParams,
} from '../services/posts/postService';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function usePublishPostNow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.publishPostNow(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useCancelScheduledPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.cancelScheduledPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
