/**
 * Script de prueba para verificar importaciones del system-integrator
 */

console.log('🔍 Verificando importaciones del system-integrator...');

try {
    // Importar componentes principales
    console.log('📦 Importando componentes principales...');
    const { CredentialsManager } = require('./quantum-core/CredentialsManager');
    console.log('✅ CredentialsManager importado');
    
    const { BinanceRealConnector } = require('./quantum-core/BinanceRealConnector');
    console.log('✅ BinanceRealConnector importado');
    
    const { QuantumMarketMaker } = require('./quantum-core/QuantumMarketMaker');
    console.log('✅ QuantumMarketMaker importado');
    
    const QuantumInfiniteCache = require('./quantum-core/QuantumInfiniteCache');
    console.log('✅ QuantumInfiniteCache importado');
    
    const { QuantumUnifiedCore } = require('./quantum-core/QuantumUnifiedCore');
    console.log('✅ QuantumUnifiedCore importado');
    
    const { QuantumCoherenceIntegrator } = require('./quantum-core/QuantumCoherenceIntegrator');
    console.log('✅ QuantumCoherenceIntegrator importado');
    
    const { QuantumMonitoring } = require('./quantum-core/QuantumMonitoring');
    console.log('✅ QuantumMonitoring importado');
    
    const { AdversityPrimePredictor } = require('./quantum-core/AdversityPrimePredictor');
    console.log('✅ AdversityPrimePredictor importado');
    
    const { QuantumLeverageEngine } = require('./quantum-core/QuantumLeverageEngine');
    console.log('✅ QuantumLeverageEngine importado');
    
    const { QuantumProfitMaximizer } = require('./quantum-core/QuantumProfitMaximizer');
    console.log('✅ QuantumProfitMaximizer importado');
    
    const { AntiLiquidationEngine } = require('./quantum-core/AntiLiquidationEngine');
    console.log('✅ AntiLiquidationEngine importado');
    
    const { QuantumNxNMatrix } = require('./quantum-core/QuantumNxNMatrix');
    console.log('✅ QuantumNxNMatrix importado');
    
    const { UniversalSymbolMonitor } = require('./quantum-core/UniversalSymbolMonitor');
    console.log('✅ UniversalSymbolMonitor importado');
    
    const { UniversalCorrelationAnalyzer } = require('./quantum-core/UniversalCorrelationAnalyzer');
    console.log('✅ UniversalCorrelationAnalyzer importado');
    
    // Importar componentes Leonardo Consciousness
    console.log('🧠 Importando componentes Leonardo Consciousness...');
    const { LeonardoDecisionEngine } = require('./leonardo-consciousness/LeonardoDecisionEngine');
    console.log('✅ LeonardoDecisionEngine importado');
    
    const { FundsManager } = require('./leonardo-consciousness/FundsManager');
    console.log('✅ FundsManager importado');
    
    const { TradingEngineLayer } = require('./leonardo-consciousness/TradingEngineLayer');
    console.log('✅ TradingEngineLayer importado');
    
    const { BinanceConnectorAdapter } = require('./leonardo-consciousness/BinanceConnectorAdapter');
    console.log('✅ BinanceConnectorAdapter importado');
    
    const { QuantumUnifiedSystem } = require('./leonardo-consciousness/QuantumUnifiedSystem');
    console.log('✅ QuantumUnifiedSystem importado');
    
    const { UnifiedLeonardoCore } = require('./leonardo-consciousness/UnifiedLeonardoCore');
    console.log('✅ UnifiedLeonardoCore importado');
    
    const { LeonardoQuantumServer } = require('./leonardo-consciousness/LeonardoQuantumServer');
    console.log('✅ LeonardoQuantumServer importado');
    
    const { UnifiedLeonardoServer } = require('./leonardo-consciousness/UnifiedLeonardoServer');
    console.log('✅ UnifiedLeonardoServer importado');
    
    const { FundsManagerLayer } = require('./leonardo-consciousness/FundsManagerLayer');
    console.log('✅ FundsManagerLayer importado');
    
    // Importar componentes de gestión de errores
    console.log('🛡️ Importando componentes de gestión de errores...');
    const { QuantumErrorHandler } = require('./quantum-error-handler');
    console.log('✅ QuantumErrorHandler importado');
    
    const { ApiKeyManager } = require('./api-key-manager');
    console.log('✅ ApiKeyManager importado');
    
    console.log('🎉 ¡Todas las importaciones exitosas!');
    
} catch (error) {
    console.error('❌ Error en importación:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}
