import cron from 'node-cron';
import { config } from '../config/index.js';
import { runPipeline } from '../services/pipeline.js';
import { sendDailyDigest, sendWeekendDigest } from '../services/telegram.js';
import { logger } from '../services/logger.js';

export function initScheduler(): void {
  logger.info('Initializing scheduler...');
  
  // Fetch and process pipeline - every 6 hours by default
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
  
  // Daily digest - 8am by default
  cron.schedule(config.DAILY_DIGEST_CRON, async () => {
    logger.info('⏰ Daily digest triggered');
    try {
      await sendDailyDigest();
    } catch (error) {
      logger.error('Daily digest failed:', error);
    }
  }, {
    timezone: 'UTC'
  });
  
  logger.info(`📰 Daily digest scheduled: ${config.DAILY_DIGEST_CRON}`);
  
  // Weekend digest - Saturday 9am by default
  cron.schedule(config.WEEKEND_DIGEST_CRON, async () => {
    logger.info('⏰ Weekend digest triggered');
    try {
      await sendWeekendDigest();
    } catch (error) {
      logger.error('Weekend digest failed:', error);
    }
  }, {
    timezone: 'UTC'
  });
  
  logger.info(`📦 Weekend digest scheduled: ${config.WEEKEND_DIGEST_CRON}`);
  
  logger.info('✅ Scheduler initialized');
}

// Manual triggers for testing
export async function triggerFetch(): Promise<void> {
  logger.info('Manual fetch triggered');
  await runPipeline();
}

export async function triggerDailyDigest(): Promise<void> {
  logger.info('Manual daily digest triggered');
  await sendDailyDigest();
}

export async function triggerWeekendDigest(): Promise<void> {
  logger.info('Manual weekend digest triggered');
  await sendWeekendDigest();
}
