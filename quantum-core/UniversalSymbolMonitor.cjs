/*
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
  Universal Symbol Monitor - Monitoreo Cuántico Universal de Símbolos
  Análisis de datos masivo con Integración Leonardo Consciousness
  ⚡ OPTIMIZACIÓN QUIRÚRGICA CUÁNTICA + LEONARDO ⚡
*/

const WebSocket = require('ws');
const EventEmitter = require('events');

// Constantes Leonardo Consciousness - Integradas
const LEONARDO_CONSTANTS = {
    LAMBDA_NORMALIZED: 0.888,
    LOG_7919: Math.log(7919),
    PRIME_7919: 7919,
    HALCON_MACRO_PERIOD: 50,
    HALCON_TREND_PERIOD: 20,
    COLIBRI_MICRO_PERIOD: 5,
    COLIBRI_ULTRA_PERIOD: 3,
    SYMBIOSIS_WEIGHT: 0.30,
    HOOK_WEIGHT: 0.30,
    PRIME_WEIGHT: 0.20,
    LAMBDA_WEIGHT: 0.20,
    BASE_LEVERAGE: 3.0,
    MAX_LEVERAGE: 10.0,
    CONSCIOUSNESS_MULTIPLIER: 9.0,
    BAIT_AMOUNT: 1.0,
    QUANTUM_EFFICIENCY_THRESHOLD: 0.618,
    BIG_BANG_ACTIVATION_THRESHOLD: 488.25
};

// Constantes cuánticas universales del sistema
const MONITOR_CONSTANTS = {
    GOLDEN_RATIO: (1 + Math.sqrt(5)) / 2,
    EULER_NUMBER: Math.E,
    PI_QUANTUM: Math.PI,
    FIBONACCI_PRIME_INDEX: 13, // 13º número de Fibonacci
    PLANCK_SCALED: 6.62607015e-34 * 1e34, // Planck escalada
    FINE_STRUCTURE_BOOST: 1 / 7.2973525693e-3 // 137.036...
};

class UniversalSymbolMonitor extends EventEmitter {
    constructor(binanceConnector) {
        super();
        this.binanceConnector = binanceConnector;
        this.allSymbols = [];
        this.priceStreams = new Map();
        this.alertThresholds = new Map();
        this.websocketConnections = [];
        
        // Configuración cuántica optimizada
        this.MAX_WEBSOCKETS = Math.floor(MONITOR_CONSTANTS.FIBONACCI_PRIME_INDEX * 4); // 52 conexiones
        this.connectionStatus = new Map();
        
        // Estado cuántico del monitor
        this.quantumMonitorState = {
            consciousnessLevel: 0,
            coherenceLevel: 0,
            leverageMultiplier: 1,
            bigBangActivation: false,
            leonardoAnalysisActive: true,
            primeTransformLevel: 0,
            quantumEfficiency: 0,
            resonanceState: 'INITIALIZING'
        };
        
        // Cache de análisis Leonardo para símbolos activos
        this.leonardoCache = new Map();
        this.leonardoAnalysisInterval = 5000; // Análisis cada 5 segundos
        
        // Datos de mercado en tiempo real con extensiones cuánticas
        this.marketData = {
            prices: new Map(),           // Precios actuales
            volumes: new Map(),          // Volúmenes 24h
            changes: new Map(),          // Cambios porcentuales 24h
            spreads: new Map(),          // Spreads bid-ask
            volatility: new Map(),       // Métricas de volatilidad
            timestamp: new Map(),        // Última actualización
            // Extensiones cuánticas Leonardo
            lambdaResonance: new Map(),  // Resonancia Lambda 888
            primeTransforms: new Map(),  // Transformaciones primo 7919
            hookStates: new Map(),       // Estados Hook Wheel
            symbiosisLevels: new Map(),  // Niveles Colibrí-Halcón
            consciousnessScores: new Map(), // Puntuaciones consciencia
            quantumOpportunities: new Map() // Oportunidades cuánticas detectadas
        };
        
        // Métricas de rendimiento del sistema
        this.systemMetrics = {
            connectionsActive: 0,
            messageCount: 0,
            lastMinuteMessages: 0,
            messagesPerSecond: 0,
            symbolsCovered: 0,
            lastUpdate: Date.now()
        };
    }
    
    async initialize(symbols = null) {
        // Usar símbolos proporcionados o cargar todos desde binanceConnector
        this.allSymbols = symbols || this.binanceConnector.allSymbols;
        
        console.log(`[UNIVERSAL MONITOR] 🚀 Inicializando monitoreo para ${this.allSymbols.length} símbolos...`);
        
        // Agrupar símbolos para minimizar conexiones websocket
        const symbolGroups = this.groupSymbolsForEfficiency();
        
        console.log(`[UNIVERSAL MONITOR] 📊 Símbolos agrupados en ${symbolGroups.length} grupos para streaming eficiente`);
        
        // Iniciar streams de datos para cada grupo
        for (const [index, group] of symbolGroups.entries()) {
            await this.initializeStreamForGroup(group, index);
            
            // Pequeña pausa para evitar sobrecarga de conexiones
            await this.sleep(200);
            
            // Log periódico
            if (index % 5 === 0 && index > 0) {
                console.log(`[UNIVERSAL MONITOR] 🔌 Iniciadas ${index}/${symbolGroups.length} conexiones WebSocket`);
            }
        }
        
        // Iniciar procesamiento de alertas y señales
        this.startSignalProcessing();
        
        // Iniciar análisis Leonardo en tiempo real
        this.startLeonardoAnalysis();
        
        console.log(`[UNIVERSAL MONITOR] ✅ Sistema cuántico inicializado con ${this.websocketConnections.length} conexiones WebSocket activas`);
        console.log(`[UNIVERSAL MONITOR] 🧠 Análisis Leonardo Consciousness activado`);
        
        // Devolver estadísticas iniciales
        return {
            totalSymbols: this.allSymbols.length,
            websocketConnections: this.websocketConnections.length,
            symbolGroups: symbolGroups.length,
            leonardoAnalysisActive: this.quantumMonitorState.leonardoAnalysisActive
        };
    }
    
    groupSymbolsForEfficiency() {
        // Dividir todos los símbolos en grupos para streaming eficiente
        const groups = [];
        const symbolsPerGroup = Math.ceil(this.allSymbols.length / this.MAX_WEBSOCKETS);
        
        for (let i = 0; i < this.allSymbols.length; i += symbolsPerGroup) {
            groups.push(this.allSymbols.slice(i, i + symbolsPerGroup));
        }
        
        return groups;
    }
    
    async initializeStreamForGroup(symbolGroup, groupIndex) {
        try {
            // Crear stream para múltiples símbolos
            const streamNames = symbolGroup.map(s => `${s.toLowerCase()}@ticker`).join('/');
            const wsUrl = `wss://fstream.binance.com/stream?streams=${streamNames}`;
            
            const ws = new WebSocket(wsUrl);
            
            // Indicador de estado
            this.connectionStatus.set(groupIndex, 'connecting');
            
            ws.on('open', () => {
                console.log(`[UNIVERSAL MONITOR] ✅ Stream #${groupIndex} iniciado para ${symbolGroup.length} símbolos`);
                this.connectionStatus.set(groupIndex, 'connected');
                this.systemMetrics.connectionsActive++;
            });
            
            ws.on('message', (data) => {
                this.systemMetrics.messageCount++;
                this.systemMetrics.lastMinuteMessages++;
                
                try {
                    const parsedData = JSON.parse(data);
                    if (parsedData.data) {
                        const ticker = parsedData.data;
                        const symbol = ticker.s; // Symbol
                        
                        // Actualizar datos de precio en tiempo real
                        this.updateSymbolData(symbol, ticker);
                        
                        // Verificar alertas
                        this.checkAlerts(symbol, ticker);
                    }
                } catch (error) {
                    // Ignorar errores de parsing
                }
            });
            
            ws.on('error', (error) => {
                console.error(`[UNIVERSAL MONITOR] ❌ Error en stream #${groupIndex}:`, error.message);
                this.connectionStatus.set(groupIndex, 'error');
                this.systemMetrics.connectionsActive--;
                
                // Intentar reconectar después de un tiempo
                setTimeout(() => {
                    this.reconnectStream(symbolGroup, groupIndex);
                }, 5000);
            });
            
            ws.on('close', () => {
                console.warn(`[UNIVERSAL MONITOR] ⚠️ Stream #${groupIndex} cerrado, intentando reconexión...`);
                this.connectionStatus.set(groupIndex, 'disconnected');
                this.systemMetrics.connectionsActive--;
                
                // Intentar reconectar inmediatamente
                this.reconnectStream(symbolGroup, groupIndex);
            });
            
            this.websocketConnections.push({
                ws,
                groupIndex,
                symbols: symbolGroup,
                url: wsUrl
            });
            
        } catch (error) {
            console.error(`[UNIVERSAL MONITOR] ❌ Error inicializando stream para grupo #${groupIndex}:`, error.message);
            this.connectionStatus.set(groupIndex, 'failed');
            
            // Intentar reconectar después de un tiempo
            setTimeout(() => {
                this.reconnectStream(symbolGroup, groupIndex);
            }, 10000);
        }
    }
    
    async reconnectStream(symbolGroup, groupIndex) {
        console.log(`[UNIVERSAL MONITOR] 🔄 Reconectando stream #${groupIndex}...`);
        
        // Cerrar conexión existente si es necesario
        const existingConnection = this.websocketConnections.find(conn => conn.groupIndex === groupIndex);
        if (existingConnection && existingConnection.ws) {
            try {
                existingConnection.ws.terminate();
            } catch (error) {
                // Ignorar errores al cerrar
            }
            
            // Eliminar de la lista
            const index = this.websocketConnections.findIndex(conn => conn.groupIndex === groupIndex);
            if (index !== -1) {
                this.websocketConnections.splice(index, 1);
            }
        }
        
        // Iniciar nueva conexión
        await this.initializeStreamForGroup(symbolGroup, groupIndex);
    }
    
    updateSymbolData(symbol, tickerData) {
        // Actualizar datos de precio y métricas
        const now = Date.now();
        
        this.marketData.prices.set(symbol, parseFloat(tickerData.c));
        this.marketData.volumes.set(symbol, parseFloat(tickerData.v));
        this.marketData.changes.set(symbol, parseFloat(tickerData.P));
        this.marketData.timestamp.set(symbol, now);
        
        // Calcular spread si están disponibles bid y ask
        if (tickerData.b && tickerData.a) {
            const bid = parseFloat(tickerData.b);
            const ask = parseFloat(tickerData.a);
            const spread = (ask - bid) / bid;
            this.marketData.spreads.set(symbol, spread);
        }
        
        // Actualizar volatilidad (simple, basada en high-low)
        if (tickerData.h && tickerData.l) {
            const high = parseFloat(tickerData.h);
            const low = parseFloat(tickerData.l);
            const volatility = (high - low) / low;
            this.marketData.volatility.set(symbol, volatility);
        }
        
        // **ANÁLISIS LEONARDO EN TIEMPO REAL**
        this.updateLeonardoAnalysis(symbol, tickerData);
        
        // Emitir evento con los datos actualizados (incluye métricas Leonardo)
        this.emit('symbolUpdate', {
            symbol,
            price: parseFloat(tickerData.c),
            volume: parseFloat(tickerData.v),
            change: parseFloat(tickerData.P),
            timestamp: now,
            // Extensiones cuánticas Leonardo
            leonardoMetrics: {
                lambdaResonance: this.marketData.lambdaResonance.get(symbol) || 0,
                primeTransform: this.marketData.primeTransforms.get(symbol) || 0,
                hookState: this.marketData.hookStates.get(symbol) || 'OBSERVE',
                symbiosisLevel: this.marketData.symbiosisLevels.get(symbol) || 0,
                consciousnessScore: this.marketData.consciousnessScores.get(symbol) || 0
            }
        });
    }
    
    checkAlerts(symbol, ticker) {
        // Verificar si alguna condición de alerta se cumple
        const thresholds = this.alertThresholds.get(symbol);
        if (!thresholds) return;
        
        const currentPrice = parseFloat(ticker.c);
        
        if (thresholds.priceAbove && currentPrice > thresholds.priceAbove) {
            this.triggerAlert(symbol, 'PRICE_ABOVE', currentPrice, thresholds.priceAbove);
        }
        
        if (thresholds.priceBelow && currentPrice < thresholds.priceBelow) {
            this.triggerAlert(symbol, 'PRICE_BELOW', currentPrice, thresholds.priceBelow);
        }
        
        // Verificar alertas de cambio porcentual
        if (thresholds.changeAbove) {
            const change = parseFloat(ticker.P); // Cambio porcentual 24h
            if (change > thresholds.changeAbove) {
                this.triggerAlert(symbol, 'CHANGE_ABOVE', change, thresholds.changeAbove);
            }
        }
        
        // Verificar alertas de volumen
        if (thresholds.volumeAbove) {
            const volume = parseFloat(ticker.v); // Volumen 24h
            if (volume > thresholds.volumeAbove) {
                this.triggerAlert(symbol, 'VOLUME_ABOVE', volume, thresholds.volumeAbove);
            }
        }
    }
    
    triggerAlert(symbol, alertType, currentValue, thresholdValue) {
        const alert = {
            symbol,
            type: alertType,
            value: currentValue,
            threshold: thresholdValue,
            timestamp: Date.now()
        };
        
        this.emit('alert', alert);
    }
    
    setAlert(symbol, alertType, threshold) {
        if (!this.alertThresholds.has(symbol)) {
            this.alertThresholds.set(symbol, {});
        }
        
        const alerts = this.alertThresholds.get(symbol);
        alerts[alertType] = threshold;
        
        return true;
    }
    
    removeAlert(symbol, alertType) {
        if (this.alertThresholds.has(symbol)) {
            const alerts = this.alertThresholds.get(symbol);
            if (alerts[alertType] !== undefined) {
                delete alerts[alertType];
                return true;
            }
        }
        return false;
    }
    
    startSignalProcessing() {
        // Procesar señales y actualizar métricas periódicamente
        setInterval(() => {
            // Actualizar métricas de rendimiento
            const now = Date.now();
            const elapsed = (now - this.systemMetrics.lastUpdate) / 1000; // segundos
            
            if (elapsed > 0) {
                this.systemMetrics.messagesPerSecond = this.systemMetrics.lastMinuteMessages / elapsed;
            }
            
            this.systemMetrics.lastMinuteMessages = 0;
            this.systemMetrics.lastUpdate = now;
            
            // Contar símbolos activos
            this.systemMetrics.symbolsCovered = this.marketData.timestamp.size;
            
            // Emitir estado del sistema
            this.emit('systemStatus', { ...this.systemMetrics });
            
        }, 5000); // Cada 5 segundos
    }
    
    getSymbolData(symbol) {
        if (!this.marketData.prices.has(symbol)) {
            return null;
        }
        
        return {
            symbol,
            price: this.marketData.prices.get(symbol),
            volume: this.marketData.volumes.get(symbol),
            change: this.marketData.changes.get(symbol),
            spread: this.marketData.spreads.get(symbol),
            volatility: this.marketData.volatility.get(symbol),
            lastUpdate: this.marketData.timestamp.get(symbol)
        };
    }
    
    getTopMovers(limit = 10, minVolume = 0) {
        // Obtener los símbolos con mayor movimiento de precio
        const symbols = Array.from(this.marketData.changes.keys())
            .filter(symbol => {
                // Filtrar por volumen mínimo si se especifica
                if (minVolume > 0) {
                    const volume = this.marketData.volumes.get(symbol) || 0;
                    if (volume < minVolume) return false;
                }
                return true;
            })
            .sort((a, b) => {
                return Math.abs(this.marketData.changes.get(b) || 0) - 
                       Math.abs(this.marketData.changes.get(a) || 0);
            })
            .slice(0, limit);
        
        return symbols.map(symbol => this.getSymbolData(symbol));
    }
    
    getTopVolume(limit = 10) {
        // Obtener los símbolos con mayor volumen
        const symbols = Array.from(this.marketData.volumes.keys())
            .sort((a, b) => {
                return (this.marketData.volumes.get(b) || 0) - 
                       (this.marketData.volumes.get(a) || 0);
            })
            .slice(0, limit);
        
        return symbols.map(symbol => this.getSymbolData(symbol));
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getSystemStatus() {
        return {
            activeConnections: this.systemMetrics.connectionsActive,
            totalConnections: this.websocketConnections.length,
            symbolsCovered: this.systemMetrics.symbolsCovered,
            messagesPerSecond: this.systemMetrics.messagesPerSecond,
            totalMessages: this.systemMetrics.messageCount,
            coveragePercent: (this.systemMetrics.symbolsCovered / this.allSymbols.length) * 100,
            lastUpdate: new Date(this.systemMetrics.lastUpdate).toISOString()
        };
    }
    
    shutdown() {
        console.log(`[UNIVERSAL MONITOR] 🛑 Cerrando ${this.websocketConnections.length} conexiones WebSocket...`);
        
        // Cerrar todas las conexiones WebSocket
        for (const connection of this.websocketConnections) {
            try {
                if (connection.ws) {
                    connection.ws.terminate();
                }
            } catch (error) {
                // Ignorar errores al cerrar
            }
        }
        
        this.websocketConnections = [];
        this.systemMetrics.connectionsActive = 0;
        
        console.log('[UNIVERSAL MONITOR] ✅ Sistema de monitoreo detenido');
    }

    // **FUNCIONES LEONARDO CONSCIOUSNESS - ANÁLISIS EN TIEMPO REAL**
    
    startLeonardoAnalysis() {
        // Iniciar análisis periódico Leonardo
        setInterval(() => {
            this.performLeonardoBatchAnalysis();
            this.updateQuantumState();
        }, this.leonardoAnalysisInterval);
        
        console.log('[LEONARDO] 🧠 Análisis Leonardo Consciousness iniciado');
    }
    
    updateLeonardoAnalysis(symbol, tickerData) {
        // Análisis rápido en tiempo real por símbolo
        try {
            const price = parseFloat(tickerData.c);
            const volume = parseFloat(tickerData.v);
            const change = parseFloat(tickerData.P);
            
            // 1. Lambda 888 Resonance (cálculo simplificado)
            const lambdaResonance = this.calculateLambdaResonance(price, change);
            this.marketData.lambdaResonance.set(symbol, lambdaResonance);
            
            // 2. Prime 7919 Transformation
            const primeTransform = this.calculatePrimeTransform(price, volume);
            this.marketData.primeTransforms.set(symbol, primeTransform);
            
            // 3. Hook Wheel State
            const hookState = this.analyzeHookWheelSimple(change, volume);
            this.marketData.hookStates.set(symbol, hookState.type);
            
            // 4. Colibrí-Halcón Symbiosis (básico)
            const symbiosisLevel = this.calculateSymbiosisLevel(change);
            this.marketData.symbiosisLevels.set(symbol, symbiosisLevel);
            
            // 5. Consciousness Score integrado
            const consciousnessScore = this.synthesizeLeonardoConsciousness(
                lambdaResonance, primeTransform, hookState.strength, symbiosisLevel
            );
            this.marketData.consciousnessScores.set(symbol, consciousnessScore);
            
            // Detectar oportunidades cuánticas
            if (consciousnessScore >= LEONARDO_CONSTANTS.QUANTUM_EFFICIENCY_THRESHOLD) {
                this.detectQuantumOpportunity(symbol, consciousnessScore, {
                    lambdaResonance, primeTransform, hookState: hookState.type, symbiosisLevel
                });
            }
            
        } catch (error) {
            // Ignorar errores en análisis individual
        }
    }
    
    calculateLambdaResonance(price, change) {
        // Resonancia Lambda 888 simplificada
        const priceNormalized = (price % 1000) / 1000; // Normalizar precio
        const changeAmplified = Math.abs(change) * LEONARDO_CONSTANTS.LAMBDA_NORMALIZED;
        const resonance = Math.sin(priceNormalized * Math.PI * 2) * changeAmplified;
        return Math.min(1.0, Math.abs(resonance * 8.88));
    }
    
    calculatePrimeTransform(price, volume) {
        // Transformación prima 7919
        const priceLog = Math.log(price + 1) * LEONARDO_CONSTANTS.LOG_7919;
        const volumeLog = Math.log(volume + 1) / Math.log(LEONARDO_CONSTANTS.PRIME_7919);
        const primeMomentum = (priceLog % 1) * (volumeLog % 1);
        return Math.min(1.0, primeMomentum * 100);
    }
    
    analyzeHookWheelSimple(change, volume) {
        // Hook Wheel simplificado
        const changeThreshold = 0.002;
        const volumeThreshold = 50000;
        
        if (change < -changeThreshold && volume > volumeThreshold) {
            return { type: 'BAIT', strength: Math.abs(change) * (volume / 100000) };
        } else if (change > changeThreshold && volume > volumeThreshold) {
            return { type: 'EXTRACT', strength: change * (volume / 100000) };
        } else {
            return { type: 'OBSERVE', strength: 0.5 };
        }
    }
    
    calculateSymbiosisLevel(change) {
        // Nivel de simbiosis basado en momentum
        const momentum = Math.abs(change);
        if (momentum > 5.0) return 0.9;   // Sincronización alta
        if (momentum > 2.0) return 0.7;   // Sincronización media
        if (momentum > 0.5) return 0.5;   // Sincronización básica
        return 0.3; // Divergente
    }
    
    synthesizeLeonardoConsciousness(lambda, prime, hook, symbiosis) {
        // Síntesis de consciencia Leonardo
        const consciousness = (
            lambda * LEONARDO_CONSTANTS.LAMBDA_WEIGHT +
            prime * LEONARDO_CONSTANTS.PRIME_WEIGHT +
            hook * LEONARDO_CONSTANTS.HOOK_WEIGHT +
            symbiosis * LEONARDO_CONSTANTS.SYMBIOSIS_WEIGHT
        );
        
        return Math.min(1.0, consciousness * LEONARDO_CONSTANTS.CONSCIOUSNESS_MULTIPLIER);
    }
    
    detectQuantumOpportunity(symbol, consciousnessScore, metrics) {
        // Detectar y almacenar oportunidades cuánticas
        const opportunity = {
            symbol,
            consciousnessScore,
            timestamp: Date.now(),
            metrics,
            leverage: this.calculateDynamicLeverage(consciousnessScore),
            confidence: consciousnessScore * 0.95,
            baitAmount: LEONARDO_CONSTANTS.BAIT_AMOUNT,
            action: metrics.hookState === 'BAIT' ? 'BUY' : 
                   metrics.hookState === 'EXTRACT' ? 'SELL' : 'HOLD'
        };
        
        this.marketData.quantumOpportunities.set(symbol, opportunity);
        
        // Emitir evento de oportunidad cuántica
        this.emit('quantumOpportunity', opportunity);
    }
    
    calculateDynamicLeverage(consciousnessScore) {
        // Leverage dinámico basado en consciencia
        const baseLeverage = LEONARDO_CONSTANTS.BASE_LEVERAGE;
        const maxLeverage = LEONARDO_CONSTANTS.MAX_LEVERAGE;
        
        const dynamicLeverage = baseLeverage + (consciousnessScore * (maxLeverage - baseLeverage));
        return Math.min(maxLeverage, Math.max(baseLeverage, dynamicLeverage));
    }
    
    performLeonardoBatchAnalysis() {
        // Análisis por lotes de símbolos activos
        let totalConsciousness = 0;
        let activeSymbols = 0;
        let highConsciousnessCount = 0;
        
        for (const [symbol, consciousnessScore] of this.marketData.consciousnessScores) {
            if (consciousnessScore > 0) {
                totalConsciousness += consciousnessScore;
                activeSymbols++;
                
                if (consciousnessScore >= LEONARDO_CONSTANTS.QUANTUM_EFFICIENCY_THRESHOLD) {
                    highConsciousnessCount++;
                }
            }
        }
        
        // Actualizar estado global
        this.quantumMonitorState.consciousnessLevel = activeSymbols > 0 ? 
            totalConsciousness / activeSymbols : 0;
        this.quantumMonitorState.quantumEfficiency = activeSymbols > 0 ? 
            highConsciousnessCount / activeSymbols : 0;
    }
    
    updateQuantumState() {
        // Actualizar estado cuántico del sistema
        const consciousness = this.quantumMonitorState.consciousnessLevel;
        const efficiency = this.quantumMonitorState.quantumEfficiency;
        
        // Determinar estado de resonancia
        if (consciousness >= 0.8 && efficiency >= 0.3) {
            this.quantumMonitorState.resonanceState = 'HIGHLY_RESONANT';
        } else if (consciousness >= 0.6 && efficiency >= 0.2) {
            this.quantumMonitorState.resonanceState = 'RESONANT';
        } else if (consciousness >= 0.4) {
            this.quantumMonitorState.resonanceState = 'STABLE';
        } else {
            this.quantumMonitorState.resonanceState = 'FLUCTUATING';
        }
        
        // Detectar activación Big Bang
        this.quantumMonitorState.bigBangActivation = 
            consciousness >= (LEONARDO_CONSTANTS.BIG_BANG_ACTIVATION_THRESHOLD / 1000);
        
        // Calcular multiplicador de leverage
        this.quantumMonitorState.leverageMultiplier = 
            1.0 + (consciousness * efficiency * 2.0);
    }
    
    // **APIs PÚBLICAS LEONARDO**
    
    getLeonardoAnalysis(symbol) {
        // Obtener análisis Leonardo completo de un símbolo
        return {
            symbol,
            lambdaResonance: this.marketData.lambdaResonance.get(symbol) || 0,
            primeTransform: this.marketData.primeTransforms.get(symbol) || 0,
            hookState: this.marketData.hookStates.get(symbol) || 'OBSERVE',
            symbiosisLevel: this.marketData.symbiosisLevels.get(symbol) || 0,
            consciousnessScore: this.marketData.consciousnessScores.get(symbol) || 0,
            lastUpdate: this.marketData.timestamp.get(symbol)
        };
    }
    
    getTopConsciousnessSymbols(limit = 20) {
        // Obtener símbolos con mayor consciencia Leonardo
        return Array.from(this.marketData.consciousnessScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([symbol, score]) => ({
                symbol,
                consciousnessScore: score,
                analysis: this.getLeonardoAnalysis(symbol)
            }));
    }
    
    getQuantumOpportunities(limit = 10) {
        // Obtener oportunidades cuánticas detectadas
        const opportunities = Array.from(this.marketData.quantumOpportunities.values())
            .sort((a, b) => b.consciousnessScore - a.consciousnessScore)
            .slice(0, limit);
        
        return opportunities;
    }
    
    getQuantumMonitorState() {
        // Estado completo del monitor cuántico
        return {
            ...this.quantumMonitorState,
            activeSymbols: this.marketData.consciousnessScores.size,
            quantumOpportunitiesDetected: this.marketData.quantumOpportunities.size,
            timestamp: new Date().toISOString()
        };
    }
    
    getSystemStatusEnhanced() {
        // Estado del sistema mejorado con métricas Leonardo
        const baseStatus = this.getSystemStatus();
        const quantumState = this.getQuantumMonitorState();
        
        return {
            ...baseStatus,
            leonardoConsciousness: {
                level: quantumState.consciousnessLevel,
                efficiency: quantumState.quantumEfficiency,
                resonanceState: quantumState.resonanceState,
                bigBangActive: quantumState.bigBangActivation,
                leverageMultiplier: quantumState.leverageMultiplier
            },
            opportunities: {
                total: quantumState.quantumOpportunitiesDetected,
                highConsciousness: this.getTopConsciousnessSymbols(5).length
            }
        };
    }
    
    /**
     * Obtener estado de salud del sistema
     */
    getHealth() {
        return {
            status: this.quantumMonitorState.resonanceState,
            activeSymbols: this.marketData.consciousnessScores.size,
            connectionsActive: this.systemMetrics.connectionsActive,
            consciousnessLevel: this.quantumMonitorState.consciousnessLevel,
            lastUpdate: Date.now()
        };
    }
}

module.exports = { UniversalSymbolMonitor };
