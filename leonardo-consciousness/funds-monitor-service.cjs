#!/usr/bin/env node

// ========================================================================
// 📊 FUNDS MANAGER MONITORING SERVICE 
// Servicio de monitoreo en segundo plano para FundsManager y Binance
// Verificación continua de conectividad, balance y métricas de performance
// ========================================================================

const { FundsManager } = require('./FundsManager');
const BinanceConnectorAdapter = require('./BinanceConnectorAdapter');
const { CredentialsManager } = require('../quantum-core/CredentialsManager');
const fs = require('fs').promises;
const path = require('path');

// Configuración del servicio de monitoreo
const MONITORING_CONFIG = {
    checkIntervalMs: 60000,        // Verificar cada 60 segundos
    logToFile: true,               // Guardar logs en archivo
    alertThresholds: {
        connectivity: 5000,        // Alert si latencia > 5000ms
        balance: 100,              // Alert si balance < $100
        errorRate: 0.1,            // Alert si error rate > 10%
        drawdown: 0.3              // Alert si drawdown > 30%
    },
    maxLogEntries: 1000,           // Máximo entries en log antes de rotation
    enableConsoleOutput: true,     // Mostrar output en consola
    enableAlerts: true,            // Activar sistema de alertas
    saveDashboardData: true        // Guardar datos para dashboard
};

class FundsManagerMonitorService {
    constructor(config = {}) {
        this.config = { ...MONITORING_CONFIG, ...config };
        this.isRunning = false;
        this.monitoringInterval = null;
        this.stats = {
            totalChecks: 0,
            successfulChecks: 0,
            errorCount: 0,
            lastSuccessfulCheck: null,
            lastError: null,
            startTime: Date.now(),
            alerts: []
        };
        
        // **INICIALIZAR CREDENTIALS MANAGER**: Para diagnósticos del servicio
        this.credentialsManager = CredentialsManager.getInstance();
        
        // Componentes monitoreados
        this.fundsManager = null;
        this.binanceConnector = null;
        
        // Datos históricos para trending
        this.historicalData = {
            balance: [],
            connectivity: [],
            performance: [],
            errors: []
        };
        
        this.logFile = path.join(__dirname, 'funds-monitor.log');
        this.dashboardFile = path.join(__dirname, 'funds-dashboard-data.json');
        
        // Log inicial de credenciales
        this.logCredentialsStatus();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🚀 INICIALIZACIÓN Y ARRANQUE DEL SERVICIO
    // ═══════════════════════════════════════════════════════════════════════

    async start() {
        if (this.isRunning) {
            this.log('WARNING', 'El servicio de monitoreo ya está ejecutándose');
            return;
        }

        try {
            this.log('INFO', '🚀 Iniciando Funds Manager Monitoring Service');
            
            // Inicializar componentes
            await this.initializeComponents();
            
            // Configurar monitoreo
            this.setupMonitoring();
            
            // Primera verificación inmediata
            await this.performHealthCheck();
            
            this.isRunning = true;
            this.log('SUCCESS', '✅ Servicio de monitoreo iniciado exitosamente');
            
        } catch (error) {
            this.log('ERROR', '❌ Error inicializando servicio de monitoreo', error);
            throw error;
        }
    }

    async initializeComponents() {
        this.log('INFO', '🔧 Inicializando componentes...');
        
        try {
            // Inicializar FundsManager
            this.fundsManager = new FundsManager({
                initialBalance: 10000,
                maxLeverage: 10,
                maxRiskPerTrade: 0.05
            });
            
            await this.fundsManager.initialize();
            this.log('SUCCESS', '💰 FundsManager inicializado');
            
            // Inicializar Binance Connector
            this.binanceConnector = new BinanceConnectorAdapter();
            this.log('SUCCESS', '🌐 BinanceConnector inicializado');
            
        } catch (error) {
            this.log('ERROR', 'Error inicializando componentes', error);
            throw error;
        }
    }

    setupMonitoring() {
        this.log('INFO', `⏰ Configurando monitoreo cada ${this.config.checkIntervalMs/1000}s`);
        
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.performHealthCheck();
            } catch (error) {
                this.log('ERROR', 'Error en health check', error);
                this.stats.errorCount++;
            }
        }, this.config.checkIntervalMs);
        
        // Configurar rotación de logs
        setInterval(() => {
            this.rotateLogsIfNeeded();
        }, 300000); // Cada 5 minutos
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🏥 VERIFICACIONES DE SALUD DEL SISTEMA
    // ═══════════════════════════════════════════════════════════════════════

    async performHealthCheck() {
        const checkId = `CHECK_${Date.now()}_${this.stats.totalChecks + 1}`;
        this.stats.totalChecks++;
        
        const healthReport = {
            checkId,
            timestamp: new Date().toISOString(),
            connectivity: null,
            balance: null,
            performance: null,
            alerts: [],
            overall: false
        };

        try {
            // 1. Verificar conectividad Binance
            healthReport.connectivity = await this.checkBinanceConnectivity();
            
            // 2. Verificar estado FundsManager
            healthReport.balance = await this.checkFundsManagerStatus();
            
            // 3. Verificar métricas de performance
            healthReport.performance = await this.checkPerformanceMetrics();
            
            // 4. Evaluar alertas
            healthReport.alerts = this.evaluateAlerts(healthReport);
            
            // 5. Estado general
            healthReport.overall = this.evaluateOverallHealth(healthReport);
            
            if (healthReport.overall) {
                this.stats.successfulChecks++;
                this.stats.lastSuccessfulCheck = Date.now();
            }
            
            // Almacenar datos históricos
            this.storeHistoricalData(healthReport);
            
            // Generar logs y alertas
            await this.processHealthReport(healthReport);
            
        } catch (error) {
            this.log('ERROR', `Error en health check ${checkId}`, error);
            this.stats.errorCount++;
            this.stats.lastError = error.message;
        }
        
        return healthReport;
    }

    async checkBinanceConnectivity() {
        const startTime = Date.now();
        
        try {
            // Ping test
            const pingResult = await this.binanceConnector.ping();
            const latency = Date.now() - startTime;
            
            if (!pingResult.success) {
                throw new Error(`Ping fallido: ${pingResult.error}`);
            }
            
            // Test de account info
            let accountAccess = false;
            try {
                const accountInfo = await this.binanceConnector.getAccountInfo();
                accountAccess = !!accountInfo;
            } catch (accountError) {
                // No es crítico si falla account info, puede ser configuración API
            }
            
            return {
                status: 'CONNECTED',
                latency: latency,
                ping: pingResult.success,
                accountAccess: accountAccess,
                testnet: process.env.BINANCE_TESTNET === 'true'
            };
            
        } catch (error) {
            return {
                status: 'DISCONNECTED',
                error: error.message,
                latency: Date.now() - startTime
            };
        }
    }

    async checkFundsManagerStatus() {
        try {
            const fundsStatus = this.fundsManager.getFundsStatus();
            const currentFunds = this.fundsManager.getCurrentFunds();
            const metrics = this.fundsManager.getMetrics();
            
            return {
                status: 'HEALTHY',
                totalBalance: fundsStatus.totalBalance,
                availableBalance: fundsStatus.availableBalance,
                canTrade: fundsStatus.canTrade,
                emergencyStop: fundsStatus.emergencyStop,
                activePositions: fundsStatus.activePositions,
                currentDrawdown: metrics.currentDrawdown,
                winRate: metrics.winRate,
                totalTrades: metrics.totalTrades
            };
            
        } catch (error) {
            return {
                status: 'ERROR',
                error: error.message
            };
        }
    }

    async checkPerformanceMetrics() {
        try {
            if (!this.fundsManager) return null;
            
            const metrics = this.fundsManager.getMetrics();
            const performanceMetrics = this.fundsManager.getFundsStatus().performanceMetrics;
            
            // Calcular métricas avanzadas
            const successRate = this.stats.totalChecks > 0 ? 
                (this.stats.successfulChecks / this.stats.totalChecks) * 100 : 0;
                
            const errorRate = this.stats.totalChecks > 0 ? 
                (this.stats.errorCount / this.stats.totalChecks) * 100 : 0;
            
            const uptime = Date.now() - this.stats.startTime;
            
            return {
                systemUptime: uptime,
                successRate: successRate,
                errorRate: errorRate,
                totalProfit: performanceMetrics.totalProfit - performanceMetrics.totalLoss,
                profitFactor: performanceMetrics.profitFactor,
                maxDrawdown: performanceMetrics.maxDrawdown,
                winRate: performanceMetrics.winRate,
                totalTrades: performanceMetrics.totalTrades,
                avgWin: performanceMetrics.avgWin,
                avgLoss: performanceMetrics.avgLoss
            };
            
        } catch (error) {
            return {
                status: 'ERROR',
                error: error.message
            };
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🚨 SISTEMA DE ALERTAS
    // ═══════════════════════════════════════════════════════════════════════

    evaluateAlerts(healthReport) {
        const alerts = [];
        const thresholds = this.config.alertThresholds;
        
        // Alert de conectividad
        if (healthReport.connectivity && 
            healthReport.connectivity.latency > thresholds.connectivity) {
            alerts.push({
                type: 'CONNECTIVITY',
                severity: 'WARNING',
                message: `Alta latencia: ${healthReport.connectivity.latency}ms`,
                threshold: thresholds.connectivity
            });
        }
        
        if (healthReport.connectivity && healthReport.connectivity.status === 'DISCONNECTED') {
            alerts.push({
                type: 'CONNECTIVITY',
                severity: 'CRITICAL',
                message: 'Conexión Binance perdida',
                error: healthReport.connectivity.error
            });
        }
        
        // Alert de balance
        if (healthReport.balance && 
            healthReport.balance.totalBalance < thresholds.balance) {
            alerts.push({
                type: 'BALANCE',
                severity: 'WARNING', 
                message: `Balance bajo: $${healthReport.balance.totalBalance}`,
                threshold: thresholds.balance
            });
        }
        
        // Alert de drawdown
        if (healthReport.balance && 
            healthReport.balance.currentDrawdown > thresholds.drawdown) {
            alerts.push({
                type: 'DRAWDOWN',
                severity: 'CRITICAL',
                message: `Drawdown alto: ${(healthReport.balance.currentDrawdown * 100).toFixed(1)}%`,
                threshold: thresholds.drawdown
            });
        }
        
        // Alert de emergency stop
        if (healthReport.balance && healthReport.balance.emergencyStop) {
            alerts.push({
                type: 'EMERGENCY_STOP',
                severity: 'CRITICAL',
                message: 'Emergency stop activado'
            });
        }
        
        // Alert de error rate
        if (healthReport.performance && 
            healthReport.performance.errorRate > thresholds.errorRate * 100) {
            alerts.push({
                type: 'ERROR_RATE',
                severity: 'WARNING',
                message: `Error rate alto: ${healthReport.performance.errorRate.toFixed(1)}%`,
                threshold: thresholds.errorRate * 100
            });
        }
        
        return alerts;
    }

    evaluateOverallHealth(healthReport) {
        const criticalAlerts = healthReport.alerts.filter(alert => 
            alert.severity === 'CRITICAL'
        );
        
        if (criticalAlerts.length > 0) return false;
        
        // Verificar componentes básicos
        const connectivityOK = healthReport.connectivity && 
                              healthReport.connectivity.status === 'CONNECTED';
        const balanceOK = healthReport.balance && 
                         healthReport.balance.status !== 'ERROR';
        
        return connectivityOK && balanceOK;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📊 ALMACENAMIENTO Y LOGGING
    // ═══════════════════════════════════════════════════════════════════════

    storeHistoricalData(healthReport) {
        const timestamp = Date.now();
        
        // Balance history
        if (healthReport.balance && healthReport.balance.totalBalance) {
            this.historicalData.balance.push({
                timestamp,
                balance: healthReport.balance.totalBalance,
                available: healthReport.balance.availableBalance,
                drawdown: healthReport.balance.currentDrawdown
            });
        }
        
        // Connectivity history
        if (healthReport.connectivity) {
            this.historicalData.connectivity.push({
                timestamp,
                latency: healthReport.connectivity.latency,
                status: healthReport.connectivity.status
            });
        }
        
        // Performance history
        if (healthReport.performance) {
            this.historicalData.performance.push({
                timestamp,
                successRate: healthReport.performance.successRate,
                errorRate: healthReport.performance.errorRate,
                totalTrades: healthReport.performance.totalTrades
            });
        }
        
        // Mantener solo últimas 100 entradas por categoría
        Object.keys(this.historicalData).forEach(key => {
            if (this.historicalData[key].length > 100) {
                this.historicalData[key] = this.historicalData[key].slice(-100);
            }
        });
    }

    async processHealthReport(healthReport) {
        // Console output
        if (this.config.enableConsoleOutput) {
            this.logHealthReport(healthReport);
        }
        
        // File logging
        if (this.config.logToFile) {
            await this.writeToLogFile(healthReport);
        }
        
        // Dashboard data
        if (this.config.saveDashboardData) {
            await this.updateDashboardData(healthReport);
        }
        
        // Process alerts
        if (this.config.enableAlerts && healthReport.alerts.length > 0) {
            this.processAlerts(healthReport.alerts);
        }
    }

    logHealthReport(healthReport) {
        const status = healthReport.overall ? '✅' : '❌';
        const timestamp = new Date().toISOString();
        
        console.log(`\n[${timestamp}] ${status} Health Check ${healthReport.checkId}`);
        
        if (healthReport.connectivity) {
            const connStatus = healthReport.connectivity.status === 'CONNECTED' ? '✅' : '❌';
            console.log(`  🌐 Conectividad: ${connStatus} (${healthReport.connectivity.latency}ms)`);
        }
        
        if (healthReport.balance && healthReport.balance.status !== 'ERROR') {
            console.log(`  💰 Balance: $${healthReport.balance.totalBalance.toFixed(2)} (${healthReport.balance.activePositions} posiciones)`);
            console.log(`  📊 Win Rate: ${(healthReport.balance.winRate * 100).toFixed(1)}% | Trades: ${healthReport.balance.totalTrades}`);
            
            if (healthReport.balance.currentDrawdown > 0) {
                console.log(`  📉 Drawdown: ${(healthReport.balance.currentDrawdown * 100).toFixed(1)}%`);
            }
        }
        
        // Mostrar alertas
        healthReport.alerts.forEach(alert => {
            const emoji = alert.severity === 'CRITICAL' ? '🚨' : '⚠️';
            console.log(`  ${emoji} ${alert.type}: ${alert.message}`);
        });
    }

    async writeToLogFile(healthReport) {
        try {
            const logEntry = JSON.stringify({
                ...healthReport,
                stats: this.stats
            }) + '\n';
            
            await fs.appendFile(this.logFile, logEntry);
        } catch (error) {
            console.error('Error escribiendo log file:', error.message);
        }
    }

    async updateDashboardData(healthReport) {
        try {
            const dashboardData = {
                lastUpdate: new Date().toISOString(),
                status: healthReport.overall ? 'HEALTHY' : 'UNHEALTHY',
                stats: this.stats,
                currentHealth: healthReport,
                historicalData: this.historicalData,
                uptime: Date.now() - this.stats.startTime
            };
            
            await fs.writeFile(this.dashboardFile, JSON.stringify(dashboardData, null, 2));
        } catch (error) {
            console.error('Error actualizando dashboard data:', error.message);
        }
    }

    processAlerts(alerts) {
        alerts.forEach(alert => {
            this.stats.alerts.push({
                ...alert,
                timestamp: Date.now()
            });
            
            // Solo mantener últimas 50 alertas
            if (this.stats.alerts.length > 50) {
                this.stats.alerts = this.stats.alerts.slice(-50);
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔐 GESTIÓN DE CREDENCIALES
    // ═══════════════════════════════════════════════════════════════════════

    logCredentialsStatus() {
        try {
            const credentials = this.credentialsManager.getCredentials();
            this.log('INFO', '🔐 Estado de credenciales (vía CredentialsManager):');
            console.log(`  API_KEY: ${credentials.apiKey ? 'SET' : 'MISSING'} (${credentials.source || 'N/A'})`);
            console.log(`  SECRET: ${credentials.secretKey ? 'SET' : 'MISSING'} (${credentials.source || 'N/A'})`);
            console.log(`  TESTNET: ${credentials.isTestnet ? 'ENABLED' : 'DISABLED'} (${credentials.source || 'N/A'})`);
            console.log(`  Loaded: ${credentials.isLoaded ? 'YES' : 'NO'}`);
        } catch (error) {
            this.log('WARNING', `Error verificando credenciales: ${error.message}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔧 UTILIDADES
    // ═══════════════════════════════════════════════════════════════════════

    async rotateLogsIfNeeded() {
        try {
            const stats = await fs.stat(this.logFile).catch(() => null);
            if (stats && stats.size > 10 * 1024 * 1024) { // 10MB
                const rotatedFile = this.logFile + '.old';
                await fs.rename(this.logFile, rotatedFile);
                this.log('INFO', 'Log file rotado');
            }
        } catch (error) {
            // Ignorar errores de rotación
        }
    }

    log(level, message, error = null) {
        const timestamp = new Date().toISOString();
        const colors = {
            INFO: '\x1b[36m',
            SUCCESS: '\x1b[32m',
            WARNING: '\x1b[33m',
            ERROR: '\x1b[31m',
            RESET: '\x1b[0m'
        };
        
        console.log(`${colors[level]}[${timestamp}] ${level}: ${message}${colors.RESET}`);
        if (error) {
            console.log('  Error:', error.message || error);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🛑 CIERRE DEL SERVICIO
    // ═══════════════════════════════════════════════════════════════════════

    async stop() {
        if (!this.isRunning) return;
        
        this.log('INFO', '🛑 Deteniendo servicio de monitoreo...');
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        // Guardar estado final
        if (this.config.saveDashboardData) {
            try {
                await this.updateDashboardData({
                    checkId: 'FINAL_STATE',
                    timestamp: new Date().toISOString(),
                    overall: false,
                    alerts: [{ type: 'SERVICE_STOPPED', message: 'Servicio detenido' }]
                });
            } catch (error) {
                // Ignorar errores al guardar estado final
            }
        }
        
        this.isRunning = false;
        this.log('SUCCESS', '✅ Servicio de monitoreo detenido');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 📊 API PÚBLICA
    // ═══════════════════════════════════════════════════════════════════════

    getStatus() {
        return {
            isRunning: this.isRunning,
            stats: this.stats,
            uptime: Date.now() - this.stats.startTime,
            config: this.config
        };
    }

    getHistoricalData() {
        return this.historicalData;
    }

    async getDashboardData() {
        try {
            const data = await fs.readFile(this.dashboardFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 EJECUCIÓN COMO SERVICIO
// ═══════════════════════════════════════════════════════════════════════

async function main() {
    const monitor = new FundsManagerMonitorService();
    
    // Manejar señales de cierre elegantemente
    process.on('SIGINT', async () => {
        console.log('\n🛑 Recibida señal de interrupción');
        await monitor.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Recibida señal de terminación');
        await monitor.stop();
        process.exit(0);
    });
    
    try {
        await monitor.start();
        
        // Mantener el proceso vivo
        const keepAlive = () => {
            if (monitor.isRunning) {
                setTimeout(keepAlive, 1000);
            }
        };
        keepAlive();
        
    } catch (error) {
        console.error('💥 Error fatal en servicio de monitoreo:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = FundsManagerMonitorService;
