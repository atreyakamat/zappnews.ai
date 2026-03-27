import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), '..', 'data', 'config.json');

// Default RSS feeds
const DEFAULT_RSS_FEEDS = [
  { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss/', enabled: true, category: 'ai_company' },
  { name: 'Anthropic', url: 'https://www.anthropic.com/rss.xml', enabled: true, category: 'ai_company' },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', enabled: true, category: 'ai_company' },
  { name: 'Meta AI', url: 'https://ai.meta.com/blog/rss/', enabled: true, category: 'ai_company' },
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', enabled: true, category: 'tech_news' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', enabled: true, category: 'tech_news' },
  { name: 'Wired AI', url: 'https://www.wired.com/feed/tag/ai/latest/rss', enabled: true, category: 'tech_news' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', enabled: true, category: 'tech_news' },
  { name: 'Berkeley AI Research', url: 'https://bair.berkeley.edu/blog/feed.xml', enabled: true, category: 'research' },
  { name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', enabled: true, category: 'developer' },
  { name: "Ben's Bites", url: 'https://bensbites.beehiiv.com/feed', enabled: true, category: 'newsletter' },
  { name: 'The Batch', url: 'https://www.deeplearning.ai/the-batch/feed/', enabled: true, category: 'newsletter' },
];

function getConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading config:', error);
  }
  
  // Return default config
  return {
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      chatId: process.env.TELEGRAM_CHAT_ID || '',
      connected: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
    },
    schedule: {
      fetchCron: process.env.FETCH_CRON || '0 */3 * * *',
      digestCron: process.env.DIGEST_CRON || '5 */3 * * *'
    },
    socialAccounts: [
      { platform: 'twitter', connected: !!process.env.TWITTER_ACCESS_TOKEN, username: process.env.TWITTER_USERNAME },
      { platform: 'threads', connected: !!process.env.THREADS_ACCESS_TOKEN, username: process.env.THREADS_USERNAME },
      { platform: 'linkedin', connected: !!process.env.LINKEDIN_ACCESS_TOKEN, username: process.env.LINKEDIN_USERNAME },
      { platform: 'reddit', connected: !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET), username: process.env.REDDIT_USERNAME }
    ],
    rssFeeds: DEFAULT_RSS_FEEDS
  };
}

function saveConfig(config: any) {
  const dir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export async function GET() {
  const config = getConfig();
  return NextResponse.json(config);
}

export async function PUT(request: Request) {
  try {
    const config = await request.json();
    saveConfig(config);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
