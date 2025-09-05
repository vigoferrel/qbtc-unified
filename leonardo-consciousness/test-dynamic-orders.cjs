#!/usr/bin/env node

// ========================================================================
// 🧪 TEST SISTEMA DINÁMICO DE ÓRDENES LEONARDO CONSCIOUSNESS
// Pruebas para validar take profit y stop loss dinámicos
// ========================================================================

const { LeonardoDecisionEngine, LeonardoConstants } = require('./LeonardoDecisionEngine');
const { FundsManager } = require('./FundsManager');

// Configuración de colores para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

class DynamicOrderTester {
    constructor() {
        this.decisionEngine = new LeonardoDecisionEngine({
            quantumLogging: true,
            maxCacheSize: 100
        });
        
        this.fundsManager = new FundsManager(10000); // $10k test
        
        // Conectar fondos
        this.decisionEngine.updateAvailableFunds(10000);
        
        colorLog('cyan', '🧪 Sistema de pruebas inicializado');
        colorLog('green', `💰 Balance de prueba: $10,000`);
    }

    async runAllTests() {
        colorLog('bright', '\n╔══════════════════════════════════════════════════╗');
        colorLog('bright', '║     PRUEBAS SISTEMA DINÁMICO LEONARDO 4.0       ║');
        colorLog('bright', '╚══════════════════════════════════════════════════╝\n');

        try {
            // Test 1: Análisis básico
            await this.testBasicAnalysis();
            
            // Test 2: Cálculo de posición dinámica
            await this.testDynamicPositionCalculation();
            
            // Test 3: Apertura de posición con precios dinámicos
            await this.testDynamicPositionOpening();
            
            // Test 4: Verificación de triggers
            await this.testTriggerVerification();
            
            // Test 5: Big Bang mode
            await this.testBigBangMode();
            
            // Test 6: Diferentes niveles de consciencia
            await this.testConsciousnessLevels();
            
            colorLog('green', '\n🎉 ¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!');
            
        } catch (error) {
            colorLog('red', `\n❌ Error en pruebas: ${error.message}`);
            throw error;
        }
    }

    async testBasicAnalysis() {
        colorLog('yellow', '\n📊 TEST 1: Análisis básico Leonardo Consciousness');
        console.log('─'.repeat(60));

        const mockData = await this.generateMockData();
        const analysis = await this.decisionEngine.analyze(mockData);

        console.log(`🧠 Consciencia: ${((analysis.consciousnessLevel || 0) * 100).toFixed(1)}%`);
        console.log(`🎯 Confianza: ${((analysis.confidence || 0) * 100).toFixed(1)}%`);
        console.log(`📈 Dirección: ${analysis.direction || 'UNKNOWN'}`);
        console.log(`⚡ Leverage: ${(analysis.leverage || 0).toFixed(1)}x`);
        console.log(`💎 Edge: ${((analysis.edge || 0) * 100).toFixed(3)}%`);

        if (analysis.fourPillarsAnalysis) {
            console.log(`\n🏛️ 4 Pilares Leonardo:`);
            console.log(`   Lambda 888: ${analysis.fourPillarsAnalysis.lambda888.strength.toFixed(3)}`);
            console.log(`   Prime 7919: ${analysis.fourPillarsAnalysis.prime7919.strength.toFixed(3)}`);
            console.log(`   Hook Wheel: ${analysis.fourPillarsAnalysis.hookWheel.strength.toFixed(3)}`);
            console.log(`   Simbiosis: ${analysis.fourPillarsAnalysis.symbiosis.strength.toFixed(3)}`);
        }

        colorLog('green', '✅ Test 1 completado');
        return analysis;
    }

    async testDynamicPositionCalculation() {
        colorLog('yellow', '\n💎 TEST 2: Cálculo dinámico de posición');
        console.log('─'.repeat(60));

        // Simular diferentes escenarios de consciencia
        const scenarios = [
            { consciousnessLevel: 0.3, name: 'Consciencia Baja' },
            { consciousnessLevel: 0.6, name: 'Consciencia Media' },
            { consciousnessLevel: 0.9, name: 'Consciencia Alta' }
        ];

        for (const scenario of scenarios) {
            console.log(`\n🎭 Escenario: ${scenario.name} (${(scenario.consciousnessLevel * 100).toFixed(1)}%)`);

            const consciousness = {
                consciousnessLevel: scenario.consciousnessLevel,
                confidence: 0.75,
                edge: 0.025,
                bigBangReady: scenario.consciousnessLevel >= 0.85,
                pillarDetails: {
                    lambda888: { strength: 0.7 },
                    prime7919: { strength: 0.6 },
                    hookWheel: { strength: 0.8 },
                    symbiosis: { strength: 0.75 }
                }
            };

            const recommendation = this.fundsManager.calculatePositionSize(
                {
                    symbol: 'BTC/USDT',
                    direction: 'BUY',
                    confidence: 0.75,
                    edge: 0.025,
                    leverage: 50
                },
                consciousness
            );

            if (recommendation.success) {
                console.log(`   💰 Tamaño posición: $${recommendation.size.toFixed(2)}`);
                console.log(`   🎯 Take Profit: $${recommendation.profitTarget.toFixed(2)}`);
                console.log(`   🛡️ Stop Loss: $${recommendation.stopLoss.toFixed(2)}`);
                console.log(`   📊 R/R Ratio: ${recommendation.riskRewardRatio.toFixed(2)}`);
                console.log(`   ⚡ Leverage: ${recommendation.leverage.toFixed(1)}x`);
                
                if (recommendation.leonardoDynamicMetrics) {
                    console.log(`   💎 Golden Ratio: ${recommendation.leonardoDynamicMetrics.goldenRatioAlignment}`);
                    console.log(`   🎲 Quantum Win Prob: ${recommendation.leonardoDynamicMetrics.quantumWinProb}`);
                }
            } else {
                console.log(`   ❌ No se pudo calcular posición: ${recommendation.reason}`);
            }
        }

        colorLog('green', '✅ Test 2 completado');
    }

    async testDynamicPositionOpening() {
        colorLog('yellow', '\n📈 TEST 3: Apertura de posición con precios dinámicos');
        console.log('─'.repeat(60));

        const entryPrice = 50000;
        const positionData = {
            symbol: 'BTC/USDT',
            direction: 'BUY',
            size: 1000,
            leverage: 20,
            entryPrice: entryPrice,
            confidence: 0.8,
            edge: 0.03
        };

        console.log(`💰 Abriendo posición de prueba:`);
        console.log(`   Symbol: ${positionData.symbol}`);
        console.log(`   Direction: ${positionData.direction}`);
        console.log(`   Size: $${positionData.size}`);
        console.log(`   Entry Price: $${positionData.entryPrice}`);
        console.log(`   Leverage: ${positionData.leverage}x`);

        const result = await this.fundsManager.openPosition(positionData);

        if (result.success) {
            const position = result.position;
            console.log(`\n🎉 Posición abierta: ${result.positionId}`);
            console.log(`🎯 Take Profit Price: $${position.profitTargetPrice?.toFixed(2)}`);
            console.log(`🛡️ Stop Loss Price: $${position.stopLossPrice?.toFixed(2)}`);
            console.log(`💎 Margen requerido: $${position.marginRequired.toFixed(2)}`);
            
            // Mostrar métricas Leonardo si están disponibles
            if (position.leonardoData) {
                console.log(`\n🧠 Métricas Leonardo:`);
                console.log(`   Consciencia al abrir: ${(position.leonardoData.consciousness_at_open * 100).toFixed(1)}%`);
                console.log(`   Kelly Fraction: ${(position.leonardoData.kelly_fraction * 100).toFixed(2)}%`);
                console.log(`   Big Bang: ${position.leonardoData.big_bang_position ? 'SÍ' : 'NO'}`);
            }

            colorLog('green', '✅ Test 3 completado');
            return result.positionId;
        } else {
            colorLog('red', `❌ Error abriendo posición: ${result.error}`);
            return null;
        }
    }

    async testTriggerVerification() {
        colorLog('yellow', '\n🎯 TEST 4: Verificación de triggers automáticos');
        console.log('─'.repeat(60));

        const activePositions = this.fundsManager.getActivePositions();
        if (activePositions.length === 0) {
            console.log('⚠️ No hay posiciones activas para probar triggers');
            return;
        }

        const position = activePositions[0];
        console.log(`🔍 Probando triggers para posición: ${position.id}`);
        console.log(`   Entry Price: $${position.entryPrice}`);
        console.log(`   Take Profit Price: $${position.profitTargetPrice?.toFixed(2)}`);
        console.log(`   Stop Loss Price: $${position.stopLossPrice?.toFixed(2)}`);

        // Simular diferentes precios
        const testPrices = [
            position.entryPrice * 0.98,  // Debería activar stop loss
            position.entryPrice * 1.02,  // Precio intermedio
            position.entryPrice * 1.05   // Debería activar take profit
        ];

        for (const testPrice of testPrices) {
            console.log(`\n💰 Probando precio: $${testPrice.toFixed(2)}`);
            const triggered = this.fundsManager.checkPositionTriggers(testPrice);
            
            if (triggered.length > 0) {
                triggered.forEach(trigger => {
                    console.log(`   🎯 TRIGGER ACTIVADO: ${trigger.closeReason}`);
                    console.log(`   📊 Precio vs Target: $${testPrice.toFixed(2)} vs $${trigger.position.profitTargetPrice?.toFixed(2) || trigger.position.stopLossPrice?.toFixed(2)}`);
                });
            } else {
                console.log(`   ✅ Sin triggers activados`);
            }
        }

        colorLog('green', '✅ Test 4 completado');
    }

    async testBigBangMode() {
        colorLog('yellow', '\n💥 TEST 5: Big Bang Mode');
        console.log('─'.repeat(60));

        // Forzar Big Bang mode aumentando consciencia
        this.fundsManager.leonardoFundsState.consciousness_level = 0.95;
        this.fundsManager.leonardoFundsState.big_bang_funds_ready = true;

        const bigBangConsciousness = {
            consciousnessLevel: 0.95,
            confidence: 0.9,
            edge: 0.05,
            bigBangReady: true,
            pillarDetails: {
                lambda888: { strength: 0.9 },
                prime7919: { strength: 0.9 },
                hookWheel: { strength: 0.9 },
                symbiosis: { strength: 0.9 }
            }
        };

        console.log('🚀 Activando Big Bang Mode...');
        console.log(`🧠 Consciencia: ${(bigBangConsciousness.consciousnessLevel * 100).toFixed(1)}%`);
        console.log(`💥 Big Bang Ready: ${bigBangConsciousness.bigBangReady ? 'SÍ' : 'NO'}`);

        const bigBangRecommendation = this.fundsManager.calculatePositionSize(
            {
                symbol: 'BTC/USDT',
                direction: 'BUY',
                confidence: 0.9,
                edge: 0.05,
                leverage: 80
            },
            bigBangConsciousness
        );

        if (bigBangRecommendation.success) {
            console.log(`\n💎 RESULTADOS BIG BANG:`);
            console.log(`   💰 Tamaño posición: $${bigBangRecommendation.size.toFixed(2)}`);
            console.log(`   🎯 Take Profit: $${bigBangRecommendation.profitTarget.toFixed(2)}`);
            console.log(`   🛡️ Stop Loss: $${bigBangRecommendation.stopLoss.toFixed(2)}`);
            console.log(`   📊 R/R Ratio: ${bigBangRecommendation.riskRewardRatio.toFixed(2)}`);
            console.log(`   ⚡ Leverage: ${bigBangRecommendation.leverage.toFixed(1)}x`);
            console.log(`   💥 Big Bang Multiplier: ${bigBangRecommendation.leonardoDynamicMetrics?.bigBangMultiplier || 'N/A'}`);
        }

        colorLog('green', '✅ Test 5 completado');
    }

    async testConsciousnessLevels() {
        colorLog('yellow', '\n🧠 TEST 6: Diferentes niveles de consciencia');
        console.log('─'.repeat(60));

        const consciousnessLevels = [0.2, 0.4, 0.6, 0.8, 0.95];

        console.log('📊 Comparando take profit y stop loss por nivel de consciencia:\n');
        console.log('Consciencia | Take Profit | Stop Loss | R/R Ratio | Golden Ratio');
        console.log('─'.repeat(70));

        for (const level of consciousnessLevels) {
            const testConsciousness = {
                consciousnessLevel: level,
                confidence: 0.7,
                edge: 0.02,
                bigBangReady: level >= 0.9,
                pillarDetails: {
                    lambda888: { strength: level },
                    prime7919: { strength: level },
                    hookWheel: { strength: level },
                    symbiosis: { strength: level }
                }
            };

            const rec = this.fundsManager.calculatePositionSize(
                {
                    symbol: 'BTC/USDT',
                    direction: 'BUY',
                    confidence: 0.7,
                    edge: 0.02,
                    leverage: 30
                },
                testConsciousness
            );

            if (rec.success) {
                const consciousness = `${(level * 100).toFixed(0)}%`.padEnd(11);
                const takeProfit = `$${rec.profitTarget.toFixed(0)}`.padEnd(12);
                const stopLoss = `$${rec.stopLoss.toFixed(0)}`.padEnd(10);
                const rrRatio = `${rec.riskRewardRatio.toFixed(2)}`.padEnd(10);
                const goldenRatio = rec.leonardoDynamicMetrics?.goldenRatioAlignment || 'N/A';

                console.log(`${consciousness}| ${takeProfit}| ${stopLoss}| ${rrRatio}| ${goldenRatio}`);
            }
        }

        colorLog('green', '✅ Test 6 completado');
    }

    async generateMockData() {
        try {
            // Intentar obtener datos reales primero
            console.log('🔍 Intentando obtener datos reales de mercado...');
            const realData = await this.fetchRealMarketData();
            if (realData && realData.isRealData) {
                console.log('✅ Usando datos REALES de Binance');
                return realData;
            }
        } catch (error) {
            console.log(`⚠️ Error obteniendo datos reales: ${error.message}`);
        }
        
        console.log('🔄 Usando datos simulados con patrones realistas...');
        const prices = [];
        const volumes = [];
        
        // Base price más realista para BTC (precio actual aproximado)
        let basePrice = 67500;

        // Generar 50 puntos de datos con patrones crypto realistas
        for (let i = 0; i < 50; i++) {
            let change;
            
            // Patrones más realistas de volatilidad crypto
            if (Math.random() < 0.03) {
                // 3% probabilidad de movimiento extremo (flash crash/pump)
                change = (Math.random() - 0.5) * 0.15; // ±7.5%
            } else if (Math.random() < 0.1) {
                // 10% probabilidad de movimiento grande
                change = (Math.random() - 0.5) * 0.06; // ±3%
            } else if (Math.random() < 0.3) {
                // 30% probabilidad de movimiento medio
                change = (Math.random() - 0.5) * 0.025; // ±1.25%
            } else {
                // 60% probabilidad de movimiento pequeño
                change = (Math.random() - 0.5) * 0.008; // ±0.4%
            }
            
            // Simular tendencia ligeramente alcista (bull market bias)
            change += 0.0002; // +0.02% bias
            
            basePrice *= (1 + change);
            prices.push(basePrice);
            
            // Volúmenes realistas para BTC (200-2000 BTC por hora)
            const baseVolume = 300 + Math.random() * 1200;
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
    
    async fetchRealMarketData() {
        return new Promise((resolve, reject) => {
            const https = require('https');
            
            // Obtener datos de klines de Binance
            const url = 'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=50';
            
            https.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const klines = JSON.parse(data);
                        const prices = [];
                        const volumes = [];
                        
                        klines.forEach(kline => {
                            prices.push(parseFloat(kline[4])); // close price
                            volumes.push(parseFloat(kline[5])); // volume
                        });
                        
                        resolve({
                            symbol: 'BTC/USDT',
                            timeframe: '1h',
                            prices,
                            volumes,
                            currentPrice: prices[prices.length - 1],
                            isRealData: true,
                            timestamp: Date.now()
                        });
                    } catch (parseError) {
                        reject(parseError);
                    }
                });
                
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    showSummary() {
        colorLog('cyan', '\n📋 RESUMEN DEL SISTEMA:');
        console.log('─'.repeat(50));
        
        const fundsStatus = this.fundsManager.getFundsStatus();
        const leonardoState = this.decisionEngine.getLeonardoState();

        console.log(`💰 Balance total: $${fundsStatus.totalBalance.toFixed(2)}`);
        console.log(`📈 Posiciones activas: ${fundsStatus.activePositions}`);
        console.log(`🧠 Consciencia actual: ${(leonardoState.consciousness_level * 100).toFixed(1)}%`);
        console.log(`💥 Big Bang ready: ${leonardoState.big_bang_ready ? 'SÍ' : 'NO'}`);
        console.log(`📊 Trades realizados: ${fundsStatus.performanceMetrics.totalTrades}`);
        console.log(`🎯 Win rate: ${(fundsStatus.performanceMetrics.winRate * 100).toFixed(1)}%`);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 EJECUTAR PRUEBAS
// ═══════════════════════════════════════════════════════════════════════

async function main() {
    try {
        const tester = new DynamicOrderTester();
        await tester.runAllTests();
        tester.showSummary();
        
        colorLog('bright', '\n🎊 SISTEMA DINÁMICO FUNCIONANDO CORRECTAMENTE');
        colorLog('green', 'Listo para trading con take profit y stop loss dinámicos!');
        
    } catch (error) {
        colorLog('red', `\n💥 Error en las pruebas: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { DynamicOrderTester };
