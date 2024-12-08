#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Configuration
PROJECT_DIR="/var/www/discordtest.com"  # Change this for different projects
PROJECT_NAME="discord-api"              # Match the name used in deploy script
LOGS_DIR="$SCRIPT_DIR/logs"            # Logs directory relative to script location
LOG_FILE="$LOGS_DIR/monitor-server.log"
MAX_RESTART_ATTEMPTS=3
PORT=3000                              # Application port
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/your/webhook/url/here"  # Replace with your Discord webhook URL

# Node.js and PM2 paths
export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
NODE_PATH="/home/ubuntu/.nvm/versions/node/v23.3.0/lib/node_modules"
NPM_PATH="/home/ubuntu/.nvm/versions/node/v23.3.0/bin/npm"
PATH="$PATH:/home/ubuntu/.nvm/versions/node/v23.3.0/bin"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p "$LOGS_DIR"
chown www-data:www-data "$LOGS_DIR"

# Function to log messages
log_message() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" >> "$LOG_FILE"
    echo "[$timestamp] $message"
}

# Function to run PM2 commands as www-data
pm2_command() {
    sudo -u www-data bash -c "PATH=$PATH NODE_PATH=$NODE_PATH pm2 $*"
}

# Function to check and free port
check_and_free_port() {
    log_message "Checking if port $PORT is in use..."
    
    # Stop all PM2 processes first
    pm2_command delete all > /dev/null 2>&1
    pm2_command kill > /dev/null 2>&1
    
    # More aggressive port cleanup
    for i in {1..3}; do
        if lsof -i :$PORT > /dev/null 2>&1; then
            log_message "Attempt $i: Port $PORT is in use. Attempting to free it..."
            
            # Kill any process using the port
            if command -v fuser >/dev/null 2>&1; then
                fuser -k $PORT/tcp >/dev/null 2>&1
            fi
            
            # Alternative method using lsof
            local pid=$(lsof -t -i:$PORT 2>/dev/null)
            if [ ! -z "$pid" ]; then
                log_message "Killing process $pid using port $PORT"
                kill -9 $pid 2>/dev/null
            fi
            
            sleep 3
        else
            log_message "Port $PORT is free"
            return 0
        fi
    done
    
    # Final check
    if lsof -i :$PORT > /dev/null 2>&1; then
        log_message "Failed to free port $PORT after multiple attempts"
        send_discord_notification "🚨 Error: Failed to free port $PORT after multiple attempts"
        return 1
    fi
    
    return 0
}

# Function to check PM2 logs
check_pm2_logs() {
    log_message "Checking PM2 logs for errors..."
    pm2_command logs --lines 50 --nostream >> "$LOG_FILE" 2>&1
    
    # Also check PM2 error logs specifically
    if [ -f ~/.pm2/logs/${PROJECT_NAME}-error.log ]; then
        log_message "Recent error logs:"
        tail -n 50 ~/.pm2/logs/${PROJECT_NAME}-error.log >> "$LOG_FILE"
    fi
}

# Function to send Discord notification
send_discord_notification() {
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        local message="$1"
        curl -H "Content-Type: application/json" \
             -d "{\"content\":\"$message\"}" \
             "$DISCORD_WEBHOOK_URL" 2>/dev/null
    fi
}

# Function to check if PM2 is installed
check_pm2_installed() {
    if ! command -v pm2 &> /dev/null; then
        log_message "PM2 is not installed. Installing PM2..."
        $NPM_PATH install -g pm2
        if [ $? -ne 0 ]; then
            log_message "Failed to install PM2. Exiting."
            exit 1
        fi
    fi
}

# Function to check if Node.js and npm are installed
check_node_installed() {
    if ! command -v node &> /dev/null || ! command -v $NPM_PATH &> /dev/null; then
        log_message "Node.js or npm is not installed at the correct path. Aborting."
        exit 1
    fi
}

# Function to check environment file
check_env_file() {
    if [ ! -f "$PROJECT_DIR/server/.env" ]; then
        log_message "Warning: .env file not found in $PROJECT_DIR/server"
        send_discord_notification "⚠️ Warning: .env file not found in project directory"
        return 1
    fi
    return 0
}

# Function to check if process is running
check_process() {
    local process_status=$(pm2_command jlist | grep -c "\"name\":\"$PROJECT_NAME\"")
    if [ "$process_status" -eq 0 ]; then
        return 1
    fi
    
    # Check if process is online
    local online_status=$(pm2_command jlist | grep -c "\"name\":\"$PROJECT_NAME\",\"pm2_env\":{.*\"status\":\"online\"")
    if [ "$online_status" -eq 0 ]; then
        return 1
    fi
    
    return 0
}

# Function to start/restart the process
restart_process() {
    local attempt=1
    
    while [ $attempt -le $MAX_RESTART_ATTEMPTS ]; do
        log_message "Attempt $attempt to start/restart $PROJECT_NAME..."
        
        # Check and free port first
        if ! check_and_free_port; then
            log_message "Failed to free required port. Exiting."
            return 1
        fi
        
        # Change to project directory
        cd "$PROJECT_DIR/server" || {
            log_message "Failed to change to project directory: $PROJECT_DIR/server"
            send_discord_notification "🚨 Error: Cannot access project directory"
            exit 1
        }
        
        # Check node_modules
        if [ ! -d "node_modules" ]; then
            log_message "node_modules not found, running npm install..."
            sudo -u www-data $NPM_PATH install --omit=dev
            if [ $? -ne 0 ]; then
                log_message "Failed to install dependencies"
                send_discord_notification "🚨 Error: Failed to install dependencies"
                return 1
            fi
        fi
        
        # Stop existing process if running
        pm2_command stop "$PROJECT_NAME" 2>/dev/null
        pm2_command delete "$PROJECT_NAME" 2>/dev/null
        
        # Clear PM2 logs before starting
        pm2_command flush
        
        # Wait a moment for the port to be fully released
        sleep 2
        
        # Start the process with additional logging
        if sudo -u www-data bash -c "PATH=$PATH NODE_PATH=$NODE_PATH NODE_ENV=production pm2 start index.js --name $PROJECT_NAME --update-env"; then
            log_message "Successfully started $PROJECT_NAME"
            send_discord_notification "✅ Service $PROJECT_NAME has been restarted successfully"
            
            # Save PM2 process list
            sudo -u www-data bash -c "PATH=$PATH NODE_PATH=$NODE_PATH pm2 save"
            
            # Wait a moment and check logs for immediate errors
            sleep 5
            check_pm2_logs
            
            return 0
        fi
        
        log_message "Failed to start $PROJECT_NAME (attempt $attempt)"
        check_pm2_logs
        
        attempt=$((attempt + 1))
        sleep 10
    done
    
    log_message "Failed to start $PROJECT_NAME after $MAX_RESTART_ATTEMPTS attempts"
    send_discord_notification "🚨 Critical: Failed to restart $PROJECT_NAME after multiple attempts"
    return 1
}

# Main execution
main() {
    # Create log file if it doesn't exist
    touch "$LOG_FILE"
    chown www-data:www-data "$LOG_FILE"
    
    # Check prerequisites
    check_node_installed
    check_pm2_installed
    
    # Check environment file
    check_env_file
    
    # Check if process is running
    if ! check_process; then
        log_message "Process $PROJECT_NAME is not running or is in an error state"
        restart_process
    else
        log_message "Process $PROJECT_NAME is running normally"
        # Check logs for any recent errors
        check_pm2_logs
    fi
}

# Run main function
main
