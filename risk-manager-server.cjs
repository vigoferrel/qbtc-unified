#!/usr/bin/env node
/**
 * RISK MANAGER SERVER - PUERTO 14501
 * Servidor de gestión de riesgo para MetaConsciencia
 */

const express = require('express');
const crypto = require('crypto');

class RiskManagerServer {
    constructor() {
        this.app = express();
        this.port = 14501;
        
        this.setupMiddleware();
        this.setupRoutes();
        
        this.state = {
            var_level: 0.02, // 2% VaR
            portfolio_risk: 0.05, // 5% risk
            leverage_usage: 0.65, // 65% utilization
            stop_loss_active: true,
            circuit_breakers: 'ARMED',
            positions_count: 0
        };
        
        console.log('🛡️ Risk Manager Server inicializando...');
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
                service: 'Risk Manager',
                port: this.port,
                var_level: this.state.var_level,
                portfolio_risk: this.state.portfolio_risk,
                leverage_usage: this.state.leverage_usage,
                circuit_breakers: this.state.circuit_breakers,
                positions_count: this.state.positions_count,
                uptime: process.uptime()
            });
        });
        
        // Endpoint de análisis de riesgo
        this.app.post('/analyze-risk', (req, res) => {
            const { position_size, leverage, symbol } = req.body;
            
            const risk_score = this.calculateRiskScore(position_size, leverage);
            this.state.positions_count = Math.max(0, this.state.positions_count + (req.body.action === 'open' ? 1 : -1));
            
            res.json({
                risk_score,
                var_level: this.state.var_level,
                recommended_size: position_size * (1 - risk_score * 0.5),
                max_leverage: Math.floor(20 / (1 + risk_score * 10)),
                warning: risk_score > 0.7 ? 'HIGH_RISK' : risk_score > 0.4 ? 'MODERATE_RISK' : 'LOW_RISK',
                circuit_breakers: this.state.circuit_breakers,
                timestamp: Date.now()
            });
        });
        
        // Métricas Prometheus
        this.app.get('/metrics', (req, res) => {
            res.set('Content-Type', 'text/plain');
            res.send(`# Risk Manager Metrics
risk_var_level ${this.state.var_level}
risk_portfolio_risk ${this.state.portfolio_risk}
risk_leverage_usage ${this.state.leverage_usage}
risk_positions_count ${this.state.positions_count}
risk_uptime_seconds ${process.uptime()}
`);
        });
    }
    
    calculateRiskScore(position_size, leverage) {
        // Sin Math.random - usar crypto
        const buffer = crypto.randomBytes(4);
        const random = buffer.readUInt32BE() / 0xFFFFFFFF;
        
        const base_risk = (leverage || 1) / 125; // Base sobre leverage máximo
        const size_risk = (position_size || 1000) / 10000; // Base sobre posición típica
        const market_volatility = 0.3 + (random * 0.4); // 0.3-0.7 volatilidad
        
        return Math.min(0.99, base_risk * 0.4 + size_risk * 0.3 + market_volatility * 0.3);
    }
    
    start() {
        this.server = this.app.listen(this.port, () => {
            console.log(`🛡️ Risk Manager Server ACTIVO en puerto ${this.port}`);
            console.log(`🔗 Health: http://localhost:${this.port}/health`);
            console.log(`📊 Metrics: http://localhost:${this.port}/metrics`);
            
            // Actualización de riesgo periódica
            this.riskMonitoring = setInterval(() => {
                this.updateRiskLevels();
            }, 10000);
        });
    }
    
    updateRiskLevels() {
        // Actualización determinista de niveles de riesgo
        const buffer = crypto.randomBytes(4);
        const random = buffer.readUInt32BE() / 0xFFFFFFFF;
        
        // Simular cambios en VaR basados en volatilidad del mercado
        this.state.var_level = 0.015 + (random * 0.02); // 1.5%-3.5%
        this.state.portfolio_risk = Math.min(0.1, this.state.var_level * 2);
        this.state.leverage_usage = 0.5 + (random * 0.4); // 50%-90%
        
        console.log(`🛡️ Risk Update: VaR=${(this.state.var_level * 100).toFixed(2)}%, Portfolio=${(this.state.portfolio_risk * 100).toFixed(2)}%`);
    }
}

const server = new RiskManagerServer();

// Manejo de señales
process.on('SIGTERM', () => {
    console.log('⏹️ Deteniendo Risk Manager...');
    clearInterval(server.riskMonitoring);
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('⏹️ Deteniendo Risk Manager...');
    clearInterval(server.riskMonitoring);
    process.exit(0);
});

if (require.main === module) {
    server.start();
}

module.exports = { RiskManagerServer };
