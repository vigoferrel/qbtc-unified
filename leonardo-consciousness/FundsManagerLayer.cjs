/**
 * QBTC-UNIFIED - Funds Manager Layer
 * Gestor de Fondos Leonardo - Kelly Criterion & Risk Management
 * 
 * "La simplicidad es la máxima sofisticación" - Leonardo da Vinci
 */

class FundsManagerLayer {
    constructor() {
        // Estado del gestor de fondos
        this.isInitialized = false;
        this.balance = {
            total: 1000.0,           // Balance inicial $1000 (simulado)
            available: 1000.0,       // Fondos disponibles
            reserved: 0.0,           // Fondos reservados en trades
            profit: 0.0,             // Profit acumulado
            drawdown: 0.0            // Drawdown actual
        };
        
        // Configuración Leonardo
        this.config = {
            BAIT_AMOUNT: parseFloat(process.env.LEONARDO_BAIT_AMOUNT) || 1.0,
            KELLY_FACTOR: parseFloat(process.env.KELLY_CRITERION_FACTOR) || 0.25,
            MAX_RISK_PER_TRADE: parseFloat(process.env.MAX_RISK_PER_TRADE) || 0.01,
            MAX_DRAWDOWN: parseFloat(process.env.TRADING_MAX_DRAWDOWN) || 0.50,
            COMPOUNDING_ENABLED: true,
            REINVESTMENT_RATIO: parseFloat(process.env.PROFIT_REINVESTMENT_RATIO) || 0.80,
            
            // Constantes Leonardo
            PHI_RATIO: 1.618,
            LAMBDA_NORMALIZED: 0.888,
            TARGET_DAILY_RETURN: parseFloat(process.env.TARGET_DAILY_RETURN) || 5.0
        };
        
        // Métricas de performance
        this.metrics = {
            totalTrades: 0,
            successfulTrades: 0,
            winRate: 0,
            averageProfit: 0,
            maxProfit: 0,
            maxDrawdown: 0,
            sharpeRatio: 0,
            kellyOptimal: 0,
            compoundingMultiplier: 1.0
        };
        
        // Historial de trades
        this.tradeHistory = [];
        
        console.log('💰 FundsManagerLayer initialized');
    }
    
    /**
     * Inicializar el gestor de fondos
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ FundsManager already initialized');
            return;
        }
        
        try {
            console.log('💰 Initializing Funds Manager...');
            
            // Inicializar balance con modo de operación
            await this.initializeBalance();
            
            // Calcular Kelly optimal inicial
            await this.calculateKellyOptimal();
            
            // Configurar compounding
            await this.setupCompounding();
            
            this.isInitialized = true;
            console.log('✅ Funds Manager initialized successfully');
            console.log(`💵 Initial balance: $${this.balance.total.toFixed(2)}`);
            console.log(`🎣 Bait amount: $${this.config.BAIT_AMOUNT}`);
            
        } catch (error) {
            console.error('❌ Failed to initialize Funds Manager:', error.message);
            throw error;
        }
    }
    
    /**
     * Obtener estado de salud del sistema
     */
    getHealth() {
        return {
            status: this.isInitialized ? 'HEALTHY' : 'NOT_INITIALIZED',
            isInitialized: this.isInitialized,
            totalBalance: this.balance?.total || 0,
            availableBalance: this.balance?.available || 0,
            winRate: this.metrics?.winRate || 0,
            lastUpdate: Date.now()
        };
    }
    
    /**
     * Inicializar balance
     */
    async initializeBalance() {
        const mode = process.env.SYSTEM_MODE || 'dev';
        
        if (mode === 'sim' || mode === 'dev') {
            // Modo simulación - balance inicial alto para testing
            this.balance = {
                total: 10000.0,
                available: 10000.0,
                reserved: 0.0,
                profit: 0.0,
                drawdown: 0.0
            };
            console.log('💰 Simulation mode - Starting with $10,000');
        } else {
            // Modo real - balance conservador
            this.balance = {
                total: 100.0,
                available: 100.0,
                reserved: 0.0,
                profit: 0.0,
                drawdown: 0.0
            };
            console.log('💰 Live mode - Starting with $100');
        }
    }
    
    /**
     * Calcular Kelly Criterion optimal
     */
    async calculateKellyOptimal() {
        // Kelly formula: f* = (bp - q) / b
        // Donde: b = odds, p = prob ganar, q = prob perder
        
        const winRate = this.metrics.winRate || 0.65; // 65% win rate inicial
        const avgWin = 4.0;  // 4% promedio ganancia
        const avgLoss = 2.0; // 2% promedio pérdida
        
        const b = avgWin / avgLoss; // Odds ratio
        const p = winRate;
        const q = 1 - winRate;
        
        this.metrics.kellyOptimal = Math.max((b * p - q) / b, 0) * this.config.KELLY_FACTOR;
        
        console.log(`📊 Kelly optimal: ${(this.metrics.kellyOptimal * 100).toFixed(1)}%`);
    }
    
    /**
     * Configurar compounding exponencial
     */
    async setupCompounding() {
        // Multiplicador basado en PHI y target return
        const phiInfluence = this.config.PHI_RATIO - 1; // 0.618
        const lambdaInfluence = this.config.LAMBDA_NORMALIZED; // 0.888
        const targetInfluence = this.config.TARGET_DAILY_RETURN / 100; // 5% = 0.05
        
        this.metrics.compoundingMultiplier = 1 + (phiInfluence * lambdaInfluence * targetInfluence);
        
        console.log(`📈 Compounding multiplier: ${this.metrics.compoundingMultiplier.toFixed(3)}x`);
    }
    
    /**
     * Calcular tamaño de posición optimal
     */
    async calculateOptimalPositionSize(baitAmount, confidence, consciousness) {
        try {
            if (!this.isInitialized) {
                throw new Error('FundsManager not initialized');
            }
            
            // Verificar fondos disponibles
            if (this.balance.available < baitAmount) {
                return {
                    canExecute: false,
                    reason: 'Insufficient funds',
                    positionSize: 0,
                    baitAmount: 0,
                    expectedProfit: 0
                };
            }
            
            // Calcular factor de riesgo basado en consciencia y confianza
            const riskFactor = Math.min(confidence * consciousness, 1.0);
            const kellyAdjusted = this.metrics.kellyOptimal * riskFactor;
            
            // Tamaño de posición Leonardo
            const basePosition = baitAmount * this.config.PHI_RATIO;
            const kellyPosition = this.balance.available * kellyAdjusted;
            const maxRiskPosition = this.balance.available * this.config.MAX_RISK_PER_TRADE;
            
            // Tomar el menor para seguridad
            const positionSize = Math.min(basePosition, kellyPosition, maxRiskPosition);
            
            // Profit esperado con multiplicador de compounding
            const expectedProfit = positionSize * confidence * this.metrics.compoundingMultiplier;
            
            console.log(`💰 Position calculation:`);
            console.log(`   Bait: $${baitAmount}`);
            console.log(`   Confidence: ${(confidence * 100).toFixed(1)}%`);
            console.log(`   Consciousness: ${(consciousness * 100).toFixed(1)}%`);
            console.log(`   Position size: $${positionSize.toFixed(2)}`);
            console.log(`   Expected profit: $${expectedProfit.toFixed(2)}`);
            
            return {
                canExecute: true,
                positionSize: positionSize,
                baitAmount: baitAmount,
                expectedProfit: expectedProfit,
                riskFactor: riskFactor,
                kellyFactor: kellyAdjusted,
                confidenceScore: confidence,
                consciousnessScore: consciousness
            };
            
        } catch (error) {
            console.error('❌ Error calculating position size:', error.message);
            return {
                canExecute: false,
                reason: error.message,
                positionSize: 0,
                baitAmount: 0,
                expectedProfit: 0
            };
        }
    }
    
    /**
     * Reservar fondos para trade
     */
    async reserveFunds(amount) {
        if (this.balance.available < amount) {
            throw new Error('Insufficient available funds');
        }
        
        this.balance.available -= amount;
        this.balance.reserved += amount;
        
        console.log(`💾 Reserved $${amount.toFixed(2)} for trade`);
        console.log(`💰 Available: $${this.balance.available.toFixed(2)}, Reserved: $${this.balance.reserved.toFixed(2)}`);
        
        return true;
    }
    
    /**
     * Liberar fondos de trade (al cerrar posición)
     */
    async releaseFunds(amount, profit = 0) {
        this.balance.reserved = Math.max(this.balance.reserved - amount, 0);
        this.balance.available += amount + profit;
        this.balance.total += profit;
        
        if (profit !== 0) {
            this.balance.profit += profit;
            
            // Actualizar métricas
            if (profit > 0) {
                this.metrics.successfulTrades++;
                this.metrics.maxProfit = Math.max(this.metrics.maxProfit, profit);
            }
            
            this.metrics.totalTrades++;
            this.metrics.winRate = this.metrics.successfulTrades / this.metrics.totalTrades;
            this.metrics.averageProfit = this.balance.profit / this.metrics.totalTrades;
            
            // Registrar trade en historial
            this.tradeHistory.push({
                timestamp: Date.now(),
                amount: amount,
                profit: profit,
                balance: this.balance.total,
                winRate: this.metrics.winRate
            });
            
            // Compounding automático
            if (profit > 0 && this.config.COMPOUNDING_ENABLED) {
                await this.applyCompounding(profit);
            }
            
            console.log(`💰 Trade closed: Amount $${amount.toFixed(2)}, Profit $${profit.toFixed(2)}`);
            console.log(`📊 Total balance: $${this.balance.total.toFixed(2)}, Win rate: ${(this.metrics.winRate * 100).toFixed(1)}%`);
        }
        
        return true;
    }
    
    /**
     * Aplicar compounding exponencial
     */
    async applyCompounding(profit) {
        if (profit <= 0) return;
        
        // Reinvertir percentage del profit
        const reinvestAmount = profit * this.config.REINVESTMENT_RATIO;
        
        // Aplicar multiplicador de compounding
        const compoundingGain = reinvestAmount * (this.metrics.compoundingMultiplier - 1);
        
        this.balance.available += compoundingGain;
        this.balance.total += compoundingGain;
        
        console.log(`📈 Compounding applied: +$${compoundingGain.toFixed(2)} (${this.config.REINVESTMENT_RATIO * 100}% reinvested)`);
        
        // Actualizar multiplicador basado en performance
        await this.updateCompoundingMultiplier();
    }
    
    /**
     * Actualizar multiplicador de compounding
     */
    async updateCompoundingMultiplier() {
        const recentWinRate = this.getRecentWinRate();
        const profitGrowth = this.getProfitGrowthRate();
        
        // Ajustar multiplicador basado en performance
        const performanceFactor = (recentWinRate + profitGrowth) / 2;
        const phiInfluence = this.config.PHI_RATIO - 1;
        
        this.metrics.compoundingMultiplier = Math.min(
            1 + (phiInfluence * performanceFactor * this.config.LAMBDA_NORMALIZED),
            2.0 // Límite máximo 2x
        );
        
        console.log(`📊 Compounding multiplier updated: ${this.metrics.compoundingMultiplier.toFixed(3)}x`);
    }
    
    /**
     * Obtener win rate reciente (últimos 10 trades)
     */
    getRecentWinRate() {
        const recentTrades = this.tradeHistory.slice(-10);
        if (recentTrades.length === 0) return this.metrics.winRate;
        
        const recentWins = recentTrades.filter(trade => trade.profit > 0).length;
        return recentWins / recentTrades.length;
    }
    
    /**
     * Obtener tasa de crecimiento de profit
     */
    getProfitGrowthRate() {
        const recentTrades = this.tradeHistory.slice(-10);
        if (recentTrades.length < 2) return 0;
        
        const firstBalance = recentTrades[0].balance;
        const lastBalance = recentTrades[recentTrades.length - 1].balance;
        
        return Math.min((lastBalance - firstBalance) / firstBalance, 1.0);
    }
    
    /**
     * Verificar límites de drawdown
     */
    checkDrawdownLimits() {
        const peakBalance = Math.max(...this.tradeHistory.map(t => t.balance), this.balance.total);
        this.balance.drawdown = (peakBalance - this.balance.total) / peakBalance;
        this.metrics.maxDrawdown = Math.max(this.metrics.maxDrawdown, this.balance.drawdown);
        
        if (this.balance.drawdown > this.config.MAX_DRAWDOWN) {
            console.log(`🚨 DRAWDOWN ALERT: ${(this.balance.drawdown * 100).toFixed(1)}% (Max: ${(this.config.MAX_DRAWDOWN * 100).toFixed(1)}%)`);
            return false; // Activar emergency stop
        }
        
        return true;
    }
    
    /**
     * Obtener balance actual
     */
    getBalance() {
        return {
            ...this.balance,
            metrics: this.metrics,
            isHealthy: this.checkDrawdownLimits(),
            compoundingActive: this.config.COMPOUNDING_ENABLED,
            kellyOptimal: this.metrics.kellyOptimal
        };
    }
    
    /**
     * Obtener métricas de performance
     */
    getPerformanceMetrics() {
        return {
            ...this.metrics,
            balance: this.balance,
            drawdownPercent: this.balance.drawdown * 100,
            profitPercent: (this.balance.profit / (this.balance.total - this.balance.profit)) * 100,
            recentWinRate: this.getRecentWinRate() * 100,
            profitGrowthRate: this.getProfitGrowthRate() * 100,
            tradesCount: this.tradeHistory.length
        };
    }
    
    /**
     * Simular profit potencial
     */
    simulatePotentialProfit(days = 30) {
        const dailyReturn = this.config.TARGET_DAILY_RETURN / 100;
        const winRate = this.metrics.winRate || 0.65;
        
        let projectedBalance = this.balance.total;
        const projections = [];
        
        for (let day = 1; day <= days; day++) {
            // Simular trades diarios con compounding
            const dailyTrades = 5; // 5 trades por día
            
            for (let trade = 0; trade < dailyTrades; trade++) {
                const tradeSuccess = Math.random() < winRate;
                const tradeAmount = projectedBalance * this.metrics.kellyOptimal;
                
                if (tradeSuccess) {
                    const profit = tradeAmount * dailyReturn * this.metrics.compoundingMultiplier;
                    projectedBalance += profit;
                } else {
                    const loss = tradeAmount * (dailyReturn / 2); // Pérdidas menores
                    projectedBalance -= loss;
                }
            }
            
            projections.push({
                day: day,
                balance: projectedBalance,
                profit: projectedBalance - this.balance.total,
                profitPercent: ((projectedBalance - this.balance.total) / this.balance.total) * 100
            });
        }
        
        return projections;
    }
    
    /**
     * Reporte de estado completo
     */
    generateReport() {
        const report = {
            timestamp: Date.now(),
            balance: this.balance,
            metrics: this.metrics,
            performance: this.getPerformanceMetrics(),
            projections: this.simulatePotentialProfit(7), // 7 días
            health: {
                isHealthy: this.checkDrawdownLimits(),
                drawdownStatus: this.balance.drawdown < this.config.MAX_DRAWDOWN ? 'OK' : 'ALERT',
                fundsAvailability: this.balance.available > this.config.BAIT_AMOUNT ? 'OK' : 'LOW',
                compoundingStatus: this.config.COMPOUNDING_ENABLED ? 'ACTIVE' : 'INACTIVE'
            }
        };
        
        return report;
    }
}

module.exports = FundsManagerLayer;
