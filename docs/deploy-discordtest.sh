#!/bin/bash

# Exit on error
set -e

echo "Starting deployment..."

# Define directories
DEPLOY_DIR="/var/www/discordtest.com"
TEMP_DIR="/tmp/discordtest-deploy"

# Get npm path
NPM_PATH=$(which npm)

# Create temporary directory for build process
echo "Creating temporary build directory..."
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Clone repository to temporary directory
echo "Cloning repository..."
git clone https://itisgriff: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@github.com/itisgriff/DiscordTest.com.git $TEMP_DIR
cd $TEMP_DIR

# Install all dependencies (including dev dependencies) for building
echo "Installing dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

# Prepare server files
echo "Setting up server..."
sudo mkdir -p $DEPLOY_DIR/server
sudo cp -r server/* $DEPLOY_DIR/server/

# Clean install production dependencies for server
echo "Installing server dependencies..."
cd $DEPLOY_DIR
sudo rm -rf node_modules
sudo cp $TEMP_DIR/package.json .
sudo cp $TEMP_DIR/package-lock.json .
sudo -E env "PATH=$PATH" $NPM_PATH install --production

# Copy built frontend files
echo "Copying frontend files..."
sudo cp -r $TEMP_DIR/dist/* $DEPLOY_DIR/

# Set proper permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data $DEPLOY_DIR

# Start/Restart PM2 process
echo "Starting server..."
sudo -u www-data bash -c "PATH=$PATH HOME=/var/www pm2 restart discord-api || PATH=$PATH HOME=/var/www pm2 start server/index.js --name discord-api"
sudo -u www-data bash -c "PATH=$PATH HOME=/var/www pm2 save"

# Clean up temporary files
echo "Cleaning up..."
rm -rf $TEMP_DIR

echo "Deployment completed successfully!" 