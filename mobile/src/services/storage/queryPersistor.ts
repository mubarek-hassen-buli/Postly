import type {
  Persister,
  PersistedClient,
  PersistQueryClientOptions,
} from '@tanstack/react-query-persist-client';
import { sqliteStorage } from './sqliteStorage';

const CACHE_KEY = 'POSTLY_OFFLINE_CACHE';
const CACHE_BUSTER = 'v1';
export const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

let throttleTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingClient: PersistedClient | null = null;

async function flushPendingSave(): Promise<void> {
  if (!pendingClient) return;
  const toSave = pendingClient;
  pendingClient = null;
  try {
    const serialized = JSON.stringify(toSave);
    await sqliteStorage.setItem(CACHE_KEY, serialized);
  } catch (error) {
    console.warn('[queryPersistor] Error saving cache to SQLite:', error);
  }
}

/**
 * Native SQLite Persister implementing the TanStack Query Persister contract.
 * Automatically throttles write operations to save battery and flash storage.
 */
export const queryPersister: Persister = {
  persistClient(persistedClient: PersistedClient): void {
    pendingClient = persistedClient;
    if (throttleTimeout) return;

    throttleTimeout = setTimeout(() => {
      throttleTimeout = null;
      flushPendingSave();
    }, 1000);
  },

  async restoreClient(): Promise<PersistedClient | undefined> {
    try {
      const cacheString = await sqliteStorage.getItem(CACHE_KEY);
      if (!cacheString) return undefined;
      return JSON.parse(cacheString) as PersistedClient;
    } catch (error) {
      console.warn('[queryPersistor] Error restoring cache from SQLite:', error);
      return undefined;
    }
  },

  async removeClient(): Promise<void> {
    if (throttleTimeout) {
      clearTimeout(throttleTimeout);
      throttleTimeout = null;
    }
    pendingClient = null;
    try {
      await sqliteStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.warn('[queryPersistor] Error removing cache from SQLite:', error);
    }
  },
};

// Configure PersistQueryClientOptions with 7-day TTL and selective dehydration
export const queryPersistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: queryPersister,
  maxAge: CACHE_MAX_AGE_MS,
  buster: CACHE_BUSTER,
  dehydrateOptions: {
    // Only dehydrate successful queries to avoid persisting temporary error states
    shouldDehydrateQuery: (query) => {
      const isSuccess = query.state.status === 'success';
      const hasData = query.state.data !== undefined;
      return isSuccess && hasData;
    },
  },
};

// Auto-prune stale SQLite records beyond 7 days on startup
sqliteStorage.pruneExpired(CACHE_MAX_AGE_MS).catch((err) => {
  console.warn('[queryPersistor] Error running initial cache prune:', err);
});
