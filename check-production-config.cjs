/**
 * Script para verificar la configuración de producción
 */

// Cargar variables de entorno
require('dotenv').config();

const SystemConfig = require('./qbtc-core/config/SystemConfig');

console.log('=== VERIFICACIÓN DE CONFIGURACIÓN DE PRODUCCIÓN ===\n');

// Verificar variables de entorno
console.log('Variables de entorno:');
console.log('BINANCE_API_KEY:', process.env.BINANCE_API_KEY ? '***CONFIGURADO***' : 'NO CONFIGURADO');
console.log('BINANCE_SECRET_KEY:', process.env.BINANCE_SECRET_KEY ? '***CONFIGURADO***' : 'NO CONFIGURADO');
console.log('BINANCE_TESTNET:', process.env.BINANCE_TESTNET);
console.log('REAL_TRADING_ENABLED:', process.env.REAL_TRADING_ENABLED);
console.log('');

// Verificar configuración del sistema
const config = SystemConfig;
const binanceConfig = config.getBinanceConfig();
const tradingConfig = config.getTradingConfig();

console.log('Configuración de Binance:');
console.log('API Key:', binanceConfig.api.apiKey === '' ? 'DEMO KEY' : 'REAL KEY');
console.log('Testnet:', binanceConfig.api.);
console.log('');

console.log('Configuración de Trading:');
console.log('Simulated:', tradingConfig.simulated);
console.log('Max Positions:', tradingConfig.maxPositions);
console.log('Max Leverage:', config.getFundsConfig().maxLeverage);
console.log('');

// Verificar modo de producción
const  = binanceConfig.api. || 
                  binanceConfig.api.apiKey === '' ||
                  process.env.REAL_TRADING_ENABLED !== 'true';

console.log('Estado del sistema:');
console.log('Modo Demo:', );
console.log('Modo Producción:', !);
console.log('');

if () {
    console.log('❌ El sistema está en MODO DEMO');
    console.log('Para cambiar a modo de producción real:');
    console.log('1. Asegúrate de tener credenciales reales en .env');
    console.log('2. Verifica que REAL_TRADING_ENABLED=true');
    console.log('4. Verifica que BINANCE_TESTNET=false');
} else {
    console.log('✅ El sistema está en MODO PRODUCCIÓN REAL');
    console.log('El sistema se conectará a la API real de Binance');
}