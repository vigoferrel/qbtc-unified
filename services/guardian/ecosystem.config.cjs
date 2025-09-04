const { PM2Config } = require('../../lib/qbtc-runtime.cjs');

module.exports = PM2Config.generateConfig('qbtc-guardian', './guardian-service.cjs', {
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '300M',
    logLevel: 'info',
    logLevelProd: 'warn',
    env: {
        GUARDIAN_PORT: 14601,
        GUARDIAN_RISK_LEVEL: 'info',
        NODE_ENV: 'development'
    },
    envProd: {
        GUARDIAN_PORT: 14601,
        GUARDIAN_RISK_LEVEL: 'warn', 
        NODE_ENV: 'production'
    }
});
