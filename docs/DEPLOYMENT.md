# ZappNews.ai - Debian Home Server Deployment Guide

## Quick Install (5 minutes)

### Prerequisites
- Debian 11/12 or Ubuntu 20.04+
- Root or sudo access
- Internet connection

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/atreyakamat/zappnews.ai.git
cd zappnews.ai

# Run the setup script
sudo bash scripts/setup-debian.sh
```

### 2. Configure Credentials

```bash
# Edit the environment file
sudo nano /opt/zappnews/.env
```

Fill in these required credentials:

| Variable | Where to get it |
|----------|-----------------|
| `SUPABASE_URL` | Supabase dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API |
| `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| `TELEGRAM_BOT_TOKEN` | @BotFather on Telegram |
| `TELEGRAM_CHAT_ID` | See instructions below |

### 3. Set Up Supabase Database

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor
4. Copy and run the contents of `scripts/schema.sql`
5. Go to Settings → API and copy URL + anon key to `.env`

### 4. Create Telegram Bot

1. Open Telegram and message [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Copy the token to `TELEGRAM_BOT_TOKEN`
4. To get your chat ID:
   - Message your new bot (say "hello")
   - Visit: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Find `"chat":{"id":123456789}` - that number is your chat ID
5. Add the chat ID to `TELEGRAM_CHAT_ID`

### 5. Start the Service

```bash
# Enable auto-start on boot
sudo systemctl enable zappnews

# Start the service
sudo systemctl start zappnews

# Check it's running
sudo systemctl status zappnews
```

### 6. Test It

```bash
# Check health
curl http://localhost:3000/health

# Trigger a manual fetch
curl -X POST http://localhost:3000/api/fetch

# Send yourself a test digest
curl -X POST http://localhost:3000/api/digest/daily
```

---

## Management Commands

Use the management script for easy control:

```bash
cd /path/to/zappnews.ai

# Service control
./scripts/manage.sh start
./scripts/manage.sh stop
./scripts/manage.sh restart
./scripts/manage.sh status

# View logs
./scripts/manage.sh logs        # systemd logs
./scripts/manage.sh logs-app    # application logs
./scripts/manage.sh logs-error  # error logs

# Manual triggers
./scripts/manage.sh fetch       # Fetch news now
./scripts/manage.sh digest      # Send daily digest now
./scripts/manage.sh weekend     # Send weekend digest now

# Maintenance
./scripts/manage.sh health      # API health check
./scripts/manage.sh edit-config # Edit .env file
./scripts/manage.sh update      # Pull updates and restart
```

---

## Scheduling

Default schedules (all times in UTC):

| Task | Schedule | Cron Expression |
|------|----------|-----------------|
| Fetch news | Every 6 hours | `0 */6 * * *` |
| Daily digest | 8:00 AM daily | `0 8 * * *` |
| Weekend digest | 9:00 AM Saturday | `0 9 * * 6` |

To customize, edit `/opt/zappnews/.env`:

```bash
# Example: Daily digest at 7am local time (adjust for your timezone)
DAILY_DIGEST_CRON=0 7 * * *
```

Then restart: `sudo systemctl restart zappnews`

---

## Optional: Web Dashboard

The web dashboard lets you browse and manage saved items.

### Install on Same Server

```bash
cd /path/to/zappnews.ai/web

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
nano .env.local
# Add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build for production
npm run build

# Start (or use PM2/systemd)
npm run start
```

### Using PM2 (Recommended for Production)

```bash
# Install PM2
sudo npm install -g pm2

# Start web dashboard on port 3001
cd web
PORT=3001 pm2 start npm --name "zappnews-web" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### Access via Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/zappnews
server {
    listen 80;
    server_name zappnews.local;  # or your domain

    # API backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Web dashboard
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/zappnews /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Troubleshooting

### Service won't start

```bash
# Check logs
sudo journalctl -u zappnews -n 50

# Verify .env file exists and has correct permissions
ls -la /opt/zappnews/.env

# Test manually
cd /opt/zappnews
node dist/index.js
```

### Telegram bot not responding

1. Make sure the bot token is correct
2. Check you messaged the bot first (so it has your chat ID)
3. Verify TELEGRAM_CHAT_ID is your numeric chat ID
4. Check logs: `./scripts/manage.sh logs`

### No news being fetched

```bash
# Trigger manual fetch and watch logs
./scripts/manage.sh fetch
./scripts/manage.sh logs
```

### Database connection issues

1. Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
2. Check Supabase dashboard for any issues
3. Ensure the schema was run correctly

---

## File Locations

| Path | Description |
|------|-------------|
| `/opt/zappnews/` | Application code |
| `/opt/zappnews/.env` | Configuration |
| `/var/log/zappnews/app.log` | Application logs |
| `/var/log/zappnews/error.log` | Error logs |
| `/etc/systemd/system/zappnews.service` | Systemd service |

---

## Backup

The news data is stored in Supabase (cloud), so there's minimal local state to backup. If you want to backup your configuration:

```bash
# Backup
cp /opt/zappnews/.env ~/zappnews-env-backup

# Restore after reinstall
sudo cp ~/zappnews-env-backup /opt/zappnews/.env
sudo chmod 600 /opt/zappnews/.env
```

---

## Uninstall

```bash
./scripts/manage.sh uninstall
```

This removes the application but keeps your Supabase database intact.
