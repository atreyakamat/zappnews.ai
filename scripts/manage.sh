#!/bin/bash
# ZappNews.ai - Management Script
# Usage: ./manage.sh [command]

set -e

INSTALL_DIR="/opt/zappnews"
SERVICE_NAME="zappnews"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

case "$1" in
    start)
        echo -e "${GREEN}Starting ZappNews...${NC}"
        sudo systemctl start $SERVICE_NAME
        echo "✅ Started"
        ;;
    
    stop)
        echo -e "${YELLOW}Stopping ZappNews...${NC}"
        sudo systemctl stop $SERVICE_NAME
        echo "✅ Stopped"
        ;;
    
    restart)
        echo -e "${YELLOW}Restarting ZappNews...${NC}"
        sudo systemctl restart $SERVICE_NAME
        echo "✅ Restarted"
        ;;
    
    status)
        echo -e "${BLUE}ZappNews Status:${NC}"
        sudo systemctl status $SERVICE_NAME --no-pager
        ;;
    
    logs)
        echo -e "${BLUE}ZappNews Logs (Ctrl+C to exit):${NC}"
        sudo journalctl -u $SERVICE_NAME -f
        ;;
    
    logs-app)
        echo -e "${BLUE}Application Logs:${NC}"
        tail -f /var/log/zappnews/app.log
        ;;
    
    logs-error)
        echo -e "${RED}Error Logs:${NC}"
        tail -f /var/log/zappnews/error.log
        ;;
    
    fetch)
        echo -e "${YELLOW}Triggering manual fetch...${NC}"
        curl -X POST http://localhost:3000/api/fetch
        echo ""
        ;;
    
    digest)
        echo -e "${YELLOW}Sending daily digest...${NC}"
        curl -X POST http://localhost:3000/api/digest/daily
        echo ""
        ;;
    
    weekend)
        echo -e "${YELLOW}Sending weekend digest...${NC}"
        curl -X POST http://localhost:3000/api/digest/weekend
        echo ""
        ;;
    
    health)
        echo -e "${BLUE}Health Check:${NC}"
        curl -s http://localhost:3000/health | jq . || curl http://localhost:3000/health
        echo ""
        ;;
    
    edit-config)
        sudo nano $INSTALL_DIR/.env
        echo -e "${YELLOW}Restart service to apply changes: ./manage.sh restart${NC}"
        ;;
    
    update)
        echo -e "${YELLOW}Updating ZappNews...${NC}"
        cd $INSTALL_DIR
        sudo systemctl stop $SERVICE_NAME
        
        # Pull latest code (if git repo)
        if [ -d ".git" ]; then
            git pull
        fi
        
        npm ci
        npm run build
        sudo systemctl start $SERVICE_NAME
        echo -e "${GREEN}✅ Updated and restarted${NC}"
        ;;
    
    uninstall)
        echo -e "${RED}⚠️  This will remove ZappNews. Are you sure? (y/N)${NC}"
        read -r confirm
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            sudo systemctl stop $SERVICE_NAME
            sudo systemctl disable $SERVICE_NAME
            sudo rm /etc/systemd/system/zappnews.service
            sudo systemctl daemon-reload
            sudo rm -rf $INSTALL_DIR
            sudo rm -rf /var/log/zappnews
            echo -e "${GREEN}✅ Uninstalled${NC}"
        else
            echo "Cancelled"
        fi
        ;;
    
    *)
        echo "ZappNews.ai Management Script"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Commands:"
        echo "  start        Start the service"
        echo "  stop         Stop the service"
        echo "  restart      Restart the service"
        echo "  status       Show service status"
        echo "  logs         Follow systemd logs"
        echo "  logs-app     Follow application logs"
        echo "  logs-error   Follow error logs"
        echo "  fetch        Trigger manual news fetch"
        echo "  digest       Send daily digest now"
        echo "  weekend      Send weekend digest now"
        echo "  health       Check API health"
        echo "  edit-config  Edit environment config"
        echo "  update       Update to latest version"
        echo "  uninstall    Remove ZappNews"
        echo ""
        exit 1
        ;;
esac
