module.exports = {
  apps: [{
    name: 'discord-api',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // PM2 monitoring configuration
    monitoring: {
      // Metrics update interval
      interval: 30,
      // Thresholds for alerts
      thresholds: {
        memory: 800000000, // 800MB
        cpu: 80 // 80% CPU usage
      }
    },
    // Health check configuration
    healthCheck: {
      url: 'http://localhost:3000/health',
      interval: 30000, // Check every 30 seconds
      timeout: 5000, // 5 second timeout
      maxRetries: 3
    },
    // Error handling
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true,
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    // Restart delay
    exp_backoff_restart_delay: 100
  }]
}; 