/**
 * QBTC UNIFIED - Motor de Trading Unificado
 * Implementación del motor de trading con capacidades cuánticas y poéticas
 */

// Importar constantes compartidas
const {
    SYSTEM,
    NETWORK,
    LEONARDO,
    QUANTUM,
    TRADING,
    FUNDS,
    BINANCE
} = require('../shared/constants/QBTCConstants.js');

// Importar utilidades deterministas
const { deterministicRandom, deterministicQuantumState } = require('../shared/utils/DeterministicMath.js');
const { hash32, hash64 } = require('../shared/utils/HashUtils.js');

 // QBTCTradingEngine: futures-only edge via isolated service
// Importar conector Binance
const BinanceConnector = require('../shared/connectors/BinanceConnector.js');
const FuturesEdgeService = require('./FuturesEdgeService.js');

class QBTCTradingEngine {
    constructor() {
        this.isRunning = false;
        this.positions = [];
        this.orders = [];
        this.tradeHistory = [];
        this.balance = FUNDS.CONFIG.INITIAL_BALANCE;
        this.totalProfit = 0;
        this.winRate = 0;
        this.profitFactor = 0;
        this.maxDrawdown = 0;
        this.currentDrawdown = 0;
        this.peakBalance = this.balance;
        
        // Métricas cuánticas
        this.quantumMetrics = {
            coherence: QUANTUM.STATES.COHERENCE,
            consciousness: QUANTUM.STATES.CONSCIOUSNESS,
            optimization: {
                zReal: LEONARDO.MAXIMIZATION_FUNCTION.REAL_PART,
                zImaginary: LEONARDO.MAXIMIZATION_FUNCTION.IMAGINARY_PART,
                efficiency: 0
            }
        };
        
        // Conector Binance
        this.binance = BinanceConnector.getInstance();

        // Futures-only Edge Service (aislado, singleton)
        this.edgeService = FuturesEdgeService.getInstance();
        
        // Poeta actual para transformaciones
        this.currentPoet = null;
        this.selectCurrentPoet();
        
        // Inicializar motor
        this.initialize();
    }

    // Inicializar motor de trading
    async initialize() {
        console.log('Inicializando motor de trading unificado...');
        
        // Conectar a Binance
        await this.binance.connect();
        
        // Cargar datos iniciales
        await this.loadInitialData();
        
        console.log('Motor de trading unificado inicializado');
    }

    // Seleccionar poeta actual
    selectCurrentPoet() {
        const poets = Object.keys(LEONARDO.CHILEAN_POETS_PRIME_TRANSFORMS);
        const poetIndex = Math.floor(Date.now() / 10000) % poets.length;
        this.currentPoet = poets[poetIndex];
    }

    // Cargar datos iniciales
    async loadInitialData() {
        try {
            // Obtener balance inicial
            const accountInfo = await this.binance.getAccountInfo();
            if (accountInfo && accountInfo.balances) {
                const usdtBalance = accountInfo.balances.find(b => b.asset === 'USDT');
                if (usdtBalance) {
                    this.balance = parseFloat(usdtBalance.free);
                    this.peakBalance = this.balance;
                }
            }
            
            // Obtener órdenes abiertas
            const openOrders = await this.binance.getOpenOrders();
            this.orders = openOrders || [];
            
            // Obtener posiciones abiertas
            const positions = await this.binance.getPositions();
            this.positions = positions || [];
            
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
        }
    }

    // Iniciar trading
    async start() {
        if (this.isRunning) {
            console.log('El motor de trading ya está en ejecución');
            return;
        }
        
        this.isRunning = true;
        console.log('Iniciando motor de trading unificado...');
        
        // Iniciar ciclo de trading
        this.startTradingCycle();
    }

    // Detener trading
    stop() {
        if (!this.isRunning) {
            console.log('El motor de trading no está en ejecución');
            return;
        }
        
        this.isRunning = false;
        console.log('Deteniendo motor de trading unificado...');
    }

    // Iniciar ciclo de trading
    async startTradingCycle() {
        while (this.isRunning) {
            try {
                // Actualizar poeta si es necesario
                if (Date.now() % 10000 < 100) {
                    this.selectCurrentPoet();
                }
                
                // Analizar mercado
                const marketAnalysis = await this.analyzeMarket();
                
                // Generar señales de trading
                const signals = this.generateTradingSignals(marketAnalysis);
                
                // Ejecutar trades basados en señales
                await this.executeTrades(signals);
                
                // Gestionar posiciones abiertas
                await this.managePositions();
                
                // Actualizar métricas
                this.updateMetrics();
                
                // Aplicar optimización cuántica
                this.applyQuantumOptimization();
                
                // Esperar siguiente ciclo
                await this.sleep(5000); // 5 segundos entre ciclos
                
            } catch (error) {
                console.error('Error en ciclo de trading:', error);
                await this.sleep(10000); // Esperar 10 segundos en caso de error
            }
        }
    }

    // Analizar mercado (Futuros-only, microestructura; aislado via servicio)
   async analyzeMarket() {
           const symbols = TRADING.SYMBOLS.MAJOR.concat(TRADING.SYMBOLS.MINOR);
           return await this.edgeService.analyzeSymbols(symbols);
       }

    // LEGACY (unused) - Indicadores clásicos conservados solo para referencia
    // Calcular indicadores técnicos
    calculateIndicators(klines) {
        if (!klines || klines.length < 20) return {};
        
        const closes = klines.map(k => parseFloat(k.close));
        const volumes = klines.map(k => parseFloat(k.volume));
        const highs = klines.map(k => parseFloat(k.high));
        const lows = klines.map(k => parseFloat(k.low));
        
        // Calcular RSI
        const rsi = this.calculateRSI(closes, 14);
        
        // Calcular MACD
        const macd = this.calculateMACD(closes, 12, 26, 9);
        
        // Calcular Bandas de Bollinger
        const bollinger = this.calculateBollingerBands(closes, 20, 2);
        
        // Calcular media móvil
        const sma = this.calculateSMA(closes, 20);
        
        return {
            rsi: rsi,
            macd: macd,
            bollinger: bollinger,
            sma: sma,
            price: closes[closes.length - 1],
            volume: volumes[volumes.length - 1]
        };
    }

    // LEGACY (unused) - RSI clásico
    // Calcular RSI
    calculateRSI(prices, period) {
        if (prices.length < period + 1) return 50;
        
        const changes = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i - 1]);
        }
        
        const gains = changes.filter(c => c > 0);
        const losses = changes.filter(c => c < 0).map(c => Math.abs(c));
        
        const avgGain = gains.reduce((sum, g) => sum + g, 0) / period;
        const avgLoss = losses.reduce((sum, l) => sum + l, 0) / period;
        
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        return rsi;
    }

    // LEGACY (unused) - MACD clásico
    // Calcular MACD
    calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod) {
        const fastEMA = this.calculateEMA(prices, fastPeriod);
        const slowEMA = this.calculateEMA(prices, slowPeriod);
        const macdLine = fastEMA - slowEMA;
        
        // Para simplificar, usamos un valor de señal fijo
        const signalLine = macdLine * 0.9;
        const histogram = macdLine - signalLine;
        
        return {
            macd: macdLine,
            signal: signalLine,
            histogram: histogram
        };
    }

    // LEGACY (unused) - EMA clásica
    // Calcular EMA
    calculateEMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1];
        
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }
        
        return ema;
    }

    // LEGACY (unused) - Bandas de Bollinger
    // Calcular Bandas de Bollinger
    calculateBollingerBands(prices, period, deviations) {
        if (prices.length < period) return { upper: prices[0], middle: prices[0], lower: prices[0] };
        
        const sma = this.calculateSMA(prices, period);
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        return {
            upper: sma + (stdDev * deviations),
            middle: sma,
            lower: sma - (stdDev * deviations)
        };
    }

    // LEGACY (unused) - SMA clásica
    // Calcular SMA
    calculateSMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1];
        
        const sum = prices.slice(-period).reduce((sum, price) => sum + price, 0);
        return sum / period;
    }

    // LEGACY (unused) - Transformación poética sobre indicadores clásicos
    // Aplicar transformación poética
    applyPoeticTransformation(indicators, poet) {
        if (!poet || !indicators) return indicators;
        
        const transformationMatrix = poet.TRANSFORMATION_MATRIX;
        const timestamp = Date.now();
        
        // Aplicar transformación a indicadores
        const transformed = { ...indicators };
        
        // Transformar RSI
        if (indicators.rsi !== undefined) {
            const rsiFactor = transformationMatrix[0];
            transformed.rsi = indicators.rsi * (1 + (rsiFactor - 0.5) * 0.1);
            transformed.rsi = Math.max(0, Math.min(100, transformed.rsi));
        }
        
        // Transformar MACD
        if (indicators.macd !== undefined) {
            const macdFactor = transformationMatrix[1];
            transformed.macd = {
                macd: indicators.macd.macd * (1 + (macdFactor - 0.5) * 0.1),
                signal: indicators.macd.signal * (1 + (macdFactor - 0.5) * 0.1),
                histogram: indicators.macd.histogram * (1 + (macdFactor - 0.5) * 0.1)
            };
        }
        
        // Transformar Bandas de Bollinger
        if (indicators.bollinger !== undefined) {
            const bollingerFactor = transformationMatrix[2];
            transformed.bollinger = {
                upper: indicators.bollinger.upper * (1 + (bollingerFactor - 0.5) * 0.05),
                middle: indicators.bollinger.middle * (1 + (bollingerFactor - 0.5) * 0.05),
                lower: indicators.bollinger.lower * (1 + (bollingerFactor - 0.5) * 0.05)
            };
        }
        
        return transformed;
    }

    // Generate signals from futures microstructure edge only
// Generar señales de trading (Futuros-only, edge cuántico)
generateTradingSignals(marketAnalysis) {
        const signals = [];
    
        for (const [symbol, analysis] of Object.entries(marketAnalysis)) {
            if (!analysis.snapshot) continue;
    
            const edgeSignal = this.edgeService.getSignal(analysis.snapshot);
            if (!edgeSignal) continue;
    
            const confidence = edgeSignal.confidence || 0;
            if (confidence < TRADING.CONFIG.MIN_CONFIDENCE) continue;
    
            // Base position size from risk model, then modulate by positionSizeFactor from microstructure risk
            const baseSize = this.calculatePositionSize(symbol, edgeSignal.type, confidence);
            const finalSize = Math.max(0, baseSize * (edgeSignal.positionSizeFactor || 1));
    
            signals.push({
                type: edgeSignal.type,
                reason: edgeSignal.reason,
                confidence,
                positionSize: finalSize,
                symbol: symbol,
                timestamp: Date.now(),
                poet: this.currentPoet
            });
        }
    
        return signals;
    }

    // LEGACY (unused) - Confianza basada en indicadores clásicos
    // Calcular confianza de la señal
    calculateSignalConfidence(indicators) {
        let confidence = 0.5; // Confianza base
        
        // Ajustar confianza basado en RSI
        if (indicators.rsi !== undefined) {
            if (indicators.rsi < 30 || indicators.rsi > 70) {
                confidence += 0.2;
            }
        }
        
        // Ajustar confianza basado en MACD
        if (indicators.macd !== undefined) {
            const macdStrength = Math.abs(indicators.macd.histogram);
            confidence += macdStrength * 0.1;
        }
        
        // Ajustar confianza basado en Bandas de Bollinger
        if (indicators.bollinger !== undefined && indicators.price !== undefined) {
            const bbPosition = (indicators.price - indicators.bollinger.lower) / 
                              (indicators.bollinger.upper - indicators.bollinger.lower);
            
            if (bbPosition < 0.1 || bbPosition > 0.9) {
                confidence += 0.15;
            }
        }
        
        return Math.min(1, confidence);
    }

    // LEGACY (unused) - Señal basada en RSI/MACD/Bollinger
    // Generar señal individual
    generateSignal(symbol, indicators, confidence) {
        let signal = null;
        
        // Lógica de señal basada en RSI
        if (indicators.rsi < 30) {
            signal = {
                type: 'BUY',
                reason: 'RSI oversold',
                confidence: confidence
            };
        } else if (indicators.rsi > 70) {
            signal = {
                type: 'SELL',
                reason: 'RSI overbought',
                confidence: confidence
            };
        }
        
        // Refinar señal con MACD
        if (indicators.macd && signal) {
            if (signal.type === 'BUY' && indicators.macd.histogram < 0) {
                signal.confidence *= 0.8;
            } else if (signal.type === 'SELL' && indicators.macd.histogram > 0) {
                signal.confidence *= 0.8;
            }
        }
        
        // Refinar señal con Bandas de Bollinger
        if (indicators.bollinger && indicators.price && signal) {
            if (signal.type === 'BUY' && indicators.price > indicators.bollinger.middle) {
                signal.confidence *= 0.9;
            } else if (signal.type === 'SELL' && indicators.price < indicators.bollinger.middle) {
                signal.confidence *= 0.9;
            }
        }
        
        // Calcular tamaño de posición
        if (signal && signal.confidence >= TRADING.CONFIG.MIN_CONFIDENCE) {
            signal.positionSize = this.calculatePositionSize(symbol, signal.type, confidence);
        }
        
        return signal;
    }

    // Calcular tamaño de posición
    calculatePositionSize(symbol, type, confidence) {
        // Calcular tamaño basado en Kelly cuántico
        const winRate = this.winRate || 0.5;
        const avgWin = this.getAverageWin();
        const avgLoss = this.getAverageLoss();
        
        const kellyFraction = TRADING.OPTIMAL_LEVERAGE.OPTIMAL_KELLY_FRACTION(winRate, avgWin, avgLoss);
        
        // Aplicar ajuste cuántico
        const quantumEntanglement = this.quantumMetrics.coherence * this.quantumMetrics.consciousness;
        const quantumKelly = FUNDS.QUANTUM_METRICS.QUANTUM_KELLY_EFFICIENCY(kellyFraction, quantumEntanglement);
        
        // Calcular tamaño final
        const riskAmount = this.balance * TRADING.CONFIG.RISK_PER_TRADE;
        const positionSize = riskAmount * quantumKelly * confidence;
        
        // Aplicar límites
        const minSize = FUNDS.CONFIG.MIN_POSITION_SIZE * this.balance;
        const maxSize = FUNDS.CONFIG.MAX_POSITION_SIZE * this.balance;
        
        return Math.max(minSize, Math.min(maxSize, positionSize));
    }

    // Obtener promedio de ganancias
    getAverageWin() {
        const wins = this.tradeHistory.filter(trade => trade.profit > 0);
        if (wins.length === 0) return 1;
        
        const totalWin = wins.reduce((sum, trade) => sum + trade.profit, 0);
        return totalWin / wins.length;
    }

    // Obtener promedio de pérdidas
    getAverageLoss() {
        const losses = this.tradeHistory.filter(trade => trade.profit < 0);
        if (losses.length === 0) return 1;
        
        const totalLoss = losses.reduce((sum, trade) => sum + Math.abs(trade.profit), 0);
        return totalLoss / losses.length;
    }

    // Ejecutar trades
    async executeTrades(signals) {
        for (const signal of signals) {
            try {
                if (signal.type === 'BUY') {
                    await this.executeBuy(signal);
                } else if (signal.type === 'SELL') {
                    await this.executeSell(signal);
                }
            } catch (error) {
                console.error(`Error al ejecutar trade para ${signal.symbol}:`, error);
            }
        }
    }

    // Ejecutar compra
    async executeBuy(signal) {
        // Verificar límites de trading
        if (this.positions.length >= TRADING.CONFIG.MAX_POSITIONS) {
            console.log('Límite de posiciones alcanzado');
            return;
        }
        
        // Obtener precio actual
        const ticker = await this.binance.getTicker(signal.symbol);
        const currentPrice = parseFloat(ticker.lastPrice);
        
        // Calcular cantidad
        const quantity = signal.positionSize / currentPrice;
        
        // Crear orden
        const order = {
            symbol: signal.symbol,
            side: 'BUY',
            type: TRADING.ORDER_TYPES.MARKET,
            quantity: quantity,
            timestamp: Date.now(),
            confidence: signal.confidence,
            reason: signal.reason,
            poet: signal.poet
        };
        
        // Ejecutar orden
        const result = await this.binance.createOrder(order);
        
        if (result) {
            // Registrar orden
            this.orders.push(result);
            
            // Crear posición
            const position = {
                symbol: signal.symbol,
                side: 'LONG',
                quantity: quantity,
                entryPrice: currentPrice,
                currentPrice: currentPrice,
                stopLoss: currentPrice * (1 - TRADING.CONFIG.STOP_LOSS),
                takeProfit: currentPrice * (1 + TRADING.CONFIG.TAKE_PROFIT),
                timestamp: Date.now(),
                orderId: result.orderId,
                poet: signal.poet
            };
            
            this.positions.push(position);
            
            console.log(`Compra ejecutada: ${signal.symbol} - Cantidad: ${quantity} - Precio: ${currentPrice}`);
        }
    }

    // Ejecutar venta
    async executeSell(signal) {
        // Buscar posición abierta para el símbolo
        const positionIndex = this.positions.findIndex(p => p.symbol === signal.symbol && p.side === 'LONG');
        
        if (positionIndex === -1) {
            console.log(`No hay posición abierta para ${signal.symbol}`);
            return;
        }
        
        const position = this.positions[positionIndex];
        
        // Crear orden de cierre
        const order = {
            symbol: signal.symbol,
            side: 'SELL',
            type: TRADING.ORDER_TYPES.MARKET,
            quantity: position.quantity,
            timestamp: Date.now(),
            confidence: signal.confidence,
            reason: signal.reason,
            poet: signal.poet,
            closePosition: true,
            positionId: positionIndex
        };
        
        // Ejecutar orden
        const result = await this.binance.createOrder(order);
        
        if (result) {
            // Registrar orden
            this.orders.push(result);
            
            // Calcular profit/loss
            const currentPrice = parseFloat((await this.binance.getTicker(signal.symbol)).lastPrice);
            const profit = (currentPrice - position.entryPrice) * position.quantity;
            
            // Registrar trade en historial
            this.tradeHistory.push({
                symbol: signal.symbol,
                side: 'SELL',
                quantity: position.quantity,
                entryPrice: position.entryPrice,
                exitPrice: currentPrice,
                profit: profit,
                timestamp: Date.now(),
                duration: Date.now() - position.timestamp,
                poet: signal.poet
            });
            
            // Actualizar balance
            this.balance += profit;
            
            // Eliminar posición
            this.positions.splice(positionIndex, 1);
            
            console.log(`Venta ejecutada: ${signal.symbol} - Cantidad: ${position.quantity} - Precio: ${currentPrice} - Profit: ${profit}`);
        }
    }

    // Gestionar posiciones abiertas
    async managePositions() {
        for (let i = this.positions.length - 1; i >= 0; i--) {
            const position = this.positions[i];
            
            try {
                // Obtener precio actual
                const ticker = await this.binance.getTicker(position.symbol);
                const currentPrice = parseFloat(ticker.lastPrice);
                position.currentPrice = currentPrice;
                
                // Verificar stop loss
                if (currentPrice <= position.stopLoss) {
                    await this.closePosition(i, 'STOP_LOSS');
                    continue;
                }
                
                // Verificar take profit
                if (currentPrice >= position.takeProfit) {
                    await this.closePosition(i, 'TAKE_PROFIT');
                    continue;
                }
                
                // Actualizar stop loss trailing
                this.updateTrailingStopLoss(position, currentPrice);
                
            } catch (error) {
                console.error(`Error al gestionar posición ${position.symbol}:`, error);
            }
        }
    }

    // Cerrar posición
    async closePosition(positionIndex, reason) {
        const position = this.positions[positionIndex];
        
        // Crear orden de cierre
        const order = {
            symbol: position.symbol,
            side: 'SELL',
            type: TRADING.ORDER_TYPES.MARKET,
            quantity: position.quantity,
            timestamp: Date.now(),
            closePosition: true,
            reason: reason
        };
        
        // Ejecutar orden
        const result = await this.binance.createOrder(order);
        
        if (result) {
            // Registrar orden
            this.orders.push(result);
            
            // Calcular profit/loss
            const profit = (position.currentPrice - position.entryPrice) * position.quantity;
            
            // Registrar trade en historial
            this.tradeHistory.push({
                symbol: position.symbol,
                side: 'SELL',
                quantity: position.quantity,
                entryPrice: position.entryPrice,
                exitPrice: position.currentPrice,
                profit: profit,
                timestamp: Date.now(),
                duration: Date.now() - position.timestamp,
                reason: reason,
                poet: position.poet
            });
            
            // Actualizar balance
            this.balance += profit;
            
            // Eliminar posición
            this.positions.splice(positionIndex, 1);
            
            console.log(`Posición cerrada: ${position.symbol} - Razón: ${reason} - Profit: ${profit}`);
        }
    }

    // Actualizar stop loss trailing
    updateTrailingStopLoss(position, currentPrice) {
        const profit = currentPrice - position.entryPrice;
        const profitPercentage = profit / position.entryPrice;
        
        // Si hay beneficio del 2% o más, activar trailing stop
        if (profitPercentage >= 0.02) {
            const newStopLoss = currentPrice * (1 - TRADING.CONFIG.STOP_LOSS * 0.5);
            if (newStopLoss > position.stopLoss) {
                position.stopLoss = newStopLoss;
            }
        }
    }

    // Actualizar métricas
    updateMetrics() {
        // Actualizar balance pico y drawdown
        if (this.balance > this.peakBalance) {
            this.peakBalance = this.balance;
        }
        
        this.currentDrawdown = (this.peakBalance - this.balance) / this.peakBalance;
        if (this.currentDrawdown > this.maxDrawdown) {
            this.maxDrawdown = this.currentDrawdown;
        }
        
        // Calcular win rate
        if (this.tradeHistory.length > 0) {
            const wins = this.tradeHistory.filter(trade => trade.profit > 0).length;
            this.winRate = wins / this.tradeHistory.length;
        }
        
        // Calcular profit factor
        const grossProfit = this.tradeHistory
            .filter(trade => trade.profit > 0)
            .reduce((sum, trade) => sum + trade.profit, 0);
        
        const grossLoss = Math.abs(this.tradeHistory
            .filter(trade => trade.profit < 0)
            .reduce((sum, trade) => sum + trade.profit, 0));
        
        this.profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;
        
        // Calcular profit total
        this.totalProfit = this.balance - FUNDS.CONFIG.INITIAL_BALANCE;
    }

    // Aplicar optimización cuántica
    applyQuantumOptimization() {
        // Optimizar para z=9+16j
        const targetReal = LEONARDO.MAXIMIZATION_FUNCTION.REAL_PART;
        const targetImaginary = LEONARDO.MAXIMIZATION_FUNCTION.IMAGINARY_PART;
        
        // Calcular estado actual
        const currentReal = this.quantumMetrics.coherence * targetReal;
        const currentImaginary = this.quantumMetrics.consciousness * targetImaginary;
        
        // Calcular eficiencia
        const maxDistance = Math.sqrt(targetReal * targetReal + targetImaginary * targetImaginary);
        const currentDistance = Math.sqrt(
            Math.pow(currentReal - targetReal, 2) + 
            Math.pow(currentImaginary - targetImaginary, 2)
        );
        
        this.quantumMetrics.optimization.efficiency = 1 - (currentDistance / maxDistance);
        
        // Ajustar métricas cuánticas basado en rendimiento
        if (this.winRate > 0.6) {
            this.quantumMetrics.coherence = Math.min(1, this.quantumMetrics.coherence + 0.001);
        } else if (this.winRate < 0.4) {
            this.quantumMetrics.coherence = Math.max(0, this.quantumMetrics.coherence - 0.001);
        }
        
        if (this.profitFactor > 1.5) {
            this.quantumMetrics.consciousness = Math.min(1, this.quantumMetrics.consciousness + 0.001);
        } else if (this.profitFactor < 1) {
            this.quantumMetrics.consciousness = Math.max(0, this.quantumMetrics.consciousness - 0.001);
        }
    }

    // Obtener estado del motor
    getStatus() {
        return {
            isRunning: this.isRunning,
            balance: this.balance,
            totalProfit: this.totalProfit,
            winRate: this.winRate,
            profitFactor: this.profitFactor,
            maxDrawdown: this.maxDrawdown,
            currentDrawdown: this.currentDrawdown,
            positions: this.positions.length,
            trades: this.tradeHistory.length,
            quantumMetrics: this.quantumMetrics,
            currentPoet: this.currentPoet
        };
    }

    // Obtener historial de trades
    getTradeHistory(limit = 50) {
        return this.tradeHistory.slice(-limit);
    }

    // Obtener posiciones abiertas
    getPositions() {
        return this.positions;
    }

    // Función de espera
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Exportar la clase
module.exports = QBTCTradingEngine;