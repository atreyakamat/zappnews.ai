import Database from 'better-sqlite3';
import { createHash } from 'crypto';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { config } from '../config/index.js';
import { Item, ItemInsert, Summary, SummaryInsert, SavedItem, DigestItem, TagType } from '../types/index.js';
import { logger } from './logger.js';

class LocalDatabase {
  private db: Database.Database;

  constructor() {
    // Ensure data directory exists
    const dbPath = config.SQLITE_PATH;
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initialize();
    logger.info(`SQLite database initialized at ${dbPath}`);
  }

  private initialize(): void {
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        url TEXT NOT NULL,
        url_hash TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        raw_text TEXT,
        author TEXT,
        fetched_at TEXT DEFAULT (datetime('now')),
        processed INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS summaries (
        id TEXT PRIMARY KEY,
        item_id TEXT NOT NULL UNIQUE REFERENCES items(id),
        summary TEXT NOT NULL,
        tag TEXT NOT NULL,
        cta TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        sent INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS saved (
        id TEXT PRIMARY KEY,
        summary_id TEXT NOT NULL REFERENCES summaries(id),
        user_id TEXT DEFAULT 'default',
        status TEXT DEFAULT 'unread',
        saved_at TEXT DEFAULT (datetime('now')),
        notes TEXT,
        UNIQUE(user_id, summary_id)
      );

      CREATE INDEX IF NOT EXISTS idx_items_url_hash ON items(url_hash);
      CREATE INDEX IF NOT EXISTS idx_items_processed ON items(processed);
      CREATE INDEX IF NOT EXISTS idx_summaries_sent ON summaries(sent);
      CREATE INDEX IF NOT EXISTS idx_summaries_created ON summaries(created_at);
    `);
  }

  private generateId(): string {
    return crypto.randomUUID();
  }

  hashUrl(url: string): string {
    return createHash('sha256').update(url.toLowerCase().trim()).digest('hex').substring(0, 32);
  }

  async urlExists(url: string): Promise<boolean> {
    const hash = this.hashUrl(url);
    const row = this.db.prepare('SELECT 1 FROM items WHERE url_hash = ?').get(hash);
    return !!row;
  }

  async insertItem(item: ItemInsert): Promise<Item | null> {
    const urlHash = this.hashUrl(item.url);
    const id = this.generateId();

    try {
      this.db.prepare(`
        INSERT INTO items (id, source, url, url_hash, title, raw_text, author, processed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, item.source, item.url, urlHash, item.title, item.raw_text, item.author, 0);

      return {
        id,
        source: item.source,
        url: item.url,
        url_hash: urlHash,
        title: item.title,
        raw_text: item.raw_text || '',
        author: item.author,
        fetched_at: new Date().toISOString(),
        processed: false
      };
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        logger.debug(`Item already exists: ${item.url}`);
        return null;
      }
      throw error;
    }
  }

  async insertItems(items: ItemInsert[]): Promise<Item[]> {
    const inserted: Item[] = [];
    for (const item of items) {
      const result = await this.insertItem(item);
      if (result) inserted.push(result);
    }
    return inserted;
  }

  async getUnprocessedItems(limit = 50): Promise<Item[]> {
    const rows = this.db.prepare(`
      SELECT * FROM items WHERE processed = 0 ORDER BY fetched_at ASC LIMIT ?
    `).all(limit) as any[];

    return rows.map(row => ({
      ...row,
      processed: !!row.processed
    }));
  }

  async markItemProcessed(itemId: string): Promise<void> {
    this.db.prepare('UPDATE items SET processed = 1 WHERE id = ?').run(itemId);
  }

  async insertSummary(summary: SummaryInsert): Promise<Summary | null> {
    const id = this.generateId();

    try {
      this.db.prepare(`
        INSERT INTO summaries (id, item_id, summary, tag, cta, sent)
        VALUES (?, ?, ?, ?, ?, 0)
      `).run(id, summary.item_id, summary.summary, summary.tag, summary.cta);

      return {
        id,
        item_id: summary.item_id,
        summary: summary.summary,
        tag: summary.tag as TagType,
        cta: summary.cta,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error inserting summary:', error);
      return null;
    }
  }

  // Get unsent summaries for hourly digest
  async getUnsentSummaries(limit = 5): Promise<DigestItem[]> {
    const rows = this.db.prepare(`
      SELECT 
        i.id as item_id,
        i.title,
        i.url,
        i.source,
        s.id as summary_id,
        s.summary,
        s.tag,
        s.cta
      FROM summaries s
      JOIN items i ON i.id = s.item_id
      WHERE s.sent = 0
      ORDER BY s.created_at DESC
      LIMIT ?
    `).all(limit) as any[];

    return rows.map(row => ({
      item_id: row.item_id,
      title: row.title,
      url: row.url,
      summary: row.summary,
      tag: row.tag as TagType,
      cta: row.cta
    }));
  }

  // Mark summaries as sent
  async markSummariesSent(summaryIds: string[]): Promise<void> {
    const placeholders = summaryIds.map(() => '?').join(',');
    this.db.prepare(`UPDATE summaries SET sent = 1 WHERE id IN (${placeholders})`).run(...summaryIds);
  }

  // Get daily digest (for backwards compatibility)
  async getDailyDigest(limit = 5): Promise<DigestItem[]> {
    return this.getUnsentSummaries(limit);
  }

  // Get weekend digest (saved items)
  async getWeekendDigest(userId = 'default'): Promise<DigestItem[]> {
    const rows = this.db.prepare(`
      SELECT 
        sv.id as saved_id,
        sv.status,
        i.title,
        i.url,
        s.summary,
        s.tag,
        s.cta
      FROM saved sv
      JOIN summaries s ON s.id = sv.summary_id
      JOIN items i ON i.id = s.item_id
      WHERE sv.user_id = ? AND sv.status IN ('unread', 'tried')
      ORDER BY sv.saved_at DESC
    `).all(userId) as any[];

    return rows.map(row => ({
      item_id: row.item_id || '',
      saved_id: row.saved_id,
      title: row.title,
      url: row.url,
      summary: row.summary,
      tag: row.tag as TagType,
      cta: row.cta,
      status: row.status
    }));
  }

  async saveItem(summaryId: string, userId = 'default'): Promise<SavedItem | null> {
    const id = this.generateId();

    try {
      this.db.prepare(`
        INSERT INTO saved (id, summary_id, user_id, status)
        VALUES (?, ?, ?, 'unread')
      `).run(id, summaryId, userId);

      return {
        id,
        summary_id: summaryId,
        user_id: userId,
        status: 'unread',
        saved_at: new Date().toISOString()
      };
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        logger.debug(`Item already saved: ${summaryId}`);
        return null;
      }
      throw error;
    }
  }

  async updateSavedStatus(savedId: string, status: 'unread' | 'tried' | 'done'): Promise<void> {
    this.db.prepare('UPDATE saved SET status = ? WHERE id = ?').run(status, savedId);
  }

  async getSavedItems(userId = 'default', status?: string): Promise<any[]> {
    let query = `
      SELECT 
        sv.id as saved_id,
        sv.status,
        sv.saved_at,
        sv.notes,
        sv.user_id,
        i.title,
        i.url,
        i.source,
        s.summary,
        s.tag,
        s.cta
      FROM saved sv
      JOIN summaries s ON s.id = sv.summary_id
      JOIN items i ON i.id = s.item_id
      WHERE sv.user_id = ?
    `;

    if (status) {
      query += ` AND sv.status = ?`;
    }
    query += ` ORDER BY sv.saved_at DESC`;

    const stmt = this.db.prepare(query);
    return status ? stmt.all(userId, status) : stmt.all(userId);
  }

  async deleteSavedItem(savedId: string): Promise<void> {
    this.db.prepare('DELETE FROM saved WHERE id = ?').run(savedId);
  }

  async getSummaryByItemId(itemId: string): Promise<Summary | null> {
    const row = this.db.prepare('SELECT * FROM summaries WHERE item_id = ?').get(itemId) as any;
    return row || null;
  }

  // Get recent summaries for frontend display
  getRecentSummaries(limit = 100): any[] {
    const rows = this.db.prepare(`
      SELECT 
        s.id,
        i.title,
        s.summary,
        i.url,
        i.source,
        s.tag,
        s.cta,
        s.created_at
      FROM summaries s
      JOIN items i ON s.item_id = i.id
      ORDER BY s.created_at DESC
      LIMIT ?
    `).all(limit) as any[];
    return rows;
  }

  // Stats for dashboard
  async getStats(): Promise<{ items: number; summaries: number; saved: number; unsent: number }> {
    const items = (this.db.prepare('SELECT COUNT(*) as count FROM items').get() as any).count;
    const summaries = (this.db.prepare('SELECT COUNT(*) as count FROM summaries').get() as any).count;
    const saved = (this.db.prepare('SELECT COUNT(*) as count FROM saved').get() as any).count;
    const unsent = (this.db.prepare('SELECT COUNT(*) as count FROM summaries WHERE sent = 0').get() as any).count;
    return { items, summaries, saved, unsent };
  }
}

export const localDb = new LocalDatabase();
