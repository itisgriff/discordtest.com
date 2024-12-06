# Setting up Nginx for DiscordTest.com

This guide explains how to set up an Nginx server block and SSL certificate for discordtest.com on Ubuntu 24.

## Prerequisites

1. Ubuntu 24.x installed
2. Root or sudo access
3. Domain (discordtest.com) pointing to your server's IP
4. Nginx installed

## Installation Steps

### 1. Install Required Software

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Nginx if not already installed
sudo apt install nginx -y

# Install Certbot and Nginx plugin
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Create Web Root Directory

```bash
# Create the website directory
sudo mkdir -p /var/www/discordtest.com
sudo chown -R $USER:$USER /var/www/discordtest.com
sudo chmod -R 755 /var/www/discordtest.com
```

### 3. Create Nginx Server Block

Create a new server block configuration:

```bash
sudo nano /etc/nginx/sites-available/discordtest.com
```

Add the following configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name discordtest.com www.discordtest.com;
    root /var/www/discordtest.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Add security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    
    # Enable CORS
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 4. Enable the Server Block

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/discordtest.com /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test is successful, restart Nginx
sudo systemctl restart nginx
```

### 5. Set Up SSL with Certbot

```bash
# Obtain and install SSL certificate
sudo certbot --nginx -d discordtest.com -d www.discordtest.com

# This will:
# 1. Obtain SSL certificate
# 2. Automatically modify Nginx configuration
# 3. Set up automatic renewal
```

### 6. Deploy Website Files

```bash
# Navigate to the web root
cd /var/www/discordtest.com

# Build and deploy your React application
npm run build
cp -r dist/* /var/www/discordtest.com/
```

### 7. Verify Installation

- Visit https://discordtest.com to verify the site loads
- Check SSL certificate at https://www.ssllabs.com/ssltest/

### 8. Set Up Auto-Renewal

Certbot automatically creates a renewal timer, but you can verify it:

```bash
sudo systemctl status certbot.timer
```

## Maintenance

### Renewing Certificates Manually

```bash
sudo certbot renew --dry-run  # Test renewal
sudo certbot renew           # Actually renew
```

### Nginx Commands

```bash
sudo systemctl status nginx  # Check status
sudo systemctl start nginx   # Start Nginx
sudo systemctl stop nginx    # Stop Nginx
sudo systemctl restart nginx # Restart Nginx
```

## Troubleshooting

1. Check Nginx error logs:
```bash
sudo tail -f /var/log/nginx/error.log
```

2. Check SSL certificate status:
```bash
sudo certbot certificates
```

3. Test Nginx configuration:
```bash
sudo nginx -t
``` 