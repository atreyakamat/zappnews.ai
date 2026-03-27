# ZappNews.ai

🤖 **AI News Feed Pipeline** - Aggregates, summarizes, and delivers AI news to your Telegram daily.

## Features

- **Multi-source aggregation**: Hacker News, Reddit, arXiv, YouTube
- **LLM summarization**: Concise 2-sentence summaries with actionable CTAs
- **Telegram bot**: Daily digests with inline save/skip buttons
- **Weekend reminders**: Get a digest of saved items every Saturday
- **Web dashboard**: Browse and manage your saved library
- **Automatic deduplication**: Never see the same article twice

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ZappNews.ai                              │
├─────────────────────────────────────────────────────────────────┤
│  Sources          │  Backend API       │  Delivery              │
│  ─────────        │  ───────────       │  ────────              │
│  • Hacker News    │  • Fetch Service   │  • Telegram Bot        │
│  • Reddit         │  • LLM Summarizer  │  • Web Dashboard       │
│  • arXiv          │  • Cron Scheduler  │                        │
│  • YouTube        │  • Supabase DB     │                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🏠 Home Server Deployment (Debian/Ubuntu)

### Quick Install

```bash
# Clone the repository
git clone https://github.com/atreyakamat/zappnews.ai.git
cd zappnews.ai

# Run the setup script
sudo bash scripts/setup-debian.sh

# Edit configuration
sudo nano /opt/zappnews/.env

# Start the service
sudo systemctl enable zappnews
sudo systemctl start zappnews
```

### Management Commands

```bash
./scripts/manage.sh start      # Start service
./scripts/manage.sh stop       # Stop service
./scripts/manage.sh status     # Check status
./scripts/manage.sh logs       # View logs
./scripts/manage.sh fetch      # Trigger manual fetch
./scripts/manage.sh digest     # Send daily digest now
```

📖 **Full deployment guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 💻 Local Development

### 1. Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- OpenAI API key
- Telegram bot token (from @BotFather)

### 2. Setup

```bash
# Clone and install
git clone https://github.com/yourusername/zappnews.ai.git
cd zappnews.ai
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
# Copy scripts/schema.sql and run it in Supabase SQL editor

# Start development server
npm run dev
```

### 3. Configure Telegram Bot

1. Message @BotFather on Telegram
2. Create new bot: `/newbot`
3. Copy the token to `TELEGRAM_BOT_TOKEN`
4. Get your chat ID by messaging your bot and visiting:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
5. Copy your chat ID to `TELEGRAM_CHAT_ID`

### 4. Optional: Configure Additional Sources

**Reddit** (recommended):
1. Create app at https://www.reddit.com/prefs/apps
2. Add `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`

**YouTube**:
1. Get API key from Google Cloud Console
2. Add `YOUTUBE_API_KEY`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/fetch` | POST | Trigger manual fetch |
| `/api/digest/daily` | POST | Send daily digest |
| `/api/digest/weekend` | POST | Send weekend digest |

## Telegram Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/digest` | Get today's AI news |
| `/saved` | View saved items |
| `/status` | Check bot status |

## Scheduling

Default schedules (UTC):
- **Fetch**: Every 6 hours (`0 */6 * * *`)
- **Daily digest**: 8am daily (`0 8 * * *`)
- **Weekend digest**: Saturday 9am (`0 9 * * 6`)

Customize in `.env`:
```
FETCH_CRON=0 */6 * * *
DAILY_DIGEST_CRON=0 8 * * *
WEEKEND_DIGEST_CRON=0 9 * * 6
```

## Web Dashboard

```bash
cd web
npm install
cp .env.example .env.local
# Edit .env.local with Supabase credentials
npm run dev
```

Visit http://localhost:3000 to see your saved library.

## Deployment

### Railway (Backend)

1. Connect GitHub repo to Railway
2. Add environment variables
3. Deploy

### Vercel (Web Dashboard)

1. Connect `web/` directory to Vercel
2. Add environment variables
3. Deploy

### Docker

```bash
docker-compose up -d
```

## Cost Estimate

| Service | Cost |
|---------|------|
| Supabase | Free tier |
| OpenAI (~500 summaries/mo) | ~$1-3/mo |
| Telegram | Free |
| Railway | ~$5/mo |
| Vercel | Free tier |
| **Total** | **~$5-8/mo** |

## Project Structure

```
zappnews.ai/
├── src/
│   ├── index.ts              # Express server entry
│   ├── config/               # Environment config
│   ├── types/                # TypeScript interfaces
│   ├── services/
│   │   ├── sources/          # HN, Reddit, arXiv, YouTube fetchers
│   │   ├── database.ts       # Supabase client
│   │   ├── summarizer.ts     # OpenAI LLM integration
│   │   ├── telegram.ts       # Telegram bot
│   │   └── pipeline.ts       # Orchestration
│   └── scheduler/            # Cron jobs
├── web/                      # Next.js dashboard
├── scripts/
│   └── schema.sql            # Database schema
└── docker-compose.yml        # Docker deployment
```

## License

MIT
