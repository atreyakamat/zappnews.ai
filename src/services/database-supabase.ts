import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { Item, ItemInsert, Summary, SummaryInsert, SavedItem, DigestItem, TagType } from '../types/index.js';
import { createHash } from 'crypto';
import { logger } from './logger.js';

class SupabaseDatabase {
  private client: SupabaseClient;

  constructor() {
    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
      throw new Error('Supabase URL and anon key required when DB_MODE=supabase');
    }
    this.client = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  }

  hashUrl(url: string): string {
    return createHash('sha256').update(url.toLowerCase().trim()).digest('hex').substring(0, 32);
  }

  async urlExists(url: string): Promise<boolean> {
    const hash = this.hashUrl(url);
    const { data, error } = await this.client
      .from('items')
      .select('id')
      .eq('url_hash', hash)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      logger.error('Error checking URL existence:', error);
    }
    
    return !!data;
  }

  async insertItem(item: ItemInsert): Promise<Item | null> {
    const urlHash = this.hashUrl(item.url);
    
    const { data, error } = await this.client
      .from('items')
      .insert({ ...item, url_hash: urlHash })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') {
        logger.debug(`Item already exists: ${item.url}`);
        return null;
      }
      logger.error('Error inserting item:', error);
      throw error;
    }
    
    return data;
  }

  async insertItems(items: ItemInsert[]): Promise<Item[]> {
    const inserted: Item[] = [];
    for (const item of items) {
      try {
        const result = await this.insertItem(item);
        if (result) inserted.push(result);
      } catch (error) {
        logger.error(`Failed to insert: ${item.url}`, error);
      }
    }
    return inserted;
  }

  async getUnprocessedItems(limit = 50): Promise<Item[]> {
    const { data, error } = await this.client
      .from('items')
      .select('*')
      .eq('processed', false)
      .order('fetched_at', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  async markItemProcessed(itemId: string): Promise<void> {
    await this.client.from('items').update({ processed: true }).eq('id', itemId);
  }

  async insertSummary(summary: SummaryInsert): Promise<Summary | null> {
    const { data, error } = await this.client
      .from('summaries')
      .insert(summary)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getDailyDigest(limit = 5): Promise<DigestItem[]> {
    const { data, error } = await this.client.rpc('get_daily_digest', { item_limit: limit });
    if (error) throw error;
    return data || [];
  }

  async getUnsentSummaries(limit = 5): Promise<DigestItem[]> {
    return this.getDailyDigest(limit);
  }

  async markSummariesSent(ids: string[]): Promise<void> {
    // Supabase schema doesn't have sent column by default
    logger.debug('markSummariesSent not implemented for Supabase');
  }

  async getWeekendDigest(userId = 'default'): Promise<DigestItem[]> {
    const { data, error } = await this.client.rpc('get_weekend_digest', { p_user_id: userId });
    if (error) throw error;
    return data || [];
  }

  async saveItem(summaryId: string, userId = 'default'): Promise<SavedItem | null> {
    const { data, error } = await this.client
      .from('saved')
      .insert({ summary_id: summaryId, user_id: userId, status: 'unread' })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') return null;
      throw error;
    }
    return data;
  }

  async updateSavedStatus(savedId: string, status: 'unread' | 'tried' | 'done'): Promise<void> {
    await this.client.from('saved').update({ status }).eq('id', savedId);
  }

  async getSavedItems(userId = 'default', status?: string): Promise<any[]> {
    let query = this.client
      .from('saved_items_view')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
    
    if (status) query = query.eq('status', status);
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async deleteSavedItem(savedId: string): Promise<void> {
    await this.client.from('saved').delete().eq('id', savedId);
  }

  async getSummaryByItemId(itemId: string): Promise<Summary | null> {
    const { data, error } = await this.client
      .from('summaries')
      .select('*')
      .eq('item_id', itemId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getStats(): Promise<{ items: number; summaries: number; saved: number; unsent: number }> {
    // Simplified stats for Supabase
    return { items: 0, summaries: 0, saved: 0, unsent: 0 };
  }
}

export const supabaseDb = new SupabaseDatabase();
