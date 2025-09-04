/*
  BINANCE SYMBOLS FETCHER - API OFICIAL
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES
  
  Obtiene y documenta la lista oficial de TODOS los futuros perpetuos de Binance
  Soporta hasta 1,979 símbolos simultáneamente según especificaciones cuánticas
*/

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class BinanceSymbolsFetcher {
    constructor() {
        this.baseURL = 'https://fapi.binance.com';
        this.symbols = {
            all: [],
            perpetual: [],
            active: [],
            development: []
        };
        this.statistics = {
            totalSymbols: 0,
            perpetualSymbols: 0,
            activeSymbols: 0,
            quoteCurrencies: new Map(),
            symbolCategories: new Map(),
            volumeRanking: []
        };
    }

    async fetchAllBinanceSymbols() {
        try {
            console.log('[BINANCE FETCHER] Obteniendo informacion oficial de exchange...');
            
            const response = await axios.get(`${this.baseURL}/fapi/v1/exchangeInfo`, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'QBTC-Unified-System/3.0'
                }
            });

            if (!response.data || !response.data.symbols) {
                throw new Error('Respuesta invalida de API - no contiene symbols');
            }

            this.symbols.all = response.data.symbols;
            console.log(`[BINANCE FETCHER] ${this.symbols.all.length} símbolos totales obtenidos`);

            // Filtrar solo futuros perpetuos
            this.symbols.perpetual = this.symbols.all.filter(symbol => 
                symbol.contractType === 'PERPETUAL'
            );
            console.log(`[BINANCE FETCHER] ${this.symbols.perpetual.length} futuros perpetuos identificados`);

            // Filtrar solo activos (trading activo)
            this.symbols.active = this.symbols.perpetual.filter(symbol => 
                symbol.status === 'TRADING'
            );
            console.log(`[BINANCE FETCHER] ${this.symbols.active.length} futuros activos para trading`);

            // Obtener datos de 24h para ranking por volumen
            await this.fetch24HrStatistics();

            // Analizar y categorizar símbolos
            this.analyzeSymbols();

            // Generar lista de desarrollo (40 símbolos)
            this.generateDevelopmentSymbols();

            return {
                success: true,
                totalSymbols: this.symbols.active.length,
                data: this.symbols
            };

        } catch (error) {
            console.error('[BINANCE FETCHER] Error obteniendo símbolos:', error.message);
            return {
                success: false,
                error: error.message,
                fallbackUsed: false
            };
        }
    }

    async fetch24HrStatistics() {
        try {
            console.log('[BINANCE FETCHER] Obteniendo estadisticas 24hr para ranking...');
            
            const response = await axios.get(`${this.baseURL}/fapi/v1/ticker/24hr`, {
                timeout: 15000
            });

            if (response.data && Array.isArray(response.data)) {
                // Crear mapa de volúmenes para ranking
                const volumeMap = new Map();
                response.data.forEach(ticker => {
                    volumeMap.set(ticker.symbol, {
                        volume: parseFloat(ticker.volume || 0),
                        quoteVolume: parseFloat(ticker.quoteVolume || 0),
                        priceChange: parseFloat(ticker.priceChangePercent || 0),
                        count: parseInt(ticker.count || 0)
                    });
                });

                // Enriquecer símbolos activos con datos de volumen
                this.symbols.active.forEach(symbol => {
                    const stats = volumeMap.get(symbol.symbol);
                    if (stats) {
                        symbol.volume24h = stats.volume;
                        symbol.quoteVolume24h = stats.quoteVolume;
                        symbol.priceChange24h = stats.priceChange;
                        symbol.tradeCount24h = stats.count;
                    }
                });

                // Crear ranking por volumen
                this.statistics.volumeRanking = this.symbols.active
                    .filter(s => s.volume24h > 0)
                    .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
                    .slice(0, 200) // Top 200 por volumen
                    .map(s => ({
                        symbol: s.symbol,
                        volume: s.volume24h,
                        quoteVolume: s.quoteVolume24h,
                        priceChange: s.priceChange24h
                    }));

                console.log('[BINANCE FETCHER] Estadisticas 24hr obtenidas y procesadas');
            }

        } catch (error) {
            console.warn('[BINANCE FETCHER] Warning: No se pudieron obtener estadísticas 24hr:', error.message);
        }
    }

    analyzeSymbols() {
        console.log('[BINANCE FETCHER] Analizando y categorizando símbolos...');

        this.statistics.totalSymbols = this.symbols.all.length;
        this.statistics.perpetualSymbols = this.symbols.perpetual.length;
        this.statistics.activeSymbols = this.symbols.active.length;

        // Analizar quote currencies
        this.symbols.active.forEach(symbol => {
            const quoteCurrency = this.extractQuoteCurrency(symbol.symbol);
            const currentCount = this.statistics.quoteCurrencies.get(quoteCurrency) || 0;
            this.statistics.quoteCurrencies.set(quoteCurrency, currentCount + 1);

            // Categorizar símbolo
            const category = this.categorizeSymbol(symbol.symbol);
            const categoryCount = this.statistics.symbolCategories.get(category) || 0;
            this.statistics.symbolCategories.set(category, categoryCount + 1);
        });

        console.log('[BINANCE FETCHER] Análisis completado:');
        console.log(`  - Quote currencies: ${Array.from(this.statistics.quoteCurrencies.keys()).join(', ')}`);
        console.log(`  - Categorías: ${Array.from(this.statistics.symbolCategories.keys()).join(', ')}`);
    }

    extractQuoteCurrency(symbol) {
        const commonQuotes = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB'];
        for (const quote of commonQuotes) {
            if (symbol.endsWith(quote)) {
                return quote;
            }
        }
        return 'OTHER';
    }

    categorizeSymbol(symbol) {
        // Categorías basadas en el análisis del QuantumMarketMaker existente
        if (this.isMajorCoin(symbol)) return 'MAJOR';
        if (this.isMemeCoin(symbol)) return 'MEME';
        if (this.isDarkSide(symbol)) return 'DARK';
        if (this.isDeFi(symbol)) return 'DEFI';
        if (this.isLayer1(symbol)) return 'LAYER1';
        if (this.isGameFi(symbol)) return 'GAMING';
        return 'EXOTIC';
    }

    isMajorCoin(symbol) {
        const majors = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'MATIC', 'DOT', 'AVAX', 'LINK', 'UNI'];
        return majors.some(major => symbol.includes(major));
    }

    isMemeCoin(symbol) {
        const memes = ['SHIB', 'DOGE', 'PEPE', 'FLOKI', 'WIF', 'BONK', 'BOME', 'MEME'];
        return memes.some(meme => symbol.includes(meme));
    }

    isDarkSide(symbol) {
        const dark = ['1000', 'RATS', 'SATS', 'ORDI', 'STX'];
        return dark.some(d => symbol.includes(d));
    }

    isDeFi(symbol) {
        const defi = ['UNI', 'SUSHI', 'CAKE', 'COMP', 'AAVE', 'MKR', 'YFI', 'CRV'];
        return defi.some(d => symbol.includes(d));
    }

    isLayer1(symbol) {
        const layer1 = ['ADA', 'SOL', 'AVAX', 'DOT', 'ATOM', 'NEAR', 'FTM', 'ALGO'];
        return layer1.some(l1 => symbol.includes(l1));
    }

    isGameFi(symbol) {
        const gaming = ['AXS', 'MANA', 'SAND', 'ENJ', 'GMT', 'APE'];
        return gaming.some(g => symbol.includes(g));
    }

    generateDevelopmentSymbols() {
        console.log('[BINANCE FETCHER] Generando lista de 40 símbolos para desarrollo...');

        // Lista curada de 40 símbolos para desarrollo
        const developmentList = [
            // Majors (10)
            'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
            'XRPUSDT', 'DOTUSDT', 'AVAXUSDT', 'MATICUSDT', 'LINKUSDT',
            
            // Meme coins (10)
            'DOGEUSDT', 'SHIBUSDT', 'PEPEUSDT', '1000FLOKIUSDT', 'WIFUSDT',
            'BONKUSDT', 'BOMEUSDT', 'MEMEUSDT', '1000RATSUSDT', '1000SATSUSDT',
            
            // Dark side (10)
            'ORDIUSDT', 'INJUSDT', 'STXUSDT', 'JUPUSDT', 'TNSRUSDT',
            'PYUSDT', 'ALTUSDT', 'ARKUSDT', 'PIXELUSDT', 'ACEUSDT',
            
            // Exotics (10)
            'APTUSDT', 'NEARUSDT', 'FTMUSDT', 'ATOMUSDT', 'ICPUSDT',
            'ALGOUSDT', 'HBARUSDT', 'VETUSDT', 'XMRUSDT', 'FILUSDT'
        ];

        // Verificar que todos los símbolos existen en la lista activa
        const activeSymbolNames = this.symbols.active.map(s => s.symbol);
        this.symbols.development = developmentList.filter(symbol => 
            activeSymbolNames.includes(symbol)
        );

        // Si faltan símbolos, completar con top volume
        if (this.symbols.development.length < 40) {
            const needed = 40 - this.symbols.development.length;
            const additional = this.statistics.volumeRanking
                .filter(s => !this.symbols.development.includes(s.symbol))
                .slice(0, needed)
                .map(s => s.symbol);
            
            this.symbols.development = this.symbols.development.concat(additional);
        }

        console.log(`[BINANCE FETCHER] Lista de desarrollo: ${this.symbols.development.length} símbolos`);
    }

    async saveSymbolsToFiles() {
        console.log('[BINANCE FETCHER] Guardando símbolos en archivos...');

        const outputDir = path.join(__dirname, '../config/symbols');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 1. Lista completa de futuros perpetuos activos
        const allSymbolsData = {
            timestamp: new Date().toISOString(),
            total: this.symbols.active.length,
            maxSupported: 1979, // Según QuantumInfiniteCache
            symbols: this.symbols.active.map(s => ({
                symbol: s.symbol,
                baseAsset: s.baseAsset,
                quoteAsset: s.quoteAsset,
                category: this.categorizeSymbol(s.symbol),
                volume24h: s.volume24h || 0,
                priceChange24h: s.priceChange24h || 0
            }))
        };

        fs.writeFileSync(
            path.join(outputDir, 'binance-perpetual-futures-complete.json'),
            JSON.stringify(allSymbolsData, null, 2),
            'utf8'
        );

        // 2. Lista de desarrollo (40 símbolos)
        const devSymbolsData = {
            timestamp: new Date().toISOString(),
            environment: 'DEVELOPMENT',
            total: this.symbols.development.length,
            symbols: this.symbols.development
        };

        fs.writeFileSync(
            path.join(outputDir, 'binance-development-symbols.json'),
            JSON.stringify(devSymbolsData, null, 2),
            'utf8'
        );

        // 3. Estadísticas y análisis
        const statsData = {
            timestamp: new Date().toISOString(),
            statistics: {
                totalExchangeSymbols: this.statistics.totalSymbols,
                perpetualFutures: this.statistics.perpetualSymbols,
                activeTrading: this.statistics.activeSymbols,
                quoteCurrencies: Object.fromEntries(this.statistics.quoteCurrencies),
                categories: Object.fromEntries(this.statistics.symbolCategories)
            },
            topVolumeSymbols: this.statistics.volumeRanking.slice(0, 50)
        };

        fs.writeFileSync(
            path.join(outputDir, 'binance-symbols-statistics.json'),
            JSON.stringify(statsData, null, 2),
            'utf8'
        );

        console.log('[BINANCE FETCHER] Archivos guardados en:', outputDir);
        return outputDir;
    }

    generateASCIIReport() {
        const report = `
╔══════════════════════════════════════════════════════════════╗
║                  BINANCE SYMBOLS ANALYSIS                   ║
║              FUTURES PERPETUOS - REPORTE OFICIAL            ║
╠══════════════════════════════════════════════════════════════╣
║ Timestamp: ${new Date().toISOString().padEnd(43)} ║
║ Sistema: QBTC Unified Quantum System v3.0                   ║
╠══════════════════════════════════════════════════════════════╣
║                       ESTADISTICAS                          ║
╠══════════════════════════════════════════════════════════════╣
║ Total Symbols Exchange: ${String(this.statistics.totalSymbols).padStart(4)} símbolos            ║
║ Futuros Perpetuos:      ${String(this.statistics.perpetualSymbols).padStart(4)} símbolos            ║
║ Trading Activo:         ${String(this.statistics.activeSymbols).padStart(4)} símbolos            ║
║ Desarrollo (Fixed):       40 símbolos            ║
║ Max Soportados:         1979 símbolos            ║
╠══════════════════════════════════════════════════════════════╣
║                    QUOTE CURRENCIES                         ║
╠══════════════════════════════════════════════════════════════╣`;

        // Agregar quote currencies
        for (const [quote, count] of this.statistics.quoteCurrencies) {
            const line = `║ ${quote.padEnd(6)}: ${String(count).padStart(4)} símbolos`;
            report += '\n' + line.padEnd(61) + '║';
        }

        const report2 = `
╠══════════════════════════════════════════════════════════════╣
║                     CATEGORIAS                              ║
╠══════════════════════════════════════════════════════════════╣`;

        // Agregar categorías
        let categoryReport = '';
        for (const [category, count] of this.statistics.symbolCategories) {
            const line = `║ ${category.padEnd(8)}: ${String(count).padStart(4)} símbolos`;
            categoryReport += '\n' + line.padEnd(61) + '║';
        }

        const report3 = `
╠══════════════════════════════════════════════════════════════╣
║                 TOP 10 POR VOLUMEN 24H                      ║
╠══════════════════════════════════════════════════════════════╣`;

        let volumeReport = '';
        this.statistics.volumeRanking.slice(0, 10).forEach((symbol, index) => {
            const rank = String(index + 1).padStart(2);
            const sym = symbol.symbol.padEnd(12);
            const vol = this.formatVolume(symbol.volume).padStart(10);
            const change = `${symbol.priceChange?.toFixed(1) || '0.0'}%`.padStart(7);
            const line = `║ ${rank}. ${sym} ${vol} ${change}`;
            volumeReport += '\n' + line.padEnd(61) + '║';
        });

        const report4 = `
╠══════════════════════════════════════════════════════════════╣
║              LISTA DESARROLLO (40 SÍMBOLOS)                 ║
╠══════════════════════════════════════════════════════════════╣`;

        let devReport = '';
        for (let i = 0; i < this.symbols.development.length; i += 4) {
            const batch = this.symbols.development.slice(i, i + 4);
            const line = `║ ${batch.map(s => s.padEnd(12)).join(' ')}`;
            devReport += '\n' + line.padEnd(61) + '║';
        }

        const reportEnd = `
╚══════════════════════════════════════════════════════════════╝`;

        return report + report2 + categoryReport + report3 + volumeReport + report4 + devReport + reportEnd;
    }

    formatVolume(volume) {
        if (!volume) return '0';
        if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
        if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
        if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
        return volume.toFixed(0);
    }

    async generateFullReport() {
        try {
            // Obtener todos los símbolos
            const result = await this.fetchAllBinanceSymbols();
            
            if (!result.success) {
                throw new Error(`Error obteniendo símbolos: ${result.error}`);
            }

            // Guardar archivos
            const outputDir = await this.saveSymbolsToFiles();

            // Generar reporte ASCII
            const asciiReport = this.generateASCIIReport();
            
            // Guardar reporte ASCII
            fs.writeFileSync(
                path.join(outputDir, 'BINANCE_SYMBOLS_REPORT.txt'),
                asciiReport,
                'utf8'
            );

            console.log('\n' + asciiReport);
            console.log(`\n[BINANCE FETCHER] ✅ Reporte completo generado en: ${outputDir}`);

            return {
                success: true,
                outputDirectory: outputDir,
                statistics: this.statistics,
                symbols: this.symbols
            };

        } catch (error) {
            console.error('[BINANCE FETCHER] ❌ Error generando reporte:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    (async () => {
        console.log('[BINANCE FETCHER] 🚀 Iniciando análisis de símbolos de Binance...\n');
        
        const fetcher = new BinanceSymbolsFetcher();
        const result = await fetcher.generateFullReport();
        
        if (result.success) {
            console.log('\n[BINANCE FETCHER] ✅ Análisis completado exitosamente');
            process.exit(0);
        } else {
            console.log('\n[BINANCE FETCHER] ❌ Error en el análisis:', result.error);
            process.exit(1);
        }
    })();
}

module.exports = BinanceSymbolsFetcher;
