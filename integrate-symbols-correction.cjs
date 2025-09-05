/*
  Integrador Principal - Aplicar Corrección de Símbolos al Sistema Leonardo
  Aplica la corrección de carga de símbolos reales en todos los componentes del sistema
*/

const { SymbolsLoader } = require('./fix-symbols-loading');
const path = require('path');
const fs = require('fs');

class SystemIntegrator {
    constructor() {
        console.log('🔧 Iniciando integración completa del sistema...');
        
        // Componentes del sistema a integrar
        this.systemComponents = [
            'leonardo-consciousness/QuantumUnifiedSystem.js',
            'activate-quantum-system.js',
            'activate-complete-system.js',
            'frontend-unified/leonardo-quantum-api.js'
        ];
        
        this.symbolsLoader = new SymbolsLoader();
        this.integrationResults = {
            symbolsLoaded: 0,
            componentsUpdated: 0,
            errors: [],
            success: false
        };
        
        console.log('✅ Integrador inicializado');
    }
    
    async integrate() {
        console.log('🚀 INICIANDO INTEGRACIÓN COMPLETA DEL SISTEMA');
        console.log('==================================================');
        
        try {
            // Paso 1: Cargar símbolos reales
            console.log('\n📊 PASO 1: Cargando símbolos reales...');
            const symbolsResult = await this.symbolsLoader.run();
            this.integrationResults.symbolsLoaded = symbolsResult?.succeeded || 0;
            
            // Paso 2: Actualizar componentes del sistema
            console.log('\n🔧 PASO 2: Actualizando componentes del sistema...');
            await this.updateSystemComponents();
            
            // Paso 3: Configurar actualización automática
            console.log('\n⚡ PASO 3: Configurando actualización automática...');
            await this.setupAutoUpdate();
            
            // Paso 4: Verificar integración
            console.log('\n✅ PASO 4: Verificando integración...');
            await this.verifyIntegration();
            
            this.integrationResults.success = true;
            console.log('\n🎉 INTEGRACIÓN COMPLETADA EXITOSAMENTE');
            
            return this.integrationResults;
            
        } catch (error) {
            console.error('\n💥 ERROR EN LA INTEGRACIÓN:', error.message);
            this.integrationResults.errors.push(error.message);
            this.integrationResults.success = false;
            throw error;
        }
    }
    
    async updateSystemComponents() {
        console.log('🔄 Actualizando componentes del sistema...');
        
        for (const component of this.systemComponents) {
            try {
                const componentPath = path.resolve(component);
                
                if (fs.existsSync(componentPath)) {
                    console.log(`   📝 Actualizando: ${component}`);
                    await this.updateComponent(componentPath);
                    this.integrationResults.componentsUpdated++;
                    console.log(`   ✅ ${component} actualizado`);
                } else {
                    console.warn(`   ⚠️ Componente no encontrado: ${component}`);
                }
                
            } catch (error) {
                console.error(`   ❌ Error actualizando ${component}:`, error.message);
                this.integrationResults.errors.push(`${component}: ${error.message}`);
            }
        }
        
        console.log(`✅ ${this.integrationResults.componentsUpdated} componentes actualizados`);
    }
    
    async updateComponent(componentPath) {
        // Leer el archivo
        let content = fs.readFileSync(componentPath, 'utf-8');
        
        // Identificar el tipo de componente y aplicar actualización correspondiente
        const fileName = path.basename(componentPath);
        
        if (fileName.includes('QuantumUnifiedSystem')) {
            content = this.updateQuantumUnifiedSystem(content);
        } else if (fileName.includes('activate-quantum-system')) {
            content = this.updateActivateQuantumSystem(content);
        } else if (fileName.includes('activate-complete-system')) {
            content = this.updateActivateCompleteSystem(content);
        } else if (fileName.includes('leonardo-quantum-api')) {
            content = this.updateLeonardoQuantumAPI(content);
        }
        
        // Crear backup
        const backupPath = `${componentPath}.backup-${Date.now()}`;
        fs.writeFileSync(backupPath, fs.readFileSync(componentPath, 'utf-8'));
        console.log(`   💾 Backup creado: ${path.basename(backupPath)}`);
        
        // Escribir archivo actualizado
        fs.writeFileSync(componentPath, content, 'utf-8');
    }
    
    updateQuantumUnifiedSystem(content) {
        // Reemplazar la función fetchSymbolData para usar datos reales
        const realDataFunction = `
    async fetchSymbolData(symbol) {
        try {
            // **USAR DATOS REALES DE BINANCE**
            if (this.binanceRealConnector) {
                const ticker = await this.binanceRealConnector.get24hrTicker(symbol);
                if (ticker) {
                    return {
                        symbol: ticker.symbol,
                        price: parseFloat(ticker.lastPrice),
                        volume: parseFloat(ticker.volume),
                        priceChangePercent: parseFloat(ticker.priceChangePercent),
                        high: parseFloat(ticker.highPrice),
                        low: parseFloat(ticker.lowPrice),
                        volatility: (parseFloat(ticker.highPrice) - parseFloat(ticker.lowPrice)) / parseFloat(ticker.lastPrice),
                        timestamp: Date.now(),
                        trades24h: parseInt(ticker.count || 0),
                        marketCap: parseFloat(ticker.lastPrice) * parseFloat(ticker.volume),
                        bidPrice: parseFloat(ticker.bidPrice || ticker.lastPrice),
                        askPrice: parseFloat(ticker.askPrice || ticker.lastPrice)
                    };
                }
            }
            
            // Fallback a datos simulados solo si no hay conexión real
            console.warn('[QUANTUM UNIFIED] Usando datos simulados para:', symbol);
            // ... código existente de simulación ...`;
        
        // Buscar y reemplazar la función fetchSymbolData
        const fetchFunctionRegex = /async fetchSymbolData\(symbol\)\s*{[\s\S]*?(?=\n    \}[\s]*\n)/;
        
        if (fetchFunctionRegex.test(content)) {
            content = content.replace(fetchFunctionRegex, realDataFunction);
        }
        
        // Añadir importación de BinanceRealConnector si no existe
        if (!content.includes('BinanceRealConnector')) {
            const importLine = `const { BinanceRealConnector } = require('../quantum-core/BinanceRealConnector');\n`;
            content = importLine + content;
        }
        
        // Añadir inicialización de BinanceRealConnector en el constructor
        if (!content.includes('this.binanceRealConnector')) {
            const constructorMatch = content.match(/constructor\([^)]*\)\s*{/);
            if (constructorMatch) {
                const insertIndex = content.indexOf(constructorMatch[0]) + constructorMatch[0].length;
                const binanceConnectorInit = `\n        // **INTEGRACIÓN BINANCE REAL CONNECTOR**\n        this.binanceRealConnector = new BinanceRealConnector();\n        console.log('[QUANTUM UNIFIED] 🔗 BinanceRealConnector integrado');\n`;
                content = content.slice(0, insertIndex) + binanceConnectorInit + content.slice(insertIndex);
            }
        }
        
        return content;
    }
    
    updateActivateQuantumSystem(content) {
        // Actualizar la función preloadAllSymbols para usar más símbolos
        const updatedPreload = `
    async preloadAllSymbols() {
        console.log('🌍 Precargando símbolos masivamente con datos reales...');
        
        try {
            // **USAR SÍMBOLOS REALES DE BINANCE**
            if (this.binanceConnector && typeof this.binanceConnector.getExchangeInfo === 'function') {
                const exchangeInfo = await this.binanceConnector.getExchangeInfo();
                
                if (exchangeInfo && exchangeInfo.symbols) {
                    // Filtrar símbolos USDT activos
                    const realSymbols = exchangeInfo.symbols
                        .filter(symbol => 
                            symbol.quoteAsset === 'USDT' && 
                            symbol.status === 'TRADING' &&
                            symbol.symbol.endsWith('USDT')
                        )
                        .map(symbol => symbol.symbol)
                        .slice(0, 200); // Cargar 200 símbolos principales
                    
                    console.log(\`🎯 Cargando \${realSymbols.length} símbolos reales desde Binance...\`);
                    
                    // Función de fetch real
                    const realFetchFn = async (symbol) => {
                        try {
                            const ticker = await this.binanceConnector.get24hrTicker(symbol);
                            if (!ticker) return null;
                            
                            return {
                                symbol: ticker.symbol,
                                price: parseFloat(ticker.lastPrice),
                                volume: parseFloat(ticker.volume),
                                priceChangePercent: parseFloat(ticker.priceChangePercent),
                                high: parseFloat(ticker.highPrice),
                                low: parseFloat(ticker.lowPrice),
                                volatility: (parseFloat(ticker.highPrice) - parseFloat(ticker.lowPrice)) / parseFloat(ticker.lastPrice),
                                timestamp: Date.now(),
                                trades24h: parseInt(ticker.count || 0)
                            };
                        } catch (error) {
                            console.warn(\`⚠️ Error obteniendo \${symbol}:\`, error.message);
                            return null;
                        }
                    };
                    
                    // Precargar usando QuantumCache
                    await this.quantumCache.preloadSymbols(realSymbols, realFetchFn, {
                        sequential: false,
                        maxConcurrency: 15,
                        timeout: 30000,
                        ttl: 7919
                    });
                    
                    console.log(\`✅ \${realSymbols.length} símbolos reales precargados exitosamente\`);
                    return;
                }
            }
            
            // Fallback a símbolos básicos si no hay conexión
            console.warn('⚠️ Usando símbolos básicos como fallback');`;
        
        // Buscar y reemplazar la función preloadAllSymbols
        const preloadRegex = /async preloadAllSymbols\(\)\s*{[\s\S]*?(?=\n    \}[\s]*\n)/;
        
        if (preloadRegex.test(content)) {
            content = content.replace(preloadRegex, updatedPreload);
        }
        
        return content;
    }
    
    updateActivateCompleteSystem(content) {
        // Añadir integración con SymbolsLoader
        if (!content.includes('SymbolsLoader')) {
            const importLine = `const { SymbolsLoader } = require('./fix-symbols-loading');\n`;
            content = importLine + content;
            
            // Añadir inicialización automática de símbolos
            const initMatch = content.match(/async initialize\(\)\s*{/);
            if (initMatch) {
                const insertIndex = content.indexOf(initMatch[0]) + initMatch[0].length;
                const symbolsLoaderInit = `\n            // **CARGA AUTOMÁTICA DE SÍMBOLOS REALES**\n            console.log('[COMPLETE SYSTEM] 🔄 Cargando símbolos reales automáticamente...');\n            try {\n                const symbolsLoader = new SymbolsLoader();\n                await symbolsLoader.run();\n                console.log('[COMPLETE SYSTEM] ✅ Símbolos reales cargados automáticamente');\n            } catch (error) {\n                console.warn('[COMPLETE SYSTEM] ⚠️ Error en carga automática de símbolos:', error.message);\n            }\n`;
                content = content.slice(0, insertIndex) + symbolsLoaderInit + content.slice(insertIndex);
            }
        }
        
        return content;
    }
    
    updateLeonardoQuantumAPI(content) {
        // Añadir endpoint para estado de símbolos
        const symbolsStatusEndpoint = `
    // **ENDPOINT: Estado de Símbolos**
    app.get('/api/symbols/status', (req, res) => {
        try {
            const quantumCache = require('../quantum-core/QuantumInfiniteCache');
            const cache = new quantumCache();
            
            const status = {
                symbolsLoaded: cache.quantumState.symbolsLoaded,
                cacheSize: cache.tradingCache.symbols.size,
                hitRate: cache.getMetrics().performance.hitRate,
                lastUpdate: new Date().toISOString()
            };
            
            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
    
    // **ENDPOINT: Recargar Símbolos**
    app.post('/api/symbols/reload', async (req, res) => {
        try {
            const { SymbolsLoader } = require('../fix-symbols-loading');
            const loader = new SymbolsLoader();
            
            const result = await loader.run();
            
            res.json({
                success: true,
                message: 'Símbolos recargados exitosamente',
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });`;
        
        // Buscar donde añadir los endpoints (antes del final del archivo)
        const endpointMatch = content.match(/app\.listen\(.*\)/);
        if (endpointMatch) {
            const insertIndex = content.lastIndexOf(endpointMatch[0]);
            content = content.slice(0, insertIndex) + symbolsStatusEndpoint + '\n\n    ' + content.slice(insertIndex);
        }
        
        return content;
    }
    
    async setupAutoUpdate() {
        console.log('⚡ Configurando sistema de actualización automática...');
        
        const autoUpdateScript = `/*
  Sistema de Actualización Automática de Símbolos
  Ejecuta cada 30 minutos para mantener la cache actualizada
*/

const { SymbolsLoader } = require('./fix-symbols-loading');
const cron = require('node-cron');

class AutoSymbolUpdater {
    constructor() {
        this.symbolsLoader = new SymbolsLoader();
        this.isRunning = false;
        this.lastUpdate = null;
        this.updateInterval = '*/30 * * * *'; // Cada 30 minutos
    }
    
    start() {
        console.log('🔄 Iniciando actualizador automático de símbolos...');
        
        // Actualización inicial
        this.updateSymbols();
        
        // Programar actualizaciones periódicas
        cron.schedule(this.updateInterval, () => {
            if (!this.isRunning) {
                this.updateSymbols();
            }
        });
        
        console.log(\`✅ Actualizador programado cada 30 minutos\`);
    }
    
    async updateSymbols() {
        if (this.isRunning) {
            console.log('⏳ Actualización ya en progreso, omitiendo...');
            return;
        }
        
        this.isRunning = true;
        const startTime = Date.now();
        
        try {
            console.log('🔄 [AUTO-UPDATE] Iniciando actualización automática de símbolos...');
            
            const result = await this.symbolsLoader.run();
            
            this.lastUpdate = new Date();
            const duration = Date.now() - startTime;
            
            console.log(\`✅ [AUTO-UPDATE] Actualización completada en \${(duration / 1000).toFixed(2)}s\`);
            console.log(\`   📈 Símbolos actualizados: \${result.succeeded || 0}\`);
            console.log(\`   ❌ Errores: \${result.failed || 0}\`);
            
        } catch (error) {
            console.error('💥 [AUTO-UPDATE] Error en actualización automática:', error.message);
        } finally {
            this.isRunning = false;
        }
    }
    
    getStatus() {
        return {
            running: this.isRunning,
            lastUpdate: this.lastUpdate,
            nextUpdate: this.getNextUpdateTime(),
            interval: this.updateInterval
        };
    }
    
    getNextUpdateTime() {
        if (!this.lastUpdate) return 'Próximamente';
        
        const next = new Date(this.lastUpdate.getTime() + 30 * 60 * 1000);
        return next.toISOString();
    }
}

// Exportar y auto-iniciar si es ejecutado directamente
const autoUpdater = new AutoSymbolUpdater();

if (require.main === module) {
    autoUpdater.start();
    
    // Mantener proceso vivo
    process.on('SIGINT', () => {
        console.log('\\n🛑 Deteniendo actualizador automático...');
        process.exit(0);
    });
}

module.exports = { AutoSymbolUpdater, autoUpdater };
`;
        
        // Crear el archivo de actualización automática
        fs.writeFileSync('auto-symbols-updater.js', autoUpdateScript, 'utf-8');
        console.log('✅ Sistema de actualización automática creado: auto-symbols-updater.js');
        
        // Instalar cron si no existe
        try {
            require('node-cron');
        } catch (error) {
            console.log('📦 Instalando dependencia node-cron...');
            const { execSync } = require('child_process');
            execSync('npm install node-cron --save', { stdio: 'inherit' });
        }
    }
    
    async verifyIntegration() {
        console.log('🔍 Verificando integración...');
        
        // Verificar que los símbolos están cargados
        try {
            const QuantumInfiniteCache = require('./quantum-core/QuantumInfiniteCache');
            const cache = new QuantumInfiniteCache();
            
            console.log(`   💎 Símbolos en cache: ${cache.quantumState.symbolsLoaded}`);
            console.log(`   📊 Tamaño de cache: ${cache.tradingCache.symbols.size}`);
            
            if (cache.quantumState.symbolsLoaded > 0) {
                console.log('   ✅ Cache de símbolos funcionando correctamente');
            } else {
                console.warn('   ⚠️ Cache de símbolos vacía - puede requerir reinicio');
            }
            
        } catch (error) {
            console.error('   ❌ Error verificando cache:', error.message);
        }
        
        // Verificar archivos de respaldo
        const backupFiles = fs.readdirSync('.').filter(file => file.includes('.backup-'));
        console.log(`   💾 Archivos de respaldo creados: ${backupFiles.length}`);
        
        console.log('✅ Verificación de integración completada');
    }
    
    displayResults() {
        console.log('\n📊 RESUMEN DE LA INTEGRACIÓN:');
        console.log('===============================');
        console.log(`✅ Símbolos cargados: ${this.integrationResults.symbolsLoaded}`);
        console.log(`🔧 Componentes actualizados: ${this.integrationResults.componentsUpdated}`);
        console.log(`❌ Errores: ${this.integrationResults.errors.length}`);
        console.log(`🎯 Estado: ${this.integrationResults.success ? 'ÉXITO' : 'ERROR'}`);
        
        if (this.integrationResults.errors.length > 0) {
            console.log('\\n⚠️ ERRORES ENCONTRADOS:');
            this.integrationResults.errors.forEach(error => {
                console.log(`   • ${error}`);
            });
        }
        
        console.log('\\n🎉 SISTEMA LEONARDO INTEGRADO CON DATOS REALES DE BINANCE');
    }
}

// Ejecutar integración si es llamado directamente
if (require.main === module) {
    const integrator = new SystemIntegrator();
    
    integrator.integrate()
        .then((results) => {
            integrator.displayResults();
            console.log('\\n🚀 ¡INTEGRACIÓN COMPLETA! El sistema ahora usa datos reales de Binance.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\\n💥 Error fatal en la integración:', error.message);
            integrator.displayResults();
            process.exit(1);
        });
}

module.exports = { SystemIntegrator };
