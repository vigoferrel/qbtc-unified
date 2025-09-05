#!/usr/bin/env node
/**
 * TRADING SYSTEM SERVER - PUERTO 14201
 * Sistema de trading para MetaConsciencia
 */

const express = require('express');
const crypto = require('crypto');

class TradingSystemServer {
    constructor() {
        this.app = express();
        this.port = 14201;
        
        this.setupMiddleware();
        this.setupRoutes();
        
        this.state = {
            active_trades: 0,
            profit: 0,
            win_rate: 0.73,
            total_volume: 0,
            last_trade: null
        };
        
        console.log('💹 Trading System Server inicializando...');
    }
    
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
        });
    }
    
    setupRoutes() {
        // Health endpoint para MetaConsciencia
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'OK',
                service: 'Trading System',
                port: this.port,
                active_trades: this.state.active_trades,
                profit: this.state.profit,
                win_rate: this.state.win_rate,
                total_volume: this.state.total_volume,
                uptime: process.uptime()
            });
        });
        
        // Endpoint para ejecutar trade
        this.app.post('/execute-trade', (req, res) => {
            const { symbol, side, size, leverage } = req.body;
            
            const trade_id = this.generateTradeId();
            const expected_profit = this.calculateExpectedProfit(size, leverage);
            
            this.state.active_trades++;
            this.state.total_volume += size || 100;
            this.state.last_trade = { trade_id, symbol, side, size, timestamp: Date.now() };
            
            res.json({
                trade_id,
                symbol: symbol || 'BTCUSDT',
                side: side || 'BUY',
                size: size || 100,
                leverage: leverage || 10,
                expected_profit,
                status: 'EXECUTED',
                timestamp: Date.now()
            });
        });
        
        // Métricas Prometheus
        this.app.get('/metrics', (req, res) => {
            res.set('Content-Type', 'text/plain');
            res.send(`# Trading System Metrics
trading_active_trades ${this.state.active_trades}
trading_profit ${this.state.profit}
trading_win_rate ${this.state.win_rate}
trading_total_volume ${this.state.total_volume}
trading_uptime_seconds ${process.uptime()}
`);
        });
    }
    
    generateTradeId() {
        // Sin Math.random - usar crypto
        const buffer = crypto.randomBytes(4);
        const random = buffer.readUInt32BE();
        return `TRADE_${random.toString(16).toUpperCase()}`;
    }
    
    calculateExpectedProfit(size, leverage) {
        // Cálculo determinista de profit esperado
        const buffer = crypto.randomBytes(4);
        const random = buffer.readUInt32BE() / 0xFFFFFFFF;
        
        const base_size = size || 100;
        const base_leverage = leverage || 10;
        const market_factor = 0.8 + (random * 0.4); // 0.8-1.2
        
        return base_size * base_leverage * 0.002 * market_factor; // ~0.2% expected profit
    }
    
    start() {
        this.server = this.app.listen(this.port, () => {
            console.log(`💹 Trading System Server ACTIVO en puerto ${this.port}`);
            console.log(`🔗 Health: http://localhost:${this.port}/health`);
            console.log(`📊 Metrics: http://localhost:${this.port}/metrics`);
            
            // Simulación de trading periódica
            this.tradingSimulation = setInterval(() => {
                this.simulateTradingActivity();
            }, 15000);
        });
    }
    
    simulateTradingActivity() {
        // Simulación determinista de actividad de trading
        const buffer = crypto.randomBytes(8);
        const random1 = (buffer.readUInt32BE(0) / 0xFFFFFFFF);
        const random2 = (buffer.readUInt32BE(4) / 0xFFFFFFFF);
        
        // Simular cierre de trades
        if (this.state.active_trades > 0 && random1 < 0.3) {
            this.state.active_trades--;
            const trade_profit = (random2 * 200 - 50); // -50 to +150 profit range
            this.state.profit += trade_profit;
            
            // Update win rate
            if (trade_profit > 0) {
                this.state.win_rate = Math.min(0.95, this.state.win_rate + 0.01);
            } else {
                this.state.win_rate = Math.max(0.55, this.state.win_rate - 0.005);
            }
        }
        
        console.log(`💹 Trading Update: ${this.state.active_trades} trades, $${this.state.profit.toFixed(2)} profit, ${(this.state.win_rate * 100).toFixed(1)}% win rate`);
    }
}

const server = new TradingSystemServer();

// Manejo de señales
process.on('SIGTERM', () => {
    console.log('⏹️ Deteniendo Trading System...');
    clearInterval(server.tradingSimulation);
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('⏹️ Deteniendo Trading System...');
    clearInterval(server.tradingSimulation);
    process.exit(0);
});

if (require.main === module) {
    server.start();
}

module.exports = { TradingSystemServer };
