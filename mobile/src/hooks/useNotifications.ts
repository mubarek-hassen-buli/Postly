import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  notificationService,
  PaginatedNotificationsResponse,
} from '../services/notifications/notificationService';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export function useNotifications(unreadOnly?: boolean) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, { unread_only: unreadOnly }],
    queryFn: () => notificationService.getNotifications({ unread_only: unreadOnly }),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useUnreadNotificationsCount() {
  const { data } = useNotifications(true);
  return data?.count ?? data?.results.length ?? 0;
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds?: string[]) =>
      notificationService.markNotificationsRead(notificationIds),
    onMutate: async (notificationIds) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      // Optimistically update notifications to read
      queryClient.setQueriesData<PaginatedNotificationsResponse>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            results: oldData.results.map((n) =>
              !notificationIds || notificationIds.includes(n.id) ? { ...n, is_read: true } : n
            ),
          };
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
}
