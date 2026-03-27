#!/bin/bash
# ZappNews.ai - Debian/Ubuntu Setup Script
# Run as root or with sudo

set -e

echo "🤖 ZappNews.ai - Debian Setup Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Get the actual user (not root)
ACTUAL_USER=${SUDO_USER:-$USER}
INSTALL_DIR="/opt/zappnews"
DATA_DIR="/var/lib/zappnews"

echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"
apt-get install -y \
    curl \
    git \
    build-essential \
    ca-certificates \
    gnupg

# Install Node.js 20 LTS
echo -e "${YELLOW}Step 3: Installing Node.js 20...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Create installation directory
echo -e "${YELLOW}Step 4: Setting up directories...${NC}"
mkdir -p $INSTALL_DIR
mkdir -p $DATA_DIR
mkdir -p /var/log/zappnews

# Copy application files
echo -e "${YELLOW}Step 5: Copying application files...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cp -r $SCRIPT_DIR/package*.json $INSTALL_DIR/
cp -r $SCRIPT_DIR/tsconfig.json $INSTALL_DIR/
cp -r $SCRIPT_DIR/src $INSTALL_DIR/

# Install dependencies and build
echo -e "${YELLOW}Step 6: Installing npm packages...${NC}"
cd $INSTALL_DIR
npm ci --only=production
npm install typescript tsx -g

echo -e "${YELLOW}Step 7: Building application...${NC}"
npm run build

# Create .env file if it doesn't exist
if [ ! -f "$INSTALL_DIR/.env" ]; then
    echo -e "${YELLOW}Step 8: Creating environment file...${NC}"
    cat > $INSTALL_DIR/.env << 'EOF'
# ZappNews.ai Environment Configuration
# Fill in your credentials below

# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# OpenAI (Required)
OPENAI_API_KEY=sk-your-openai-key

# Telegram (Required)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# Reddit (Optional)
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USER_AGENT=ZappNewsBot/1.0

# YouTube (Optional)
YOUTUBE_API_KEY=

# Server
PORT=3000
NODE_ENV=production

# Scheduling (cron expressions - UTC)
FETCH_CRON=0 */6 * * *
DAILY_DIGEST_CRON=0 8 * * *
WEEKEND_DIGEST_CRON=0 9 * * 6
EOF
    chmod 600 $INSTALL_DIR/.env
    echo -e "${RED}⚠️  Please edit $INSTALL_DIR/.env with your credentials!${NC}"
fi

# Set ownership
chown -R $ACTUAL_USER:$ACTUAL_USER $INSTALL_DIR
chown -R $ACTUAL_USER:$ACTUAL_USER $DATA_DIR
chown -R $ACTUAL_USER:$ACTUAL_USER /var/log/zappnews

# Create systemd service
echo -e "${YELLOW}Step 9: Creating systemd service...${NC}"
cat > /etc/systemd/system/zappnews.service << EOF
[Unit]
Description=ZappNews.ai - AI News Feed Pipeline
Documentation=https://github.com/atreyakamat/zappnews.ai
After=network.target

[Service]
Type=simple
User=$ACTUAL_USER
Group=$ACTUAL_USER
WorkingDirectory=$INSTALL_DIR
ExecStart=/usr/bin/node $INSTALL_DIR/dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/zappnews/app.log
StandardError=append:/var/log/zappnews/error.log
Environment=NODE_ENV=production

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DATA_DIR /var/log/zappnews

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

echo ""
echo -e "${GREEN}✅ ZappNews.ai installed successfully!${NC}"
echo ""
echo "======================================"
echo "Next steps:"
echo "======================================"
echo ""
echo "1. Edit the configuration file:"
echo "   sudo nano $INSTALL_DIR/.env"
echo ""
echo "2. Set up Supabase database:"
echo "   - Create a Supabase project at https://supabase.com"
echo "   - Run the schema: cat $SCRIPT_DIR/scripts/schema.sql"
echo "   - Copy the URL and anon key to .env"
echo ""
echo "3. Create a Telegram bot:"
echo "   - Message @BotFather on Telegram"
echo "   - Create bot with /newbot"
echo "   - Copy token to TELEGRAM_BOT_TOKEN"
echo "   - Get your chat ID and set TELEGRAM_CHAT_ID"
echo ""
echo "4. Start the service:"
echo "   sudo systemctl enable zappnews"
echo "   sudo systemctl start zappnews"
echo ""
echo "5. Check status:"
echo "   sudo systemctl status zappnews"
echo "   sudo journalctl -u zappnews -f"
echo ""
echo "6. View logs:"
echo "   tail -f /var/log/zappnews/app.log"
echo ""
