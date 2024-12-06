#!/bin/bash

# Exit on any error
set -e

echo "Starting DiscordTest.com website deployment..."

# Manage backups (keep only 2 most recent)
echo "Managing backups..."
BACKUP_DIR="/var/www"
BACKUP_PREFIX="discordtest_backup_"
CURRENT_DATE=$(date +%Y%m%d)
NEW_BACKUP="${BACKUP_DIR}/${BACKUP_PREFIX}${CURRENT_DATE}.tar.gz"

# Remove old backups, keeping only the most recent one
ls -t ${BACKUP_DIR}/${BACKUP_PREFIX}*.tar.gz 2>/dev/null | tail -n +3 | xargs rm -f 2>/dev/null || true

# Create new backup
echo "Creating backup..."
sudo tar -czf "$NEW_BACKUP" /var/www/discordtest.com

# Remove old website
echo "Removing old website..."
sudo rm -rf /var/www/discordtest.com

# Clone new website
echo "Cloning new website..."
sudo git clone https://itisgriff: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@github.com/itisgriff/DiscordTest.com.git /var/www/DiscordTest.com-Website

# Create directory and copy build files
echo "Copying build files..."
sudo mkdir -p /var/www/discordtest.com
sudo cp -r /var/www/DiscordTest.com-Website/dist/* /var/www/discordtest.com/

# Clean up repository
echo "Cleaning up..."
sudo rm -rf /var/www/DiscordTest.com-Website

# Set permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data /var/www/discordtest.com

echo "Deployment complete! Please verify the website is working correctly." 