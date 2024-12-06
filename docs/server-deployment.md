# Server Deployment Guide

This guide explains how to deploy the Discord Tools API server on Ubuntu.

## Prerequisites

- Ubuntu 20.04 or later
- Node.js 18+ and npm
- PM2 for process management
- Nginx (optional, for reverse proxy)

## Server File Structure

The server files are organized as follows:
```
/var/www/discordtest/
├── index.js           # Main server entry point
├── server/           # Server-specific files
│   ├── routes/      # API route handlers
│   ├── middleware/  # Express middleware
│   └── utils/       # Utility functions
├── dist/            # Built frontend files
└── .env             # Environment configuration
```

## Installation Steps

1. Install Node.js and npm:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Install PM2 globally:
```bash
sudo npm install -g pm2
```

3. Clone the repository:
```bash
git clone https://github.com/your-repo/discord-tools.git
cd discord-tools
```

4. Install dependencies:
```bash
npm install
```

5. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

## Deployment

The easiest way to deploy is using the provided deployment script:

```bash
sudo chmod +x docs/deploy-discordtest.sh
./docs/deploy-discordtest.sh
```

This script will:
1. Set up the deployment directory
2. Pull the latest changes
3. Install dependencies
4. Copy server files to the correct location
5. Build the project
6. Start/restart the PM2 process

## Manual Deployment Steps

If you prefer to deploy manually:

1. Build the project:
```bash
npm run build
```

2. Copy server files:
```bash
mkdir -p server
cp -r src/server/* server/
cp server/index.js .
```

3. Start with PM2:
```bash
pm2 start index.js --name discord-api
```

4. Enable startup on boot:
```bash
pm2 startup
pm2 save
```

## PM2 Management Commands

- View logs: `pm2 logs discord-api`
- Restart server: `pm2 restart discord-api`
- Stop server: `pm2 stop discord-api`
- View status: `pm2 status`

## Nginx Configuration (Optional)

If using Nginx as a reverse proxy:

1. Install Nginx:
```bash
sudo apt install nginx
```

2. Create configuration:
```nginx
server {
    listen 80;
    server_name api.discordtest.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/discord-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Setup (Optional)

To secure your API with SSL using Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.discordtest.com
```

## Troubleshooting

- Check logs: `pm2 logs discord-api`
- Verify process: `pm2 status`
- Test API: `curl http://localhost:3000/health`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log` 