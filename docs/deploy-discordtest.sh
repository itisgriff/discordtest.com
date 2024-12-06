#!/bin/bash

# Exit on error
set -e

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root or with sudo"
  exit 1
fi

# Check required commands
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting." >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "git is required but not installed. Aborting." >&2; exit 1; }

echo "Starting deployment..."

# Define directories
DEPLOY_DIR="/var/www/discordtest.com"
TEMP_DIR="/tmp/discordtest-deploy"

# Get npm path
NPM_PATH=$(which npm)

# Ensure PM2 is installed globally
if ! command -v pm2 >/dev/null 2>&1; then
  echo "Installing PM2 globally..."
  npm install -g pm2
fi

# Create temporary directory for build process
echo "Creating temporary build directory..."
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Clone repository to temporary directory
echo "Cloning repository..."
if [ -z "$GITHUB_TOKEN" ]; then
  echo "GITHUB_TOKEN environment variable is not set"
  exit 1
fi

git clone https://x-access-token:${GITHUB_TOKEN}@github.com/itisgriff/DiscordTest.com.git $TEMP_DIR
cd $TEMP_DIR

# Check for required files
if [ ! -f ".env" ]; then
  echo "Error: .env file not found"
  exit 1
fi

# Install all dependencies (including dev dependencies) for building
echo "Installing dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

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
cp $TEMP_DIR/.env .
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
sudo -u www-data bash -c "PATH=$PATH HOME=/var/www pm2 restart discord-api || PATH=$PATH HOME=/var/www pm2 start server/index.js --name discord-api"
sudo -u www-data bash -c "PATH=$PATH HOME=/var/www pm2 save"
sudo -u www-data bash -c "PATH=$PATH HOME=/var/www pm2 startup"

# Clean up temporary files
echo "Cleaning up..."
rm -rf $TEMP_DIR

echo "Deployment completed successfully!"
echo "Please ensure your environment variables are properly configured." 