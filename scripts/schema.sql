-- ZappNews.ai Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Items table: raw fetched posts
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL CHECK (source IN ('hackernews', 'reddit', 'arxiv', 'youtube', 'twitter', 'threads')),
  url TEXT NOT NULL,
  url_hash TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  raw_text TEXT,
  author TEXT,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT items_url_unique UNIQUE (url_hash)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_items_url_hash ON items(url_hash);
CREATE INDEX IF NOT EXISTS idx_items_source ON items(source);
CREATE INDEX IF NOT EXISTS idx_items_fetched_at ON items(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_processed ON items(processed);

-- Summaries table: LLM-generated summaries
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  tag TEXT NOT NULL CHECK (tag IN ('tool', 'paper', 'project', 'tutorial', 'opinion')),
  cta TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT summaries_item_unique UNIQUE (item_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_summaries_item_id ON summaries(item_id);
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON summaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_summaries_tag ON summaries(tag);

-- Saved items table: user's saved items
CREATE TABLE IF NOT EXISTS saved (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  summary_id UUID NOT NULL REFERENCES summaries(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT 'default',
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'tried', 'done')),
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  
  CONSTRAINT saved_user_summary_unique UNIQUE (user_id, summary_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_saved_user_id ON saved(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_status ON saved(status);
CREATE INDEX IF NOT EXISTS idx_saved_saved_at ON saved(saved_at DESC);

-- View for digest queries: combines items + summaries
CREATE OR REPLACE VIEW digest_items AS
SELECT 
  i.id AS item_id,
  i.source,
  i.url,
  i.title,
  i.author,
  i.fetched_at,
  s.id AS summary_id,
  s.summary,
  s.tag,
  s.cta,
  s.created_at AS summarized_at
FROM items i
JOIN summaries s ON s.item_id = i.id
ORDER BY s.created_at DESC;

-- View for saved items with full details
CREATE OR REPLACE VIEW saved_items_view AS
SELECT 
  sv.id AS saved_id,
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
ORDER BY sv.saved_at DESC;

-- Function to get top items for daily digest
CREATE OR REPLACE FUNCTION get_daily_digest(item_limit INT DEFAULT 5)
RETURNS TABLE (
  item_id UUID,
  title TEXT,
  url TEXT,
  summary TEXT,
  tag TEXT,
  cta TEXT,
  source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.title,
    i.url,
    s.summary,
    s.tag,
    s.cta,
    i.source
  FROM items i
  JOIN summaries s ON s.item_id = i.id
  WHERE s.created_at > NOW() - INTERVAL '24 hours'
  ORDER BY s.created_at DESC
  LIMIT item_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get weekend digest (saved items)
CREATE OR REPLACE FUNCTION get_weekend_digest(p_user_id TEXT DEFAULT 'default')
RETURNS TABLE (
  saved_id UUID,
  title TEXT,
  url TEXT,
  summary TEXT,
  tag TEXT,
  cta TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sv.id,
    i.title,
    i.url,
    s.summary,
    s.tag,
    s.cta,
    sv.status
  FROM saved sv
  JOIN summaries s ON s.id = sv.summary_id
  JOIN items i ON i.id = s.item_id
  WHERE sv.user_id = p_user_id
    AND sv.status IN ('unread', 'tried')
  ORDER BY sv.saved_at DESC;
END;
$$ LANGUAGE plpgsql;
