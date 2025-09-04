const { PM2Config } = require('../../lib/qbtc-runtime.cjs');

module.exports = PM2Config.generateConfig('qbtc-metrics', './metrics-server.cjs', {
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '400M',
    logLevel: 'info',
    logLevelProd: 'warn',
    env: {
        METRICS_PORT: 14701,
        METRICS_LOG_LEVEL: 'info',
        NODE_ENV: 'development'
    },
    envProd: {
        METRICS_PORT: 14701,
        METRICS_LOG_LEVEL: 'warn', 
        NODE_ENV: 'production'
    }
});
