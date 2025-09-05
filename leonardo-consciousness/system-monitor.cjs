#!/usr/bin/env node

// ========================================================================
// 📊 LEONARDO CONSCIOUSNESS SYSTEM MONITOR
// Monitor en tiempo real del estado del sistema optimizado
// ========================================================================

const { LeonardoDecisionEngine } = require('./LeonardoDecisionEngine');
const { FundsManager } = require('./FundsManager');

class LeonardoSystemMonitor {
    constructor() {
        this.decisionEngine = new LeonardoDecisionEngine();
        this.fundsManager = new FundsManager(10000);
        this.decisionEngine.updateAvailableFunds(10000);
        
        console.log('🖥️ Leonardo System Monitor Iniciado');
        console.log('📊 Monitoreando métricas optimizadas...\n');
    }
    
    async fetchRealMarketData(symbol = 'BTCUSDT') {
        try {
            console.log(`📡 Fetching real market data for ${symbol}...`);
            
            // Usar API pública de Binance para obtener datos reales
            const https = require('https');
            
            // 1. Obtener precio actual
            const priceData = await this.fetchFromBinance(
                `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
            );
            const currentPrice = parseFloat(priceData.price);
            
            // 2. Obtener datos de klines (velas) para últimas 30 horas
            const klinesData = await this.fetchFromBinance(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=30`
            );
            
            // 3. Procesar datos históricos
            const prices = [];
            const volumes = [];
            
            klinesData.forEach(kline => {
                // [openTime, open, high, low, close, volume, closeTime, quoteVolume, trades, buyBaseVolume, buyQuoteVolume, ignore]
                prices.push(parseFloat(kline[4])); // close price
                volumes.push(parseFloat(kline[5])); // volume
            });
            
            console.log(`✅ Real data fetched: Current BTC price: $${currentPrice.toFixed(2)}`);
            
            return {
                symbol: 'BTC/USDT',
                timeframe: '1h',
                prices,
                volumes,
                currentPrice,
                isRealData: true,
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.log(`⚠️ Error fetching real data: ${error.message}`);
            console.log(`🔄 Fallback to simulated data with realistic patterns...`);
            
            // Fallback a datos simulados pero con patrones más realistas
            return this.generateRealisticMarketData();
        }
    }
    
    fetchFromBinance(url) {
        return new Promise((resolve, reject) => {
            const https = require('https');
            
            https.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (parseError) {
                        reject(new Error(`Parse error: ${parseError.message}`));
                    }
                });
                
            }).on('error', (err) => {
                reject(err);
            });
        });
    }
    
    generateRealisticMarketData() {
        // Datos simulados pero con patrones realistas del mercado crypto
        const prices = [];
        const volumes = [];
        
        // Usar un precio base realista
        let basePrice = 67000 + (Math.random() - 0.5) * 5000; // BTC rango realista
        
        for (let i = 0; i < 30; i++) {
            // Patrones más realistas de volatilidad crypto
            let change;
            if (Math.random() < 0.05) {
                // 5% probabilidad de movimiento grande (pumps/dumps)
                change = (Math.random() - 0.5) * 0.08; // ±4%
            } else if (Math.random() < 0.2) {
                // 20% probabilidad de movimiento medio
                change = (Math.random() - 0.5) * 0.03; // ±1.5%
            } else {
                // 75% probabilidad de movimiento pequeño
                change = (Math.random() - 0.5) * 0.01; // ±0.5%
            }
            
            basePrice *= (1 + change);
            prices.push(basePrice);
            
            // Volúmenes realistas para BTC
            const baseVolume = 200 + Math.random() * 800; // 200-1000 BTC por hora es realista
            volumes.push(baseVolume);
        }
        
        return {
            symbol: 'BTC/USDT',
            timeframe: '1h',
            prices,
            volumes,
            currentPrice: basePrice,
            isRealData: false,
            timestamp: Date.now()
        };
    }
    
    async runMonitoringCycle() {
        try {
            console.log('🔄 ' + '='.repeat(70));
            console.log('📅 Ciclo de Monitoreo:', new Date().toLocaleTimeString());
            console.log('─'.repeat(70));
            
            // Obtener datos de mercado reales
            const marketData = await this.fetchRealMarketData();
            
            // Análisis Leonardo completo
            const analysis = await this.decisionEngine.analyze(marketData);
            
            // Mostrar métricas optimizadas
            this.displayOptimizedMetrics(analysis);
            
            // Mostrar estado de fondos
            this.displayFundsStatus();
            
            // Mostrar recomendaciones
            this.displayRecommendations(analysis);
            
            console.log('─'.repeat(70));
            console.log('✅ Ciclo completado exitosamente\n');
            
        } catch (error) {
            console.error('❌ Error en ciclo de monitoreo:', error.message);
        }
    }
    
    displayOptimizedMetrics(analysis) {
        console.log('🧠 MÉTRICAS LEONARDO CONSCIOUSNESS OPTIMIZADAS:');
        console.log('┌─────────────────────────────────────────────────────────┐');
        
        // Estado general
        const consciousness = (analysis.consciousnessLevel * 100).toFixed(1);
        const confidence = (analysis.confidence * 100).toFixed(1);
        const dataSource = analysis.isRealData ? '🔴 REAL' : '🟡 SIM';
        console.log(`│ 🌊 Consciencia: ${consciousness}% | 🎯 Confianza: ${confidence}% | 📈 Dir: ${analysis.direction} │`);
        console.log(`│ ${dataSource} Data | Precio Actual: $${analysis.currentPrice?.toFixed(2) || 'N/A'}             │`);
        
        // 4 Pilares optimizados
        if (analysis.fourPillarsAnalysis) {
            const pillars = analysis.fourPillarsAnalysis;
            
            console.log('├─────────────────────────────────────────────────────────┤');
            console.log('│ 🏛️  PILARES LEONARDO (OPTIMIZADOS)                    │');
            
            // Lambda 888
            const lambda = (pillars.lambda888.strength * 100).toFixed(1);
            console.log(`│ 📡 Lambda 888: ${lambda.padEnd(5)}% | Status: ${pillars.lambda888.status?.padEnd(12)} │`);
            
            // Prime 7919 (OPTIMIZADO)
            const prime = (pillars.prime7919.strength * 100).toFixed(1);
            const primeStatus = prime > 30 ? '🟢 OPTIMIZADO' : prime > 10 ? '🟡 MEJORANDO' : '🔴 BAJO';
            console.log(`│ 🔱 Prime 7919: ${prime.padEnd(5)}% | Status: ${primeStatus.padEnd(12)} │`);
            
            // Hook Wheel
            const hook = (pillars.hookWheel.strength * 100).toFixed(1);
            console.log(`│ 🎯 Hook Wheel: ${hook.padEnd(5)}% | Status: ${pillars.hookWheel.status?.padEnd(12)} │`);
            
            // Simbiosis (OPTIMIZADA)
            const symbiosis = (pillars.symbiosis.strength * 100).toFixed(1);
            const symbiosisStatus = pillars.symbiosis.strength > 0.4 ? '🟢 SYNC' : '🟡 WEAK_SYNC';
            console.log(`│ 🐦 Simbiosis: ${symbiosis.padEnd(6)}% | Status: ${symbiosisStatus.padEnd(12)} │`);
        }
        
        // Golden Ratio Alignment (IMPLEMENTADO)
        if (analysis.fourPillarsAnalysis?.lambda888) {
            const goldenRatio = analysis.leonardoMetrics?.golden_ratio_alignment?.state || 'CALCULANDO';
            const ratioScore = analysis.leonardoMetrics?.golden_ratio_alignment?.score;
            const scoreText = ratioScore ? `(${(ratioScore * 100).toFixed(1)}%)` : '';
            console.log('├─────────────────────────────────────────────────────────┤');
            console.log(`│ 💎 Golden Ratio: ${goldenRatio.padEnd(12)} ${scoreText.padEnd(8)}        │`);
        }
        
        console.log('└─────────────────────────────────────────────────────────┘');
    }
    
    displayFundsStatus() {
        const status = this.fundsManager.getFundsStatus();
        
        console.log('\n💰 ESTADO DE FONDOS Y TRADING:');
        console.log('┌─────────────────────────────────────────────────────────┐');
        console.log(`│ Balance Total: $${status.totalBalance.toFixed(2).padEnd(12)} | Posiciones: ${status.activePositions.toString().padEnd(2)}     │`);
        console.log(`│ Margen Libre: $${status.freeMargin.toFixed(2).padEnd(13)} | Trading: ${status.canTrade ? '🟢 SÍ' : '🔴 NO'}      │`);
        
        // Métricas de performance (CONTADOR CORREGIDO)
        const metrics = status.performanceMetrics;
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log(`│ 📊 Total Trades: ${metrics.totalTrades.toString().padEnd(4)} | Ganadores: ${metrics.winningTrades.toString().padEnd(4)}        │`);
        console.log(`│ 🎯 Win Rate: ${(metrics.winRate * 100).toFixed(1).padEnd(6)}% | Profit Factor: ${metrics.profitFactor.toFixed(2).padEnd(4)} │`);
        
        // Estado Leonardo en fondos
        const leonardoState = status.leonardoFundsState;
        console.log('├─────────────────────────────────────────────────────────┤');
        console.log(`│ 🧠 Consciencia Fondos: ${(leonardoState.consciousness_level * 100).toFixed(1).padEnd(6)}%              │`);
        console.log(`│ 💥 Big Bang Ready: ${leonardoState.big_bang_funds_ready ? '🟢 SÍ' : '🔴 NO'.padEnd(4)}                    │`);
        
        console.log('└─────────────────────────────────────────────────────────┘');
    }
    
    displayRecommendations(analysis) {
        if (analysis.tradingRecommendations && analysis.tradingRecommendations.length > 0) {
            console.log('\n💡 RECOMENDACIONES DE TRADING:');
            console.log('┌─────────────────────────────────────────────────────────┐');
            
            analysis.tradingRecommendations.forEach((rec, index) => {
                const type = rec.type.padEnd(12);
                const confidence = rec.confidence ? `${(rec.confidence * 100).toFixed(1)}%` : 'N/A';
                console.log(`│ ${(index + 1)}. ${type} | Confianza: ${confidence.padEnd(6)}           │`);
                console.log(`│    ${rec.reasoning?.substring(0, 50).padEnd(50)} │`);
            });
            
            console.log('└─────────────────────────────────────────────────────────┘');
        }
    }
    
    async startMonitoring(intervalSeconds = 30) {
        console.log(`🖥️ Iniciando monitoreo continuo (cada ${intervalSeconds} segundos)...`);
        console.log('💡 Presiona Ctrl+C para detener\n');
        
        // Ejecutar primer ciclo inmediatamente
        await this.runMonitoringCycle();
        
        // Configurar intervalo
        const intervalMs = intervalSeconds * 1000;
        this.monitoringInterval = setInterval(async () => {
            await this.runMonitoringCycle();
        }, intervalMs);
        
        // Manejar terminación elegante
        process.on('SIGINT', () => {
            console.log('\n🛑 Deteniendo monitor...');
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
            }
            this.decisionEngine.destroy();
            this.fundsManager.destroy();
            console.log('✅ Monitor detenido elegantemente');
            process.exit(0);
        });
    }
}

// ========================================================================
// 🚀 EJECUCIÓN PRINCIPAL
// ========================================================================

async function main() {
    const args = process.argv.slice(2);
    const intervalArg = args.find(arg => arg.startsWith('--interval='));
    const interval = intervalArg ? parseInt(intervalArg.split('=')[1]) : 30;
    
    console.log('🌌 LEONARDO CONSCIOUSNESS SYSTEM MONITOR v4.0');
    console.log('🔧 Sistema completamente optimizado y operacional');
    console.log('=' .repeat(70));
    
    try {
        const monitor = new LeonardoSystemMonitor();
        await monitor.startMonitoring(interval);
        
    } catch (error) {
        console.error('💥 Error fatal en monitor:', error.message);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { LeonardoSystemMonitor };
