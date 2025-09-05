/**
 * QBTC-UNIFIED - Integración de CredentialsManager con Mock Server
 * Este script integra el gestor de credenciales con el servidor mock
 * para garantizar una alineación óptima entre entornos
 */

const { CredentialsManager } = require('./quantum-core/CredentialsManager');
const fs = require('fs');
const path = require('path');

// Crear archivo .env temporal si no existe
function createTempEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creando archivo .env temporal para desarrollo...');
    
    const envContent = `# QBTC-UNIFIED Environment Configuration - Generado automáticamente
# ========================================================================
# CONFIGURACIÓN DE SERVIDORES
# ========================================================================
LEONARDO_HOST=0.0.0.0
LEONARDO_PORT=18020
ENABLE_CORS=true
ENABLE_WEB_INTERFACE=true
ENABLE_API=true
ENABLE_MONITORING=true
TRADING_MODE=SIMULATED
AUTO_START_TRADING=false

# ========================================================================
# CREDENCIALES BINANCE (SIMULADAS PARA TESTING)
# ========================================================================
BINANCE_API_KEY=simulated_development_key_${Date.now().toString(36)}
BINANCE_SECRET_KEY=simulated_development_secret_${Date.now().toString(36)}
BINANCE_TESTNET=true

# ========================================================================
# PARÁMETROS CUÁNTICOS
# ========================================================================
QUANTUM_CONSCIOUSNESS_TARGET=0.941
QUANTUM_COHERENCE_TARGET=0.964
QUANTUM_BIG_BANG_THRESHOLD=0.95
`;
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ Archivo .env creado exitosamente');
  }
}

// Integrar CredentialsManager con el servidor mock
function integrateCredentialsManager() {
  console.log('🔄 Integrando CredentialsManager con servidor mock...');
  
  // Crear archivo .env si no existe
  createTempEnvFile();
  
  // Inicializar CredentialsManager
  const credentialsManager = CredentialsManager.getInstance();
  
  // Diagnóstico de credenciales
  credentialsManager.diagnose();
  
  // Obtener credenciales para usar en el servidor mock
  const credentials = credentialsManager.getCredentials();
  
  return {
    apiKey: credentials.apiKey || 'simulated_key',
    secretKey: credentials.secretKey || 'simulated_secret',
    isTestnet: credentials.isTestnet !== undefined ? credentials.isTestnet : true,
    isLoaded: credentials.isLoaded,
    source: credentials.source || 'mock-server-default'
  };
}

// Exportar función de integración
module.exports = {
  integrateCredentialsManager,
  createTempEnvFile
};

// Si este script se ejecuta directamente
if (require.main === module) {
  console.log('🚀 Ejecutando integración de credenciales...');
  const credentials = integrateCredentialsManager();
  console.log('📊 Estado de credenciales:');
  console.log(`   API Key: ${credentials.apiKey ? `${credentials.apiKey.substring(0, 8)}...` : 'NO DISPONIBLE'}`);
  console.log(`   Secret Key: ${credentials.secretKey ? 'DISPONIBLE (oculta)' : 'NO DISPONIBLE'}`);
  console.log(`   Testnet: ${credentials.isTestnet ? 'SÍ' : 'NO'}`);
  console.log(`   Cargadas: ${credentials.isLoaded ? 'SÍ' : 'NO'}`);
  console.log(`   Fuente: ${credentials.source}`);
}
