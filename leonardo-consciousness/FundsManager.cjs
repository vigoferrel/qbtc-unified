// ========================================================================
// 💰 LEONARDO FUNDS MANAGER 4.0
// Gestión Inteligente de Capital con Filosofía "Carnada de $1"
// Kelly Criterion + Compounding Cuántico + Risk Management Leonardo
// ========================================================================

const { LeonardoConstants } = require('./LeonardoDecisionEngine.cjs');
const EventEmitter = require('events');

class FundsManager extends EventEmitter {
    constructor(config = {}) {
        super();
        this.constants = LeonardoConstants;
        
        // Extraer configuraciones del objeto o usar valores por defecto
        const initialBalance = typeof config === 'number' ? config : (config.initialBalance || 1000);
        const maxLeverage = config.maxLeverage || this.constants.MAX_LEVERAGE;
        const maxRiskPerTrade = config.maxRiskPerTrade || 0.10;
        const maxDrawdown = config.maxDrawdown || 0.50;
        const stopLoss = config.stopLoss || 0.02;
        const takeProfit = config.takeProfit || 0.04;
        const kellyFactor = config.kellyFactor || 0.25;
        const maxConcurrentTrades = config.maxConcurrentTrades || 3;
        const emergencyThreshold = config.emergencyThreshold || 0.70;
        const testnet = config.testnet || false;
        
        // Estado financiero principal
        this.totalBalance = parseFloat(initialBalance) || 1000;
        this.availableBalance = this.totalBalance;
        this.reservedBalance = 0;
        this.equity = this.totalBalance;
        this.margin = 0;
        this.freeMargin = this.totalBalance;
        
        // Posiciones activas
        this.activePositions = new Map();
        this.positionCounter = 0;
        
        // Métricas de rendimiento
        this.performanceMetrics = {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalProfit: 0,
            totalLoss: 0,
            winRate: 0,
            profitFactor: 0,
            maxDrawdown: 0,
            currentDrawdown: 0,
            maxBalance: initialBalance,
            avgWin: 0,
            avgLoss: 0,
            largestWin: 0,
            largestLoss: 0,
            consecutiveWins: 0,
            consecutiveLosses: 0,
            maxConsecutiveWins: 0,
            maxConsecutiveLosses: 0
        };
        
        // Historial de balance para análisis
        this.balanceHistory = [{ 
            balance: initialBalance, 
            timestamp: Date.now(), 
            event: 'INITIAL_DEPOSIT' 
        }];
        
        // Configuración RENTABILIDAD INFINITA Leonardo
        this.riskConfig = {
            maxRiskPerTrade: 0.10, // 10% MÁXIMO POR TRADE - RENTABILIDAD EXTREMA
            maxDailyRisk: 1.0, // 100% DIARIO - SIN LÍMITES
            maxDrawdownLimit: 0.50, // 50% drawdown permitido - ESPACIO INFINITO
            compoundingEnabled: true,
            compoundingFactor: 1.25, // 25% COMPOUNDING AGRESIVO
            emergencyStopLevel: 0.10, // Solo stop al 10% - MÁXIMA AGRESIVIDAD
            baitAmount: this.constants.BAIT_AMOUNT, // $10 carnada optimizada
            maxLeverage: this.constants.MAX_LEVERAGE, // 100x LEVERAGE
            kellyFractionLimit: 0.75 // 75% Kelly - RENTABILIDAD INFINITA
        };
        
        // Estado de Leonardo Consciousness en fondos
        this.leonardoFundsState = {
            consciousness_level: 0.618, // Inicial dorada
            compounding_active: true,
            big_bang_funds_ready: false,
            profit_acceleration: 1.0,
            bait_efficiency: 1.0,
            golden_ratio_optimization: true
        };
        
        // Métricas diarias para reset
        this.dailyMetrics = {
            date: this.getCurrentDateString(),
            dailyPnL: 0,
            dailyTrades: 0,
            dailyRisk: 0,
            maxDailyLoss: 0
        };
        
        console.log('💰 Leonardo Funds Manager 4.0 Inicializado');
        console.log(`💵 Balance inicial: $${this.totalBalance.toFixed(2)}`);
        console.log(`🎣 Carnada por trade: $${this.riskConfig.baitAmount}`);
        console.log(`⚖️ Riesgo máximo por trade: ${(this.riskConfig.maxRiskPerTrade * 100).toFixed(1)}%`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 💎 CÁLCULO DE POSICIÓN ÓPTIMA (Kelly Criterion Leonardo)
    // ═══════════════════════════════════════════════════════════════════════
    
    calculatePositionSize(opportunity, consciousness) {
        try {
            // Validar estado de trading
            if (!this.canTrade()) {
                return this.generateZeroPositionResult('TRADING_DISABLED');
            }
            
            // Obtener datos de la oportunidad
            const confidence = consciousness.confidence || 0.5;
            const edge = consciousness.edge || 0.01;
            const leverage = consciousness.leverage || this.constants.BASE_LEVERAGE;
            
            console.log(`📊 Calculando posición: Confianza ${(confidence * 100).toFixed(1)}%, Edge ${(edge * 100).toFixed(2)}%, Leverage ${leverage.toFixed(1)}x`);
            
            // 1. KELLY CRITERION LEONARDO OPTIMIZADO
            const kellyFraction = this.calculateKellyFraction(confidence, edge);
            
            // 2. CARNADA BASE ($1 Leonardo)
            const baitAmount = this.riskConfig.baitAmount * this.leonardoFundsState.bait_efficiency;
            
            // 3. FACTOR DE CONSCIENCIA (Más consciencia = mayor posición)
            const consciousnessFactor = consciousness.consciousnessLevel || 0.37;
            const consciousnessMultiplier = 1 + (consciousnessFactor * this.constants.PHI);
            
            // 4. COMPOUNDING CUÁNTICO
            const compoundingFactor = this.calculateCompoundingFactor();
            
            // 5. POSICIÓN KELLY AJUSTADA
            const kellyPosition = this.availableBalance * kellyFraction * consciousnessMultiplier;
            
            // 6. POSICIÓN CARNADA ESCALADA
            const baitPosition = baitAmount * leverage * consciousnessMultiplier * compoundingFactor;
            
            // 7. APLICAR LÍMITES DE RIESGO
            const maxRiskAmount = this.availableBalance * this.riskConfig.maxRiskPerTrade;
            const maxDailyRiskAmount = this.availableBalance * this.riskConfig.maxDailyRisk - this.dailyMetrics.dailyRisk;
            
            // 8. SELECCIONAR POSICIÓN ÓPTIMA
            const rawPosition = Math.max(kellyPosition, baitPosition);
            const safePosition = Math.min(rawPosition, maxRiskAmount, maxDailyRiskAmount);
            
            // 9. POSICIÓN FINAL CON LEVERAGE
            const finalPositionSize = Math.max(safePosition, baitAmount); // Mínimo carnada
            const marginRequired = finalPositionSize / leverage;
            
            // 10. VALIDAR MARGEN DISPONIBLE
            if (marginRequired > this.freeMargin) {
                console.log(`⚠️ Margen insuficiente: Requerido $${marginRequired.toFixed(2)}, Disponible $${this.freeMargin.toFixed(2)}`);
                return this.generateReducedPositionResult(marginRequired, leverage);
            }
            
            // 11. CALCULAR MÉTRICAS DE LA POSICIÓN
            const positionMetrics = this.calculatePositionMetrics(
                finalPositionSize, 
                leverage, 
                confidence, 
                edge,
                consciousness
            );
            
            console.log(`✅ Posición calculada: $${finalPositionSize.toFixed(2)} (${leverage.toFixed(1)}x leverage)`);
            console.log(`💎 Kelly: ${(kellyFraction * 100).toFixed(2)}%, Consciencia: ${(consciousnessFactor * 100).toFixed(1)}%`);
            
            return {
                success: true,
                size: finalPositionSize,
                leverage: leverage,
                marginRequired: marginRequired,
                risk: marginRequired, // Riesgo real sin leverage
                baitUsed: Math.min(baitAmount, marginRequired),
                kellyFraction: kellyFraction,
                consciousnessFactor: consciousnessFactor,
                compoundingFactor: compoundingFactor,
                profitTarget: positionMetrics.profitTarget,
                stopLoss: positionMetrics.stopLoss,
                riskRewardRatio: positionMetrics.riskRewardRatio,
                expectedValue: positionMetrics.expectedValue,
                maxDrawdownImpact: positionMetrics.maxDrawdownImpact,
                leonardoMetrics: {
                    bait_efficiency: this.leonardoFundsState.bait_efficiency,
                    consciousness_multiplier: consciousnessMultiplier,
                    golden_ratio_factor: this.constants.PHI,
                    big_bang_ready: this.leonardoFundsState.big_bang_funds_ready
                }
            };
            
        } catch (error) {
            console.error('❌ Error calculando posición:', error.message);
            return this.generateZeroPositionResult('CALCULATION_ERROR');
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 📈 KELLY CRITERION LEONARDO AVANZADO
    // ═══════════════════════════════════════════════════════════════════════
    
    calculateKellyFraction(confidence, edge) {
        // Kelly clásico: f = (p * b - q) / b
        // donde p = probabilidad de ganar, q = probabilidad de perder, b = odds
        
        const winProbability = confidence;
        const lossProbability = 1 - confidence;
        const odds = this.calculateOdds(edge);
        
        // Kelly Leonardo optimizado
        let kellyFraction = (winProbability * odds - lossProbability) / odds;
        
        // Ajustes Leonardo Consciousness
        // 1. Factor Phi para optimización dorada
        kellyFraction *= this.constants.PHI / 2; // Suavizar Kelly
        
        // 2. Ajuste por historial de performance
        const performanceAdjustment = this.calculatePerformanceAdjustment();
        kellyFraction *= performanceAdjustment;
        
        // 3. Limitar Kelly para seguridad
        kellyFraction = Math.max(0, Math.min(kellyFraction, this.riskConfig.kellyFractionLimit));
        
        // 4. Aplicar consciencia cuántica
        if (this.leonardoFundsState.consciousness_level >= 0.888) {
            kellyFraction *= 1.618; // Bonus golden ratio por alta consciencia
        }
        
        return kellyFraction;
    }
    
    calculateOdds(edge) {
        // Convertir edge a odds para Kelly
        return (1 + edge) / edge;
    }
    
    calculatePerformanceAdjustment() {
        // Ajustar Kelly basado en performance reciente
        if (this.performanceMetrics.totalTrades < 10) {
            return 0.5; // Conservativo al inicio
        }
        
        const winRate = this.performanceMetrics.winRate;
        const profitFactor = this.performanceMetrics.profitFactor;
        
        // Bonus por buen performance
        if (winRate > 0.6 && profitFactor > 1.5) {
            return 1.5;
        } else if (winRate > 0.5 && profitFactor > 1.2) {
            return 1.2;
        } else if (winRate < 0.4 || profitFactor < 0.8) {
            return 0.6; // Reducir tras mal performance
        }
        
        return 1.0;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🔄 COMPOUNDING CUÁNTICO LEONARDO
    // ═══════════════════════════════════════════════════════════════════════
    
    calculateCompoundingFactor() {
        if (!this.leonardoFundsState.compounding_active) return 1.0;
        
        // Factor base de compounding
        let factor = this.riskConfig.compoundingFactor; // 1.05 base
        
        // Bonus por profit acumulado
        const profitRatio = (this.totalBalance - this.balanceHistory[0].balance) / this.balanceHistory[0].balance;
        if (profitRatio > 0) {
            factor += profitRatio * 0.1; // 10% del profit ratio
        }
        
        // Bonus por consciencia alta
        if (this.leonardoFundsState.consciousness_level >= 0.941) {
            factor *= this.constants.PHI / 1.618; // Golden ratio perfecto
        }
        
        // Límite de compounding para seguridad
        return Math.min(factor, 2.0);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 💼 GESTIÓN DE POSICIONES
    // ═══════════════════════════════════════════════════════════════════════
    
    async openPosition(positionData) {
        try {
            const positionId = `LEONARDO_${++this.positionCounter}_${Date.now()}`;
            
            // Validar datos de entrada
            if (!this.validatePositionData(positionData)) {
                throw new Error('Datos de posición inválidos');
            }
            
            // Reservar margen
            const marginRequired = positionData.size / positionData.leverage;
            if (marginRequired > this.freeMargin) {
                throw new Error('Margen insuficiente para abrir posición');
            }
            
            // Calcular precios dinámicos de take profit y stop loss
            const entryPrice = positionData.entryPrice;
            let dynamicProfitTarget, dynamicStopLoss;
            
            // Si ya vienen calculados los valores dinámicos, usarlos
            if (positionData.profitTarget && positionData.stopLoss) {
                dynamicProfitTarget = positionData.profitTarget;
                dynamicStopLoss = positionData.stopLoss;
            } else {
                // Fallback: calcular dinámicamente aquí
                const consciousness = {
                    consciousnessLevel: this.leonardoFundsState.consciousness_level,
                    confidence: positionData.confidence || 0.5,
                    edge: positionData.edge || 0.01,
                    bigBangReady: this.leonardoFundsState.big_bang_funds_ready,
                    pillarDetails: {
                        lambda888: { strength: 0.7 },
                        prime7919: { strength: 0.6 },
                        hookWheel: { strength: 0.8 },
                        symbiosis: { strength: 0.75 }
                    }
                };
                
                const metrics = this.calculatePositionMetrics(
                    positionData.size,
                    positionData.leverage,
                    positionData.confidence || 0.5,
                    positionData.edge || 0.01,
                    consciousness
                );
                
                dynamicProfitTarget = metrics.profitTarget;
                dynamicStopLoss = metrics.stopLoss;
            }
            
            // Convertir métricas a precios reales
            const profitTargetPrice = this.calculateTargetPrice(entryPrice, dynamicProfitTarget, positionData.direction, positionData.size);
            const stopLossPrice = this.calculateStopPrice(entryPrice, dynamicStopLoss, positionData.direction, positionData.size);
            
            // Crear posición con precios dinámicos
            const position = {
                id: positionId,
                symbol: positionData.symbol,
                direction: positionData.direction,
                size: positionData.size,
                leverage: positionData.leverage,
                entryPrice: entryPrice,
                marginRequired: marginRequired,
                openTime: Date.now(),
                status: 'OPEN',
                
                // PRECIOS DINÁMICOS LEONARDO CONSCIOUSNESS
                profitTarget: dynamicProfitTarget,     // Valor absoluto del profit
                stopLoss: dynamicStopLoss,             // Valor absoluto del stop
                profitTargetPrice: profitTargetPrice,  // Precio objetivo de profit
                stopLossPrice: stopLossPrice,          // Precio objetivo de stop
                
                currentPnL: 0,
                maxPnL: 0,
                minPnL: 0,
                
                // Métricas Leonardo expandidas
                leonardoData: {
                    consciousness_at_open: this.leonardoFundsState.consciousness_level,
                    bait_amount: positionData.baitUsed || this.riskConfig.baitAmount,
                    kelly_fraction: positionData.kellyFraction || 0,
                    big_bang_position: this.leonardoFundsState.big_bang_funds_ready,
                    
                    // Métricas dinámicas calculadas
                    dynamic_profit_percent: positionData.takeProfitPercent,
                    dynamic_stop_percent: positionData.stopLossPercent,
                    quantum_win_prob: positionData.leonardoDynamicMetrics?.quantumWinProb,
                    golden_ratio_alignment: positionData.leonardoDynamicMetrics?.goldenRatioAlignment,
                    consciousness_multiplier: positionData.leonardoDynamicMetrics?.consciousnessMultiplier
                }
            };
            
            // Actualizar balances
            this.reserveMargin(marginRequired);
            
            // Guardar posición
            this.activePositions.set(positionId, position);
            
            // Actualizar métricas diarias
            this.dailyMetrics.dailyTrades++;
            this.dailyMetrics.dailyRisk += marginRequired;
            
            // ✅ INCREMENTAR CONTADOR DE TRADES AL ABRIR POSICIÓN
            this.performanceMetrics.totalTrades++;
            
            // Log
            console.log(`📈 Posición abierta: ${positionId}`);
            console.log(`💰 ${position.symbol} ${position.direction} $${position.size.toFixed(2)} (${position.leverage}x)`);
            console.log(`🔒 Margen reservado: $${marginRequired.toFixed(2)}`);
            console.log(`📊 Total trades: ${this.performanceMetrics.totalTrades}`);
            
            this.addBalanceHistory(`POSITION_OPEN_${position.symbol}`, 0, position);
            
            return {
                success: true,
                positionId: positionId,
                position: position,
                newFreeMargin: this.freeMargin,
                newReservedBalance: this.reservedBalance
            };
            
        } catch (error) {
            console.error('❌ Error abriendo posición:', error.message);
            return {
                success: false,
                error: error.message,
                positionId: null
            };
        }
    }
    
    async closePosition(positionId, closePrice, reason = 'MANUAL_CLOSE') {
        try {
            const position = this.activePositions.get(positionId);
            if (!position) {
                throw new Error(`Posición ${positionId} no encontrada`);
            }
            
            // Calcular P&L final
            const pnl = this.calculatePnL(position, closePrice);
            
            // Liberar margen
            this.releaseMargin(position.marginRequired);
            
            // Aplicar P&L al balance
            this.totalBalance += pnl;
            this.availableBalance += pnl;
            this.equity = this.totalBalance;
            
            // Emitir evento de actualización de fondos
            this.emit('fundsUpdate', this.getCurrentFunds());
            
            // Actualizar posición
            position.status = 'CLOSED';
            position.closePrice = closePrice;
            position.closeTime = Date.now();
            position.finalPnL = pnl;
            position.closeReason = reason;
            position.holdTime = position.closeTime - position.openTime;
            
            // Actualizar métricas de performance
            this.updatePerformanceMetrics(position);
            
            // Actualizar métricas Leonardo
            this.updateLeonardoFundsState(position);
            
            // Remover de posiciones activas
            this.activePositions.delete(positionId);
            
            // Actualizar métricas diarias
            this.dailyMetrics.dailyPnL += pnl;
            
            // Log
            const profitStatus = pnl >= 0 ? '💰 PROFIT' : '📉 LOSS';
            console.log(`📉 Posición cerrada: ${positionId} | ${profitStatus}: $${pnl.toFixed(2)}`);
            console.log(`⏱️ Tiempo de hold: ${this.formatHoldTime(position.holdTime)}`);
            console.log(`💵 Nuevo balance: $${this.totalBalance.toFixed(2)}`);
            
            this.addBalanceHistory(`POSITION_CLOSE_${position.symbol}`, pnl, position);
            
            // Verificar estado de emergency stop
            this.checkEmergencyStop();
            
            return {
                success: true,
                positionId: positionId,
                pnl: pnl,
                newBalance: this.totalBalance,
                position: position
            };
            
        } catch (error) {
            console.error('❌ Error cerrando posición:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 💹 CÁLCULOS FINANCIEROS
    // ═══════════════════════════════════════════════════════════════════════
    
    calculatePnL(position, currentPrice) {
        const entryPrice = position.entryPrice;
        const direction = position.direction;
        
        let priceChange;
        if (direction === 'BUY' || direction === 'LONG') {
            priceChange = currentPrice - entryPrice;
        } else {
            priceChange = entryPrice - currentPrice;
        }
        
        const pnlPercentage = priceChange / entryPrice;
        const pnl = position.size * pnlPercentage;
        
        return pnl;
    }
    
    calculatePositionMetrics(positionSize, leverage, confidence, edge, consciousness) {
        const risk = positionSize / leverage;
        
        // ══════════════════════════════════════════════════════════════════════════
        // 🎯 TAKE PROFIT DINÁMICO - LEONARDO CONSCIOUSNESS CUÁNTICO
        // ══════════════════════════════════════════════════════════════════════════
        
        // 1. Obtener datos de los 4 pilares cuánticos
        let lambda888Strength = 0.5, prime7919Power = 0.5, hookWheelForce = 0.5, symbiosisLevel = 0.5;
        
        if (consciousness.pillarDetails) {
            lambda888Strength = consciousness.pillarDetails.lambda888?.strength || 0.5;
            prime7919Power = consciousness.pillarDetails.prime7919?.strength || 0.5;
            hookWheelForce = consciousness.pillarDetails.hookWheel?.strength || 0.5;
            symbiosisLevel = consciousness.pillarDetails.symbiosis?.strength || 0.5;
        }
        
        // 2. Factor de consciencia cuántica (0.5 - 3.0x multiplicador)
        const consciousnessMultiplier = 0.5 + (consciousness.consciousnessLevel * 2.5);
        
        // 3. Factor phi dorado para optimización perfecta
        const phiFactor = this.constants.PHI / 1.618; // = 1.0 perfecta armonía
        
        // 4. Factor de confianza exponencial con golden ratio
        const confidencePower = Math.pow(confidence, 0.618); // Golden ratio power
        
        // 5. Factor de volatilidad del mercado (basado en edge)
        const marketVolatilityFactor = 1 + (Math.abs(edge) * 10); // Edge alto = más volatilidad
        
        // 6. Cálculo cuántico dinámico de take profit
        const quantumProfitBase = (
            (lambda888Strength * 0.30) +    // 30% peso Lambda resonance
            (prime7919Power * 0.25) +       // 25% peso Prime transformation
            (hookWheelForce * 0.25) +       // 25% peso Hook wheel strategy
            (symbiosisLevel * 0.20)         // 20% peso Colibrí-Halcón symbiosis
        );
        
        // 7. Aplicar multiplicadores cuánticos
        const profitMultiplierDynamic = quantumProfitBase * consciousnessMultiplier * phiFactor * confidencePower * marketVolatilityFactor;
        
        // 8. Convertir a porcentaje de profit (1% - 20% rango)
        const takeProfitPercent = Math.min(0.20, Math.max(0.01, profitMultiplierDynamic * 0.08));
        const profitTarget = risk * (takeProfitPercent * 100); // Convertir a múltiplo
        
        // ══════════════════════════════════════════════════════════════════════════
        // 🛡️ STOP LOSS DINÁMICO - LEONARDO CONSCIOUSNESS PROTECCIÓN CUÁNTICA
        // ══════════════════════════════════════════════════════════════════════════
        
        // 1. Factor de volatilidad cuántica (mayor confianza = menor stop loss)
        const volatilityProtection = Math.max(0.3, 1 - confidence); // Rango 0.3 - 1.0
        
        // 2. Factor de protección basado en hook wheel (estrategia "perder para ganar")
        const hookProtectionFactor = hookWheelForce > 0.7 ? 0.4 : 0.7; // Menos stop si hook fuerte
        
        // 3. Factor de consciencia cuántica (alta consciencia = stop loss más ajustado)
        const consciousnessProtection = Math.max(0.4, 1 - (consciousness.consciousnessLevel * 0.6));
        
        // 4. Factor de adaptación por rendimiento histórico
        const winRateHistory = this.performanceMetrics.winRate || 0.5;
        const performanceProtection = winRateHistory > 0.7 ? 0.6 : 0.8; // Mejor performance = menos stop
        
        // 5. Cálculo cuántico dinámico de stop loss
        const quantumStopBase = (
            (lambda888Strength * 0.15) +    // 15% peso Lambda
            (prime7919Power * 0.35) +       // 35% peso Prime (mayor peso en protección)
            (hookWheelForce * 0.30) +       // 30% peso Hook (estrategia protección)
            (symbiosisLevel * 0.20)         // 20% peso Simbiosis
        );
        
        // 6. Aplicar multiplicadores de protección
        const stopLossMultiplierDynamic = volatilityProtection * hookProtectionFactor * consciousnessProtection * performanceProtection * quantumStopBase;
        
        // 7. Convertir a porcentaje de stop loss (0.3% - 8% rango)
        const stopLossPercent = Math.min(0.08, Math.max(0.003, stopLossMultiplierDynamic * 0.05));
        const stopLoss = risk * (stopLossPercent * 100); // Convertir a múltiplo
        
        // ══════════════════════════════════════════════════════════════════════════
        // 📊 MÉTRICAS AVANZADAS LEONARDO CONSCIOUSNESS
        // ══════════════════════════════════════════════════════════════════════════
        
        // Risk/Reward ratio dinámico
        const riskRewardRatio = profitTarget / stopLoss;
        
        // Expected Value con probabilidad cuántica mejorada
        const quantumWinProb = confidence * (1 + consciousness.consciousnessLevel * 0.3); // Bonus por consciencia
        const adjustedWinProb = Math.min(0.92, quantumWinProb); // Máximo 92% realista
        const expectedValue = (adjustedWinProb * profitTarget) - ((1 - adjustedWinProb) * stopLoss);
        
        // Impacto en drawdown ajustado por consciencia
        const drawdownReduction = 1 - (consciousness.consciousnessLevel * 0.25); // Menos impacto con alta consciencia
        const maxDrawdownImpact = (stopLoss / this.totalBalance) * 100 * drawdownReduction;
        
        // Factor de optimización phi (verificar si está cerca del ratio dorado)
        const phiOptimization = takeProfitPercent / stopLossPercent;
        const goldenRatioAlignment = Math.abs(phiOptimization - this.constants.PHI) < 0.2 ? 'PERFECT_PHI' : 
                                   Math.abs(phiOptimization - this.constants.PHI) < 0.5 ? 'GOOD_PHI' : 'STANDARD';
        
        // Factor Big Bang (multiplicador extremo cuando sistema en Big Bang)
        const bigBangMultiplier = consciousness.bigBangReady ? 1.618 : 1.0;
        
        console.log(`🎯 Take Profit dinámico: ${(takeProfitPercent * 100).toFixed(2)}% | Stop Loss: ${(stopLossPercent * 100).toFixed(2)}%`);
        console.log(`⚡ Consciencia: ${(consciousness.consciousnessLevel * 100).toFixed(1)}% | R/R: ${riskRewardRatio.toFixed(2)}`);
        console.log(`💎 Golden Ratio: ${goldenRatioAlignment} | Quantum Win Prob: ${(adjustedWinProb * 100).toFixed(1)}%`);
        
        return {
            // Valores principales
            profitTarget: profitTarget * bigBangMultiplier,
            stopLoss,
            takeProfitPercent: (takeProfitPercent * 100).toFixed(2) + '%',
            stopLossPercent: (stopLossPercent * 100).toFixed(2) + '%',
            riskRewardRatio,
            expectedValue: expectedValue * bigBangMultiplier,
            maxDrawdownImpact,
            
            // Métricas Leonardo avanzadas
            leonardoDynamicMetrics: {
                consciousnessMultiplier: consciousnessMultiplier.toFixed(3),
                quantumProfitBase: quantumProfitBase.toFixed(4),
                quantumStopBase: quantumStopBase.toFixed(4),
                volatilityProtection: volatilityProtection.toFixed(3),
                hookProtectionFactor: hookProtectionFactor.toFixed(3),
                phiOptimization: phiOptimization.toFixed(3),
                goldenRatioAlignment,
                quantumWinProb: (adjustedWinProb * 100).toFixed(1) + '%',
                bigBangMultiplier,
                marketVolatilityFactor: marketVolatilityFactor.toFixed(3)
            },
            
            // Contribución de cada pilar (para debug)
            pillarContributions: {
                lambda888: (lambda888Strength * 0.30).toFixed(4),
                prime7919: (prime7919Power * 0.25).toFixed(4),
                hookWheel: (hookWheelForce * 0.25).toFixed(4),
                symbiosis: (symbiosisLevel * 0.20).toFixed(4)
            },
            
            // Factores de protección (para debug)
            protectionFactors: {
                volatilityProtection,
                hookProtectionFactor,
                consciousnessProtection,
                performanceProtection,
                winRateHistory: (winRateHistory * 100).toFixed(1) + '%'
            }
        };
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 📊 GESTIÓN DE BALANCE Y MÉTRICAS
    // ═══════════════════════════════════════════════════════════════════════
    
    reserveMargin(amount) {
        this.availableBalance -= amount;
        this.reservedBalance += amount;
        this.freeMargin = this.availableBalance;
        this.margin = this.reservedBalance;
    }
    
    releaseMargin(amount) {
        this.availableBalance += amount;
        this.reservedBalance -= amount;
        this.freeMargin = this.availableBalance;
        this.margin = this.reservedBalance;
    }
    
    updatePerformanceMetrics(closedPosition) {
        const pnl = closedPosition.finalPnL;
        const isWin = pnl > 0;
        
        // Contadores básicos (totalTrades ya se incrementó al abrir)
        // this.performanceMetrics.totalTrades++; // <- YA NO INCREMENTAR AQUÍ
        
        if (isWin) {
            this.performanceMetrics.winningTrades++;
            this.performanceMetrics.totalProfit += pnl;
            this.performanceMetrics.consecutiveWins++;
            this.performanceMetrics.consecutiveLosses = 0;
            
            if (pnl > this.performanceMetrics.largestWin) {
                this.performanceMetrics.largestWin = pnl;
            }
            
            this.performanceMetrics.maxConsecutiveWins = Math.max(
                this.performanceMetrics.maxConsecutiveWins,
                this.performanceMetrics.consecutiveWins
            );
        } else {
            this.performanceMetrics.losingTrades++;
            this.performanceMetrics.totalLoss += Math.abs(pnl);
            this.performanceMetrics.consecutiveLosses++;
            this.performanceMetrics.consecutiveWins = 0;
            
            if (Math.abs(pnl) > this.performanceMetrics.largestLoss) {
                this.performanceMetrics.largestLoss = Math.abs(pnl);
            }
            
            this.performanceMetrics.maxConsecutiveLosses = Math.max(
                this.performanceMetrics.maxConsecutiveLosses,
                this.performanceMetrics.consecutiveLosses
            );
        }
        
        // Win rate
        this.performanceMetrics.winRate = this.performanceMetrics.winningTrades / this.performanceMetrics.totalTrades;
        
        // Profit factor
        this.performanceMetrics.profitFactor = this.performanceMetrics.totalLoss > 0 ? 
            this.performanceMetrics.totalProfit / this.performanceMetrics.totalLoss : 
            this.performanceMetrics.totalProfit;
        
        // Average win/loss
        this.performanceMetrics.avgWin = this.performanceMetrics.winningTrades > 0 ?
            this.performanceMetrics.totalProfit / this.performanceMetrics.winningTrades : 0;
            
        this.performanceMetrics.avgLoss = this.performanceMetrics.losingTrades > 0 ?
            this.performanceMetrics.totalLoss / this.performanceMetrics.losingTrades : 0;
        
        // Max balance tracking
        if (this.totalBalance > this.performanceMetrics.maxBalance) {
            this.performanceMetrics.maxBalance = this.totalBalance;
        }
        
        // Drawdown calculation
        this.performanceMetrics.currentDrawdown = (this.performanceMetrics.maxBalance - this.totalBalance) / this.performanceMetrics.maxBalance;
        
        if (this.performanceMetrics.currentDrawdown > this.performanceMetrics.maxDrawdown) {
            this.performanceMetrics.maxDrawdown = this.performanceMetrics.currentDrawdown;
        }
    }
    
    updateLeonardoFundsState(closedPosition) {
        const pnl = closedPosition.finalPnL;
        const isWin = pnl > 0;
        
        // Actualizar consciencia basada en resultado
        if (isWin) {
            this.leonardoFundsState.consciousness_level = Math.min(1.0, 
                this.leonardoFundsState.consciousness_level + 0.01618); // Incremento phi
            
            this.leonardoFundsState.bait_efficiency = Math.min(2.0,
                this.leonardoFundsState.bait_efficiency * 1.05); // 5% incremento
                
        } else {
            this.leonardoFundsState.consciousness_level = Math.max(0.1,
                this.leonardoFundsState.consciousness_level - 0.00618); // Decremento menor
                
            this.leonardoFundsState.bait_efficiency = Math.max(0.5,
                this.leonardoFundsState.bait_efficiency * 0.98); // 2% decremento
        }
        
        // Big Bang readiness (cuando consciencia >= 94.1%)
        this.leonardoFundsState.big_bang_funds_ready = this.leonardoFundsState.consciousness_level >= 0.941;
        
        // Profit acceleration factor
        if (this.performanceMetrics.winRate > 0.618) { // Golden ratio win rate
            this.leonardoFundsState.profit_acceleration = Math.min(3.0, 
                1.0 + (this.performanceMetrics.winRate * this.constants.PHI));
        }
        
        console.log(`🧠 Consciencia fondos: ${(this.leonardoFundsState.consciousness_level * 100).toFixed(1)}%`);
        if (this.leonardoFundsState.big_bang_funds_ready) {
            console.log('💥 BIG BANG FUNDS READY!');
        }
    }
    
    addBalanceHistory(event, pnl, positionData = null) {
        this.balanceHistory.push({
            balance: this.totalBalance,
            pnl: pnl,
            timestamp: Date.now(),
            event: event,
            position: positionData ? {
                id: positionData.id,
                symbol: positionData.symbol,
                direction: positionData.direction,
                size: positionData.size
            } : null
        });
        
        // Mantener solo los últimos 1000 registros
        if (this.balanceHistory.length > 1000) {
            this.balanceHistory = this.balanceHistory.slice(-1000);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🚨 RISK MANAGEMENT Y PROTECCIONES
    // ═══════════════════════════════════════════════════════════════════════
    
    canTrade() {
        // 1. Verificar emergency stop
        if (this.isEmergencyStop()) {
            console.log('🚨 EMERGENCY STOP ACTIVADO - Trading deshabilitado');
            return false;
        }
        
        // 2. Verificar drawdown límite
        if (this.performanceMetrics.currentDrawdown >= this.riskConfig.maxDrawdownLimit) {
            console.log(`📉 DRAWDOWN LÍMITE ALCANZADO: ${(this.performanceMetrics.currentDrawdown * 100).toFixed(1)}%`);
            return false;
        }
        
        // 3. Verificar riesgo diario
        if (this.dailyMetrics.dailyRisk >= this.availableBalance * this.riskConfig.maxDailyRisk) {
            console.log('📅 RIESGO DIARIO MÁXIMO ALCANZADO');
            return false;
        }
        
        // 4. Verificar margen libre mínimo
        if (this.freeMargin < this.riskConfig.baitAmount) {
            console.log('💰 MARGEN INSUFICIENTE PARA CARNADA MÍNIMA');
            return false;
        }
        
        return true;
    }
    
    isEmergencyStop() {
        const initialBalance = this.balanceHistory[0].balance;
        return this.totalBalance <= initialBalance * this.riskConfig.emergencyStopLevel;
    }
    
    checkEmergencyStop() {
        if (this.isEmergencyStop()) {
            console.log('🚨 EMERGENCY STOP ACTIVADO!');
            console.log(`💰 Balance actual: $${this.totalBalance.toFixed(2)}`);
            console.log(`📊 Balance inicial: $${this.balanceHistory[0].balance.toFixed(2)}`);
            console.log(`📉 Pérdida: ${(((this.totalBalance / this.balanceHistory[0].balance) - 1) * 100).toFixed(1)}%`);
            
            // Cerrar todas las posiciones abiertas
            this.closeAllPositions('EMERGENCY_STOP');
        }
    }
    
    async closeAllPositions(reason = 'MANUAL_CLOSE_ALL') {
        console.log(`🔄 Cerrando todas las posiciones: ${reason}`);
        const closedPositions = [];
        
        for (const [positionId, position] of this.activePositions) {
            // En implementación real, obtener precio actual del mercado
            const currentPrice = position.entryPrice; // Placeholder
            const result = await this.closePosition(positionId, currentPrice, reason);
            closedPositions.push(result);
        }
        
        return closedPositions;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 📅 GESTIÓN TEMPORAL (Reset diario, etc.)
    // ═══════════════════════════════════════════════════════════════════════
    
    checkDailyReset() {
        const today = this.getCurrentDateString();
        if (today !== this.dailyMetrics.date) {
            console.log(`📅 Reset diario: ${this.dailyMetrics.date} → ${today}`);
            
            // Log métricas del día anterior
            if (this.dailyMetrics.dailyTrades > 0) {
                console.log(`📊 Día anterior: ${this.dailyMetrics.dailyTrades} trades, P&L: $${this.dailyMetrics.dailyPnL.toFixed(2)}`);
            }
            
            // Reset métricas diarias
            this.dailyMetrics = {
                date: today,
                dailyPnL: 0,
                dailyTrades: 0,
                dailyRisk: 0,
                maxDailyLoss: 0
            };
        }
    }
    
    getCurrentDateString() {
        return new Date().toISOString().split('T')[0];
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 🔧 UTILIDADES
    // ═══════════════════════════════════════════════════════════════════════
    
    validatePositionData(positionData) {
        return positionData &&
               positionData.symbol &&
               positionData.direction &&
               positionData.size > 0 &&
               positionData.leverage > 0 &&
               positionData.entryPrice > 0;
    }
    
    generateZeroPositionResult(reason) {
        return {
            success: false,
            size: 0,
            leverage: 0,
            marginRequired: 0,
            risk: 0,
            reason: reason,
            baitUsed: 0
        };
    }
    
    generateReducedPositionResult(marginRequired, leverage) {
        const reducedMargin = this.freeMargin * 0.95; // Usar 95% del margen libre
        const reducedSize = reducedMargin * leverage;
        
        return {
            success: true,
            size: reducedSize,
            leverage: leverage,
            marginRequired: reducedMargin,
            risk: reducedMargin,
            baitUsed: Math.min(this.riskConfig.baitAmount, reducedMargin),
            warning: 'REDUCED_POSITION_DUE_TO_MARGIN_LIMIT'
        };
    }
    
    formatHoldTime(holdTimeMs) {
        const seconds = Math.floor(holdTimeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // 💰 CONVERSIONES DE PRECIOS DINÁMICOS LEONARDO CONSCIOUSNESS
    // ═══════════════════════════════════════════════════════════════════════════
    
    calculateTargetPrice(entryPrice, profitTargetAmount, direction, positionSize) {
        // Convertir profit absoluto ($) a precio objetivo
        // Profit = positionSize * (targetPrice - entryPrice) / entryPrice
        // Por tanto: targetPrice = entryPrice + (profit * entryPrice / positionSize)
        
        const profitPercentage = profitTargetAmount / positionSize;
        
        if (direction === 'BUY' || direction === 'LONG') {
            // Para posición larga: precio objetivo es mayor
            return entryPrice * (1 + profitPercentage);
        } else {
            // Para posición corta: precio objetivo es menor
            return entryPrice * (1 - profitPercentage);
        }
    }
    
    calculateStopPrice(entryPrice, stopLossAmount, direction, positionSize) {
        // Convertir stop loss absoluto ($) a precio de stop
        const stopPercentage = stopLossAmount / positionSize;
        
        if (direction === 'BUY' || direction === 'LONG') {
            // Para posición larga: stop loss es menor que entrada
            return entryPrice * (1 - stopPercentage);
        } else {
            // Para posición corta: stop loss es mayor que entrada
            return entryPrice * (1 + stopPercentage);
        }
    }
    
    // ═══════════════════════════════════════════════════════════════════════════
    // 🤖 VERIFICACIÓN AUTOMÁTICA DE ÓRDENES (Para auto-trading)
    // ═══════════════════════════════════════════════════════════════════════════
    
    checkPositionTriggers(currentPrice) {
        const triggeredPositions = [];
        
        for (const [positionId, position] of this.activePositions) {
            if (position.status !== 'OPEN') continue;
            
            let shouldClose = false;
            let closeReason = '';
            
            // Verificar Take Profit
            if (this.isProfitTargetHit(position, currentPrice)) {
                shouldClose = true;
                closeReason = 'TAKE_PROFIT_HIT';
                console.log(`🎯 Take Profit alcanzado para ${positionId}: ${currentPrice} vs ${position.profitTargetPrice}`);
                
            // Verificar Stop Loss
            } else if (this.isStopLossHit(position, currentPrice)) {
                shouldClose = true;
                closeReason = 'STOP_LOSS_HIT';
                console.log(`🛡️ Stop Loss activado para ${positionId}: ${currentPrice} vs ${position.stopLossPrice}`);
            }
            
            if (shouldClose) {
                triggeredPositions.push({
                    positionId,
                    position,
                    currentPrice,
                    closeReason
                });
            }
        }
        
        return triggeredPositions;
    }
    
    isProfitTargetHit(position, currentPrice) {
        if (position.direction === 'BUY' || position.direction === 'LONG') {
            return currentPrice >= position.profitTargetPrice;
        } else {
            return currentPrice <= position.profitTargetPrice;
        }
    }
    
    isStopLossHit(position, currentPrice) {
        if (position.direction === 'BUY' || position.direction === 'LONG') {
            return currentPrice <= position.stopLossPrice;
        } else {
            return currentPrice >= position.stopLossPrice;
        }
    }
    
    // Método para auto-cerrar posiciones cuando se alcanzan los targets
    async autoCloseTriggeredPositions(currentPrice) {
        const triggeredPositions = this.checkPositionTriggers(currentPrice);
        const closedPositions = [];
        
        for (const triggered of triggeredPositions) {
            const result = await this.closePosition(
                triggered.positionId, 
                triggered.currentPrice, 
                triggered.closeReason
            );
            
            if (result.success) {
                closedPositions.push({
                    ...result,
                    triggerReason: triggered.closeReason
                });
            }
        }
        
        return closedPositions;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // 📊 API PÚBLICA
    // ═══════════════════════════════════════════════════════════════════════
    
    getFundsStatus() {
        this.checkDailyReset();
        
        return {
            // Balance principal
            totalBalance: this.totalBalance,
            availableBalance: this.availableBalance,
            reservedBalance: this.reservedBalance,
            equity: this.equity,
            margin: this.margin,
            freeMargin: this.freeMargin,
            
            // Posiciones
            activePositions: this.activePositions.size,
            
            // Performance
            performanceMetrics: this.performanceMetrics,
            
            // Métricas Leonardo
            leonardoFundsState: this.leonardoFundsState,
            
            // Métricas diarias
            dailyMetrics: this.dailyMetrics,
            
            // Estados de protección
            canTrade: this.canTrade(),
            emergencyStop: this.isEmergencyStop(),
            
            // Configuración
            riskConfig: this.riskConfig,
            
            timestamp: Date.now()
        };
    }
    
    getBalanceHistory(limit = 100) {
        return this.balanceHistory.slice(-limit);
    }
    
    getActivePositions() {
        return Array.from(this.activePositions.values());
    }
    
    getTotalBalance() {
        return this.totalBalance;
    }
    
    getCurrentFunds() {
        return {
            totalBalance: this.totalBalance,
            availableBalance: this.availableBalance,
            reservedBalance: this.reservedBalance,
            equity: this.equity,
            margin: this.margin,
            freeMargin: this.freeMargin
        };
    }
    
    updateBalance(newBalance, reason = 'MANUAL_UPDATE') {
        const difference = newBalance - this.totalBalance;
        this.totalBalance = newBalance;
        this.availableBalance = newBalance - this.reservedBalance;
        this.equity = newBalance;
        this.freeMargin = this.availableBalance;
        
        this.addBalanceHistory(`BALANCE_UPDATE_${reason}`, difference);
        
        console.log(`💰 Balance actualizado: $${newBalance.toFixed(2)} (${difference >= 0 ? '+' : ''}$${difference.toFixed(2)})`);
    }
    
    // Métodos adicionales para compatibilidad con QuantumUnifiedSystem
    hasActiveTrade(symbol) {
        for (const [positionId, position] of this.activePositions) {
            if (position.symbol === symbol && position.status === 'OPEN') {
                return true;
            }
        }
        return false;
    }

    getBalance() {
        return this.totalBalance;
    }

    calculateTradeSize(params) {
        const { balance, risk, entryPrice, stopLossPrice } = params;
        
        // Calcular el riesgo por unidad
        const riskPerUnit = Math.abs(entryPrice - stopLossPrice);
        const riskAmount = balance * risk;
        
        // Calcular cantidad basada en el riesgo
        const amount = riskPerUnit > 0 ? riskAmount / riskPerUnit : 0;
        
        return {
            amount: Math.max(0, amount),
            risk: riskAmount
        };
    }

    async executeTrade(params) {
        try {
            const { symbol, side, amount, entryPrice, leverage } = params;
            
            // Crear datos de posición para openPosition
            const positionData = {
                symbol,
                direction: side === 'BUY' ? 'LONG' : 'SHORT',
                size: amount,
                leverage: leverage || 1,
                entryPrice,
                confidence: 0.6, // Valor por defecto
                edge: 0.01 // Valor por defecto
            };
            
            const result = await this.openPosition(positionData);
            
            if (result.success) {
                return {
                    success: true,
                    trade: result.position
                };
            } else {
                return {
                    success: false,
                    error: result.error || 'Error desconocido al ejecutar trade'
                };
            }
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    getMetrics() {
        return {
            currentBalance: this.totalBalance,
            totalProfit: this.performanceMetrics.totalProfit - this.performanceMetrics.totalLoss,
            currentDrawdown: this.performanceMetrics.currentDrawdown,
            activeTrades: this.activePositions.size,
            totalTrades: this.performanceMetrics.totalTrades,
            winRate: this.performanceMetrics.winRate,
            currentRisk: this.dailyMetrics.dailyRisk / this.totalBalance,
            averageLeverage: this.calculateAverageLeverage()
        };
    }

    calculateAverageLeverage() {
        if (this.activePositions.size === 0) return 0;
        
        let totalLeverage = 0;
        for (const [positionId, position] of this.activePositions) {
            totalLeverage += position.leverage;
        }
        
        return totalLeverage / this.activePositions.size;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 🔄 MÉTODOS DE SISTEMA
    // ═══════════════════════════════════════════════════════════════════════
    
    async initialize() {
        console.log('💰 Initializing Leonardo Funds Manager...');
        
        // Reset métricas diarias si es necesario
        this.checkDailyReset();
        
        // Inicializar estado de Leonardo Consciousness
        this.leonardoFundsState.consciousness_level = 0.618;
        this.leonardoFundsState.big_bang_funds_ready = false;
        
        console.log('✅ Leonardo Funds Manager initialized successfully');
        return true;
    }
    
    /**
     * Obtener estado de salud del sistema
     */
    getHealth() {
        return {
            status: 'HEALTHY',
            totalFunds: this.totalBalance,
            availableFunds: this.availableBalance,
            consciousnessLevel: this.leonardoFundsState.consciousness_level,
            activePositions: this.activePositions.size,
            lastUpdate: Date.now()
        };
    }
    
    getCurrentFunds() {
        return {
            totalFunds: this.totalBalance,
            availableFunds: this.availableBalance,
            reservedFunds: this.reservedBalance,
            equity: this.equity,
            freeMargin: this.freeMargin
        };
    }
    
    async reset() {
        console.log('🔄 Resetting Leonardo Funds Manager...');
        
        // Cerrar todas las posiciones
        await this.closeAllPositions('SYSTEM_RESET');
        
        // Reset del balance al inicial
        const initialBalance = this.balanceHistory[0]?.balance || 1000;
        this.totalBalance = initialBalance;
        this.availableBalance = initialBalance;
        this.reservedBalance = 0;
        this.equity = initialBalance;
        this.margin = 0;
        this.freeMargin = initialBalance;
        
        // Reset métricas
        this.performanceMetrics = {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalProfit: 0,
            totalLoss: 0,
            winRate: 0,
            profitFactor: 0,
            maxDrawdown: 0,
            currentDrawdown: 0,
            maxBalance: initialBalance,
            avgWin: 0,
            avgLoss: 0,
            largestWin: 0,
            largestLoss: 0,
            consecutiveWins: 0,
            consecutiveLosses: 0,
            maxConsecutiveWins: 0,
            maxConsecutiveLosses: 0
        };
        
        // Reset estado Leonardo
        this.leonardoFundsState = {
            consciousness_level: 0.618,
            compounding_active: true,
            big_bang_funds_ready: false,
            profit_acceleration: 1.0,
            bait_efficiency: 1.0,
            golden_ratio_optimization: true
        };
        
        console.log('✅ Leonardo Funds Manager reset complete');
    }
    
    // Destructor
    destroy() {
        // Cerrar todas las posiciones antes de destruir
        if (this.activePositions.size > 0) {
            console.log('🔄 Cerrando posiciones antes de destruir FundsManager...');
            this.closeAllPositions('SYSTEM_SHUTDOWN');
        }
        
        this.activePositions.clear();
        this.balanceHistory = [];
        
        console.log('💰 Leonardo Funds Manager destruido elegantemente');
    }
}

module.exports = { FundsManager };
