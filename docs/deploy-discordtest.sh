#!/bin/bash

# Exit on error
set -e

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root or with sudo"
  exit 1
fi

# Load NVM and set NPM path
export NVM_DIR="/home/ubuntu/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
NPM_PATH="/home/ubuntu/.nvm/versions/node/v23.3.0/bin/npm"

# Check required commands
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v $NPM_PATH >/dev/null 2>&1 || { echo "npm is required but not installed at $NPM_PATH. Aborting." >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "git is required but not installed. Aborting." >&2; exit 1; }

echo "Starting deployment..."

# Define directories
DEPLOY_DIR="/var/www/discordtest.com"
TEMP_DIR="/tmp/discordtest-deploy"

# Ensure PM2 is installed globally
if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing PM2 globally..."
  $NPM_PATH install -g pm2
fi

# Create temporary directory for build process
echo "Creating temporary build directory..."
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Clone repository to temporary directory
echo "Cloning repository..."
git clone https://itisgriff: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@github.com/itisgriff/DiscordTest.com.git $TEMP_DIR
cd $TEMP_DIR

# Check for .env file in deployment directory and copy if it exists
if [ -f "$DEPLOY_DIR/.env" ]; then
  echo "Copying existing .env from deployment directory..."
  cp "$DEPLOY_DIR/.env" .
else
  echo "Creating new .env file..."
  mkdir -p $DEPLOY_DIR
  cat > "$DEPLOY_DIR/.env" << EOL
# Discord Bot Token
DISCORD_BOT_TOKEN=REDACTED

# Cloudflare Turnstile Keys
VITE_TURNSTILE_SITE_KEY=0x4AAAAAAA1qZt-MiCPVwWW7
TURNSTILE_SECRET_KEY=0x4AAAAAAA1qZqBWeQUtpbqqI5f9Ii3ou4Q

# GitHub Token (Required for deployment)
GITHUB_TOKEN=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

# Node Environment (Optional, defaults to development)
NODE_ENV=production

# Server Port (Optional, defaults to 3000)
PORT=3000
EOL
  echo "Please edit $DEPLOY_DIR/.env with your actual values and run this script again."
  exit 1
fi

# Source environment variables
echo "Loading environment variables..."
export $(cat .env | grep -v '^#' | xargs)

# Install build dependencies first
echo "Installing build dependencies..."
$NPM_PATH install -g typescript
$NPM_PATH install --save-dev @vitejs/plugin-react@latest vite@latest

# Clean install all dependencies
echo "Installing project dependencies..."
$NPM_PATH ci

# Build frontend
echo "Building frontend..."
export NODE_ENV=production
$NPM_PATH exec tsc -b && NODE_ENV=production $NPM_PATH exec vite build

# Prepare server files
echo "Setting up server..."
mkdir -p $DEPLOY_DIR/server
cp -r server/* $DEPLOY_DIR/server/

# Clean install production dependencies for server
echo "Installing server dependencies..."
cd $DEPLOY_DIR
rm -rf node_modules
cp $TEMP_DIR/package.json .
cp $TEMP_DIR/package-lock.json .
$NPM_PATH install --production

# Copy built frontend files
echo "Copying frontend files..."
cp -r $TEMP_DIR/dist/* $DEPLOY_DIR/

# Set proper permissions
echo "Setting permissions..."
chown -R www-data:www-data $DEPLOY_DIR
chmod -R 750 $DEPLOY_DIR

# Start/Restart PM2 process
echo "Starting server..."
sudo -u www-data bash -c "PATH=$PATH:/home/ubuntu/.nvm/versions/node/v23.3.0/bin HOME=/var/www pm2 restart discord-api || PATH=$PATH:/home/ubuntu/.nvm/versions/node/v23.3.0/bin HOME=/var/www pm2 start server/index.js --name discord-api"
sudo -u www-data bash -c "PATH=$PATH:/home/ubuntu/.nvm/versions/node/v23.3.0/bin HOME=/var/www pm2 save"
sudo -u www-data bash -c "PATH=$PATH:/home/ubuntu/.nvm/versions/node/v23.3.0/bin HOME=/var/www pm2 startup"

# Clean up temporary files
echo "Cleaning up..."
rm -rf $TEMP_DIR

echo "Deployment completed successfully!"