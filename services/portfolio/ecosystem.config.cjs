const { PM2Config } = require('../../lib/qbtc-runtime.cjs');

module.exports = PM2Config.generateConfig('qbtc-portfolio', './portfolio-manager.cjs', {
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    logLevel: 'info',
    logLevelProd: 'warn',
    env: {
        PORTFOLIO_PORT: 14801,
        PORTFOLIO_LOG_LEVEL: 'info',
        NODE_ENV: 'development'
    },
    envProd: {
        PORTFOLIO_PORT: 14801,
        PORTFOLIO_LOG_LEVEL: 'warn', 
        NODE_ENV: 'production'
    }
});
