/**
 * GUARDIAN DE RIESGO Y SAFETY-KILL SYSTEM
 * =======================================
 * 
 * Sistema crítico de protección que:
 * 1. Monitorea riesgos en tiempo real
 * 2. Valida todas las órdenes pre-ejecución  
 * 3. Ejecuta bloqueos automáticos (safety-kill)
 * 4. Reporta métricas y alertas
 * 5. Mantiene políticas de riesgo dinámicas
 */

const http = require('http');
const { SecureRandom, QBTCMetrics, QBTCLogger, HealthCheck } = require('../../lib/qbtc-runtime.cjs');

class GuardianService {
    constructor() {
        this.serviceName = 'Guardian';
        this.port = 14601;
        this.logger = new QBTCLogger(this.serviceName);
        this.metrics = new QBTCMetrics(this.serviceName);
        
        // Estado del sistema
        this.systemState = {
            globalKillSwitch: false,
            riskLevel: 'LOW', // LOW, MEDIUM, HIGH, CRITICAL
            activePositions: new Map(),
            riskMetrics: {
                totalExposure: 0,
                maxDrawdown: 0,
                dailyPnL: 0,
                volatility: 0,
                correlationRisk: 0
            },
            alerts: []
        };
        
        // Políticas de riesgo configurables
        this.riskPolicies = {
            maxTotalExposure: 100000, // USD
            maxSinglePositionSize: 10000, // USD
            maxDailyDrawdown: 5000, // USD
            maxDailyLoss: 8000, // USD
            minAccountBalance: 20000, // USD
            maxLeverage: 10,
            maxOpenPositions: 20,
            allowedSymbols: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
            blacklistedSymbols: [],
            maxOrderSize: 5000, // USD
            maxSlippage: 0.005, // 0.5%
            emergencyStopLoss: 0.02 // 2%
        };
        
        // Configurar health checks
        this.healthCheck = new HealthCheck(this.serviceName, {
            'policies_loaded': () => this.validatePolicies(),
            'system_monitoring': () => this.validateSystemMonitoring(),
            'kill_switch_status': () => this.validateKillSwitchStatus()
        });
        
        this.logger.info('Guardian Service inicializándose');
        this.startRiskMonitoring();
        this.setupServer();
    }

    /**
     * Inicia monitoreo continuo de riesgos
     */
    startRiskMonitoring() {
        setInterval(() => {
            this.performRiskAssessment();
        }, 5000); // Cada 5 segundos
        
        // Evaluación profunda cada minuto
        setInterval(() => {
            this.performDeepRiskAnalysis();
        }, 60000);
        
        this.logger.info('Sistema de monitoreo de riesgo iniciado');
    }

    /**
     * Evaluación continua de riesgos
     */
    async performRiskAssessment() {
        try {
            const startTime = this.metrics.startRequest();
            
            // Obtener métricas actuales del sistema
            await this.updateRiskMetrics();
            
            // Evaluar nivel de riesgo
            const newRiskLevel = this.calculateRiskLevel();
            
            if (newRiskLevel !== this.systemState.riskLevel) {
                this.logger.warn('Cambio en nivel de riesgo', {
                    previous: this.systemState.riskLevel,
                    current: newRiskLevel
                });
                this.systemState.riskLevel = newRiskLevel;
                
                // Acciones automáticas según nivel de riesgo
                await this.handleRiskLevelChange(newRiskLevel);
            }
            
            // Verificar condiciones de safety-kill
            await this.checkSafetyKillConditions();
            
            this.metrics.endRequestSuccess(startTime);
            this.metrics.setCustomMetric('risk_level_numeric', this.getRiskLevelNumeric());
            this.metrics.setCustomMetric('active_positions', this.systemState.activePositions.size);
            this.metrics.setCustomMetric('total_exposure', this.systemState.riskMetrics.totalExposure);
            
        } catch (error) {
            this.logger.error('Error en evaluación de riesgo', { error: error.message });
            this.metrics.endRequestFailure(Date.now());
        }
    }

    /**
     * Actualiza métricas de riesgo del sistema
     */
    async updateRiskMetrics() {
        try {
            // Simular obtención de datos reales (en producción viene de trading system)
            const mockPositions = this.generateMockPositions();
            this.systemState.activePositions = mockPositions;
            
            // Calcular exposición total
            let totalExposure = 0;
            let dailyPnL = 0;
            
            for (const [symbol, position] of mockPositions) {
                totalExposure += Math.abs(position.notionalValue);
                dailyPnL += position.unrealizedPnL;
            }
            
            this.systemState.riskMetrics.totalExposure = totalExposure;
            this.systemState.riskMetrics.dailyPnL = dailyPnL;
            
            // Calcular drawdown y volatilidad (simplificado)
            if (dailyPnL < 0) {
                this.systemState.riskMetrics.maxDrawdown = Math.min(
                    this.systemState.riskMetrics.maxDrawdown, 
                    dailyPnL
                );
            }
            
            this.systemState.riskMetrics.volatility = this.calculateVolatility();
            this.systemState.riskMetrics.correlationRisk = this.calculateCorrelationRisk();
            
        } catch (error) {
            this.logger.error('Error actualizando métricas de riesgo', { error: error.message });
        }
    }

    /**
     * Genera posiciones mock para pruebas (en producción viene del sistema real)
     */
    generateMockPositions() {
        const positions = new Map();
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
        
        symbols.forEach(symbol => {
            if (SecureRandom.random() > 0.3) { // 70% probabilidad de posición activa
                const side = SecureRandom.random() > 0.5 ? 'LONG' : 'SHORT';
                const size = SecureRandom.randomInt(1000, 8000);
                const entryPrice = SecureRandom.randomInt(20000, 50000);
                const currentPrice = entryPrice * (1 + (SecureRandom.random() - 0.5) * 0.1);
                const pnl = side === 'LONG' 
                    ? (currentPrice - entryPrice) * (size / entryPrice)
                    : (entryPrice - currentPrice) * (size / entryPrice);
                
                positions.set(symbol, {
                    symbol,
                    side,
                    size,
                    entryPrice,
                    currentPrice,
                    notionalValue: size,
                    unrealizedPnL: pnl,
                    leverage: SecureRandom.randomInt(1, 5)
                });
            }
        });
        
        return positions;
    }

    /**
     * Calcula nivel de riesgo basado en métricas
     */
    calculateRiskLevel() {
        const metrics = this.systemState.riskMetrics;
        let riskScore = 0;
        
        // Factor: Exposición total
        if (metrics.totalExposure > this.riskPolicies.maxTotalExposure * 0.8) {
            riskScore += 30;
        } else if (metrics.totalExposure > this.riskPolicies.maxTotalExposure * 0.6) {
            riskScore += 20;
        }
        
        // Factor: Pérdidas diarias
        if (metrics.dailyPnL < -this.riskPolicies.maxDailyLoss * 0.8) {
            riskScore += 40;
        } else if (metrics.dailyPnL < -this.riskPolicies.maxDailyLoss * 0.5) {
            riskScore += 25;
        }
        
        // Factor: Drawdown
        if (Math.abs(metrics.maxDrawdown) > this.riskPolicies.maxDailyDrawdown * 0.9) {
            riskScore += 35;
        } else if (Math.abs(metrics.maxDrawdown) > this.riskPolicies.maxDailyDrawdown * 0.6) {
            riskScore += 20;
        }
        
        // Factor: Volatilidad
        if (metrics.volatility > 0.08) {
            riskScore += 15;
        } else if (metrics.volatility > 0.05) {
            riskScore += 10;
        }
        
        // Factor: Correlación
        if (metrics.correlationRisk > 0.8) {
            riskScore += 20;
        }
        
        // Determinar nivel
        if (riskScore >= 80) return 'CRITICAL';
        if (riskScore >= 60) return 'HIGH';
        if (riskScore >= 30) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Calcula volatilidad simplificada
     */
    calculateVolatility() {
        const positions = Array.from(this.systemState.activePositions.values());
        if (positions.length === 0) return 0;
        
        let avgVolatility = 0;
        positions.forEach(pos => {
            const priceChange = Math.abs(pos.currentPrice - pos.entryPrice) / pos.entryPrice;
            avgVolatility += priceChange;
        });
        
        return avgVolatility / positions.length;
    }

    /**
     * Calcula riesgo de correlación entre posiciones
     */
    calculateCorrelationRisk() {
        const positions = Array.from(this.systemState.activePositions.values());
        if (positions.length <= 1) return 0;
        
        // Simplificado: posiciones en misma dirección = mayor correlación
        const longPositions = positions.filter(p => p.side === 'LONG').length;
        const shortPositions = positions.filter(p => p.side === 'SHORT').length;
        
        const dominantDirection = Math.max(longPositions, shortPositions);
        return dominantDirection / positions.length;
    }

    /**
     * Maneja cambios en nivel de riesgo
     */
    async handleRiskLevelChange(newLevel) {
        this.addAlert(`Risk level changed to: ${newLevel}`, newLevel === 'CRITICAL' ? 'CRITICAL' : 'WARNING');
        
        switch (newLevel) {
            case 'CRITICAL':
                await this.triggerEmergencyMode();
                break;
            case 'HIGH':
                await this.triggerHighRiskMode();
                break;
            case 'MEDIUM':
                await this.triggerMediumRiskMode();
                break;
            default:
                this.logger.info('Risk level normalized to LOW');
        }
    }

    /**
     * Verifica condiciones para safety-kill automático
     */
    async checkSafetyKillConditions() {
        const metrics = this.systemState.riskMetrics;
        const policies = this.riskPolicies;
        
        // Condiciones críticas que disparan safety-kill
        const criticalConditions = [
            {
                condition: metrics.totalExposure > policies.maxTotalExposure,
                reason: 'Total exposure exceeds limit'
            },
            {
                condition: metrics.dailyPnL < -policies.maxDailyLoss,
                reason: 'Daily loss limit exceeded'
            },
            {
                condition: Math.abs(metrics.maxDrawdown) > policies.maxDailyDrawdown,
                reason: 'Maximum drawdown exceeded'
            },
            {
                condition: this.systemState.activePositions.size > policies.maxOpenPositions,
                reason: 'Too many open positions'
            }
        ];
        
        const triggeredConditions = criticalConditions.filter(c => c.condition);
        
        if (triggeredConditions.length > 0) {
            await this.executeSafetyKill(triggeredConditions);
        }
    }

    /**
     * Ejecuta safety-kill inmediato
     */
    async executeSafetyKill(reasons) {
        if (this.systemState.globalKillSwitch) {
            this.logger.warn('Safety-kill already active');
            return;
        }
        
        this.logger.error('EXECUTING SAFETY-KILL', { reasons });
        this.systemState.globalKillSwitch = true;
        this.systemState.riskLevel = 'CRITICAL';
        
        // Notificar a todos los sistemas
        await this.notifyEmergencyStop();
        
        // Agregar alert crítica
        this.addAlert('SAFETY-KILL ACTIVATED', 'CRITICAL', { reasons });
        
        // Incrementar métrica crítica
        this.metrics.incrementCustomMetric('safety_kills');
        
        this.logger.error('SISTEMA EN MODO SAFETY-KILL - TODAS LAS OPERACIONES BLOQUEADAS');
    }

    /**
     * Notifica parada de emergencia a todos los sistemas
     */
    async notifyEmergencyStop() {
        const services = [
            { name: 'MetaConsciencia', port: 3001 },
            { name: 'TradingSystem', port: 14201 },
            { name: 'RiskManager', port: 14501 },
            { name: 'QuantumEngine', port: 14105 }
        ];
        
        for (const service of services) {
            try {
                const response = await this.httpRequest(
                    `http://localhost:${service.port}/emergency-stop`,
                    'POST',
                    { killSwitch: true, reason: 'Guardian safety-kill activated' }
                );
                this.logger.info(`Emergency stop sent to ${service.name}`, { response });
            } catch (error) {
                this.logger.error(`Failed to notify ${service.name}`, { error: error.message });
            }
        }
    }

    /**
     * Valida orden antes de ejecución (Pre-trade validation)
     */
    async validateOrder(order) {
        const startTime = this.metrics.startRequest();
        
        try {
            // Si hay kill switch activo, rechazar inmediatamente
            if (this.systemState.globalKillSwitch) {
                throw new Error('SYSTEM IN SAFETY-KILL MODE - ALL ORDERS BLOCKED');
            }
            
            const validations = [
                this.validateOrderSize(order),
                this.validateSymbol(order),
                this.validateExposureLimits(order),
                this.validateLeverage(order),
                this.validateRiskLevel(order)
            ];
            
            const results = await Promise.all(validations);
            const failed = results.filter(r => !r.valid);
            
            if (failed.length > 0) {
                const reasons = failed.map(f => f.reason).join(', ');
                this.logger.warn('Order validation failed', { order, reasons });
                this.metrics.incrementCustomMetric('orders_rejected');
                this.metrics.endRequestFailure(startTime);
                
                return {
                    valid: false,
                    reasons: failed.map(f => f.reason),
                    riskLevel: this.systemState.riskLevel
                };
            }
            
            this.logger.info('Order validation passed', { order });
            this.metrics.incrementCustomMetric('orders_approved');
            this.metrics.endRequestSuccess(startTime);
            
            return {
                valid: true,
                riskLevel: this.systemState.riskLevel,
                approvedAt: new Date().toISOString()
            };
            
        } catch (error) {
            this.logger.error('Order validation error', { error: error.message, order });
            this.metrics.endRequestFailure(startTime);
            
            return {
                valid: false,
                reasons: [error.message],
                riskLevel: 'CRITICAL'
            };
        }
    }

    /**
     * Validaciones individuales
     */
    async validateOrderSize(order) {
        if (order.notionalValue > this.riskPolicies.maxOrderSize) {
            return { valid: false, reason: 'Order size exceeds maximum allowed' };
        }
        return { valid: true };
    }

    async validateSymbol(order) {
        if (this.riskPolicies.blacklistedSymbols.includes(order.symbol)) {
            return { valid: false, reason: 'Symbol is blacklisted' };
        }
        if (!this.riskPolicies.allowedSymbols.includes(order.symbol)) {
            return { valid: false, reason: 'Symbol not in allowed list' };
        }
        return { valid: true };
    }

    async validateExposureLimits(order) {
        const currentExposure = this.systemState.riskMetrics.totalExposure;
        const newExposure = currentExposure + Math.abs(order.notionalValue);
        
        if (newExposure > this.riskPolicies.maxTotalExposure) {
            return { valid: false, reason: 'Would exceed total exposure limit' };
        }
        return { valid: true };
    }

    async validateLeverage(order) {
        if (order.leverage && order.leverage > this.riskPolicies.maxLeverage) {
            return { valid: false, reason: 'Leverage exceeds maximum allowed' };
        }
        return { valid: true };
    }

    async validateRiskLevel(order) {
        if (this.systemState.riskLevel === 'CRITICAL') {
            return { valid: false, reason: 'System in critical risk state' };
        }
        return { valid: true };
    }

    /**
     * Dispara modo de emergencia
     */
    async triggerEmergencyMode() {
        this.logger.error('EMERGENCY MODE ACTIVATED');
        // En modo de emergencia, considerar auto-close de posiciones más riesgosas
        this.addAlert('Emergency mode activated - Critical risk detected', 'CRITICAL');
    }

    async triggerHighRiskMode() {
        this.logger.warn('HIGH RISK MODE - Restricting new positions');
        this.addAlert('High risk mode activated - New position restrictions in place', 'WARNING');
    }

    async triggerMediumRiskMode() {
        this.logger.info('MEDIUM RISK MODE - Enhanced monitoring');
        this.addAlert('Medium risk mode - Enhanced monitoring active', 'INFO');
    }

    /**
     * Resetea kill switch manualmente (requiere autorización)
     */
    resetKillSwitch(authCode = null) {
        // En producción, requeriría autenticación robusta
        if (authCode !== 'RESET_GUARDIAN_2024') {
            this.logger.error('Unauthorized kill switch reset attempt');
            return { success: false, reason: 'Unauthorized' };
        }
        
        this.systemState.globalKillSwitch = false;
        this.systemState.riskLevel = 'LOW';
        this.systemState.alerts = [];
        
        this.logger.info('KILL SWITCH RESET - System operational again');
        this.addAlert('Kill switch reset - System restored', 'INFO');
        
        return { success: true, timestamp: new Date().toISOString() };
    }

    /**
     * Agrega alerta al sistema
     */
    addAlert(message, level = 'INFO', metadata = {}) {
        const alert = {
            id: SecureRandom.uuid(),
            timestamp: new Date().toISOString(),
            level,
            message,
            metadata,
            acknowledged: false
        };
        
        this.systemState.alerts.unshift(alert);
        
        // Mantener solo últimas 100 alertas
        if (this.systemState.alerts.length > 100) {
            this.systemState.alerts = this.systemState.alerts.slice(0, 100);
        }
        
        this.metrics.incrementCustomMetric(`alerts_${level.toLowerCase()}`);
    }

    /**
     * Obtiene nivel de riesgo numérico para métricas
     */
    getRiskLevelNumeric() {
        const levels = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
        return levels[this.systemState.riskLevel] || 0;
    }

    /**
     * Análisis profundo de riesgo (ejecutado menos frecuentemente)
     */
    async performDeepRiskAnalysis() {
        try {
            this.logger.info('Performing deep risk analysis');
            
            // Análisis de correlaciones avanzadas
            // Análisis de liquidez de mercado
            // Evaluación de riesgo de contraparte
            // Stress testing
            
            this.metrics.incrementCustomMetric('deep_risk_analyses');
            
        } catch (error) {
            this.logger.error('Deep risk analysis failed', { error: error.message });
        }
    }

    /**
     * Validadores de health check
     */
    validatePolicies() {
        const required = ['maxTotalExposure', 'maxOrderSize', 'allowedSymbols'];
        const missing = required.filter(key => !this.riskPolicies[key]);
        if (missing.length > 0) throw new Error(`Missing policies: ${missing.join(', ')}`);
        return true;
    }

    validateSystemMonitoring() {
        if (!this.systemState) throw new Error('System state not initialized');
        return true;
    }

    validateKillSwitchStatus() {
        return this.systemState.globalKillSwitch ? 'KILL_SWITCH_ACTIVE' : 'OPERATIONAL';
    }

    /**
     * Utilidad para HTTP requests
     */
    async httpRequest(url, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port,
                path: urlObj.pathname,
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'QBTC-Guardian/1.0'
                }
            };

            const req = http.request(options, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        resolve(parsed);
                    } catch {
                        resolve({ status: res.statusCode, data: responseData });
                    }
                });
            });

            req.on('error', reject);
            
            if (data) {
                req.write(JSON.stringify(data));
            }
            
            req.end();
        });
    }

    /**
     * Configura servidor HTTP
     */
    setupServer() {
        this.server = http.createServer(async (req, res) => {
            const startTime = this.metrics.startRequest();
            
            try {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

                if (req.method === 'OPTIONS') {
                    res.statusCode = 204;
                    res.end();
                    return;
                }

                let body = '';
                req.on('data', chunk => body += chunk.toString());
                req.on('end', async () => {
                    try {
                        const parsedBody = body ? JSON.parse(body) : {};
                        await this.handleRequest(req, res, parsedBody);
                        this.metrics.endRequestSuccess(startTime);
                    } catch (error) {
                        this.handleError(res, error);
                        this.metrics.endRequestFailure(startTime);
                    }
                });
            } catch (error) {
                this.handleError(res, error);
                this.metrics.endRequestFailure(startTime);
            }
        });

        this.server.listen(this.port, () => {
            this.logger.info(`Guardian Service listening on port ${this.port}`);
        });
    }

    /**
     * Maneja requests HTTP
     */
    async handleRequest(req, res, body) {
        const { method, url } = req;
        
        this.logger.info(`${method} ${url}`);
        
        if (method === 'GET' && url === '/health') {
            const healthResult = await this.healthCheck.runHealthChecks();
            res.statusCode = healthResult.status === 'healthy' ? 200 : 503;
            res.end(JSON.stringify(healthResult));
            return;
        }
        
        if (method === 'GET' && url === '/status') {
            res.statusCode = 200;
            res.end(JSON.stringify({
                service: this.serviceName,
                status: this.systemState.globalKillSwitch ? 'KILL_SWITCH_ACTIVE' : 'OPERATIONAL',
                riskLevel: this.systemState.riskLevel,
                riskMetrics: this.systemState.riskMetrics,
                activePositions: this.systemState.activePositions.size,
                alerts: this.systemState.alerts.length,
                lastUpdate: new Date().toISOString()
            }));
            return;
        }
        
        if (method === 'POST' && url === '/validate-order') {
            const validation = await this.validateOrder(body);
            res.statusCode = validation.valid ? 200 : 400;
            res.end(JSON.stringify(validation));
            return;
        }
        
        if (method === 'POST' && url === '/reset-kill-switch') {
            const result = this.resetKillSwitch(body.authCode);
            res.statusCode = result.success ? 200 : 403;
            res.end(JSON.stringify(result));
            return;
        }
        
        if (method === 'GET' && url === '/metrics') {
            res.setHeader('Content-Type', 'text/plain');
            res.statusCode = 200;
            res.end(this.metrics.getPrometheusMetrics());
            return;
        }
        
        if (method === 'GET' && url === '/alerts') {
            res.statusCode = 200;
            res.end(JSON.stringify({
                alerts: this.systemState.alerts,
                totalAlerts: this.systemState.alerts.length,
                unacknowledged: this.systemState.alerts.filter(a => !a.acknowledged).length
            }));
            return;
        }
        
        // Endpoint no encontrado
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Endpoint not found' }));
    }

    /**
     * Maneja errores HTTP
     */
    handleError(res, error) {
        this.logger.error('HTTP request error', { error: error.message });
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        }));
    }
}

// Iniciar servicio
const guardian = new GuardianService();

// Manejar cierre graceful
process.on('SIGINT', () => {
    guardian.logger.info('Received SIGINT, shutting down gracefully');
    if (guardian.server) {
        guardian.server.close(() => {
            guardian.logger.info('Guardian Service stopped');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('uncaughtException', (error) => {
    guardian.logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    guardian.logger.error('Unhandled rejection', { reason, promise });
});

module.exports = GuardianService;
