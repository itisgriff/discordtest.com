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
    server_name discordtest.com www.discordtest.com;
    root /var/www/discordtest.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;

        # CORS configuration
        add_header 'Access-Control-Allow-Origin' 'https://discordtest.com' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://discordtest.com' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        # Discord API proxy
        location /api/discord/ {
            proxy_pass https://discord.com/api/v10/;
            proxy_set_header Host discord.com;
            proxy_set_header Authorization $http_authorization;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # CORS headers for Discord API
            add_header 'Access-Control-Allow-Origin' 'https://discordtest.com' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;

            # Handle preflight
            if ($request_method = 'OPTIONS') {
                add_header 'Access-Control-Allow-Origin' 'https://discordtest.com' always;
                add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
                add_header 'Access-Control-Allow-Headers' 'Authorization,Content-Type' always;
                add_header 'Access-Control-Allow-Credentials' 'true' always;
                add_header 'Access-Control-Max-Age' 1728000;
                add_header 'Content-Type' 'text/plain charset=UTF-8';
                add_header 'Content-Length' 0;
                return 204;
            }
        }

        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/discordtest.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/discordtest.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot


}
server {
    if ($host = www.discordtest.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = discordtest.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;
    server_name discordtest.com www.discordtest.com;
    return 404; # managed by Certbot




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