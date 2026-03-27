import axios from 'axios';
import { FetchResult, ItemInsert } from '../../types/index.js';
import { config } from '../../config/index.js';
import { logger } from '../logger.js';

// Popular AI-focused YouTube channels
const AI_CHANNELS = [
  'UCbfYPyITQ-7l4upoX8nvctg', // Two Minute Papers
  'UCWN3xxRkmTPmbKwht9FuE5A', // Siraj Raval
  'UCr8O8l5cCX85Oem1d18EezQ', // The AI Epiphany
  'UCZHmQk67mSJgfCCTn7xBfew', // Yannic Kilcher
  'UCgBncpylJ1kiVaPyP-PZauQ', // Lex Fridman
];

// AI-related search queries
const AI_SEARCH_QUERIES = [
  'AI tutorial 2024',
  'LLM explained',
  'machine learning project',
  'GPT-4 demo',
  'Claude AI'
];

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

async function searchYouTube(query: string): Promise<ItemInsert[]> {
  if (!config.YOUTUBE_API_KEY) return [];
  
  try {
    const response = await axios.get<YouTubeSearchResponse>(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          key: config.YOUTUBE_API_KEY,
          q: query,
          part: 'snippet',
          type: 'video',
          maxResults: 5,
          order: 'date',
          publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
          relevanceLanguage: 'en'
        }
      }
    );
    
    return response.data.items.map(item => ({
      source: 'youtube' as const,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      url_hash: '',
      title: item.snippet.title,
      raw_text: item.snippet.description,
      author: item.snippet.channelTitle,
      processed: false
    }));
  } catch (error) {
    logger.error(`Error searching YouTube for "${query}":`, error);
    return [];
  }
}

async function fetchChannelVideos(channelId: string): Promise<ItemInsert[]> {
  if (!config.YOUTUBE_API_KEY) return [];
  
  try {
    const response = await axios.get<YouTubeSearchResponse>(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          key: config.YOUTUBE_API_KEY,
          channelId,
          part: 'snippet',
          type: 'video',
          maxResults: 3,
          order: 'date'
        }
      }
    );
    
    return response.data.items.map(item => ({
      source: 'youtube' as const,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      url_hash: '',
      title: item.snippet.title,
      raw_text: item.snippet.description,
      author: item.snippet.channelTitle,
      processed: false
    }));
  } catch (error) {
    logger.error(`Error fetching YouTube channel ${channelId}:`, error);
    return [];
  }
}

export async function fetchYouTube(): Promise<FetchResult> {
  try {
    if (!config.YOUTUBE_API_KEY) {
      logger.warn('YouTube API key not configured, skipping...');
      return { source: 'youtube', items: [] };
    }
    
    logger.info('Fetching YouTube...');
    
    const items: ItemInsert[] = [];
    const seenUrls = new Set<string>();
    
    // Search for AI-related videos
    const searchResults = await Promise.all(
      AI_SEARCH_QUERIES.slice(0, 2).map(searchYouTube)
    );
    
    // Also fetch from specific channels
    const channelResults = await Promise.all(
      AI_CHANNELS.slice(0, 3).map(fetchChannelVideos)
    );
    
    const allResults = [...searchResults, ...channelResults];
    
    for (const resultItems of allResults) {
      for (const item of resultItems) {
        if (seenUrls.has(item.url)) continue;
        seenUrls.add(item.url);
        items.push(item);
      }
    }
    
    logger.info(`Fetched ${items.length} items from YouTube`);
    
    return {
      source: 'youtube',
      items
    };
  } catch (error) {
    logger.error('Error fetching YouTube:', error);
    return {
      source: 'youtube',
      items: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
