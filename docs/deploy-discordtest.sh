#!/bin/bash

# Exit on any error, except in subshells
set -e

# Check if script has sudo privileges
if ! sudo -v; then
    echo "This script requires sudo privileges. Please run with sudo or as a user with sudo access."
    exit 1
fi

echo "Starting DiscordTest.com website deployment..."

# Manage backups (keep only 2 most recent)
echo "Managing backups..."
BACKUP_DIR="/var/www"
BACKUP_PREFIX="discordtest_backup_"
CURRENT_DATE=$(date +%Y%m%d)
NEW_BACKUP="${BACKUP_DIR}/${BACKUP_PREFIX}${CURRENT_DATE}.tar.gz"

# Remove old backups, keeping only the most recent one
if ls ${BACKUP_DIR}/${BACKUP_PREFIX}*.tar.gz 1>/dev/null 2>&1; then
    echo "Found existing backups, cleaning up old ones..."
    sudo find ${BACKUP_DIR} -name "${BACKUP_PREFIX}*.tar.gz" -type f -printf '%T@ %p\n' | \
        sort -n | head -n -2 | cut -d' ' -f2- | xargs -r sudo rm
else
    echo "No existing backups found."
fi

# Create new backup if directory exists
if [ -d "/var/www/discordtest.com" ] && [ -n "$(sudo ls -A /var/www/discordtest.com 2>/dev/null)" ]; then
    echo "Creating backup of existing website..."
    sudo tar -czf "$NEW_BACKUP" -C /var/www discordtest.com/
    echo "Backup created successfully at $NEW_BACKUP"
else
    echo "No existing website directory found to backup or directory is empty."
fi

# Remove old website directory if it exists
echo "Removing old website..."
sudo rm -rf /var/www/discordtest.com || true

# Create temporary directory for cloning
TEMP_DIR=$(mktemp -d)
echo "Cloning new website to temporary directory..."
git clone https://itisgriff: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@github.com/itisgriff/DiscordTest.com.git "$TEMP_DIR"

# Create directory and copy build files
echo "Copying build files..."
sudo mkdir -p /var/www/discordtest.com
sudo cp -r "$TEMP_DIR/dist/"* /var/www/discordtest.com/

# Clean up
echo "Cleaning up..."
rm -rf "$TEMP_DIR"

# Set permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data /var/www/discordtest.com

echo "Deployment complete! Please verify the website is working correctly." 