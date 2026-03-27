import cron from 'node-cron';
import { config } from '../config/index.js';
import { runPipeline } from '../services/pipeline.js';
import { sendHourlyDigest, sendWeekendDigest } from '../services/telegram.js';
import { logger } from '../services/logger.js';

export function initScheduler(): void {
  logger.info('Initializing scheduler...');
  
  // Fetch and process pipeline - every hour by default
  cron.schedule(config.FETCH_CRON, async () => {
    logger.info('⏰ Scheduled fetch triggered');
    try {
      await runPipeline();
    } catch (error) {
      logger.error('Scheduled fetch failed:', error);
    }
  }, {
    timezone: 'UTC'
  });
  
  logger.info(`📥 Fetch scheduled: ${config.FETCH_CRON}`);
  
  // Hourly digest - 5 minutes past each hour
  cron.schedule(config.DIGEST_CRON, async () => {
    logger.info('⏰ Hourly digest triggered');
    try {
      await sendHourlyDigest();
    } catch (error) {
      logger.error('Hourly digest failed:', error);
    }
  }, {
    timezone: 'UTC'
  });
  
  logger.info(`📰 Digest scheduled: ${config.DIGEST_CRON}`);
  
  logger.info('✅ Scheduler initialized');
}

// Manual triggers for testing
export async function triggerFetch(): Promise<void> {
  logger.info('Manual fetch triggered');
  await runPipeline();
}

export async function triggerDailyDigest(): Promise<void> {
  logger.info('Manual digest triggered');
  await sendHourlyDigest();
}

export async function triggerWeekendDigest(): Promise<void> {
  logger.info('Manual saved items digest triggered');
  await sendWeekendDigest();
}
