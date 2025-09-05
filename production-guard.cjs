/**
 * PRODUCTION GUARD - Validador de configuración de producción
 * Bloquea cualquier intento de usar simulaciones en el entorno de producción
 */

class ProductionGuard {
    static validateProductionEnvironment() {
        const errors = [];
        
        // Verificar que no hay modo simulación
        if (process.env. === 'true') {
            errors.push(' está activado - debe ser false en producción');
        }
        
        // Verificar que no hay datos mock
        if (process.env.MOCK_MARKET_DATA === 'true') {
            errors.push('MOCK_MARKET_DATA está activado - debe ser false en producción');
        }
        
        // Verificar que está en mainnet
        if (process.env.BINANCE_TESTNET === 'true') {
            errors.push('BINANCE_TESTNET está activado - debe ser false en producción');
        }
        
        // Verificar que trading real está habilitado
        if (process.env.REAL_TRADING_ENABLED !== 'true') {
            errors.push('REAL_TRADING_ENABLED debe estar en true para producción');
        }
        
        // Verificar que hay claves API reales
        if (!process.env.BINANCE_API_KEY || process.env.BINANCE_API_KEY.includes('demo')) {
            errors.push('BINANCE_API_KEY no configurada o contiene claves demo');
        }
        
        if (!process.env.BINANCE_SECRET_KEY || process.env.BINANCE_SECRET_KEY.includes('demo')) {
            errors.push('BINANCE_SECRET_KEY no configurada o contiene claves demo');
        }
        
        // Verificar modo del sistema
        if (process.env.SYSTEM_MODE && ['dev', 'sim', 'test'].includes(process.env.SYSTEM_MODE)) {
            errors.push(`SYSTEM_MODE está en ${process.env.SYSTEM_MODE} - debe ser 'prod' en producción`);
        }
        
        return errors;
    }
    
    static enforceProductionMode() {
        console.log('🔒 PRODUCTION GUARD - Validando configuración...');
        
        const errors = this.validateProductionEnvironment();
        
        if (errors.length > 0) {
            console.error('❌ CONFIGURACIÓN DE PRODUCCIÓN INVÁLIDA:');
            errors.forEach(error => console.error(`   - ${error}`));
            console.error('');
            console.error('🚨 SISTEMA BLOQUEADO - Corrige los errores antes de continuar');
            process.exit(1);
        }
        
        console.log('✅ Configuración de producción validada correctamente');
        
        // Establecer configuraciones forzadas de producción
        process.env. = 'false';
        process.env.MOCK_MARKET_DATA = 'false';
        process.env.REAL_TRADING_ENABLED = 'true';
        process.env.DEBUG_MODE = 'false';
        
        return true;
    }
    
    static blockSimulationFeatures() {
        // Sobrescribir funciones comunes de simulación
        if (typeof global !== 'undefined') {
            global.SIMULATION_ENABLED = false;
            global.MOCK_ENABLED = false;
            global.TEST_MODE = false;
            
            // Bloquear Math.random para evitar simulaciones
            const originalRandom = Math.random;
            Math.random = function() {
                console.warn('⚠️ Math.random() detectado - usar fuentes de datos reales en producción');
                return originalRandom.call(this);
            };
        }
    }
    
    static validateRealConnections() {
        // Lista de URLs que deben ser reales
        const realUrls = [
            'https://fapi.binance.com',
            'https://api.binance.com',
            'https://hrvxsaolaxnqltomqaud.supabase.co'
        ];
        
        // Verificar que las URLs configuradas son reales
        const baseUrl = process.env.BINANCE_BASE_URL;
        if (baseUrl && !realUrls.some(url => baseUrl.includes(url.replace('https://', '')))) {
            throw new Error(`URL base de Binance no es de producción: ${baseUrl}`);
        }
        
        return true;
    }
}

module.exports = ProductionGuard;

// Auto-ejecutar validación si es importado
if (require.main !== module) {
    ProductionGuard.enforceProductionMode();
    ProductionGuard.blockSimulationFeatures();
    ProductionGuard.validateRealConnections();
}
