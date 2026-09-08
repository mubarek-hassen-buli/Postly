import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { linkedinService, LinkedInStatusResponse } from '../services/integrations/linkedinService';

export const LINKEDIN_QUERY_KEY = ['integrations', 'linkedin'];

export function useLinkedInStatus() {
  return useQuery<LinkedInStatusResponse>({
    queryKey: LINKEDIN_QUERY_KEY,
    queryFn: () => linkedinService.getStatus(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useConnectLinkedIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => linkedinService.connectLinkedIn(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LINKEDIN_QUERY_KEY });
    },
  });
}

export function useDisconnectLinkedIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => linkedinService.disconnect(),
    onSuccess: () => {
      queryClient.setQueryData<LinkedInStatusResponse>(LINKEDIN_QUERY_KEY, {
        is_connected: false,
        account: null,
      });
      queryClient.invalidateQueries({ queryKey: LINKEDIN_QUERY_KEY });
    },
  });
}

export function usePublishLinkedInPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => linkedinService.publishPost(text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
