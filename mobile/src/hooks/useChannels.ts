import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  channelService,
  ChannelItem,
  ChannelQueryParams,
  PaginatedChannelsResponse,
} from '../services/channels/channelService';

export const CHANNELS_QUERY_KEY = ['channels'];

export function useChannels(params?: ChannelQueryParams) {
  return useQuery({
    queryKey: [...CHANNELS_QUERY_KEY, params],
    queryFn: () => channelService.getChannels(params),
  });
}

export function useSyncChannels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => channelService.syncChannels(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEY });
    },
  });
}

export function useToggleChannelSelection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => channelService.toggleChannelSelection(channelId),
    onMutate: async (channelId: string) => {
      // Cancel ongoing queries to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: CHANNELS_QUERY_KEY });

      // Snapshot previous cache states
      const previousQueries = queryClient.getQueriesData<PaginatedChannelsResponse>({
        queryKey: CHANNELS_QUERY_KEY,
      });

      // Optimistically update all matching channel queries
      queryClient.setQueriesData<PaginatedChannelsResponse>(
        { queryKey: CHANNELS_QUERY_KEY },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            results: oldData.results.map((ch) =>
              ch.id === channelId ? { ...ch, is_selected_by_user: !ch.is_selected_by_user } : ch
            ),
          };
        }
      );

      return { previousQueries };
    },
    onError: (_err, _channelId, context) => {
      // Rollback on failure
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CHANNELS_QUERY_KEY });
    },
  });
}

export function useChannelStats(channelId: string | null) {
  return useQuery({
    queryKey: ['channel_stats', channelId],
    queryFn: () => (channelId ? channelService.getChannelStats(channelId) : Promise.reject('No ID')),
    enabled: Boolean(channelId),
  });
}
