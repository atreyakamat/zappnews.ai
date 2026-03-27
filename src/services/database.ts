import { config } from '../config/index.js';
import { Item, ItemInsert, Summary, SummaryInsert, SavedItem, DigestItem } from '../types/index.js';
import { logger } from './logger.js';

// Dynamic import based on config
let dbInstance: any;

async function getDb() {
  if (dbInstance) return dbInstance;
  
  if (config.DB_MODE === 'local') {
    const { localDb } = await import('./database-local.js');
    dbInstance = localDb;
    logger.info('Using local SQLite database');
  } else {
    const { supabaseDb } = await import('./database-supabase.js');
    dbInstance = supabaseDb;
    logger.info('Using Supabase database');
  }
  
  return dbInstance;
}

// Export getDatabase for direct access
export function getDatabase() {
  if (!dbInstance) {
    // Sync initialization for local db
    if (config.DB_MODE === 'local') {
      const { localDb } = require('./database-local.js');
      dbInstance = localDb;
    }
  }
  return dbInstance;
}

// Proxy object that forwards all calls to the actual database
export const db = {
  async hashUrl(url: string): Promise<string> {
    const instance = await getDb();
    return instance.hashUrl(url);
  },
  
  async urlExists(url: string): Promise<boolean> {
    const instance = await getDb();
    return instance.urlExists(url);
  },
  
  async insertItem(item: ItemInsert): Promise<Item | null> {
    const instance = await getDb();
    return instance.insertItem(item);
  },
  
  async insertItems(items: ItemInsert[]): Promise<Item[]> {
    const instance = await getDb();
    return instance.insertItems(items);
  },
  
  async getUnprocessedItems(limit = 50): Promise<Item[]> {
    const instance = await getDb();
    return instance.getUnprocessedItems(limit);
  },
  
  async markItemProcessed(itemId: string): Promise<void> {
    const instance = await getDb();
    return instance.markItemProcessed(itemId);
  },
  
  async insertSummary(summary: SummaryInsert): Promise<Summary | null> {
    const instance = await getDb();
    return instance.insertSummary(summary);
  },
  
  async getDailyDigest(limit = 5): Promise<DigestItem[]> {
    const instance = await getDb();
    return instance.getDailyDigest(limit);
  },
  
  async getUnsentSummaries(limit = 5): Promise<DigestItem[]> {
    const instance = await getDb();
    return instance.getUnsentSummaries ? instance.getUnsentSummaries(limit) : instance.getDailyDigest(limit);
  },
  
  async markSummariesSent(ids: string[]): Promise<void> {
    const instance = await getDb();
    if (instance.markSummariesSent) {
      return instance.markSummariesSent(ids);
    }
  },
  
  async getWeekendDigest(userId = 'default'): Promise<DigestItem[]> {
    const instance = await getDb();
    return instance.getWeekendDigest(userId);
  },
  
  async saveItem(summaryId: string, userId = 'default'): Promise<SavedItem | null> {
    const instance = await getDb();
    return instance.saveItem(summaryId, userId);
  },
  
  async updateSavedStatus(savedId: string, status: 'unread' | 'tried' | 'done'): Promise<void> {
    const instance = await getDb();
    return instance.updateSavedStatus(savedId, status);
  },
  
  async getSavedItems(userId = 'default', status?: string): Promise<any[]> {
    const instance = await getDb();
    return instance.getSavedItems(userId, status);
  },
  
  async deleteSavedItem(savedId: string): Promise<void> {
    const instance = await getDb();
    return instance.deleteSavedItem(savedId);
  },
  
  async getSummaryByItemId(itemId: string): Promise<Summary | null> {
    const instance = await getDb();
    return instance.getSummaryByItemId(itemId);
  },
  
  async getStats(): Promise<{ items: number; summaries: number; saved: number; unsent: number }> {
    const instance = await getDb();
    if (instance.getStats) {
      return instance.getStats();
    }
    return { items: 0, summaries: 0, saved: 0, unsent: 0 };
  },
  
  getRecentSummaries(limit = 100): any[] {
    const instance = getDatabase();
    return instance.getRecentSummaries ? instance.getRecentSummaries(limit) : [];
  }
};
