import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export interface IKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  pruneExpired(maxAgeMs: number): Promise<void>;
}

const DB_NAME = 'postly_cache.db';
const TABLE_NAME = 'app_cache';

let dbInstance: SQLite.SQLiteDatabase | null = null;
const memoryStore = new Map<string, string>();

function getDatabase(): SQLite.SQLiteDatabase | null {
  if (Platform.OS === 'web') {
    return null;
  }
  if (!dbInstance) {
    try {
      dbInstance = SQLite.openDatabaseSync(DB_NAME);
      dbInstance.execSync(`
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_cache_updated ON ${TABLE_NAME}(updated_at);
      `);
    } catch (error) {
      console.warn('[sqliteStorage] Failed to initialize SQLite database. Falling back to memory:', error);
      dbInstance = null;
    }
  }
  return dbInstance;
}

export const sqliteStorage: IKeyValueStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
        return memoryStore.get(key) ?? null;
      }

      const db = getDatabase();
      if (!db) {
        return memoryStore.get(key) ?? null;
      }

      const row = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM ${TABLE_NAME} WHERE key = ?`,
        [key]
      );
      return row ? row.value : null;
    } catch (error) {
      console.warn(`[sqliteStorage] Error getting item "${key}":`, error);
      return memoryStore.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        } else {
          memoryStore.set(key, value);
        }
        return;
      }

      const db = getDatabase();
      if (!db) {
        memoryStore.set(key, value);
        return;
      }

      const now = Date.now();
      await db.runAsync(
        `INSERT INTO ${TABLE_NAME} (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
        [key, value, now]
      );
    } catch (error) {
      console.warn(`[sqliteStorage] Error setting item "${key}":`, error);
      memoryStore.set(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        } else {
          memoryStore.delete(key);
        }
        return;
      }

      const db = getDatabase();
      if (!db) {
        memoryStore.delete(key);
        return;
      }

      await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE key = ?`, [key]);
    } catch (error) {
      console.warn(`[sqliteStorage] Error removing item "${key}":`, error);
      memoryStore.delete(key);
    }
  },

  async clear(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
        memoryStore.clear();
        return;
      }

      const db = getDatabase();
      if (!db) {
        memoryStore.clear();
        return;
      }

      await db.runAsync(`DELETE FROM ${TABLE_NAME}`);
      memoryStore.clear();
    } catch (error) {
      console.warn('[sqliteStorage] Error clearing cache table:', error);
      memoryStore.clear();
    }
  },

  async pruneExpired(maxAgeMs: number): Promise<void> {
    try {
      if (Platform.OS === 'web') return;
      const db = getDatabase();
      if (!db) return;

      const threshold = Date.now() - maxAgeMs;
      await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE updated_at < ?`, [threshold]);
    } catch (error) {
      console.warn('[sqliteStorage] Error pruning expired records:', error);
    }
  },
};
