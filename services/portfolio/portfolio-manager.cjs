/**
 * QBTC PORTFOLIO MANAGER - Motor de Cartera Dinámico
 * ===================================================
 * 
 * Sistema avanzado de gestión de cartera que:
 * 1. Calcula sizing adaptativo basado en volatilidad
 * 2. Gestiona VaR (Value at Risk) en tiempo real
 * 3. Controla concentración y correlaciones
 * 4. Optimiza asignación de capital dinámicamente
 * 5. Implementa stop-loss y take-profit inteligentes
 */

const http = require('http');
const { SecureRandom, QBTCMetrics, QBTCLogger, HealthCheck } = require('../../lib/qbtc-runtime.cjs');

class PortfolioManager {
    constructor() {
        this.serviceName = 'PortfolioManager';
        this.port = 14801;
        this.logger = new QBTCLogger(this.serviceName);
        this.metrics = new QBTCMetrics(this.serviceName);
        
        // Estado de la cartera
        this.portfolio = {
            totalCapital: 100000, // USD
            availableCapital: 100000,
            positions: new Map(),
            historicalReturns: [],
            riskMetrics: {
                portfolioVaR: 0,
                expectedReturn: 0,
                sharpeRatio: 0,
                maxDrawdown: 0,
                beta: 1.0,
                correlationMatrix: new Map()
            }
        };
        
        // Configuración de riesgo
        this.riskConfig = {
            maxPortfolioVaR: 0.02, // 2% VaR diario máximo
            maxSingleAssetWeight: 0.30, // 30% max por activo
            maxCorrelationRisk: 0.70, // 70% max correlación
            targetSharpeRatio: 1.5,
            rebalanceThreshold: 0.05, // 5% desviación para rebalance
            lookbackPeriod: 30, // días para cálculos históricos
            minPositionSize: 100, // USD mínimo
            maxPositionSize: 20000, // USD máximo
            emergencyStopLoss: 0.08, // 8% stop loss de emergencia
            profitTaking: {
                level1: { threshold: 0.05, takePercent: 0.25 }, // 5% ganancia, tomar 25%
                level2: { threshold: 0.10, takePercent: 0.50 }, // 10% ganancia, tomar 50%
                level3: { threshold: 0.20, takePercent: 0.75 }  // 20% ganancia, tomar 75%
            }
        };
        
        // Datos de mercado simulados (en producción vendrían de fuentes reales)
        this.marketData = {
            prices: new Map(),
            volatilities: new Map(),
            correlations: new Map(),
            volumes: new Map()
        };
        
        // Configurar health checks
        this.healthCheck = new HealthCheck(this.serviceName, {
            'portfolio_validation': () => this.validatePortfolio(),
            'risk_calculations': () => this.validateRiskCalculations(),
            'market_data': () => this.validateMarketData()
        });
        
        this.logger.info('Portfolio Manager inicializándose');
        this.initializeMarketData();
        this.startPortfolioMonitoring();
        this.setupServer();
    }

    /**
     * Inicializa datos de mercado simulados
     */
    initializeMarketData() {
        const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
        
        symbols.forEach(symbol => {
            this.marketData.prices.set(symbol, {
                current: SecureRandom.randomInt(20000, 70000),
                history: this.generatePriceHistory(100),
                lastUpdate: Date.now()
            });
            
            this.marketData.volatilities.set(symbol, {
                daily: 0.02 + SecureRandom.random() * 0.08, // 2-10% volatilidad diaria
                weekly: 0.05 + SecureRandom.random() * 0.15,
                monthly: 0.10 + SecureRandom.random() * 0.25
            });
            
            this.marketData.volumes.set(symbol, {
                current: SecureRandom.randomInt(1000000, 10000000),
                average: SecureRandom.randomInt(2000000, 8000000)
            });
        });
        
        // Generar matriz de correlaciones
        this.calculateCorrelationMatrix(symbols);
        
        this.logger.info('Datos de mercado inicializados', {
            symbols: symbols.length,
            pricePoints: 100
        });
    }

    /**
     * Genera historial de precios simulado
     */
    generatePriceHistory(length) {
        const history = [];
        let price = SecureRandom.randomInt(30000, 60000);
        
        for (let i = 0; i < length; i++) {
            const change = (SecureRandom.random() - 0.5) * 0.1; // ±5% cambio máximo
            price *= (1 + change);
            
            history.push({
                price: Math.max(price, 100), // Precio mínimo
                timestamp: Date.now() - ((length - i) * 24 * 60 * 60 * 1000), // Días atrás
                volume: SecureRandom.randomInt(1000000, 5000000)
            });
        }
        
        return history;
    }

    /**
     * Calcula matriz de correlaciones entre activos
     */
    calculateCorrelationMatrix(symbols) {
        for (let i = 0; i < symbols.length; i++) {
            for (let j = i + 1; j < symbols.length; j++) {
                const symbol1 = symbols[i];
                const symbol2 = symbols[j];
                const correlation = this.calculateAssetCorrelation(symbol1, symbol2);
                
                const key = `${symbol1}-${symbol2}`;
                this.marketData.correlations.set(key, correlation);
            }
        }
    }

    /**
     * Calcula correlación entre dos activos
     */
    calculateAssetCorrelation(symbol1, symbol2) {
        // Correlación simulada basada en características del mercado
        const baseCorrelation = 0.3; // Correlación base crypto
        const randomFactor = (SecureRandom.random() - 0.5) * 0.6; // ±0.3 variación
        
        const correlation = Math.max(-0.8, Math.min(0.9, baseCorrelation + randomFactor));
        return Math.round(correlation * 1000) / 1000; // 3 decimales
    }

    /**
     * Inicia monitoreo continuo de la cartera
     */
    startPortfolioMonitoring() {
        // Actualización de riesgos cada 30 segundos
        setInterval(() => {
            this.updatePortfolioRisk();
        }, 30000);
        
        // Rebalance periódico cada 2 minutos
        setInterval(() => {
            this.evaluateRebalancing();
        }, 120000);
        
        // Actualización de datos de mercado cada minuto
        setInterval(() => {
            this.updateMarketData();
        }, 60000);
        
        this.logger.info('Monitoreo de cartera iniciado');
    }

    /**
     * Actualiza métricas de riesgo de la cartera
     */
    async updatePortfolioRisk() {
        try {
            const startTime = this.metrics.startRequest();
            
            // Calcular VaR de la cartera
            this.portfolio.riskMetrics.portfolioVaR = this.calculatePortfolioVaR();
            
            // Calcular retorno esperado
            this.portfolio.riskMetrics.expectedReturn = this.calculateExpectedReturn();
            
            // Calcular Sharpe Ratio
            this.portfolio.riskMetrics.sharpeRatio = this.calculateSharpeRatio();
            
            // Actualizar drawdown máximo
            this.updateMaxDrawdown();
            
            // Verificar límites de riesgo
            await this.checkRiskLimits();
            
            this.metrics.endRequestSuccess(startTime);
            this.metrics.setCustomMetric('portfolio_var', this.portfolio.riskMetrics.portfolioVaR);
            this.metrics.setCustomMetric('sharpe_ratio', this.portfolio.riskMetrics.sharpeRatio);
            this.metrics.setCustomMetric('total_positions', this.portfolio.positions.size);
            
        } catch (error) {
            this.logger.error('Error actualizando riesgo de cartera', { error: error.message });
            this.metrics.endRequestFailure(Date.now());
        }
    }

    /**
     * Calcula Value at Risk de la cartera usando simulación Monte Carlo
     */
    calculatePortfolioVaR(confidence = 0.95, horizon = 1) {
        if (this.portfolio.positions.size === 0) return 0;
        
        const simulations = 1000;
        const portfolioReturns = [];
        
        for (let i = 0; i < simulations; i++) {
            let portfolioReturn = 0;
            let totalValue = 0;
            
            for (const [symbol, position] of this.portfolio.positions) {
                const volatility = this.marketData.volatilities.get(symbol)?.daily || 0.05;
                const simulatedReturn = this.generateRandomReturn(volatility);
                const positionValue = position.quantity * position.currentPrice;
                
                portfolioReturn += simulatedReturn * (positionValue / this.portfolio.totalCapital);
                totalValue += positionValue;
            }
            
            portfolioReturns.push(portfolioReturn);
        }
        
        // Ordenar y calcular VaR
        portfolioReturns.sort((a, b) => a - b);
        const varIndex = Math.floor((1 - confidence) * simulations);
        const var95 = -portfolioReturns[varIndex]; // VaR es pérdida potencial (valor positivo)
        
        return Math.round(var95 * 10000) / 10000; // 4 decimales
    }

    /**
     * Genera retorno aleatorio con distribución normal
     */
    generateRandomReturn(volatility) {
        // Aproximación Box-Muller para distribución normal
        const u1 = SecureRandom.random();
        const u2 = SecureRandom.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        return z0 * volatility; // Retorno con volatilidad especificada
    }

    /**
     * Calcula retorno esperado de la cartera
     */
    calculateExpectedReturn() {
        if (this.portfolio.positions.size === 0) return 0;
        
        let weightedReturn = 0;
        let totalValue = this.getTotalPortfolioValue();
        
        for (const [symbol, position] of this.portfolio.positions) {
            const positionValue = position.quantity * position.currentPrice;
            const weight = positionValue / totalValue;
            
            // Retorno esperado basado en momentum histórico (simplificado)
            const priceData = this.marketData.prices.get(symbol);
            const recentReturns = this.calculateRecentReturns(priceData.history, 10);
            const expectedReturn = recentReturns.reduce((sum, ret) => sum + ret, 0) / recentReturns.length;
            
            weightedReturn += weight * expectedReturn;
        }
        
        return Math.round(weightedReturn * 10000) / 10000;
    }

    /**
     * Calcula Sharpe Ratio de la cartera
     */
    calculateSharpeRatio() {
        const expectedReturn = this.portfolio.riskMetrics.expectedReturn;
        const riskFreeRate = 0.02 / 365; // 2% anual / 365 días
        const portfolioVolatility = this.calculatePortfolioVolatility();
        
        if (portfolioVolatility === 0) return 0;
        
        const sharpeRatio = (expectedReturn - riskFreeRate) / portfolioVolatility;
        return Math.round(sharpeRatio * 1000) / 1000;
    }

    /**
     * Calcula volatilidad de la cartera
     */
    calculatePortfolioVolatility() {
        if (this.portfolio.positions.size === 0) return 0;
        
        let portfolioVariance = 0;
        let totalValue = this.getTotalPortfolioValue();
        const positions = Array.from(this.portfolio.positions.entries());
        
        // Varianza individual de cada posición
        for (const [symbol, position] of positions) {
            const weight = (position.quantity * position.currentPrice) / totalValue;
            const volatility = this.marketData.volatilities.get(symbol)?.daily || 0.05;
            portfolioVariance += Math.pow(weight * volatility, 2);
        }
        
        // Covarianza entre posiciones
        for (let i = 0; i < positions.length; i++) {
            for (let j = i + 1; j < positions.length; j++) {
                const [symbol1, pos1] = positions[i];
                const [symbol2, pos2] = positions[j];
                
                const weight1 = (pos1.quantity * pos1.currentPrice) / totalValue;
                const weight2 = (pos2.quantity * pos2.currentPrice) / totalValue;
                
                const vol1 = this.marketData.volatilities.get(symbol1)?.daily || 0.05;
                const vol2 = this.marketData.volatilities.get(symbol2)?.daily || 0.05;
                
                const correlation = this.getCorrelation(symbol1, symbol2);
                
                portfolioVariance += 2 * weight1 * weight2 * vol1 * vol2 * correlation;
            }
        }
        
        return Math.sqrt(portfolioVariance);
    }

    /**
     * Obtiene correlación entre dos activos
     */
    getCorrelation(symbol1, symbol2) {
        const key1 = `${symbol1}-${symbol2}`;
        const key2 = `${symbol2}-${symbol1}`;
        
        return this.marketData.correlations.get(key1) || 
               this.marketData.correlations.get(key2) || 0.3; // Default correlation
    }

    /**
     * Calcula sizing óptimo para nueva posición usando Kelly Criterion modificado
     */
    calculateOptimalSize(symbol, signal) {
        const availableCapital = this.portfolio.availableCapital;
        const volatility = this.marketData.volatilities.get(symbol)?.daily || 0.05;
        const expectedReturn = signal.expectedReturn || 0.02; // 2% retorno esperado default
        const winProbability = signal.confidence || 0.55; // 55% probabilidad default
        
        // Kelly Criterion modificado con límites de riesgo
        const kellyCriterion = (winProbability * expectedReturn - (1 - winProbability)) / expectedReturn;
        let kellySize = kellyCriterion * availableCapital;
        
        // Aplicar límites y ajustes por volatilidad
        const volatilityAdjustment = Math.max(0.5, 1 - volatility * 5); // Reducir size con alta volatilidad
        kellySize *= volatilityAdjustment;
        
        // Aplicar límites de configuración
        kellySize = Math.max(this.riskConfig.minPositionSize, kellySize);
        kellySize = Math.min(this.riskConfig.maxPositionSize, kellySize);
        kellySize = Math.min(availableCapital * this.riskConfig.maxSingleAssetWeight, kellySize);
        
        // Verificar límites de concentración
        const currentValue = this.getTotalPortfolioValue();
        const proposedWeight = kellySize / (currentValue + kellySize);
        
        if (proposedWeight > this.riskConfig.maxSingleAssetWeight) {
            kellySize = (currentValue * this.riskConfig.maxSingleAssetWeight) / (1 - this.riskConfig.maxSingleAssetWeight);
        }
        
        return Math.round(kellySize * 100) / 100; // 2 decimales
    }

    /**
     * Evalúa si es necesario rebalancear la cartera
     */
    async evaluateRebalancing() {
        if (this.portfolio.positions.size === 0) return;
        
        const targetWeights = this.calculateTargetWeights();
        const currentWeights = this.getCurrentWeights();
        const rebalanceNeeded = this.isRebalanceNeeded(targetWeights, currentWeights);
        
        if (rebalanceNeeded) {
            this.logger.info('Rebalance necesario detectado');
            await this.executeRebalance(targetWeights, currentWeights);
        }
    }

    /**
     * Calcula pesos objetivo basados en optimización de Markowitz simplificada
     */
    calculateTargetWeights() {
        const symbols = Array.from(this.portfolio.positions.keys());
        const targetWeights = new Map();
        
        // Optimización simplificada: peso inversamente proporcional al riesgo
        const totalRiskScore = symbols.reduce((sum, symbol) => {
            const volatility = this.marketData.volatilities.get(symbol)?.daily || 0.05;
            const riskScore = 1 / volatility; // Menor volatilidad = mayor peso
            return sum + riskScore;
        }, 0);
        
        symbols.forEach(symbol => {
            const volatility = this.marketData.volatilities.get(symbol)?.daily || 0.05;
            const riskScore = 1 / volatility;
            const weight = Math.min(riskScore / totalRiskScore, this.riskConfig.maxSingleAssetWeight);
            targetWeights.set(symbol, weight);
        });
        
        return targetWeights;
    }

    /**
     * Obtiene pesos actuales de la cartera
     */
    getCurrentWeights() {
        const weights = new Map();
        const totalValue = this.getTotalPortfolioValue();
        
        if (totalValue === 0) return weights;
        
        for (const [symbol, position] of this.portfolio.positions) {
            const positionValue = position.quantity * position.currentPrice;
            weights.set(symbol, positionValue / totalValue);
        }
        
        return weights;
    }

    /**
     * Determina si es necesario rebalancear
     */
    isRebalanceNeeded(targetWeights, currentWeights) {
        for (const [symbol, targetWeight] of targetWeights) {
            const currentWeight = currentWeights.get(symbol) || 0;
            const deviation = Math.abs(targetWeight - currentWeight);
            
            if (deviation > this.riskConfig.rebalanceThreshold) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Ejecuta rebalance de la cartera
     */
    async executeRebalance(targetWeights, currentWeights) {
        const totalValue = this.getTotalPortfolioValue();
        const rebalanceActions = [];
        
        for (const [symbol, targetWeight] of targetWeights) {
            const currentWeight = currentWeights.get(symbol) || 0;
            const targetValue = targetWeight * totalValue;
            const currentValue = currentWeight * totalValue;
            const difference = targetValue - currentValue;
            
            if (Math.abs(difference) > this.riskConfig.minPositionSize) {
                rebalanceActions.push({
                    symbol,
                    action: difference > 0 ? 'BUY' : 'SELL',
                    amount: Math.abs(difference),
                    currentWeight: currentWeight,
                    targetWeight: targetWeight
                });
            }
        }
        
        this.logger.info('Ejecutando rebalance', {
            actions: rebalanceActions.length,
            totalValue: totalValue
        });
        
        // Simular ejecución de órdenes de rebalance
        for (const action of rebalanceActions) {
            await this.simulateRebalanceOrder(action);
        }
        
        this.metrics.incrementCustomMetric('rebalances_executed');
    }

    /**
     * Simula ejecución de orden de rebalance
     */
    async simulateRebalanceOrder(action) {
        // En producción, esto enviaría órdenes reales al sistema de trading
        this.logger.debug('Simulando orden de rebalance', action);
        
        // Simular latencia de ejecución
        await new Promise(resolve => setTimeout(resolve, 100 + SecureRandom.randomInt(0, 200)));
        
        return {
            status: 'EXECUTED',
            symbol: action.symbol,
            action: action.action,
            amount: action.amount,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Actualiza datos de mercado (simulado)
     */
    updateMarketData() {
        for (const [symbol, priceData] of this.marketData.prices) {
            // Simular cambio de precio
            const currentPrice = priceData.current;
            const volatility = this.marketData.volatilities.get(symbol)?.daily || 0.05;
            const change = (SecureRandom.random() - 0.5) * 2 * volatility; // ±volatilidad
            const newPrice = Math.max(currentPrice * (1 + change), 100);
            
            priceData.current = Math.round(newPrice * 100) / 100; // 2 decimales
            priceData.lastUpdate = Date.now();
            
            // Agregar al historial
            priceData.history.push({
                price: newPrice,
                timestamp: Date.now(),
                volume: SecureRandom.randomInt(1000000, 5000000)
            });
            
            // Mantener solo últimos 100 puntos
            if (priceData.history.length > 100) {
                priceData.history.shift();
            }
            
            // Actualizar posiciones existentes con nuevos precios
            if (this.portfolio.positions.has(symbol)) {
                const position = this.portfolio.positions.get(symbol);
                position.currentPrice = newPrice;
                position.unrealizedPnL = (newPrice - position.averagePrice) * position.quantity;
                
                // Verificar stop-loss y take-profit
                this.checkPositionLimits(symbol, position);
            }
        }
        
        this.metrics.setCustomMetric('price_updates', this.marketData.prices.size);
    }

    /**
     * Verifica límites de posición (stop-loss, take-profit)
     */
    checkPositionLimits(symbol, position) {
        const pnlPercent = position.unrealizedPnL / (position.averagePrice * position.quantity);
        
        // Emergency stop-loss
        if (pnlPercent <= -this.riskConfig.emergencyStopLoss) {
            this.logger.warn('Emergency stop-loss triggered', {
                symbol,
                pnlPercent: pnlPercent * 100,
                unrealizedPnL: position.unrealizedPnL
            });
            
            this.triggerStopLoss(symbol, position);
            return;
        }
        
        // Profit taking levels
        const profitConfig = this.riskConfig.profitTaking;
        
        if (pnlPercent >= profitConfig.level3.threshold) {
            this.triggerProfitTaking(symbol, position, profitConfig.level3);
        } else if (pnlPercent >= profitConfig.level2.threshold) {
            this.triggerProfitTaking(symbol, position, profitConfig.level2);
        } else if (pnlPercent >= profitConfig.level1.threshold) {
            this.triggerProfitTaking(symbol, position, profitConfig.level1);
        }
    }

    /**
     * Dispara stop-loss de emergencia
     */
    async triggerStopLoss(symbol, position) {
        this.logger.error('STOP-LOSS EJECUTADO', { symbol, position: position.unrealizedPnL });
        
        // Simular venta de emergencia
        await this.simulateOrderExecution({
            symbol,
            action: 'SELL',
            quantity: position.quantity,
            type: 'MARKET',
            reason: 'EMERGENCY_STOP_LOSS'
        });
        
        this.metrics.incrementCustomMetric('stop_losses_triggered');
    }

    /**
     * Ejecuta toma de ganancias parcial
     */
    async triggerProfitTaking(symbol, position, level) {
        const sellQuantity = position.quantity * level.takePercent;
        
        this.logger.info('Toma de ganancias activada', {
            symbol,
            threshold: level.threshold * 100,
            sellPercent: level.takePercent * 100,
            sellQuantity
        });
        
        await this.simulateOrderExecution({
            symbol,
            action: 'SELL',
            quantity: sellQuantity,
            type: 'MARKET',
            reason: 'PROFIT_TAKING'
        });
        
        this.metrics.incrementCustomMetric('profit_taking_triggered');
    }

    /**
     * Simula ejecución de orden
     */
    async simulateOrderExecution(order) {
        this.logger.debug('Simulando ejecución de orden', order);
        
        // Actualizar posición o crear nueva
        if (this.portfolio.positions.has(order.symbol)) {
            const position = this.portfolio.positions.get(order.symbol);
            
            if (order.action === 'BUY') {
                const totalCost = order.quantity * this.marketData.prices.get(order.symbol).current;
                const newAveragePrice = ((position.averagePrice * position.quantity) + totalCost) / 
                                      (position.quantity + order.quantity);
                
                position.quantity += order.quantity;
                position.averagePrice = newAveragePrice;
                position.lastUpdate = new Date().toISOString();
                
                this.portfolio.availableCapital -= totalCost;
                
            } else if (order.action === 'SELL') {
                position.quantity = Math.max(0, position.quantity - order.quantity);
                
                const saleValue = order.quantity * this.marketData.prices.get(order.symbol).current;
                this.portfolio.availableCapital += saleValue;
                
                if (position.quantity === 0) {
                    this.portfolio.positions.delete(order.symbol);
                    this.logger.info(`Posición cerrada: ${order.symbol}`);
                }
            }
        }
        
        return {
            status: 'EXECUTED',
            orderId: SecureRandom.uuid(),
            executedAt: new Date().toISOString(),
            ...order
        };
    }

    /**
     * Utilidades de cálculo
     */
    getTotalPortfolioValue() {
        let totalValue = this.portfolio.availableCapital;
        
        for (const [symbol, position] of this.portfolio.positions) {
            totalValue += position.quantity * position.currentPrice;
        }
        
        return totalValue;
    }

    calculateRecentReturns(priceHistory, periods = 10) {
        if (priceHistory.length < periods + 1) return [0];
        
        const returns = [];
        const recent = priceHistory.slice(-periods - 1);
        
        for (let i = 1; i < recent.length; i++) {
            const prevPrice = recent[i - 1].price;
            const currentPrice = recent[i].price;
            const return_ = (currentPrice - prevPrice) / prevPrice;
            returns.push(return_);
        }
        
        return returns;
    }

    updateMaxDrawdown() {
        const portfolioValue = this.getTotalPortfolioValue();
        
        if (!this.portfolio.peakValue || portfolioValue > this.portfolio.peakValue) {
            this.portfolio.peakValue = portfolioValue;
        }
        
        const drawdown = (this.portfolio.peakValue - portfolioValue) / this.portfolio.peakValue;
        
        if (drawdown > this.portfolio.riskMetrics.maxDrawdown) {
            this.portfolio.riskMetrics.maxDrawdown = drawdown;
        }
    }

    async checkRiskLimits() {
        const var95 = this.portfolio.riskMetrics.portfolioVaR;
        
        if (var95 > this.riskConfig.maxPortfolioVaR) {
            this.logger.warn('Portfolio VaR exceeds limit', {
                current: var95,
                limit: this.riskConfig.maxPortfolioVaR
            });
            
            // Notificar al Guardian sobre riesgo excesivo
            await this.notifyRiskExcess(var95);
        }
    }

    async notifyRiskExcess(currentVaR) {
        try {
            await this.httpRequest('http://localhost:14601/risk-alert', 'POST', {
                source: 'PortfolioManager',
                alert: 'VaR_LIMIT_EXCEEDED',
                currentVaR: currentVaR,
                maxVaR: this.riskConfig.maxPortfolioVaR,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            this.logger.error('Error notifying Guardian', { error: error.message });
        }
    }

    /**
     * API endpoints
     */
    async handlePortfolioRequest(req, res, body) {
        const { method, url } = req;
        
        if (method === 'GET' && url === '/portfolio') {
            const portfolioSummary = {
                totalValue: this.getTotalPortfolioValue(),
                availableCapital: this.portfolio.availableCapital,
                totalPositions: this.portfolio.positions.size,
                riskMetrics: this.portfolio.riskMetrics,
                positions: Array.from(this.portfolio.positions.entries()).map(([symbol, pos]) => ({
                    symbol,
                    quantity: pos.quantity,
                    averagePrice: pos.averagePrice,
                    currentPrice: pos.currentPrice,
                    unrealizedPnL: pos.unrealizedPnL,
                    weight: (pos.quantity * pos.currentPrice) / this.getTotalPortfolioValue()
                }))
            };
            
            res.statusCode = 200;
            res.end(JSON.stringify(portfolioSummary));
            return;
        }
        
        if (method === 'POST' && url === '/calculate-size') {
            const { symbol, signal } = body;
            const optimalSize = this.calculateOptimalSize(symbol, signal);
            
            res.statusCode = 200;
            res.end(JSON.stringify({
                symbol,
                optimalSize,
                reasoning: {
                    available_capital: this.portfolio.availableCapital,
                    volatility: this.marketData.volatilities.get(symbol),
                    kelly_criterion: true,
                    risk_adjustments: true
                }
            }));
            return;
        }
        
        if (method === 'GET' && url === '/risk-metrics') {
            res.statusCode = 200;
            res.end(JSON.stringify({
                portfolio_var: this.portfolio.riskMetrics.portfolioVaR,
                expected_return: this.portfolio.riskMetrics.expectedReturn,
                sharpe_ratio: this.portfolio.riskMetrics.sharpeRatio,
                max_drawdown: this.portfolio.riskMetrics.maxDrawdown,
                portfolio_volatility: this.calculatePortfolioVolatility(),
                risk_limits: this.riskConfig
            }));
            return;
        }
        
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Portfolio endpoint not found' }));
    }

    /**
     * Validadores de health check
     */
    validatePortfolio() {
        const totalValue = this.getTotalPortfolioValue();
        if (totalValue <= 0) throw new Error('Portfolio value is zero or negative');
        
        const capitalRatio = this.portfolio.availableCapital / totalValue;
        if (capitalRatio > 1.1) throw new Error('Available capital exceeds total value');
        
        return `Portfolio value: $${totalValue.toFixed(2)}`;
    }

    validateRiskCalculations() {
        const var95 = this.portfolio.riskMetrics.portfolioVaR;
        if (isNaN(var95) || var95 < 0) throw new Error('Invalid VaR calculation');
        
        return `VaR 95%: ${(var95 * 100).toFixed(2)}%`;
    }

    validateMarketData() {
        const pricesCount = this.marketData.prices.size;
        if (pricesCount === 0) throw new Error('No market data available');
        
        // Verificar que los datos no sean demasiado antiguos
        const oldestUpdate = Math.min(...Array.from(this.marketData.prices.values())
            .map(data => data.lastUpdate));
        const age = Date.now() - oldestUpdate;
        
        if (age > 5 * 60 * 1000) throw new Error('Market data is stale');
        
        return `${pricesCount} assets, latest update ${Math.round(age/1000)}s ago`;
    }

    /**
     * Utilidad HTTP
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
                    'User-Agent': 'QBTC-PortfolioManager/1.0'
                }
            };

            const req = http.request(options, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(responseData));
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
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
                        
                        if (req.url.startsWith('/portfolio') || req.url.startsWith('/calculate-size') || req.url.startsWith('/risk-metrics')) {
                            await this.handlePortfolioRequest(req, res, parsedBody);
                        } else if (req.method === 'GET' && req.url === '/health') {
                            const healthResult = await this.healthCheck.runHealthChecks();
                            res.statusCode = healthResult.status === 'healthy' ? 200 : 503;
                            res.end(JSON.stringify(healthResult));
                        } else if (req.method === 'GET' && req.url === '/metrics') {
                            res.setHeader('Content-Type', 'text/plain');
                            res.end(this.metrics.getPrometheusMetrics());
                        } else {
                            res.statusCode = 404;
                            res.end(JSON.stringify({ error: 'Endpoint not found' }));
                        }
                        
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
            this.logger.info(`Portfolio Manager listening on port ${this.port}`);
        });
    }

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
const portfolioManager = new PortfolioManager();

// Manejar cierre graceful
process.on('SIGINT', () => {
    portfolioManager.logger.info('Received SIGINT, shutting down gracefully');
    if (portfolioManager.server) {
        portfolioManager.server.close(() => {
            portfolioManager.logger.info('Portfolio Manager stopped');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('uncaughtException', (error) => {
    portfolioManager.logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    portfolioManager.logger.error('Unhandled rejection', { reason, promise });
});

module.exports = PortfolioManager;
