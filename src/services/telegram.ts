import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config/index.js';
import { DigestItem, TagType } from '../types/index.js';
import { db } from './database.js';
import { logger } from './logger.js';

const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });
const chatId = config.TELEGRAM_CHAT_ID;

// Tag emojis
const TAG_EMOJI: Record<TagType, string> = {
  tool: '🔧',
  paper: '📄',
  project: '🚀',
  tutorial: '📚',
  opinion: '💬'
};

// Format a single digest item (clean, readable format)
function formatDigestItem(item: DigestItem, index: number): string {
  const emoji = TAG_EMOJI[item.tag] || '📰';
  
  // Using simpler formatting that works better
  return `*${index + 1}\\. ${escapeMarkdown(item.title)}*
${emoji} ${item.tag.toUpperCase()}

${escapeMarkdown(item.summary)}

💡 ${escapeMarkdown(item.cta)}
🔗 [Read more](${item.url})`;
}

// Escape markdown special characters
function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

// Send hourly digest with new items
export async function sendHourlyDigest(): Promise<void> {
  try {
    const minItems = parseInt(config.MIN_ITEMS_FOR_DIGEST, 10) || 3;
    
    logger.info('Checking for unsent summaries...');
    const items = await db.getUnsentSummaries(5);
    
    if (items.length < minItems) {
      logger.info(`Only ${items.length} items available, need ${minItems}. Skipping digest.`);
      return;
    }
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    // Send header
    await bot.sendMessage(chatId, `🤖 *AI News Update* \\- ${escapeMarkdown(timeStr)}\n\n${items.length} fresh items for you:`, { 
      parse_mode: 'MarkdownV2' 
    });
    
    // Track summary IDs to mark as sent
    const summaryIds: string[] = [];
    
    // Send each item with inline buttons
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const message = formatDigestItem(item, i);
      
      // Get summary ID from item
      const summary = await db.getSummaryByItemId(item.item_id);
      if (summary) {
        summaryIds.push(summary.id);
      }
      
      await bot.sendMessage(chatId, message, {
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [[
            { text: '💾 Save', callback_data: `save:${item.item_id}` },
            { text: '⏭️ Skip', callback_data: `skip:${item.item_id}` }
          ]]
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Mark summaries as sent
    if (summaryIds.length > 0) {
      await db.markSummariesSent(summaryIds);
    }
    
    logger.info(`✅ Sent hourly digest with ${items.length} items`);
  } catch (error) {
    logger.error('Error sending hourly digest:', error);
    throw error;
  }
}

// Alias for backwards compatibility
export const sendDailyDigest = sendHourlyDigest;

// Send saved items digest
export async function sendWeekendDigest(): Promise<void> {
  try {
    logger.info('Sending saved items digest...');
    
    const items = await db.getWeekendDigest();
    
    if (items.length === 0) {
      await bot.sendMessage(chatId, '📦 *Saved Items*\n\nNo saved items yet\\. Save items from your digests\\!', {
        parse_mode: 'MarkdownV2'
      });
      return;
    }
    
    await bot.sendMessage(chatId, `📦 *Your Saved Items* \\(${items.length}\\)\n\nTime to experiment with these:`, { 
      parse_mode: 'MarkdownV2' 
    });
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const emoji = TAG_EMOJI[item.tag as TagType] || '📰';
      
      const message = `*${i + 1}\\. ${escapeMarkdown(item.title)}*
${emoji} ${escapeMarkdown(item.tag?.toUpperCase() || 'ITEM')}

${escapeMarkdown(item.summary)}

💡 ${escapeMarkdown(item.cta)}
🔗 [Open](${item.url})`;
      
      await bot.sendMessage(chatId, message, {
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Tried', callback_data: `tried:${item.saved_id}` },
            { text: '🎉 Done', callback_data: `done:${item.saved_id}` }
          ]]
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    logger.info(`Sent saved items digest with ${items.length} items`);
  } catch (error) {
    logger.error('Error sending saved items digest:', error);
    throw error;
  }
}

// Handle button callbacks
bot.on('callback_query', async (query) => {
  try {
    const data = query.data;
    if (!data) return;
    
    const [action, id] = data.split(':');
    
    switch (action) {
      case 'save': {
        const summary = await db.getSummaryByItemId(id);
        if (summary) {
          await db.saveItem(summary.id);
          await bot.answerCallbackQuery(query.id, { text: '✅ Saved to library!' });
        } else {
          await bot.answerCallbackQuery(query.id, { text: '❌ Item not found' });
        }
        break;
      }
      
      case 'skip':
        await bot.answerCallbackQuery(query.id, { text: '⏭️ Skipped' });
        break;
      
      case 'tried':
        await db.updateSavedStatus(id, 'tried');
        await bot.answerCallbackQuery(query.id, { text: '✅ Marked as tried!' });
        break;
      
      case 'done':
        await db.updateSavedStatus(id, 'done');
        await bot.answerCallbackQuery(query.id, { text: '🎉 Done! Great job!' });
        break;
      
      default:
        await bot.answerCallbackQuery(query.id, { text: 'Unknown action' });
    }
  } catch (error) {
    logger.error('Callback error:', error);
    await bot.answerCallbackQuery(query.id, { text: '❌ Error' });
  }
});

// /start command
bot.onText(/\/start/, async (msg) => {
  const stats = await db.getStats();
  
  const welcomeMessage = `🤖 *Welcome to ZappNews AI\\!*

I send you AI news digests every hour with:
• 🔧 Tools \\& releases
• 📄 Research papers
• 🚀 Projects
• 📚 Tutorials

*Stats:*
📊 ${stats.items} items fetched
📝 ${stats.summaries} summaries
💾 ${stats.saved} saved

*Commands:*
/digest \\- Get latest AI news now
/saved \\- View your saved items
/stats \\- See statistics
/fetch \\- Trigger manual fetch

Happy learning\\! 🎯`;

  await bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: 'MarkdownV2' });
});

// /digest command
bot.onText(/\/digest/, async () => {
  await sendHourlyDigest();
});

// /saved command
bot.onText(/\/saved/, async (msg) => {
  const items = await db.getSavedItems();
  
  if (items.length === 0) {
    await bot.sendMessage(msg.chat.id, '📭 No saved items yet\\. Tap Save on items from your digests\\!', {
      parse_mode: 'MarkdownV2'
    });
    return;
  }
  
  let message = `📚 *Your Saved Items* \\(${items.length}\\)\n\n`;
  
  const statusEmoji: Record<string, string> = {
    unread: '📌',
    tried: '🔄',
    done: '✅'
  };
  
  for (const item of items.slice(0, 10)) {
    const emoji = statusEmoji[item.status] || '📌';
    message += `${emoji} ${escapeMarkdown(item.title)}\n`;
  }
  
  if (items.length > 10) {
    message += `\n_\\.\\.\\. and ${items.length - 10} more_`;
  }
  
  await bot.sendMessage(msg.chat.id, message, { parse_mode: 'MarkdownV2' });
});

// /stats command
bot.onText(/\/stats/, async (msg) => {
  const stats = await db.getStats();
  
  const message = `📊 *ZappNews Statistics*

📥 Items fetched: ${stats.items}
📝 Summaries: ${stats.summaries}
📬 Unsent: ${stats.unsent}
💾 Saved: ${stats.saved}

⏰ Fetch: ${escapeMarkdown(config.FETCH_CRON)}
📨 Digest: ${escapeMarkdown(config.DIGEST_CRON)}
🔧 LLM: ${escapeMarkdown(config.LLM_PROVIDER)}
💾 DB: ${escapeMarkdown(config.DB_MODE)}`;

  await bot.sendMessage(msg.chat.id, message, { parse_mode: 'MarkdownV2' });
});

export { bot };

logger.info('Telegram bot initialized');
