import { useState, useEffect } from 'react';
import { onlineManager } from '@tanstack/react-query';

/**
 * Hook to subscribe to TanStack Query's global network online/offline status.
 * Returns true if online, false if offline.
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => onlineManager.isOnline());

  useEffect(() => {
    return onlineManager.subscribe((online) => {
      setIsOnline(online);
    });
  }, []);

  return isOnline;
}
