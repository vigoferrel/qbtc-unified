/*
  Script para solucionar el problema de carga de símbolos
  Conecta BinanceRealConnector con QuantumInfiniteCache para cargar símbolos reales
*/

const { BinanceRealConnector } = require('./quantum-core/BinanceRealConnector');
const QuantumInfiniteCache = require('./quantum-core/QuantumInfiniteCache');

class SymbolsLoader {
    constructor() {
        console.log('🔧 Inicializando corrector de carga de símbolos...');
        
        // Inicializar conectores
        this.binanceConnector = new BinanceRealConnector();
        this.quantumCache = new QuantumInfiniteCache();
        
        console.log('✅ Componentes inicializados');
    }
    
    async testBinanceConnection() {
        console.log('🧪 Probando conexión con Binance...');
        
        try {
            // Test básico: obtener información de exchange
            const exchangeInfo = await this.binanceConnector.getExchangeInfo();
            
            if (exchangeInfo && exchangeInfo.symbols) {
                console.log(`✅ Conexión exitosa - ${exchangeInfo.symbols.length} símbolos disponibles`);
                return true;
            } else {
                console.log('❌ No se pudo obtener información del exchange');
                return false;
            }
        } catch (error) {
            console.error('❌ Error conectando con Binance:', error.message);
            return false;
        }
    }
    
    async loadRealSymbols() {
        console.log('📊 Cargando símbolos reales desde Binance...');
        
        try {
            // 1. Obtener lista de símbolos de Binance
            const exchangeInfo = await this.binanceConnector.getExchangeInfo();
            
            if (!exchangeInfo || !exchangeInfo.symbols) {
                throw new Error('No se pudo obtener información del exchange');
            }
            
            // 2. Filtrar solo símbolos USDT de futuros activos
            console.log('📋 Analizando estructura de símbolos de futuros...');
            console.log('Ejemplo de símbolo:', JSON.stringify(exchangeInfo.symbols[0], null, 2));
            
            const futuresSymbols = exchangeInfo.symbols
                .filter(symbol => {
                    // Para Binance Futures, la estructura es diferente
                    return symbol.quoteAsset === 'USDT' && 
                           symbol.status === 'TRADING' &&
                           symbol.symbol.endsWith('USDT') &&
                           (symbol.contractType === 'PERPETUAL' || !symbol.contractType) // Filtrar perpetuos principalmente
                })
                .map(symbol => symbol.symbol)
                .slice(0, 350); // Cargar 350 símbolos principales
            
            console.log(`🎯 Seleccionados ${futuresSymbols.length} símbolos USDT activos`);
            
            // 3. Crear función de fetch real
            const realFetchFn = async (symbol) => {
                try {
                    // Obtener datos de ticker de 24h
                    const ticker = await this.binanceConnector.get24hrTicker(symbol);
                    
                    if (!ticker) {
                        throw new Error(`No data for ${symbol}`);
                    }
                    
                    return {
                        symbol: ticker.symbol,
                        price: parseFloat(ticker.lastPrice),
                        volume: parseFloat(ticker.volume),
                        priceChangePercent: parseFloat(ticker.priceChangePercent),
                        high: parseFloat(ticker.highPrice),
                        low: parseFloat(ticker.lowPrice),
                        bidPrice: parseFloat(ticker.bidPrice || ticker.lastPrice),
                        askPrice: parseFloat(ticker.askPrice || ticker.lastPrice),
                        timestamp: Date.now(),
                        
                        // Calcular volatilidad basada en high/low
                        volatility: (parseFloat(ticker.highPrice) - parseFloat(ticker.lowPrice)) / parseFloat(ticker.lastPrice),
                        
                        // Datos adicionales
                        trades24h: parseInt(ticker.count || 0),
                        marketCap: parseFloat(ticker.lastPrice) * parseFloat(ticker.volume), // Aproximado
                    };
                } catch (error) {
                    console.warn(`⚠️ Error obteniendo datos para ${symbol}:`, error.message);
                    return null;
                }
            };
            
            // 4. Cargar símbolos en la cache
            console.log('🔄 Iniciando precarga de símbolos reales...');
            
            const startTime = Date.now();
            const result = await this.quantumCache.preloadSymbols(
                futuresSymbols,
                realFetchFn,
                {
                    sequential: false,
                    timeout: 45000,  // 45 segundos timeout
                    maxConcurrency: 10, // Máximo 10 peticiones simultáneas
                    ttl: 30000  // 30 segundos TTL
                }
            );
            
            const duration = Date.now() - startTime;
            
            console.log('✅ PRECARGA COMPLETADA:');
            console.log(`   📈 Exitosos: ${result.succeeded}`);
            console.log(`   ❌ Fallidos: ${result.failed}`);
            console.log(`   ⏱️ Duración: ${(duration / 1000).toFixed(2)}s`);
            
            // 5. Verificar estado de la cache
            await this.displayCacheStatus();
            
            return result;
            
        } catch (error) {
            console.error('💥 Error cargando símbolos:', error);
            throw error;
        }
    }
    
    async displayCacheStatus() {
        console.log('');
        console.log('📊 ESTADO ACTUAL DE LA CACHE:');
        
        // Obtener métricas de la cache
        const metrics = this.quantumCache.getMetrics();
        const health = this.quantumCache.validateSystemHealth();
        
        console.log(`   💎 Símbolos cargados: ${this.quantumCache.quantumState.symbolsLoaded}`);
        console.log(`   📈 Hit rate: ${metrics.performance.hitRate}`);
        console.log(`   ⚡ Latencia promedio: ${metrics.performance.avgLatency}`);
        console.log(`   🔥 Precargas exitosas: ${metrics.performance.preloadSuccess}`);
        console.log(`   🎯 Estado del sistema: ${health.status}`);
        
        if (health.warnings && health.warnings.length > 0) {
            console.log(`   ⚠️ Advertencias: ${health.warnings.join(', ')}`);
        }
        
        // Mostrar algunos símbolos cargados como ejemplo
        const symbolsMap = this.quantumCache.tradingCache.symbols;
        if (symbolsMap.size > 0) {
            console.log('');
            console.log('🎯 SÍMBOLOS CARGADOS (ejemplos):');
            let count = 0;
            for (const [symbol, data] of symbolsMap.entries()) {
                if (count < 10) {  // Mostrar solo los primeros 10
                    const symbolData = data.data;
                    console.log(`   ${symbol}: $${symbolData.price?.toFixed(6) || 'N/A'} (${symbolData.priceChangePercent?.toFixed(2) || 'N/A'}%)`);
                    count++;
                }
            }
            if (symbolsMap.size > 10) {
                console.log(`   ... y ${symbolsMap.size - 10} más`);
            }
        }
        
        console.log('');
    }
    
    async categorizeSymbols() {
        console.log('🏷️ Categorizando símbolos...');
        
        const symbolsMap = this.quantumCache.tradingCache.symbols;
        const categories = {
            'Majors': [],
            'DeFi': [],
            'Gaming': [],
            'AI': [],
            'Layer1': [],
            'Layer2': [],
            'Meme': [],
            'Privacy': [],
            'Oracle': [],
            'Storage': [],
            'Infrastructure': [],
            'NFT': [],
            'Stablecoins': [],
            'RWA': [], // Real World Assets
            'Exóticos': []
        };
        
        // Definir patrones expandidos para categorización
        const patterns = {
            'Majors': ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'TRX', 'TON', 'AVAX', 'SHIB', 'DOT', 'LINK', 'BCH', 'LTC', 'NEAR', 'MATIC', 'ICP', 'UNI', 'APT'],
            'DeFi': ['UNI', 'SUSHI', 'CAKE', 'AAVE', 'COMP', 'MKR', 'YFI', 'CRV', '1INCH', 'SNX', 'DYDX', 'GMX', 'RUNE', 'ALPHA', 'BETA', 'AUTO', 'BAKE', 'BURGER', 'SXP', 'XVS', 'VAI', 'CREAM', 'FOR', 'BNT', 'KNC', 'LRC', 'ZRX', 'BAL', 'REN', 'FARM', 'HEGIC', 'PICKLE', 'COVER', 'VALUE', 'EPS', 'TRU', 'BADGER', 'DPI', 'FLI'],
            'Gaming': ['AXS', 'SAND', 'MANA', 'GALA', 'ENJ', 'CHZ', 'ALICE', 'TLM', 'SLP', 'PYR', 'ILV', 'WAXP', 'WIN', 'FUN', 'LOKA', 'C98', 'YGG', 'GHST', 'SKILL', 'THG', 'UFT', 'POLS', 'SUPER', 'NAKA', 'REVV', 'FLOW', 'MBOX', 'TOWER', 'GMT', 'GST', 'STEPN', 'MC', 'HERO', 'METIS', 'ATLAS', 'POLIS'],
            'AI': ['FET', 'OCEAN', 'AGI', 'NMR', 'GRT', 'CTXC', 'DPR', 'MDT', 'RNDR', 'PHALA', 'AI', 'ALI', 'CGPT', 'ARKM', 'WLD', 'TAO', 'AGIX', 'ORAI', 'HEART', 'PHB', 'MATRIX', 'DOCK', 'COTI', 'LPT', 'VIDT', 'DATA'],
            'Layer1': ['ETH', 'ADA', 'SOL', 'DOT', 'AVAX', 'ATOM', 'ALGO', 'NEAR', 'FTM', 'LUNA', 'EGLD', 'HBAR', 'ICP', 'VET', 'THETA', 'EOS', 'TRX', 'XTZ', 'WAVES', 'ONT', 'QTUM', 'ZIL', 'ICX', 'KAVA', 'BAND', 'CKB', 'RVN', 'DGB', 'SYS', 'NULS'],
            'Layer2': ['MATIC', 'LRC', 'IMX', 'METIS', 'BOBA', 'ARB', 'OP', 'STRK', 'MANTA', 'BLUR', 'DYDX', 'ZK', 'POLY', 'CELR', 'SKL', 'CTC'],
            'Meme': ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'MEME', 'BABYDOGE', 'ELON', 'AKITA', 'SHIBA', 'KISHU', 'SAMO', 'CATE', 'MYRO', 'BOME', 'SLERF', 'WEN', 'POPCAT', 'MEW', 'BRETT', 'NEIRO', 'TURBO', 'MAGA'],
            'Privacy': ['XMR', 'ZEC', 'DASH', 'TORN', 'SCRT', 'ROSE', 'NYM', 'DERO', 'BEAM', 'GRIN', 'FIRO'],
            'Oracle': ['LINK', 'BAND', 'TRB', 'API3', 'UMA', 'DIA', 'FLUX', 'PYR', 'NEST'],
            'Storage': ['FIL', 'STORJ', 'AR', 'SIA', 'BTT', 'HOT', 'SC', 'SAFE'],
            'Infrastructure': ['RNDR', 'FLUX', 'AKRO', 'NKN', 'POKT', 'HNT', 'IOTX', 'JASMY', 'MOBILE'],
            'NFT': ['BLUR', 'LOOKS', 'X2Y2', 'SUDO', 'NFT', 'WHALE', 'NFTX', 'RARI'],
            'Stablecoins': ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'FRAX', 'LUSD', 'FDUSD', 'USDD'],
            'RWA': ['RIO', 'POLYX', 'PROPS', 'RWA', 'LABS', 'ONDO']
        };
        
        for (const [symbol] of symbolsMap) {
            let categorized = false;
            
            for (const [category, tokens] of Object.entries(patterns)) {
                if (tokens.some(token => symbol.startsWith(token))) {
                    categories[category].push(symbol);
                    categorized = true;
                    break;
                }
            }
            
            if (!categorized) {
                categories['Exóticos'].push(symbol);
            }
        }
        
        console.log('');
        console.log('🗂️ SÍMBOLOS POR CATEGORÍA:');
        for (const [category, symbols] of Object.entries(categories)) {
            if (symbols.length > 0) {
                console.log(`   ${this.getCategoryEmoji(category)} ${category}: ${symbols.length}`);
                if (symbols.length <= 5) {
                    console.log(`      ${symbols.join(', ')}`);
                } else {
                    console.log(`      ${symbols.slice(0, 5).join(', ')} ... (+${symbols.length - 5})`);
                }
            }
        }
        
        return categories;
    }
    
    getCategoryEmoji(category) {
        const emojis = {
            'Majors': '👑',
            'DeFi': '🔗',
            'Gaming': '🎮',
            'AI': '🤖',
            'Layer1': '⛓️',
            'Layer2': '🌉',
            'Meme': '😹',
            'Privacy': '🔐',
            'Oracle': '🔮',
            'Storage': '💾',
            'Infrastructure': '🏗️',
            'NFT': '🎨',
            'Stablecoins': '💰',
            'RWA': '🏢',
            'Exóticos': '🚀'
        };
        return emojis[category] || '📊';
    }
    
    async run() {
        console.log('🚀 INICIANDO CORRECCIÓN DE CARGA DE SÍMBOLOS');
        console.log('===============================================');
        
        try {
            // 1. Probar conexión
            const connected = await this.testBinanceConnection();
            if (!connected) {
                throw new Error('No se puede conectar con Binance');
            }
            
            // 2. Cargar símbolos reales
            await this.loadRealSymbols();
            
            // 3. Categorizar símbolos
            await this.categorizeSymbols();
            
            console.log('');
            console.log('✅ CORRECCIÓN COMPLETADA EXITOSAMENTE');
            console.log('🎯 Los símbolos ahora deberían aparecer correctamente en el sistema');
            
        } catch (error) {
            console.error('💥 ERROR EN LA CORRECCIÓN:', error.message);
            throw error;
        }
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    const loader = new SymbolsLoader();
    
    loader.run()
        .then(() => {
            console.log('');
            console.log('🎉 Proceso completado - símbolos cargados exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('');
            console.error('💥 Error fatal:', error.message);
            process.exit(1);
        });
}

module.exports = { SymbolsLoader };
