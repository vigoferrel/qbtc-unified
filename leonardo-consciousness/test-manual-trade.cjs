/**
 * TEST MANUAL TRADE - Leonardo Trading Bot
 * Script para ejecutar una operación de trading manual de prueba
 * Observa logs y verifica ejecución en Binance
 */

require('dotenv').config();
const TradingEngineLayer = require('./TradingEngineLayer');
const BinanceConnectorAdapter = require('./BinanceConnectorAdapter');

class ManualTradeTest {
    constructor() {
        this.engine = null;
        this.results = {
            connectionTest: null,
            initialization: null,
            tradeExecution: null,
            errors: []
        };
    }

    async initialize() {
        console.log('🚀 Inicializando test de trade manual...');
        console.log('📊 Configuración del entorno:');
        console.log(`   - Binance Environment: ${process.env.BINANCE_ENVIRONMENT || 'testnet'}`);
        console.log(`   - Real Trading: ${process.env.REAL_TRADING_ENABLED === 'true' ? 'SI' : 'NO'}`);
        console.log(`   - API Key configurada: ${process.env.BINANCE_API_KEY ? 'SI' : 'NO'}`);
        
        try {
            // Crear conector y motor de trading
            const connector = new BinanceConnectorAdapter();
            this.engine = new TradingEngineLayer(connector);
            
            // Test de conectividad inicial
            console.log('🌐 Probando conectividad con Binance...');
            const pingResult = await connector.ping();
            this.results.connectionTest = pingResult;
            
            if (pingResult.success) {
                console.log(`✅ Conectividad OK - Latencia: ${pingResult.latencyMs}ms`);
            } else {
                console.log(`❌ Conectividad FALLA: ${pingResult.error}`);
                this.results.errors.push(`Connection failed: ${pingResult.error}`);
            }
            
            // Inicializar motor
            console.log('🧠 Inicializando motor de trading Leonardo...');
            const initResult = await this.engine.initialize();
            this.results.initialization = initResult;
            
            if (initResult) {
                console.log('✅ Motor inicializado correctamente');
            } else {
                console.log('❌ Error inicializando motor');
                this.results.errors.push('Engine initialization failed');
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error en inicialización:', error.message);
            this.results.errors.push(`Initialization error: ${error.message}`);
            return false;
        }
    }

    async executeManualTrade() {
        console.log('\n💰 Ejecutando trade manual de prueba...');
        
        try {
            // Configurar el motor para trading manual
            this.engine.updateConfig({
                MIN_CONSCIOUSNESS: 0.1,    // Muy bajo para asegurar ejecución
                MIN_CONFIDENCE: 0.1,       // Muy bajo para asegurar ejecución  
                MIN_ALIGNMENT: 0.1,        // Muy bajo para asegurar ejecución
                BAIT_AMOUNT: 1.0,          // $1 como especifica Leonardo
                MAX_CONCURRENT_TRADES: 1   // Solo un trade de prueba
            });

            // Crear oportunidad de prueba manual
            const testOpportunity = {
                symbol: 'BTCUSDT',  // Par más líquido
                timestamp: Date.now(),
                score: 0.8,
                source: 'MANUAL_TEST'
            };

            console.log(`🎯 Simulando oportunidad en ${testOpportunity.symbol}...`);
            
            // Ejecutar evaluación manual
            await this.engine.evaluateOpportunity(testOpportunity);
            
            // Esperar un momento para procesar
            await this.sleep(2000);
            
            // Verificar resultados
            const stats = this.engine.getStats();
            const activePositions = this.engine.getActivePositions();
            const history = this.engine.getExecutionHistory(5);
            
            this.results.tradeExecution = {
                totalTrades: stats.metrics.totalTrades,
                activePositions: activePositions.length,
                lastTrades: history,
                engineStatus: {
                    isActive: stats.isActive,
                    funds: stats.funds
                }
            };
            
            console.log('\n📊 Resultados del test:');
            console.log(`   - Trades ejecutados: ${stats.metrics.totalTrades}`);
            console.log(`   - Posiciones activas: ${activePositions.length}`);
            console.log(`   - Balance total: $${stats.funds?.totalBalance || 0}`);
            
            if (history.length > 0) {
                const lastTrade = history[history.length - 1];
                console.log(`   - Último trade: ${lastTrade.symbol} ${lastTrade.action} (${lastTrade.type})`);
                console.log(`   - ID de orden: ${lastTrade.id}`);
                console.log(`   - Precio: $${lastTrade.entryPrice}`);
            }
            
            if (activePositions.length > 0) {
                console.log('\n🔍 Posiciones activas:');
                activePositions.forEach(pos => {
                    console.log(`   • ${pos.symbol}: ${pos.action} | Tamaño: $${pos.positionSize} | Entrada: $${pos.entryPrice}`);
                });
            }
            
            return stats.metrics.totalTrades > 0;
            
        } catch (error) {
            console.error('❌ Error ejecutando trade manual:', error.message);
            this.results.errors.push(`Trade execution error: ${error.message}`);
            return false;
        }
    }

    async verifyBinanceInterface() {
        console.log('\n🔍 Verificando interface con Binance...');
        
        try {
            const connector = this.engine.binanceConnector;
            
            // Test de información de cuenta
            console.log('📋 Obteniendo información de cuenta...');
            const accountInfo = await connector.getAccountInfo();
            
            if (accountInfo && typeof accountInfo === 'object') {
                console.log('✅ Información de cuenta obtenida correctamente');
                
                // Log algunos detalles (sin exponer información sensible)
                if (accountInfo.assets && Array.isArray(accountInfo.assets)) {
                    const usdtBalance = accountInfo.assets.find(asset => asset.asset === 'USDT');
                    if (usdtBalance) {
                        console.log(`   - Balance USDT: ${usdtBalance.walletBalance || 0}`);
                    }
                }
            } else {
                console.log('⚠️ No se pudo obtener información de cuenta');
            }
            
            // Test de precio
            console.log('💱 Obteniendo precio de BTCUSDT...');
            const price = await connector.getPrice('BTCUSDT');
            
            if (price && price > 0) {
                console.log(`✅ Precio BTCUSDT: $${price}`);
            } else {
                console.log('⚠️ No se pudo obtener precio');
            }
            
        } catch (error) {
            console.error('❌ Error verificando interface Binance:', error.message);
            this.results.errors.push(`Binance interface error: ${error.message}`);
        }
    }

    async monitorLogs() {
        console.log('\n📝 Monitoreando logs del sistema...');
        
        // Simular monitoreo de logs por 10 segundos
        let logCount = 0;
        const originalLog = console.log;
        
        console.log = (...args) => {
            logCount++;
            originalLog(...args);
        };
        
        // Esperar y restaurar
        await this.sleep(5000);
        console.log = originalLog;
        
        console.log(`📊 Se registraron ${logCount} entradas de log durante el monitoreo`);
    }

    async cleanup() {
        console.log('\n🧹 Limpiando recursos...');
        
        try {
            if (this.engine) {
                // Cerrar todas las posiciones de prueba
                const activePositions = this.engine.getActivePositions();
                
                if (activePositions.length > 0) {
                    console.log(`🔐 Cerrando ${activePositions.length} posiciones activas...`);
                    
                    for (const position of activePositions) {
                        await this.engine.closePosition(position.symbol, 'MANUAL_TEST_END');
                        console.log(`   ✅ Cerrada posición ${position.symbol}`);
                    }
                }
                
                // Detener el motor
                await this.engine.stop();
                console.log('✅ Motor de trading detenido');
            }
        } catch (error) {
            console.error('❌ Error en cleanup:', error.message);
        }
    }

    async generateReport() {
        console.log('\n📋 REPORTE FINAL DEL TEST');
        console.log('════════════════════════════════════════');
        
        // Conectividad
        const connStatus = this.results.connectionTest?.success ? '✅ OK' : '❌ FALLA';
        console.log(`Conectividad Binance: ${connStatus}`);
        if (this.results.connectionTest?.latencyMs) {
            console.log(`Latencia: ${this.results.connectionTest.latencyMs}ms`);
        }
        
        // Inicialización
        const initStatus = this.results.initialization ? '✅ OK' : '❌ FALLA';
        console.log(`Inicialización Motor: ${initStatus}`);
        
        // Ejecución de trade
        if (this.results.tradeExecution) {
            const exec = this.results.tradeExecution;
            console.log(`Trades Ejecutados: ${exec.totalTrades}`);
            console.log(`Posiciones Activas: ${exec.activePositions}`);
            
            if (exec.lastTrades && exec.lastTrades.length > 0) {
                console.log('Última Actividad:');
                exec.lastTrades.forEach(trade => {
                    console.log(`  • ${trade.symbol} ${trade.action} - ID: ${trade.id}`);
                });
            }
        }
        
        // Errores
        if (this.results.errors.length > 0) {
            console.log('\n❌ ERRORES ENCONTRADOS:');
            this.results.errors.forEach(error => {
                console.log(`  • ${error}`);
            });
        }
        
        // Conclusión
        const success = this.results.connectionTest?.success && 
                       this.results.initialization && 
                       this.results.errors.length === 0;
        
        console.log('\n🎯 RESULTADO FINAL:');
        if (success) {
            console.log('✅ TEST EXITOSO - Infraestructura funcionando correctamente');
            console.log('✅ Bot preparado para trading real');
        } else {
            console.log('❌ TEST CON PROBLEMAS - Revisar errores arriba');
            console.log('⚠️ Resolver problemas antes de trading real');
        }
        
        console.log('════════════════════════════════════════');
        
        return success;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Función principal
async function runManualTradeTest() {
    const test = new ManualTradeTest();
    
    try {
        console.log('🔄 INICIANDO TEST DE TRADING MANUAL');
        console.log('═══════════════════════════════════');
        
        // Paso 1: Inicialización
        const initialized = await test.initialize();
        if (!initialized) {
            await test.generateReport();
            return;
        }
        
        // Paso 2: Verificar interface Binance
        await test.verifyBinanceInterface();
        
        // Paso 3: Ejecutar trade de prueba
        const tradeExecuted = await test.executeManualTrade();
        
        // Paso 4: Monitorear logs
        await test.monitorLogs();
        
        // Paso 5: Cleanup
        await test.cleanup();
        
        // Paso 6: Generar reporte
        const success = await test.generateReport();
        
        // Código de salida
        process.exit(success ? 0 : 1);
        
    } catch (error) {
        console.error('💥 ERROR CRÍTICO:', error.message);
        console.error('Stack trace:', error.stack);
        
        await test.cleanup();
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runManualTradeTest();
}

module.exports = ManualTradeTest;
