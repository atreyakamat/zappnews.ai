import { db } from './database.js';
import { fetchAllSources } from './sources/index.js';
import { summarizeItems } from './summarizer.js';
import { logger } from './logger.js';

export async function runPipeline(): Promise<void> {
  logger.info('🚀 Starting pipeline run...');
  const startTime = Date.now();
  
  try {
    // Step 1: Fetch from all sources
    logger.info('Step 1: Fetching from sources...');
    const fetchResults = await fetchAllSources();
    
    // Step 2: Insert items with deduplication
    logger.info('Step 2: Inserting items with deduplication...');
    let insertedCount = 0;
    
    for (const result of fetchResults) {
      if (result.error) {
        logger.warn(`Source ${result.source} had error: ${result.error}`);
        continue;
      }
      
      const inserted = await db.insertItems(result.items);
      insertedCount += inserted.length;
      logger.info(`Inserted ${inserted.length} new items from ${result.source}`);
    }
    
    logger.info(`Total new items inserted: ${insertedCount}`);
    
    // Step 3: Get unprocessed items and summarize
    logger.info('Step 3: Fetching unprocessed items...');
    const unprocessedItems = await db.getUnprocessedItems(20);
    
    if (unprocessedItems.length === 0) {
      logger.info('No unprocessed items to summarize');
    } else {
      logger.info(`Found ${unprocessedItems.length} items to summarize`);
      
      // Step 4: Summarize with LLM
      logger.info('Step 4: Summarizing with LLM...');
      const summaries = await summarizeItems(unprocessedItems);
      
      // Step 5: Store summaries and mark items as processed
      logger.info('Step 5: Storing summaries...');
      let summaryCount = 0;
      
      for (const item of unprocessedItems) {
        const summary = summaries.get(item.id);
        
        if (summary) {
          await db.insertSummary({
            item_id: item.id,
            summary: summary.summary,
            tag: summary.tag,
            cta: summary.cta
          });
          summaryCount++;
        }
        
        await db.markItemProcessed(item.id);
      }
      
      logger.info(`Created ${summaryCount} summaries`);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`✅ Pipeline completed in ${duration}s`);
    
  } catch (error) {
    logger.error('Pipeline failed:', error);
    throw error;
  }
}

// Run a quick test fetch (no summarization)
export async function testFetch(): Promise<void> {
  logger.info('Running test fetch...');
  const results = await fetchAllSources();
  
  for (const result of results) {
    logger.info(`${result.source}: ${result.items.length} items${result.error ? ` (error: ${result.error})` : ''}`);
  }
}
