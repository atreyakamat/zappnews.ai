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

// Format a single digest item
function formatDigestItem(item: DigestItem, index: number): string {
  const emoji = TAG_EMOJI[item.tag] || '📰';
  
  return `*${index + 1}. ${escapeMarkdown(item.title)}*
${emoji} ${item.tag.toUpperCase()}

${escapeMarkdown(item.summary)}

💡 ${escapeMarkdown(item.cta)}
🔗 [Read more](${item.url})`;
}

// Escape markdown special characters
function escapeMarkdown(text: string): string {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

// Send daily digest
export async function sendDailyDigest(): Promise<void> {
  try {
    logger.info('Sending daily digest...');
    
    const items = await db.getDailyDigest(5);
    
    if (items.length === 0) {
      await bot.sendMessage(chatId, '🤖 *AI News*\n\nNo new items today. Check back tomorrow!', {
        parse_mode: 'MarkdownV2'
      });
      return;
    }
    
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const header = `🤖 *AI News — ${escapeMarkdown(date)}*\n\n`;
    
    // Send header
    await bot.sendMessage(chatId, header, { parse_mode: 'MarkdownV2' });
    
    // Send each item with inline buttons
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const message = formatDigestItem(item, i);
      
      await bot.sendMessage(chatId, message, {
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [[
            { text: '💾 Save', callback_data: `save:${item.item_id}` },
            { text: '⏭️ Skip', callback_data: `skip:${item.item_id}` }
          ]]
        }
      });
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    logger.info(`Sent daily digest with ${items.length} items`);
  } catch (error) {
    logger.error('Error sending daily digest:', error);
    throw error;
  }
}

// Send weekend digest (saved items)
export async function sendWeekendDigest(): Promise<void> {
  try {
    logger.info('Sending weekend digest...');
    
    const items = await db.getWeekendDigest();
    
    if (items.length === 0) {
      await bot.sendMessage(chatId, '📦 *Weekend Digest*\n\nYou have no saved items to try this weekend\\. Save some items during the week!', {
        parse_mode: 'MarkdownV2'
      });
      return;
    }
    
    const header = `📦 *Your saved items for this weekend* \\(${items.length} items\\)\n\nTime to experiment\\! Here are your bookmarked AI tools and projects:\n`;
    
    await bot.sendMessage(chatId, header, { parse_mode: 'MarkdownV2' });
    
    // Send each saved item with action buttons
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
            { text: '✅ Mark as Tried', callback_data: `tried:${item.saved_id}` },
            { text: '🎉 Done', callback_data: `done:${item.saved_id}` }
          ]]
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    logger.info(`Sent weekend digest with ${items.length} items`);
  } catch (error) {
    logger.error('Error sending weekend digest:', error);
    throw error;
  }
}

// Handle callback queries (button presses)
bot.on('callback_query', async (query) => {
  try {
    const data = query.data;
    if (!data) return;
    
    const [action, id] = data.split(':');
    
    switch (action) {
      case 'save': {
        // Get the summary for this item
        const summary = await db.getSummaryByItemId(id);
        if (summary) {
          await db.saveItem(summary.id);
          await bot.answerCallbackQuery(query.id, { text: '✅ Saved!' });
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
        await bot.answerCallbackQuery(query.id, { text: '🎉 Marked as done!' });
        break;
      
      default:
        await bot.answerCallbackQuery(query.id, { text: 'Unknown action' });
    }
  } catch (error) {
    logger.error('Error handling callback query:', error);
    await bot.answerCallbackQuery(query.id, { text: '❌ Error' });
  }
});

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const welcomeMessage = `🤖 *Welcome to ZappNews AI\\!*

I'll send you daily AI news digests with the latest:
• 🔧 Tools and releases
• 📄 Research papers
• 🚀 Project launches
• 📚 Tutorials
• 💬 Industry insights

*Commands:*
/digest \\- Get today's top AI news
/saved \\- View your saved items
/status \\- Check bot status

Happy learning\\! 🎯`;

  await bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: 'MarkdownV2' });
});

// Handle /digest command
bot.onText(/\/digest/, async () => {
  await sendDailyDigest();
});

// Handle /saved command
bot.onText(/\/saved/, async (msg) => {
  const items = await db.getSavedItems();
  
  if (items.length === 0) {
    await bot.sendMessage(msg.chat.id, '📭 No saved items yet\\. Save items from your daily digest\\!', {
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

// Handle /status command
bot.onText(/\/status/, async (msg) => {
  const message = `✅ *ZappNews AI Status*

🤖 Bot: Online
📡 Polling: Active
⏰ Daily digest: ${escapeMarkdown(config.DAILY_DIGEST_CRON)}
📦 Weekend digest: ${escapeMarkdown(config.WEEKEND_DIGEST_CRON)}
🔄 Fetch schedule: ${escapeMarkdown(config.FETCH_CRON)}`;

  await bot.sendMessage(msg.chat.id, message, { parse_mode: 'MarkdownV2' });
});

export { bot };

logger.info('Telegram bot initialized');
