/*
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
  Binance Request Validator - Validador de parámetros de peticiones Binance
  Evita errores 400 y optimiza todas las peticiones
*/

class BinanceRequestValidator {
    constructor() {
        this.minOrderValue = 5.0; // Valor mínimo de orden en USDT
        this.maxOrderValue = 1000000; // Valor máximo teórico
        this.validTimeframes = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
        this.validOrderTypes = ['MARKET', 'LIMIT', 'STOP', 'TAKE_PROFIT', 'STOP_MARKET', 'TAKE_PROFIT_MARKET', 'TRAILING_STOP_MARKET'];
        this.validSides = ['BUY', 'SELL'];
        this.maxLimitPrice = 1000000;
        this.minQuantityPrecision = 8;
        
        console.log('[BINANCE VALIDATOR] ✅ Validador de parámetros inicializado');
    }

    // **VALIDAR SÍMBOLO**
    validateSymbol(symbol) {
        if (!symbol || typeof symbol !== 'string') {
            return { isValid: false, error: 'Símbolo inválido o vacío' };
        }

        // Verificar formato básico USDT
        if (!symbol.endsWith('USDT')) {
            return { isValid: false, error: 'Solo se admiten símbolos USDT' };
        }

        // Verificar caracteres válidos
        if (!/^[A-Z0-9]+USDT$/.test(symbol)) {
            return { isValid: false, error: 'Formato de símbolo inválido' };
        }

        return { isValid: true };
    }

    // **VALIDAR CANTIDAD**
    validateQuantity(quantity, symbol = '') {
        if (!quantity || quantity <= 0) {
            return { isValid: false, error: 'Cantidad debe ser mayor que 0' };
        }

        // Verificar precisión decimal (máximo 8 decimales)
        const decimalPlaces = (quantity.toString().split('.')[1] || '').length;
        if (decimalPlaces > this.minQuantityPrecision) {
            return { 
                isValid: false, 
                error: `Máximo ${this.minQuantityPrecision} decimales permitidos para cantidad` 
            };
        }

        return { isValid: true };
    }

    // **VALIDAR PRECIO**
    validatePrice(price) {
        if (!price || price <= 0) {
            return { isValid: false, error: 'Precio debe ser mayor que 0' };
        }

        if (price > this.maxLimitPrice) {
            return { isValid: false, error: `Precio excede límite máximo: ${this.maxLimitPrice}` };
        }

        return { isValid: true };
    }

    // **VALIDAR VALOR DE ORDEN**
    validateOrderValue(quantity, price) {
        const orderValue = quantity * price;
        
        if (orderValue < this.minOrderValue) {
            return { 
                isValid: false, 
                error: `Valor de orden (${orderValue.toFixed(2)} USDT) menor al mínimo: ${this.minOrderValue} USDT` 
            };
        }

        if (orderValue > this.maxOrderValue) {
            return { 
                isValid: false, 
                error: `Valor de orden (${orderValue.toFixed(2)} USDT) excede máximo: ${this.maxOrderValue} USDT` 
            };
        }

        return { isValid: true, value: orderValue };
    }

    // **VALIDAR TIPO DE ORDEN**
    validateOrderType(orderType) {
        if (!orderType || !this.validOrderTypes.includes(orderType)) {
            return { 
                isValid: false, 
                error: `Tipo de orden inválido. Válidos: ${this.validOrderTypes.join(', ')}` 
            };
        }

        return { isValid: true };
    }

    // **VALIDAR LADO DE ORDEN**
    validateSide(side) {
        if (!side || !this.validSides.includes(side.toUpperCase())) {
            return { 
                isValid: false, 
                error: `Lado de orden inválido. Válidos: ${this.validSides.join(', ')}` 
            };
        }

        return { isValid: true };
    }

    // **VALIDAR LADO DE ORDEN**
    validateSide(side) {
        if (!side || !this.validSides.includes(side)) {
            return { 
                isValid: false, 
                error: `Lado de orden inválido. Válidos: ${this.validSides.join(', ')}` 
            };
        }

        return { isValid: true };
    }

    // **VALIDAR TIMEFRAME**
    validateTimeframe(timeframe) {
        if (!timeframe || !this.validTimeframes.includes(timeframe)) {
            return { 
                isValid: false, 
                error: `Timeframe inválido. Válidos: ${this.validTimeframes.join(', ')}` 
            };
        }

        return { isValid: true };
    }

    // **VALIDAR LEVERAGE**
    validateLeverage(leverage) {
        if (!leverage || leverage < 1 || leverage > 125) {
            return { 
                isValid: false, 
                error: 'Leverage debe estar entre 1 y 125' 
            };
        }

        return { isValid: true };
    }

    // **VALIDAR PARÁMETROS COMPLETOS DE ORDEN**
    validateOrderParams(params) {
        const errors = [];
        
        // Validar símbolo
        const symbolValidation = this.validateSymbol(params.symbol);
        if (!symbolValidation.isValid) {
            errors.push(symbolValidation.error);
        }

        // Validar lado
        const sideValidation = this.validateSide(params.side);
        if (!sideValidation.isValid) {
            errors.push(sideValidation.error);
        }

        // Validar tipo de orden
        const orderTypeValidation = this.validateOrderType(params.type);
        if (!orderTypeValidation.isValid) {
            errors.push(orderTypeValidation.error);
        }

        // Validar cantidad
        if (params.quantity) {
            const quantityValidation = this.validateQuantity(params.quantity);
            if (!quantityValidation.isValid) {
                errors.push(quantityValidation.error);
            }
        }

        // Validar precio (si es orden con precio)
        if (params.price) {
            const priceValidation = this.validatePrice(params.price);
            if (!priceValidation.isValid) {
                errors.push(priceValidation.error);
            }

            // Validar valor de orden
            if (params.quantity) {
                const orderValueValidation = this.validateOrderValue(params.quantity, params.price);
                if (!orderValueValidation.isValid) {
                    errors.push(orderValueValidation.error);
                }
            }
        }

        // Validar leverage si está presente
        if (params.leverage) {
            const leverageValidation = this.validateLeverage(params.leverage);
            if (!leverageValidation.isValid) {
                errors.push(leverageValidation.error);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            message: errors.length === 0 ? 'Parámetros válidos' : errors.join(', ')
        };
    }

    // **SANITIZAR PARÁMETROS**
    sanitizeOrderParams(params) {
        const sanitized = { ...params };

        // Limpiar símbolo
        if (sanitized.symbol) {
            sanitized.symbol = sanitized.symbol.toString().toUpperCase().trim();
        }

        // Limpiar lado y tipo
        if (sanitized.side) {
            sanitized.side = sanitized.side.toString().toUpperCase().trim();
        }

        if (sanitized.type) {
            sanitized.type = sanitized.type.toString().toUpperCase().trim();
        }

        // Redondear cantidad a precisión adecuada
        if (sanitized.quantity) {
            sanitized.quantity = parseFloat(parseFloat(sanitized.quantity).toFixed(this.minQuantityPrecision));
        }

        // Redondear precio a precisión adecuada
        if (sanitized.price) {
            sanitized.price = parseFloat(parseFloat(sanitized.price).toFixed(8));
        }

        return sanitized;
    }

    // **VALIDAR LÍMITES DE RATE LIMIT**
    validateRateLimit(requestsInLastMinute, ordersInLastSecond) {
        const errors = [];

        // Límite de requests por minuto
        if (requestsInLastMinute > 1200) {
            errors.push('Límite de requests por minuto excedido (1200)');
        }

        // Límite de órdenes por segundo
        if (ordersInLastSecond > 10) {
            errors.push('Límite de órdenes por segundo excedido (10)');
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            canProceed: errors.length === 0
        };
    }

    // **VALIDAR REQUEST COMPLETO**
    validateRequest(method, endpoint, params, headers) {
        const errors = [];
        let validatedParams = { ...params };
        let validatedHeaders = { ...headers };
        let requiresSignature = false;
        let queryString = '';

        try {
            // Validar método HTTP
            if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) {
                errors.push(`Método HTTP inválido: ${method}`);
            }

            // Validar endpoint
            if (!endpoint || typeof endpoint !== 'string') {
                errors.push('Endpoint inválido o vacío');
            }

            // Validar parámetros según el endpoint
            if (endpoint.includes('fapi/v1/order') || endpoint.includes('fapi/v2/order')) {
                // Validar parámetros de orden
                if (params.symbol) {
                    const symbolValidation = this.validateSymbol(params.symbol);
                    if (!symbolValidation.isValid) {
                        errors.push(symbolValidation.error);
                    }
                }

                if (params.quantity) {
                    const quantityValidation = this.validateQuantity(params.quantity, params.symbol);
                    if (!quantityValidation.isValid) {
                        errors.push(quantityValidation.error);
                    }
                }

                if (params.price) {
                    const priceValidation = this.validatePrice(params.price);
                    if (!priceValidation.isValid) {
                        errors.push(priceValidation.error);
                    }
                }

                if (params.side) {
                    const sideValidation = this.validateSide(params.side);
                    if (!sideValidation.isValid) {
                        errors.push(sideValidation.error);
                    }
                }

                if (params.type) {
                    const typeValidation = this.validateOrderType(params.type);
                    if (!typeValidation.isValid) {
                        errors.push(typeValidation.error);
                    }
                }

                // Validar valor de orden si tenemos cantidad y precio
                if (params.quantity && params.price) {
                    const valueValidation = this.validateOrderValue(params.quantity, params.price);
                    if (!valueValidation.isValid) {
                        errors.push(valueValidation.error);
                    }
                }

                requiresSignature = true;
            }

            // Validar timestamp para endpoints que lo requieren
            if (endpoint.includes('fapi/v1/') || endpoint.includes('fapi/v2/')) {
                if (!validatedParams.timestamp) {
                    validatedParams.timestamp = Date.now();
                }
            }

            // Sanitizar parámetros
            validatedParams = this.sanitizeOrderParams(validatedParams);

            // Construir query string para firma si es necesario
            if (requiresSignature && Object.keys(validatedParams).length > 0) {
                queryString = Object.keys(validatedParams)
                    .sort()
                    .map(key => `${key}=${validatedParams[key]}`)
                    .join('&');
            }

            // Validar headers
            if (!validatedHeaders['X-MBX-APIKEY']) {
                validatedHeaders['X-MBX-APIKEY'] = process.env.BINANCE_API_KEY || '';
            }

            return {
                valid: errors.length === 0,
                errors: errors,
                params: validatedParams,
                headers: validatedHeaders,
                requiresSignature: requiresSignature,
                queryString: queryString
            };

        } catch (error) {
            console.error('[VALIDATOR] Error en validación de request:', error.message);
            return {
                valid: false,
                errors: [`Error interno del validador: ${error.message}`],
                params: validatedParams,
                headers: validatedHeaders,
                requiresSignature: false,
                queryString: ''
            };
        }
    }

    // **OBTENER CONFIGURACIÓN OPTIMIZADA**
    getOptimizedParams(symbol, quantity, price, side, orderType = 'MARKET') {
        // Sanitizar parámetros de entrada
        const params = this.sanitizeOrderParams({
            symbol,
            quantity,
            price,
            side,
            type: orderType
        });

        // Validar parámetros
        const validation = this.validateOrderParams(params);
        
        if (!validation.isValid) {
            console.warn(`[VALIDATOR] ⚠️ Parámetros inválidos: ${validation.message}`);
            return { success: false, errors: validation.errors };
        }

        // Optimizar para máximo rendimiento
        const optimizedParams = {
            ...params,
            newOrderRespType: 'RESULT', // Respuesta completa
            timestamp: Date.now()
        };

        // Agregar parámetros específicos según tipo de orden
        if (orderType === 'MARKET') {
            delete optimizedParams.price; // No necesario para market orders
            delete optimizedParams.timeInForce;
        } else if (orderType === 'LIMIT') {
            optimizedParams.timeInForce = 'GTC'; // Good Till Canceled
        }

        return {
            success: true,
            params: optimizedParams,
            validation: validation
        };
    }
}

module.exports = { BinanceRequestValidator };
