module.exports = {
  apps: [{
    name: 'metaconsciencia',
    script: './metaconsciencia.cjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 15000
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/metaconsciencia-error.log',
    out_file: './logs/metaconsciencia-out.log',
    log_file: './logs/metaconsciencia-combined.log'
  }]
};
