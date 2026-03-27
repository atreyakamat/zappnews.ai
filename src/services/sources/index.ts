export { fetchHackerNews } from './hackernews.js';
export { fetchReddit } from './reddit.js';
export { fetchArxiv } from './arxiv.js';
export { fetchYouTube } from './youtube.js';
export { fetchRSSFeeds, addCustomFeed, listFeeds } from './rss.js';

import { FetchResult } from '../../types/index.js';
import { fetchHackerNews } from './hackernews.js';
import { fetchReddit } from './reddit.js';
// import { fetchArxiv } from './arxiv.js'; // Disabled - no papers, only practical content
import { fetchYouTube } from './youtube.js';
import { fetchRSSFeeds } from './rss.js';
import { logger } from '../logger.js';

export async function fetchAllSources(): Promise<FetchResult[]> {
  logger.info('Starting fetch from all sources...');
  
  // Fetch all sources in parallel with graceful degradation
  // Note: arXiv disabled - focusing on practical tools & news, not research papers
  const results = await Promise.allSettled([
    fetchHackerNews(),
    fetchReddit(),
    // fetchArxiv(),  // Disabled - no papers
    fetchYouTube(),
    fetchRSSFeeds()  // RSS feeds from OpenAI, Anthropic, TechCrunch, etc.
  ]);
  
  const fetchResults: FetchResult[] = [];
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      fetchResults.push(result.value);
    } else {
      logger.error('Source fetch failed:', result.reason);
    }
  }
  
  const totalItems = fetchResults.reduce((sum, r) => sum + r.items.length, 0);
  logger.info(`Fetched ${totalItems} total items from ${fetchResults.length} sources`);
  
  return fetchResults;
}
