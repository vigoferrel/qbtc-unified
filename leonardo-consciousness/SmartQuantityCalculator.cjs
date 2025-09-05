/**
 * SMART QUANTITY CALCULATOR - Leonardo Trading Bot
 * Sistema inteligente de cálculo de cantidades con precisión dinámica por asset
 * 
 * Maneja diferentes precisiones:
 * - BTC: 6-8 decimales
 * - ETH: 6-8 decimales  
 * - FLOKI, SHIB, PEPE: 0-2 decimales (muchas unidades)
 * - USDT pairs: Variable según el asset base
 */

class SmartQuantityCalculator {
    constructor() {
        // Configuraciones específicas por asset conocidos
        this.assetConfig = new Map([
            // Cryptos principales (alta precisión, pocos decimales)
            ['BTC', { precision: 8, minDecimals: 6, maxDecimals: 8, stepSizeDefault: 0.00001 }],
            ['ETH', { precision: 8, minDecimals: 6, maxDecimals: 8, stepSizeDefault: 0.001 }],
            ['BNB', { precision: 8, minDecimals: 3, maxDecimals: 8, stepSizeDefault: 0.001 }],
            
            // Altcoins intermedios
            ['ADA', { precision: 6, minDecimals: 2, maxDecimals: 6, stepSizeDefault: 0.1 }],
            ['DOT', { precision: 6, minDecimals: 3, maxDecimals: 6, stepSizeDefault: 0.01 }],
            ['LINK', { precision: 6, minDecimals: 2, maxDecimals: 6, stepSizeDefault: 0.01 }],
            
            // Meme coins y tokens de bajo valor (baja precisión, muchas unidades)
            ['SHIB', { precision: 2, minDecimals: 0, maxDecimals: 2, stepSizeDefault: 1000 }],
            ['FLOKI', { precision: 2, minDecimals: 0, maxDecimals: 2, stepSizeDefault: 100 }],
            ['PEPE', { precision: 2, minDecimals: 0, maxDecimals: 2, stepSizeDefault: 10000 }],
            ['DOGE', { precision: 4, minDecimals: 1, maxDecimals: 4, stepSizeDefault: 1 }],
            
            // Stablecoins
            ['USDT', { precision: 6, minDecimals: 2, maxDecimals: 6, stepSizeDefault: 0.01 }],
            ['USDC', { precision: 6, minDecimals: 2, maxDecimals: 6, stepSizeDefault: 0.01 }],
            ['BUSD', { precision: 6, minDecimals: 2, maxDecimals: 6, stepSizeDefault: 0.01 }],
        ]);
        
        // Configuración por defecto para assets desconocidos
        this.defaultConfig = {
            precision: 6,
            minDecimals: 2,
            maxDecimals: 6,
            stepSizeDefault: 0.001
        };
        
        console.log('🧮 SmartQuantityCalculator inicializado con configuraciones para', this.assetConfig.size, 'assets');
    }
    
    /**
     * Extraer el asset base del símbolo de trading
     */
    extractBaseAsset(symbol) {
        // Casos comunes: BTCUSDT -> BTC, ETHUSDT -> ETH, FLOKIUSDT -> FLOKI
        if (symbol.endsWith('USDT')) {
            return symbol.replace('USDT', '');
        }
        if (symbol.endsWith('USDC')) {
            return symbol.replace('USDC', '');
        }
        if (symbol.endsWith('BTC')) {
            return symbol.replace('BTC', '');
        }
        if (symbol.endsWith('ETH')) {
            return symbol.replace('ETH', '');
        }
        if (symbol.endsWith('BNB')) {
            return symbol.replace('BNB', '');
        }
        
        // Fallback: asumir que el símbolo es el asset base
        return symbol;
    }
    
    /**
     * Obtener configuración para un asset específico
     */
    getAssetConfig(symbol) {
        const baseAsset = this.extractBaseAsset(symbol);
        return this.assetConfig.get(baseAsset) || this.defaultConfig;
    }
    
    /**
     * Determinar la precisión óptima basada en stepSize de Binance
     */
    determineOptimalPrecision(stepSize, config) {
        if (!stepSize || stepSize === 0) {
            return config.precision;
        }
        
        // Contar decimales en stepSize
        const stepStr = stepSize.toString();
        if (stepStr.includes('.')) {
            const decimals = stepStr.split('.')[1].length;
            return Math.min(decimals + 1, config.maxDecimals); // +1 para seguridad
        }
        
        return config.minDecimals;
    }
    
    /**
     * Redondear cantidad según stepSize de manera inteligente
     */
    roundToStepSize(quantity, stepSize, precision) {
        if (!stepSize || stepSize === 0) {
            return parseFloat(quantity.toFixed(precision));
        }
        
        // Redondear hacia abajo para asegurar que no excedemos
        const steps = Math.floor(quantity / stepSize);
        const roundedQty = steps * stepSize;
        
        return parseFloat(roundedQty.toFixed(precision));
    }
    
    /**
     * Calcular cantidad inteligente basada en positionSize y filtros de Binance
     */
    async calculateSmartQuantity(symbol, positionSize, exchangeFilters = null, currentPrice = null) {
        try {
            const config = this.getAssetConfig(symbol);
            const baseAsset = this.extractBaseAsset(symbol);
            
            console.log(`🧮 Calculando cantidad inteligente para ${symbol} (${baseAsset}):`);
            console.log(`   Position Size: $${positionSize}`);
            console.log(`   Asset Config:`, config);
            
            // Obtener precio actual si no se proporciona
            let price = currentPrice;
            if (!price || price <= 0) {
                throw new Error(`Precio inválido para ${symbol}: ${price}`);
            }
            
            // Calcular cantidad base
            let quantity = positionSize / price;
            console.log(`   Cantidad base: ${quantity} ${baseAsset}`);
            
            // Aplicar filtros de Binance si están disponibles
            let finalPrecision = config.precision;
            let stepSize = config.stepSizeDefault;
            let minQty = 0;
            let minNotional = 0;
            
            if (exchangeFilters) {
                // LOT_SIZE o MARKET_LOT_SIZE
                const lotFilter = exchangeFilters.lotSize || exchangeFilters.marketLotSize;
                if (lotFilter) {
                    stepSize = parseFloat(lotFilter.stepSize) || stepSize;
                    minQty = parseFloat(lotFilter.minQty) || 0;
                    console.log(`   Filtro Lot: stepSize=${stepSize}, minQty=${minQty}`);
                }
                
                // MIN_NOTIONAL
                if (exchangeFilters.minNotional) {
                    minNotional = parseFloat(exchangeFilters.minNotional.notional || exchangeFilters.minNotional.minNotional) || 0;
                    console.log(`   Min Notional: $${minNotional}`);
                }
                
                // Determinar precisión óptima
                finalPrecision = this.determineOptimalPrecision(stepSize, config);
            }
            
            // Aplicar minNotional si es necesario
            if (minNotional > 0) {
                const currentNotional = quantity * price;
                if (currentNotional < minNotional) {
                    quantity = (minNotional * 1.01) / price; // +1% de buffer
                    console.log(`   Ajustado por minNotional: ${quantity} ${baseAsset} (valor: $${(quantity * price).toFixed(2)})`);
                }
            }
            
            // Redondear a stepSize
            quantity = this.roundToStepSize(quantity, stepSize, finalPrecision);
            console.log(`   Redondeado a stepSize: ${quantity} ${baseAsset}`);
            
            // Verificar minQty
            if (minQty > 0 && quantity < minQty) {
                quantity = minQty;
                console.log(`   Ajustado por minQty: ${quantity} ${baseAsset}`);
            }
            
            // Validaciones finales
            const finalNotional = quantity * price;
            const result = {
                success: true,
                quantity: quantity,
                quantityFormatted: quantity.toFixed(finalPrecision),
                precision: finalPrecision,
                notionalValue: finalNotional,
                stepSize: stepSize,
                minQty: minQty,
                minNotional: minNotional,
                baseAsset: baseAsset,
                config: config
            };
            
            console.log(`   ✅ Cantidad final: ${result.quantityFormatted} ${baseAsset}`);
            console.log(`   💰 Valor notional: $${finalNotional.toFixed(2)}`);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Error calculando cantidad para ${symbol}:`, error.message);
            return {
                success: false,
                error: error.message,
                quantity: 0,
                quantityFormatted: '0',
                precision: 6
            };
        }
    }
    
    /**
     * Validar que la cantidad cumple todos los requisitos de Binance
     */
    validateQuantity(symbol, quantity, price, exchangeFilters = null) {
        const errors = [];
        const warnings = [];
        
        if (!quantity || quantity <= 0) {
            errors.push('Cantidad debe ser mayor que cero');
        }
        
        if (!price || price <= 0) {
            errors.push('Precio debe ser mayor que cero');
        }
        
        const notionalValue = quantity * price;
        
        if (exchangeFilters) {
            // Verificar LOT_SIZE
            const lotFilter = exchangeFilters.lotSize || exchangeFilters.marketLotSize;
            if (lotFilter) {
                const minQty = parseFloat(lotFilter.minQty) || 0;
                const maxQty = parseFloat(lotFilter.maxQty) || Infinity;
                const stepSize = parseFloat(lotFilter.stepSize) || 0;
                
                if (quantity < minQty) {
                    errors.push(`Cantidad ${quantity} menor que minQty ${minQty}`);
                }
                
                if (quantity > maxQty) {
                    errors.push(`Cantidad ${quantity} mayor que maxQty ${maxQty}`);
                }
                
                if (stepSize > 0) {
                    const remainder = quantity % stepSize;
                    if (remainder > 0.0000001) { // Tolerancia para errores de punto flotante
                        warnings.push(`Cantidad no alineada con stepSize ${stepSize}`);
                    }
                }
            }
            
            // Verificar MIN_NOTIONAL
            if (exchangeFilters.minNotional) {
                const minNotional = parseFloat(exchangeFilters.minNotional.notional || exchangeFilters.minNotional.minNotional) || 0;
                if (notionalValue < minNotional) {
                    errors.push(`Valor notional $${notionalValue.toFixed(2)} menor que mínimo $${minNotional}`);
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            notionalValue: notionalValue,
            symbol: symbol
        };
    }
    
    /**
     * Método de conveniencia para obtener cantidad lista para Binance
     */
    async getOrderQuantity(symbol, positionSizeUSD, currentPrice, exchangeFilters = null) {
        const calculation = await this.calculateSmartQuantity(symbol, positionSizeUSD, exchangeFilters, currentPrice);
        
        if (!calculation.success) {
            throw new Error(`Failed to calculate quantity: ${calculation.error}`);
        }
        
        // Validar la cantidad calculada
        const validation = this.validateQuantity(symbol, calculation.quantity, currentPrice, exchangeFilters);
        
        if (!validation.valid) {
            throw new Error(`Invalid quantity: ${validation.errors.join(', ')}`);
        }
        
        if (validation.warnings.length > 0) {
            console.warn(`⚠️ Quantity warnings for ${symbol}:`, validation.warnings.join(', '));
        }
        
        return calculation.quantityFormatted;
    }
    
    /**
     * Método para testing con diferentes assets
     */
    async testQuantityCalculation(testCases) {
        console.log('🧪 TESTING SMART QUANTITY CALCULATOR');
        console.log('═══════════════════════════════════════');
        
        for (const testCase of testCases) {
            console.log(`\n🔍 Test: ${testCase.symbol}`);
            try {
                const result = await this.calculateSmartQuantity(
                    testCase.symbol,
                    testCase.positionSize,
                    testCase.filters,
                    testCase.price
                );
                
                if (result.success) {
                    console.log(`   ✅ Success: ${result.quantityFormatted} ${result.baseAsset}`);
                } else {
                    console.log(`   ❌ Failed: ${result.error}`);
                }
            } catch (error) {
                console.log(`   💥 Error: ${error.message}`);
            }
        }
    }
}

module.exports = SmartQuantityCalculator;
