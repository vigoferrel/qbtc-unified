/**
 * Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
 * Frontend Configuration - Configuración del Frontend Unificado
 */

const config = {
    // Servicios base
    services: {
        unified: {
            url: 'http://localhost:3004',
            endpoints: {
                health: '/unified/health',
                quantum: '/quantum/consciousness',
                trading: '/quantum/trading',
                metrics: '/quantum/metrics',
                stream: '/quantum/stream'
            }
        },
        quantum_core: {
            url: 'https://qbtc-api.com:9090',
            endpoints: {
                state: '/quantum/state',
                validate: '/quantum/validate',
                analysis: '/quantum/analysis'
            }
        },
        trading_engine: {
            url: 'https://qbtc-api.com:9091',
            endpoints: {
                execute: '/api/real-trading/execute',
                balance: '/api/real-balance',
                orders: '/api/orders',
                positions: '/api/positions'
            }
        },
        market_data: {
            url: 'https://qbtc-api.com:9092',
            endpoints: {
                prices: '/market/prices',
                book: '/market/book',
                trades: '/market/trades'
            }
        },
        monitoring: {
            url: 'https://qbtc-api.com:9093',
            endpoints: {
                metrics: '/monitoring/metrics',
                logs: '/monitoring/logs',
                alerts: '/monitoring/alerts'
            }
        }
    },

    // Configuración cuántica
    quantum: {
        consciousness: {
            target: 0.941,
            threshold: 0.75,
            update_interval: 1000
        },
        coherence: {
            target: 0.964,
            threshold: 0.65,
            update_interval: 500
        },
        validation: {
            required_consciousness: 0.75,
            required_coherence: 0.65,
            min_edge: 1.5
        }
    },

    // Configuración de trading
    trading: {
        min_balance: 10, // USDT
        default_amount: 10, // USDT por trade
        max_trades: 5,
        intervals: ['1m', '5m', '15m', '1h'],
        timeframes: {
            short: 60000,    // 1m
            medium: 300000,  // 5m
            long: 3600000    // 1h
        },
        risk: {
            stop_loss: 0.02,     // 2%
            take_profit: 0.05,   // 5%
            max_risk: 0.01       // 1%
        }
    },

    // Configuración de UI
    ui: {
        update_interval: 1000,
        chart_interval: 1000,
        animations: true,
        theme: 'dark',
        colors: {
            primary: '#00ff88',
            secondary: '#00d4ff',
            warning: '#ffb800',
            error: '#f6465d',
            success: '#0ecb81'
        }
    },

    // Configuración de WebSocket
    websocket: {
        reconnect_interval: 5000,
        ping_interval: 30000,
        max_reconnect_attempts: 5
    }
};

module.exports = config;
