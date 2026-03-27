import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_KEY: z.string().min(1).optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().min(1),

  // Telegram
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

  // Scheduling
  FETCH_CRON: z.string().default('0 */6 * * *'),
  DAILY_DIGEST_CRON: z.string().default('0 8 * * *'),
  WEEKEND_DIGEST_CRON: z.string().default('0 9 * * 6'),
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
