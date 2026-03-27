import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Database mode: 'local' (SQLite) or 'supabase'
  DB_MODE: z.enum(['local', 'supabase']).default('local'),
  
  // Local SQLite path
  SQLITE_PATH: z.string().default('./data/zappnews.db'),

  // Supabase (optional, only if DB_MODE=supabase)
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),

  // LLM Provider: 'openai' or 'openrouter'
  LLM_PROVIDER: z.enum(['openai', 'openrouter']).default('openrouter'),
  
  // OpenAI (optional)
  OPENAI_API_KEY: z.string().optional(),
  
  // OpenRouter (default - 50 free requests!)
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().default('meta-llama/llama-3.2-3b-instruct:free'),

  // Telegram (Required)
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),

  // Reddit (optional)
  REDDIT_CLIENT_ID: z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),
  REDDIT_USER_AGENT: z.string().default('ZappNewsBot/1.0'),

  // YouTube (optional)
  YOUTUBE_API_KEY: z.string().optional(),

  // Server
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Scheduling - now with hourly digest!
  FETCH_CRON: z.string().default('0 * * * *'),           // Every hour
  DIGEST_CRON: z.string().default('5 * * * *'),          // 5 minutes past each hour
  MIN_ITEMS_FOR_DIGEST: z.string().default('3'),         // Minimum items to send digest
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }
  
  return result.data;
};

export const config = parseEnv();

export type Config = z.infer<typeof envSchema>;
