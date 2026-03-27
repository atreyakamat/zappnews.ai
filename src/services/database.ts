import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';
import { Item, ItemInsert, Summary, SummaryInsert, SavedItem, SavedItemInsert, DigestItem } from '../types/index.js';
import { createHash } from 'crypto';
import { logger } from './logger.js';

class Database {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  }

  // Generate URL hash for deduplication
  hashUrl(url: string): string {
    return createHash('sha256').update(url.toLowerCase().trim()).digest('hex').substring(0, 32);
  }

  // Check if URL already exists
  async urlExists(url: string): Promise<boolean> {
    const hash = this.hashUrl(url);
    const { data, error } = await this.client
      .from('items')
      .select('id')
      .eq('url_hash', hash)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      logger.error('Error checking URL existence:', error);
    }
    
    return !!data;
  }

  // Insert new item
  async insertItem(item: ItemInsert): Promise<Item | null> {
    const urlHash = this.hashUrl(item.url);
    
    const { data, error } = await this.client
      .from('items')
      .insert({ ...item, url_hash: urlHash })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique violation - already exists
        logger.debug(`Item already exists: ${item.url}`);
        return null;
      }
      logger.error('Error inserting item:', error);
      throw error;
    }
    
    return data;
  }

  // Insert multiple items (with deduplication)
  async insertItems(items: ItemInsert[]): Promise<Item[]> {
    const inserted: Item[] = [];
    
    for (const item of items) {
      try {
        const result = await this.insertItem(item);
        if (result) {
          inserted.push(result);
        }
      } catch (error) {
        logger.error(`Failed to insert item: ${item.url}`, error);
      }
    }
    
    return inserted;
  }

  // Get unprocessed items
  async getUnprocessedItems(limit = 50): Promise<Item[]> {
    const { data, error } = await this.client
      .from('items')
      .select('*')
      .eq('processed', false)
      .order('fetched_at', { ascending: true })
      .limit(limit);
    
    if (error) {
      logger.error('Error fetching unprocessed items:', error);
      throw error;
    }
    
    return data || [];
  }

  // Mark item as processed
  async markItemProcessed(itemId: string): Promise<void> {
    const { error } = await this.client
      .from('items')
      .update({ processed: true })
      .eq('id', itemId);
    
    if (error) {
      logger.error('Error marking item as processed:', error);
      throw error;
    }
  }

  // Insert summary
  async insertSummary(summary: SummaryInsert): Promise<Summary | null> {
    const { data, error } = await this.client
      .from('summaries')
      .insert(summary)
      .select()
      .single();
    
    if (error) {
      logger.error('Error inserting summary:', error);
      throw error;
    }
    
    return data;
  }

  // Get daily digest items
  async getDailyDigest(limit = 5): Promise<DigestItem[]> {
    const { data, error } = await this.client
      .rpc('get_daily_digest', { item_limit: limit });
    
    if (error) {
      logger.error('Error fetching daily digest:', error);
      throw error;
    }
    
    return data || [];
  }

  // Get weekend digest (saved items)
  async getWeekendDigest(userId = 'default'): Promise<DigestItem[]> {
    const { data, error } = await this.client
      .rpc('get_weekend_digest', { p_user_id: userId });
    
    if (error) {
      logger.error('Error fetching weekend digest:', error);
      throw error;
    }
    
    return data || [];
  }

  // Save an item
  async saveItem(summaryId: string, userId = 'default'): Promise<SavedItem | null> {
    const { data, error } = await this.client
      .from('saved')
      .insert({ summary_id: summaryId, user_id: userId, status: 'unread' })
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Already saved
        logger.debug(`Item already saved: ${summaryId}`);
        return null;
      }
      logger.error('Error saving item:', error);
      throw error;
    }
    
    return data;
  }

  // Update saved item status
  async updateSavedStatus(savedId: string, status: 'unread' | 'tried' | 'done'): Promise<void> {
    const { error } = await this.client
      .from('saved')
      .update({ status })
      .eq('id', savedId);
    
    if (error) {
      logger.error('Error updating saved item status:', error);
      throw error;
    }
  }

  // Get all saved items for a user
  async getSavedItems(userId = 'default', status?: string): Promise<any[]> {
    let query = this.client
      .from('saved_items_view')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      logger.error('Error fetching saved items:', error);
      throw error;
    }
    
    return data || [];
  }

  // Delete saved item
  async deleteSavedItem(savedId: string): Promise<void> {
    const { error } = await this.client
      .from('saved')
      .delete()
      .eq('id', savedId);
    
    if (error) {
      logger.error('Error deleting saved item:', error);
      throw error;
    }
  }

  // Get summary by item ID
  async getSummaryByItemId(itemId: string): Promise<Summary | null> {
    const { data, error } = await this.client
      .from('summaries')
      .select('*')
      .eq('item_id', itemId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      logger.error('Error fetching summary:', error);
      throw error;
    }
    
    return data;
  }
}

export const db = new Database();
