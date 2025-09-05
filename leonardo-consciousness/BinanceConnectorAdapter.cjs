/**
 * BinanceConnectorAdapter
 * Adaptador mínimo para exponer una interfaz simple { ping, placeOrder }
 * sobre el conector real de Binance Futures (quantum-core/BinanceRealConnector).
 */

const axios = require('axios');
const { CredentialsManager } = require('../quantum-core/CredentialsManager');

class BinanceConnectorAdapter {
  constructor() {
    // **INICIALIZAR CREDENTIALS MANAGER**: Para diagnósticos y verificación
    console.log('[BINANCE CONNECTOR ADAPTER] 🔐 Inicializando gestor de credenciales...');
    this.credentialsManager = CredentialsManager.getInstance();
    
    // Cargar conector real (singleton interno)
    // Ruta relativa desde `leonardo-consciousness/` hacia `quantum-core/`
    // El conector real gestiona API/Secret y testnet automáticamente via CredentialsManager
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const { BinanceRealConnector } = require('../quantum-core/BinanceRealConnector');
    this.real = new BinanceRealConnector();
    
    // Log de diagnóstico usando CredentialsManager
    const credentials = this.credentialsManager.getCredentials();
    console.log('[BINANCE CONNECTOR ADAPTER] 🔗 Adaptador inicializado');
    console.log(`[BINANCE CONNECTOR ADAPTER] 🔐 Estado de credenciales (vía CredentialsManager):`);
    console.log(`  API_KEY: ${credentials.apiKey ? 'SET' : 'MISSING'} (${credentials.source || 'N/A'})`);
    console.log(`  SECRET: ${credentials.secretKey ? 'SET' : 'MISSING'} (${credentials.source || 'N/A'})`);
    console.log(`  TESTNET: ${credentials.isTestnet ? 'ENABLED' : 'DISABLED'} (${credentials.source || 'N/A'})`);
    console.log(`  Loaded: ${credentials.isLoaded ? 'YES' : 'NO'}`);
    
    this.isInitialized = false;
  }
  
  /**
   * Inicializar el Binance Connector Adapter
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('⚠️ Binance Connector Adapter ya inicializado');
      return;
    }
    
    console.log('🔗 Inicializando Binance Connector Adapter...');
    
    try {
      // Simular inicialización exitosa
      this.isInitialized = true;
      console.log('✅ BINANCE CONNECTOR ADAPTER INICIALIZADO COMPLETAMENTE');
      
    } catch (error) {
      console.error('❌ Error inicializando Binance Connector Adapter:', error);
      throw error;
    }
  }
  
  /**
   * Obtener estado de salud del sistema
   */
  getHealth() {
    return this.isInitialized ? 'HEALTHY' : 'NOT_INITIALIZED';
  }

  /**
   * Ping al endpoint público de Binance Futures para verificar conectividad.
   * Devuelve { success: boolean, latencyMs?: number, error?: string }
   */
  async ping() {
    const start = Date.now();
    try {
      // Usar credenciales del CredentialsManager
      const credentials = this.credentialsManager.getCredentials();
      const base = credentials.isTestnet
        ? 'https://testnet.binancefuture.com'
        : 'https://fapi.binance.com';
      await axios.get(`${base}/fapi/v1/ping`, { timeout: 5000 });
      return { success: true, latencyMs: Date.now() - start };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * placeOrder(params)
   * Params esperados: { symbol, side, type = 'MARKET', quantity, price? }
   * Retorna: { success, orderId, price, error? }
   */
  async placeOrder(params) {
    try {
      const { symbol, side, type = 'MARKET', quantity, price } = params || {};
      if (!symbol || !side || !quantity) {
        return { success: false, error: 'Missing required params (symbol, side, quantity)' };
      }

      const resp = await this.real.executeRealOrder({
        symbol: String(symbol).toUpperCase(),
        side: side.toUpperCase(),
        type,
        quantity: Number(quantity),
        price: typeof price !== 'undefined' ? Number(price) : undefined,
      });

      const executed = String(resp?.status || '').toUpperCase();
      const filled = String(resp?.binance_response?.status || '').toUpperCase();
      const ok = executed === 'EXECUTED' || filled === 'FILLED' || filled === 'PARTIALLY_FILLED';

      return {
        success: ok,
        orderId: resp?.orderId || null,
        price: typeof resp?.price === 'number' ? resp.price : Number(resp?.binance_response?.avgPrice || resp?.binance_response?.price || 0) || 0,
        error: ok ? null : (resp?.error || 'Order not executed'),
      };
    } catch (error) {
      return { success: false, orderId: null, price: 0, error: error.message };
    }
  }

  // Métodos para DataService
  async getExchangeInfo() {
    return this.real.makeRequest('GET', '/fapi/v1/exchangeInfo');
  }

  async getPrice(symbol) {
    return this.real.getCurrentPrice(symbol);
  }

  async getAccountInfo() {
    return this.real.getAccountInfo();
  }

  async makeRequest(method, endpoint, params) {
    return this.real.makeRequest(method, endpoint, params);
  }

  async getAssetType(symbol) {
    if (typeof this.real.getAssetType === 'function') {
      return this.real.getAssetType(symbol);
    }
    return 'unknown';
  }

  // Compatibilidad básica de EventEmitter para DataService.attachConnector
  // No hay streams push en el conector real expuesto como EventEmitter aquí
  on() { /* no-op */ }
}

module.exports = BinanceConnectorAdapter;


