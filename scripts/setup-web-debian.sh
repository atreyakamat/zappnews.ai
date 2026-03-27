#!/bin/bash
# ZappNews.ai - Web Dashboard Setup for Debian
# Run after main setup-debian.sh

set -e

echo "🌐 ZappNews.ai - Web Dashboard Setup"
echo "====================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

ACTUAL_USER=${SUDO_USER:-$USER}
WEB_DIR="/opt/zappnews-web"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${YELLOW}Step 1: Installing PM2...${NC}"
npm install -g pm2

echo -e "${YELLOW}Step 2: Setting up web dashboard directory...${NC}"
mkdir -p $WEB_DIR
cp -r $SCRIPT_DIR/web/* $WEB_DIR/
chown -R $ACTUAL_USER:$ACTUAL_USER $WEB_DIR

echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
cd $WEB_DIR
sudo -u $ACTUAL_USER npm install

echo -e "${YELLOW}Step 4: Creating environment file...${NC}"
if [ ! -f "$WEB_DIR/.env.local" ]; then
    cat > $WEB_DIR/.env.local << 'EOF'
# Get these from your Supabase dashboard -> Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF
    chmod 600 $WEB_DIR/.env.local
    chown $ACTUAL_USER:$ACTUAL_USER $WEB_DIR/.env.local
    echo -e "${RED}⚠️  Please edit $WEB_DIR/.env.local with your Supabase credentials!${NC}"
fi

echo -e "${YELLOW}Step 5: Building for production...${NC}"
sudo -u $ACTUAL_USER npm run build

echo -e "${YELLOW}Step 6: Setting up PM2...${NC}"
cd $WEB_DIR
sudo -u $ACTUAL_USER PORT=3001 pm2 start npm --name "zappnews-web" -- start
sudo -u $ACTUAL_USER pm2 save

# Set up PM2 to start on boot
env PATH=$PATH:/usr/bin pm2 startup systemd -u $ACTUAL_USER --hp /home/$ACTUAL_USER

echo ""
echo -e "${GREEN}✅ Web dashboard installed!${NC}"
echo ""
echo "Access at: http://localhost:3001"
echo ""
echo "Management commands:"
echo "  pm2 status           - Check status"
echo "  pm2 logs zappnews-web - View logs"
echo "  pm2 restart zappnews-web - Restart"
echo ""

# Optional: Set up nginx
read -p "Do you want to set up Nginx reverse proxy? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Installing and configuring Nginx...${NC}"
    apt-get install -y nginx
    
    cat > /etc/nginx/sites-available/zappnews << 'EOF'
server {
    listen 80;
    server_name _;  # Change to your domain

    # API backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Web dashboard
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/zappnews /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    nginx -t && systemctl reload nginx
    
    echo -e "${GREEN}✅ Nginx configured!${NC}"
    echo "Access at: http://your-server-ip"
fi
