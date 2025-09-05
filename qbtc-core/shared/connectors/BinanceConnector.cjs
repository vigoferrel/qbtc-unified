/**
 * QBTC UNIFIED - Binance Connector (PRODUCTION)
 * Conector Binance FUTUROS-ONLY - Sin simulaciones ni referencias SPOT
 */

const { BINANCE } = require('../constants/QBTCConstants');
const SystemConfig = require('../../config/SystemConfig');

class BinanceConnector {
    constructor() {
        if (BinanceConnector.instance) {
            return BinanceConnector.instance;
        }

        this.config = SystemConfig.getBinanceConfig();
        this.wsConnections = new Map();
        this.restClient = null;
        this.isInitialized = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.eventHandlers = new Map();

        BinanceConnector.instance = this;
    }

    static getInstance() {
        if (!BinanceConnector.instance) {
            BinanceConnector.instance = new BinanceConnector();
        }
        return BinanceConnector.instance;
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            const Binance = require('binance-api-node');
            
            this.restClient = Binance.default({
                apiKey: this.config.api.apiKey,
                apiSecret: this.config.api.apiSecret,
                httpBase: 'https://fapi.binance.com',
                wsBase: 'wss://fstream.binance.com',
                futures: true
            });

            await this.validateConnection();
            this.isInitialized = true;
            console.log('[BINANCE CONNECTOR] FUTUROS-ONLY inicializado en PRODUCCIÓN');
            
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al inicializar:', error.message);
            throw error;
        }
    }

    async connect() {
        return this.initialize();
    }

    async validateConnection() {
        try {
            const account = await this.restClient.futuresAccountInfo();
            if (!account) {
                throw new Error('No se pudo obtener información de la cuenta de futuros');
            }
            console.log('[BINANCE CONNECTOR] Conexión FUTUROS validada exitosamente');
            return true;
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al validar conexión futuros:', error.message);
            throw error;
        }
    }

    async getAccountInfo() {
        this.ensureInitialized();
        try {
            return await this.restClient.futuresAccountInfo();
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al obtener información de cuenta futuros:', error.message);
            throw error;
        }
    }

    async getBalance() {
        this.ensureInitialized();
        try {
            const account = await this.restClient.futuresAccountInfo();
            return account.assets || [];
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al obtener balance futuros:', error.message);
            throw error;
        }
    }

    async getPrice(symbol) {
        this.ensureInitialized();
        try {
            const prices = await this.restClient.futuresPrices();
            return prices[symbol];
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al obtener precio:', error.message);
            throw error;
        }
    }

    async getTicker(symbol) {
        const price = await this.getPrice(symbol);
        return { symbol, lastPrice: String(price) };
    }

    async getCandles(symbol, interval = '1h', limit = 100) {
        this.ensureInitialized();
        try {
            return await this.restClient.futuresCandles({
                symbol: symbol,
                interval: interval,
                limit: limit
            });
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al obtener velas:', error.message);
            throw error;
        }
    }

    async getKlines(symbol, interval = '1h', limit = 100) {
        return this.getCandles(symbol, interval, limit);
    }

    async buy(symbol, quantity, type = 'MARKET', price = null) {
        this.ensureInitialized();
        try {
            const orderParams = {
                symbol: symbol,
                side: 'BUY',
                type: type,
                quantity: quantity
            };

            if (type === 'LIMIT' && price) {
                orderParams.price = price;
            }

            return await this.restClient.futuresOrder(orderParams);
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al crear orden de compra:', error.message);
            throw error;
        }
    }

    async sell(symbol, quantity, type = 'MARKET', price = null) {
        this.ensureInitialized();
        try {
            const orderParams = {
                symbol: symbol,
                side: 'SELL',
                type: type,
                quantity: quantity
            };

            if (type === 'LIMIT' && price) {
                orderParams.price = price;
            }

            return await this.restClient.futuresOrder(orderParams);
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al crear orden de venta:', error.message);
            throw error;
        }
    }

    async createOrder(order) {
        const { symbol, side, type = 'MARKET', quantity, price } = order || {};
        if (!symbol || !side || !quantity) {
            throw new Error('[BINANCE CONNECTOR] Parámetros inválidos para createOrder');
        }
        if (side.toUpperCase() === 'BUY') {
            return this.buy(symbol, quantity, type, price);
        }
        return this.sell(symbol, quantity, type, price);
    }

    async cancelOrder(symbol, orderId) {
        this.ensureInitialized();
        try {
            return await this.restClient.futuresCancelOrder({
                symbol: symbol,
                orderId: orderId
            });
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al cancelar orden:', error.message);
            throw error;
        }
    }

    async getOpenOrders(symbol = null) {
        this.ensureInitialized();
        try {
            const params = symbol ? { symbol: symbol } : {};
            return await this.restClient.futuresOpenOrders(params);
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al obtener órdenes abiertas:', error.message);
            throw error;
        }
    }

    async getOrderHistory(symbol = null, limit = 500) {
        this.ensureInitialized();
        try {
            const params = { limit: limit };
            if (symbol) {
                params.symbol = symbol;
            }
            return await this.restClient.futuresAllOrders(params);
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al obtener historial de órdenes:', error.message);
            throw error;
        }
    }

    async getOpenPositions() {
        this.ensureInitialized();
        try {
            const positions = await this.restClient.futuresPositionRisk();
            return positions.filter(p => parseFloat(p.positionAmt) !== 0);
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al obtener posiciones abiertas:', error.message);
            throw error;
        }
    }

    async getPositions() {
        return this.getOpenPositions();
    }

    async subscribeToPriceStream(symbols, callback) {
        this.ensureInitialized();
        try {
            const streamName = `price_${symbols.join('_')}`;
            
            if (this.wsConnections.has(streamName)) {
                console.log(`[BINANCE CONNECTOR] Stream ${streamName} ya existe`);
                return;
            }

            const ws = this.restClient.ws.futuresTrades(symbols, (trades) => {
                callback(trades);
            });

            this.wsConnections.set(streamName, {
                ws: ws,
                symbols: symbols,
                callback: callback,
                type: 'price'
            });

            console.log(`[BINANCE CONNECTOR] Suscrito a stream de precios para: ${symbols.join(', ')}`);
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al suscribirse a stream de precios:', error.message);
            throw error;
        }
    }

    async subscribeToUserData(callback) {
        this.ensureInitialized();
        try {
            if (this.wsConnections.has('userData')) {
                console.log('[BINANCE CONNECTOR] Stream de userData ya existe');
                return;
            }

            const userData = await this.restClient.ws.futuresUser((data) => {
                callback({ type: 'account', data: data });
            });

            this.wsConnections.set('userData', {
                ws: userData,
                callback: callback,
                type: 'userData'
            });

            console.log('[BINANCE CONNECTOR] Suscrito a stream de datos de usuario');
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al suscribirse a stream de usuario:', error.message);
            throw error;
        }
    }

    async unsubscribe(streamName) {
        try {
            const connection = this.wsConnections.get(streamName);
            if (connection) {
                if (connection.ws && typeof connection.ws.close === 'function') {
                    connection.ws.close();
                }
                this.wsConnections.delete(streamName);
                console.log(`[BINANCE CONNECTOR] Stream ${streamName} cancelado`);
            }
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al cancelar stream:', error.message);
        }
    }

    async unsubscribeAll() {
        try {
            for (const [streamName] of this.wsConnections) {
                await this.unsubscribe(streamName);
            }
            console.log('[BINANCE CONNECTOR] Todas las suscripciones canceladas');
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al cancelar todas las suscripciones:', error.message);
        }
    }

    ensureInitialized() {
        if (!this.isInitialized) {
            throw new Error('BinanceConnector no está inicializado. Llame a initialize() primero.');
        }
    }

    async restart() {
        try {
            await this.unsubscribeAll();
            this.isInitialized = false;
            await this.initialize();
            console.log('[BINANCE CONNECTOR] Conector reiniciado correctamente');
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al reiniciar conector:', error.message);
            throw error;
        }
    }

    async close() {
        try {
            await this.unsubscribeAll();
            this.isInitialized = false;
            console.log('[BINANCE CONNECTOR] Conector cerrado correctamente');
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al cerrar conector:', error.message);
        }
    }

    async getFuturesExchangeInfo() {
        this.ensureInitialized();
        try {
            return await this.restClient.futuresExchangeInfo();
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al obtener exchange info:', error.message);
            return { symbols: [] };
        }
    }

    async getFundingRate(symbol) {
        this.ensureInitialized();
        try {
            const arr = await this.restClient.futuresFundingRate({ symbol, limit: 1 });
            if (arr && arr.length > 0 && arr[0].fundingRate !== undefined) {
                return parseFloat(arr[0].fundingRate);
            }
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al obtener funding rate:', error.message);
        }
        return 0;
    }

    async getRecentTrades(symbol, limit = 100) {
        this.ensureInitialized();
        try {
            return await this.restClient.futuresAggTrades({ symbol, limit });
        } catch (error) {
            console.error('[BINANCE CONNECTOR] Error al obtener trades recientes:', error.message);
            return [];
        }
    }

    getStatus() {
        return {
            initialized: this.isInitialized,
            wsConnections: this.wsConnections.size,
            reconnectAttempts: this.reconnectAttempts,
            config: {
                futures: true,
                maxConnections: this.config.ws ? this.config.ws.maxConnections : 5
            }
        };
    }
}

module.exports = BinanceConnector;
