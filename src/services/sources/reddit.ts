import axios from 'axios';
import { RedditResponse, FetchResult, ItemInsert } from '../../types/index.js';
import { config } from '../../config/index.js';
import { logger } from '../logger.js';

// AI-related subreddits
const AI_SUBREDDITS = [
  'MachineLearning',
  'artificial',
  'LocalLLaMA',
  'OpenAI',
  'ChatGPT',
  'ClaudeAI',
  'singularity',
  'learnmachinelearning'
];

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  // Check if we have valid token
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }
  
  if (!config.REDDIT_CLIENT_ID || !config.REDDIT_CLIENT_SECRET) {
    throw new Error('Reddit credentials not configured');
  }
  
  const auth = Buffer.from(`${config.REDDIT_CLIENT_ID}:${config.REDDIT_CLIENT_SECRET}`).toString('base64');
  
  const response = await axios.post(
    'https://www.reddit.com/api/v1/access_token',
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': config.REDDIT_USER_AGENT
      }
    }
  );
  
  accessToken = response.data.access_token;
  tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1 min early
  
  return accessToken!;
}

async function fetchSubreddit(subreddit: string, token: string): Promise<ItemInsert[]> {
  try {
    const response = await axios.get<RedditResponse>(
      `https://oauth.reddit.com/r/${subreddit}/hot`,
      {
        params: { limit: 15, t: 'day' },
        headers: {
          'Authorization': `Bearer ${token}`,
          'User-Agent': config.REDDIT_USER_AGENT
        }
      }
    );
    
    return response.data.data.children.map(({ data: post }) => ({
      source: 'reddit' as const,
      url: post.url.startsWith('http') ? post.url : `https://reddit.com${post.permalink}`,
      url_hash: '',
      title: post.title,
      raw_text: post.selftext || post.title,
      author: post.author,
      processed: false
    }));
  } catch (error) {
    logger.error(`Error fetching r/${subreddit}:`, error);
    return [];
  }
}

export async function fetchReddit(): Promise<FetchResult> {
  try {
    if (!config.REDDIT_CLIENT_ID || !config.REDDIT_CLIENT_SECRET) {
      logger.warn('Reddit credentials not configured, skipping...');
      return { source: 'reddit', items: [] };
    }
    
    logger.info('Fetching Reddit...');
    
    const token = await getAccessToken();
    const items: ItemInsert[] = [];
    const seenUrls = new Set<string>();
    
    // Fetch from multiple subreddits in parallel
    const results = await Promise.all(
      AI_SUBREDDITS.map(sub => fetchSubreddit(sub, token))
    );
    
    for (const subItems of results) {
      for (const item of subItems) {
        if (seenUrls.has(item.url)) continue;
        seenUrls.add(item.url);
        items.push(item);
      }
    }
    
    logger.info(`Fetched ${items.length} items from Reddit`);
    
    return {
      source: 'reddit',
      items
    };
  } catch (error) {
    logger.error('Error fetching Reddit:', error);
    return {
      source: 'reddit',
      items: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
