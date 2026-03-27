import Parser from 'rss-parser';
import { FetchResult, ItemInsert } from '../../types/index.js';
import { logger } from '../logger.js';

const parser = new Parser();

// arXiv RSS feeds for AI/ML categories
const ARXIV_FEEDS = [
  'https://rss.arxiv.org/rss/cs.AI',   // Artificial Intelligence
  'https://rss.arxiv.org/rss/cs.LG',   // Machine Learning
  'https://rss.arxiv.org/rss/cs.CL',   // Computation and Language (NLP)
  'https://rss.arxiv.org/rss/cs.CV',   // Computer Vision
];

async function fetchFeed(feedUrl: string): Promise<ItemInsert[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    
    return (feed.items || []).slice(0, 10).map(item => ({
      source: 'arxiv' as const,
      url: item.link || '',
      url_hash: '',
      title: item.title?.replace(/\s+/g, ' ').trim() || 'Untitled',
      raw_text: item.contentSnippet || item.content || item.title || '',
      author: item.creator || item['dc:creator'] || 'Unknown',
      processed: false
    }));
  } catch (error) {
    logger.error(`Error fetching arXiv feed ${feedUrl}:`, error);
    return [];
  }
}

export async function fetchArxiv(): Promise<FetchResult> {
  try {
    logger.info('Fetching arXiv...');
    
    const items: ItemInsert[] = [];
    const seenUrls = new Set<string>();
    
    // Fetch all feeds in parallel
    const results = await Promise.all(ARXIV_FEEDS.map(fetchFeed));
    
    for (const feedItems of results) {
      for (const item of feedItems) {
        if (!item.url || seenUrls.has(item.url)) continue;
        seenUrls.add(item.url);
        items.push(item);
      }
    }
    
    logger.info(`Fetched ${items.length} items from arXiv`);
    
    return {
      source: 'arxiv',
      items
    };
  } catch (error) {
    logger.error('Error fetching arXiv:', error);
    return {
      source: 'arxiv',
      items: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
