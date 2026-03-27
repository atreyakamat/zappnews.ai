// Source types
export type SourceType = 'hackernews' | 'reddit' | 'arxiv' | 'youtube' | 'twitter' | 'threads';

export type TagType = 'tool' | 'paper' | 'project' | 'tutorial' | 'opinion';

export type SavedStatus = 'unread' | 'tried' | 'done';

// Database types matching Supabase schema
export interface Item {
  id: string;
  source: SourceType;
  url: string;
  title: string;
  raw_text: string;
  author?: string;
  fetched_at: string;
  processed: boolean;
  url_hash: string;
}

export interface Summary {
  id: string;
  item_id: string;
  summary: string;
  tag: TagType;
  cta: string;
  created_at: string;
}

export interface SavedItem {
  id: string;
  summary_id: string;
  user_id: string;
  status: SavedStatus;
  saved_at: string;
  notes?: string;
}

// API response types for different sources
export interface HackerNewsItem {
  objectID: string;
  title: string;
  url?: string;
  author: string;
  points: number;
  num_comments: number;
  created_at: string;
  story_text?: string;
}

export interface HackerNewsResponse {
  hits: HackerNewsItem[];
  nbHits: number;
  page: number;
  nbPages: number;
}

export interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  url: string;
  author: string;
  score: number;
  created_utc: number;
  subreddit: string;
  permalink: string;
}

export interface RedditResponse {
  data: {
    children: Array<{ data: RedditPost }>;
    after?: string;
  };
}

export interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  link: string;
  author: string | string[];
  published: string;
  category: string[];
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
}

// Fetcher result type
export interface FetchResult {
  source: SourceType;
  items: ItemInsert[];
  error?: string;
}

// LLM summary result
export interface SummaryResult {
  summary: string;
  tag: TagType;
  cta: string;
}

// Telegram message format
export interface DigestItem {
  title: string;
  summary: string;
  cta: string;
  url: string;
  tag: TagType;
  item_id: string;
  saved_id?: string;
  status?: string;
}

// Insert types (without auto-generated fields)
export type ItemInsert = Omit<Item, 'id' | 'fetched_at'>;
export type SummaryInsert = Omit<Summary, 'id' | 'created_at'>;
export type SavedItemInsert = Omit<SavedItem, 'id' | 'saved_at'>;
