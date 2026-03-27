import express from 'express';
import { config } from './config/index.js';
import { logger } from './services/logger.js';
import { initScheduler, triggerFetch, triggerDailyDigest, triggerWeekendDigest } from './scheduler/index.js';
import { runPipeline, testFetch } from './services/pipeline.js';
import './services/telegram.js'; // Initialize Telegram bot

const app = express();
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV
  });
});

// API Routes for manual triggers
app.post('/api/fetch', async (req, res) => {
  try {
    await triggerFetch();
    res.json({ success: true, message: 'Fetch completed' });
  } catch (error) {
    logger.error('API fetch error:', error);
    res.status(500).json({ success: false, error: 'Fetch failed' });
  }
});

app.post('/api/digest/daily', async (req, res) => {
  try {
    await triggerDailyDigest();
    res.json({ success: true, message: 'Daily digest sent' });
  } catch (error) {
    logger.error('API daily digest error:', error);
    res.status(500).json({ success: false, error: 'Daily digest failed' });
  }
});

app.post('/api/digest/weekend', async (req, res) => {
  try {
    await triggerWeekendDigest();
    res.json({ success: true, message: 'Weekend digest sent' });
  } catch (error) {
    logger.error('API weekend digest error:', error);
    res.status(500).json({ success: false, error: 'Weekend digest failed' });
  }
});

app.post('/api/test-fetch', async (req, res) => {
  try {
    await testFetch();
    res.json({ success: true, message: 'Test fetch completed' });
  } catch (error) {
    logger.error('API test fetch error:', error);
    res.status(500).json({ success: false, error: 'Test fetch failed' });
  }
});

// API endpoint to get items for frontend
app.get('/api/items', async (req, res) => {
  try {
    const { getDatabase } = await import('./services/database.js');
    const db = getDatabase();
    const items = db.getRecentSummaries(100);
    res.json({ items });
  } catch (error) {
    logger.error('API get items error:', error);
    res.status(500).json({ items: [], error: 'Failed to get items' });
  }
});

// Start server
const PORT = parseInt(config.PORT, 10);

app.listen(PORT, () => {
  logger.info(`🚀 ZappNews.ai server running on port ${PORT}`);
  logger.info(`📊 Environment: ${config.NODE_ENV}`);
  
  // Initialize scheduler
  initScheduler();
  
  // Run initial fetch on startup (optional, can be disabled)
  if (config.NODE_ENV === 'production') {
    logger.info('Running initial fetch...');
    runPipeline().catch(err => logger.error('Initial fetch failed:', err));
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
