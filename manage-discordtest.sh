#!/bin/bash

# Exit on error
set -e

# Get script directory for relative paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Configuration
APP_NAME="discord-api"
DEPLOY_DIR="/var/www/discordtest.com"
HEALTH_CHECK_URL="http://localhost:3000/health"
MAX_RETRIES=5
RETRY_INTERVAL=10
GITHUB_REPO="https://itisgriff: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@github.com/itisgriff/DiscordTest.com.git"
NODE_VERSION="v23.3.0"
LOG_DIR="$SCRIPT_DIR/logs"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/1315432388297494538/-vrWc_lLHtPtWEgeYN2xOfbtNn-FaekK_iIA-fKEEGZntLLyK6JScrSSAteOEhpcGONt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Discord notification function
send_discord_notification() {
    local message="$1"
    local color="$2"
    
    # Default to red if no color specified
    [[ -z "$color" ]] && color="16711680"  # Red in decimal
    
    # Convert our shell colors to Discord colors
    case "$color" in
        "$RED") color="16711680" ;;     # Red
        "$GREEN") color="65280" ;;       # Green
        "$YELLOW") color="16776960" ;;   # Yellow
        "$BLUE") color="255" ;;          # Blue
    esac
    
    # Construct the JSON payload
    local payload=$(cat <<EOF
{
  "embeds": [{
    "title": "Server Status Update",
    "description": "$message",
    "color": $color,
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  }]
}
EOF
)
    
    # Send to Discord
    curl -H "Content-Type: application/json" \
         -d "$payload" \
         "$DISCORD_WEBHOOK_URL" \
         -s > /dev/null || true
}

# Logging function
log() {
    local message="$1"
    local color="$2"
    local notify_discord="$3"
    
    echo -e "${color:-$NC}[$(date +'%Y-%m-%d %H:%M:%S')] $message${NC}"
    
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
    fi
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_DIR/manage.log"
    
    # Send to Discord if requested and it's an error or important message
    if [[ "$notify_discord" == "true" ]]; then
        send_discord_notification "$message" "$color"
    fi
}

# Health check function
check_health() {
    local retries=0
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -s "$HEALTH_CHECK_URL" > /dev/null; then
            log "Health check passed" "$GREEN" "true"
            return 0
        fi
        retries=$((retries + 1))
        log "Health check failed. Attempt $retries of $MAX_RETRIES. Waiting ${RETRY_INTERVAL}s..." "$YELLOW" "true"
        sleep $RETRY_INTERVAL
    done
    log "Health check failed after $MAX_RETRIES attempts" "$RED" "true"
    return 1
}

# Setup environment function
setup_environment() {
    # Ensure required directories exist
    if [ ! -d "$DEPLOY_DIR" ]; then
        mkdir -p "$DEPLOY_DIR"
        log "Created deploy directory: $DEPLOY_DIR" "$GREEN"
    fi

    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        log "Created log directory: $LOG_DIR" "$GREEN"
    fi

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log "Installing Node.js $NODE_VERSION..." "$YELLOW" "true"
        curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
        apt-get install -y nodejs
    fi

    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        log "Installing PM2..." "$YELLOW" "true"
        npm install -g pm2
    fi
}

# Deploy function
deploy() {
    log "Starting deployment process..." "$BLUE" "true"
    
    # Stop existing application
    if pm2 list | grep -q "$APP_NAME"; then
        log "Stopping existing application..." "$YELLOW" "true"
        pm2 stop "$APP_NAME" || true
    fi

    # Backup current deployment if it exists
    if [ -d "$DEPLOY_DIR" ]; then
        BACKUP_DIR="${DEPLOY_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
        log "Creating backup at $BACKUP_DIR" "$YELLOW"
        cp -r "$DEPLOY_DIR" "$BACKUP_DIR"
    fi

    # Clone/pull repository
    if [ -d "$DEPLOY_DIR/.git" ]; then
        log "Updating existing repository..." "$YELLOW" "true"
        cd "$DEPLOY_DIR"
        git fetch --all
        git reset --hard origin/main
    else
        log "Cloning fresh repository..." "$YELLOW" "true"
        rm -rf "$DEPLOY_DIR"
        git clone "$GITHUB_REPO" "$DEPLOY_DIR"
        cd "$DEPLOY_DIR"
    fi

    # Install dependencies and build
    log "Installing dependencies..." "$YELLOW"
    npm install
    
    log "Building application..." "$YELLOW"
    npm run build

    # Start application with PM2
    log "Starting application with PM2..." "$YELLOW" "true"
    pm2 start ecosystem.config.js

    # Perform health check
    if check_health; then
        log "Deployment successful!" "$GREEN" "true"
    else
        log "Deployment failed health check. Rolling back..." "$RED" "true"
        if [ -d "$BACKUP_DIR" ]; then
            rm -rf "$DEPLOY_DIR"
            mv "$BACKUP_DIR" "$DEPLOY_DIR"
            cd "$DEPLOY_DIR"
            pm2 start ecosystem.config.js
            log "Rollback complete" "$YELLOW" "true"
        fi
        exit 1
    fi
}

# Restart function
restart() {
    log "Restarting application..." "$BLUE" "true"
    
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 restart "$APP_NAME"
        
        if check_health; then
            log "Application restarted successfully!" "$GREEN" "true"
        else
            log "Application failed health check after restart" "$RED" "true"
            exit 1
        fi
    else
        log "Application is not running. Starting..." "$YELLOW" "true"
        cd "$DEPLOY_DIR"
        pm2 start ecosystem.config.js
        
        if check_health; then
            log "Application started successfully!" "$GREEN" "true"
        else
            log "Application failed to start" "$RED" "true"
            exit 1
        fi
    fi
}

# Status function
status() {
    log "Checking application status..." "$BLUE"
    
    # Check PM2 status
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 show "$APP_NAME"
        
        # Check health endpoint
        if curl -s "$HEALTH_CHECK_URL" > /dev/null; then
            log "Health check: OK" "$GREEN" "true"
        else
            log "Health check: FAILED" "$RED" "true"
        fi
    else
        log "Application is not running" "$RED" "true"
    fi

    # Show recent logs
    log "Recent logs:" "$BLUE"
    tail -n 50 "$LOG_DIR/manage.log"
}

# Show usage function
show_usage() {
    echo -e "\n${BLUE}DiscordTest.com Management Script${NC}"
    echo -e "\n${YELLOW}Available commands:${NC}"
    echo -e "  ${GREEN}deploy${NC}   - Deploy new version from git"
    echo -e "  ${GREEN}restart${NC}  - Restart the application"
    echo -e "  ${GREEN}status${NC}   - Show application status and recent logs"
    echo -e "\n${YELLOW}Usage:${NC}"
    echo -e "  sudo $0 {deploy|restart|status}"
    
    if [ -z "$1" ]; then
        echo -e "\n${YELLOW}Would you like to:${NC}"
        echo -e "1) Deploy new version"
        echo -e "2) Restart application"
        echo -e "3) Check status"
        echo -e "4) Exit"
        read -p "Enter your choice (1-4): " choice
        case $choice in
            1) deploy ;;
            2) restart ;;
            3) status ;;
            4) exit 0 ;;
            *) echo -e "\n${RED}Invalid choice${NC}" && exit 1 ;;
        esac
    fi
}

# Main execution
setup_environment

case "$1" in
    "deploy")
        deploy
        ;;
    "restart")
        restart
        ;;
    "status")
        status
        ;;
    *)
        show_usage "no_args"
        ;;
esac 