/**
 * QBTC-UNIFIED - Enhanced Key Dashboard Server
 * Servidor con soporte completo para gestión avanzada de claves API y dashboard
 */

const express = require('express');
const cors = require('cors');
const http = require('http');
const { integrateCredentialsManager } = require('./credentials-integration');
const { integrateDashboard } = require('./metrics-dashboard-integration');
const { integrateApiKeyManager } = require('./api-key-integration');
const { QuantumErrorHandler } = require('./quantum-error-handler');

// Inicializar manejador de errores cuántico
const errorHandler = QuantumErrorHandler.getInstance();

// Integrar CredentialsManager con manejo de errores
let credentials;
try {
    credentials = integrateCredentialsManager();
    console.log(`🔐 Credenciales cargadas desde: ${credentials.source}`);
    console.log(`🔑 API Key: ${credentials.apiKey ? `${credentials.apiKey.substring(0, 8)}...` : 'NO DISPONIBLE'}`);
    console.log(`🔒 Testnet: ${credentials.isTestnet ? 'ACTIVADO' : 'DESACTIVADO'}`);
} catch (error) {
    errorHandler.handleError(error, { component: 'CredentialsManager' }, 'CRITICAL');
    // Usar credenciales por defecto
    credentials = {
        isLoaded: false,
        isTestnet: false,
        source: 'default',
        apiKey: null,
        secretKey: null
    };
}

// Configuración
const PORT = process.env.LEONARDO_PORT || 18020;
const HOST = process.env.LEONARDO_HOST || 'localhost';

// Crear aplicación Express
const app = express();

// Configurar middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de manejo de errores global
app.use((error, req, res, next) => {
    errorHandler.handleError(error, { 
        endpoint: req.path, 
        method: req.method,
        userAgent: req.get('User-Agent')
    });
    next(error);
});

// Estado del sistema simulado
const systemState = {
  consciousness: 0.941,
  coherence: 0.964,
  decisions: 15,
  status: 'QUANTUM_RESONANCE',
  lastUpdate: Date.now(),
  opportunities: [
    { symbol: 'BTCUSDT', edge: 2.5, confidence: 0.88, price: 45230.50, quality: 'high' },
    { symbol: 'ETHUSDT', edge: 1.8, confidence: 0.75, price: 2890.25, quality: 'medium' },
    { symbol: 'SOLUSDT', edge: 2.2, confidence: 0.82, price: 120.75, quality: 'high' },
    { symbol: 'BNBUSDT', edge: 1.2, confidence: 0.65, price: 350.25, quality: 'low' },
    { symbol: 'ADAUSDT', edge: 1.6, confidence: 0.71, price: 0.45, quality: 'medium' }
  ],
  metrics: {
    uptime: 0,
    memoryUsage: process.memoryUsage(),
    cpuLoad: 0.15,
    lastUpdate: new Date().toISOString()
  },
  quantumState: {
    resonancia_lambda: 0.888,
    transformaciones_primal: 0.941,
    hook_states: 0.382,
    simbiosis_level: 0.888,
    consciousness_score: 0.941,
    quantum_opportunities: [],
    big_bang_readiness: true,
    leonardo_activation: 0.95
  },
  credentials: {
    isLoaded: credentials.isLoaded,
    isTestnet: credentials.isTestnet,
    source: credentials.source
  },
  errorStats: errorHandler.getErrorStats()
};

// Actualizar métricas periódicamente con manejo de errores
setInterval(() => {
  try {
    systemState.consciousness = 0.85 + Math.random() * 0.15;
    systemState.coherence = 0.90 + Math.random() * 0.10;
    systemState.decisions = Math.floor(Math.random() * 20) + 10;
    systemState.lastUpdate = Date.now();
    systemState.metrics.lastUpdate = new Date().toISOString();
    systemState.metrics.cpuLoad = Math.random() * 0.3;
    systemState.metrics.memoryUsage = process.memoryUsage();
    systemState.errorStats = errorHandler.getErrorStats();
  } catch (error) {
    errorHandler.handleError(error, { component: 'MetricsUpdate' }, 'WARNING');
  }
}, 2000);

// Integrar componentes del sistema con manejo de errores
console.log('🔄 Integrando componentes del sistema...');

let dashboardConfig, apiKeyConfig;

try {
    // Integrar dashboard de métricas (UNA SOLA VEZ)
    dashboardConfig = integrateDashboard(app);
} catch (error) {
    errorHandler.handleError(error, { component: 'DashboardIntegration' }, 'ERROR');
    dashboardConfig = { isConfigured: false, endpoints: [] };
}

try {
    // Integrar API Key Manager (UNA SOLA VEZ)
    apiKeyConfig = integrateApiKeyManager(app);
} catch (error) {
    errorHandler.handleError(error, { component: 'ApiKeyIntegration' }, 'ERROR');
    apiKeyConfig = { apiKeyManager: null, endpoints: [] };
}

// Rutas API con manejo de errores mejorado
app.get('/', (req, res) => {
  try {
    res.json({
      name: 'Leonardo Consciousness Quantum Engine (ENHANCED KEY DASHBOARD)',
      version: '2.0.0',
      status: 'ACTIVE',
      consciousness: systemState.consciousness,
      coherence: systemState.coherence,
      credentials: {
        loaded: credentials.isLoaded,
        testnet: credentials.isTestnet,
        source: credentials.source,
        manager: 'ApiKeyManager'
      },
      errorStats: errorHandler.getErrorStats(),
      endpoints: {
        metrics: '/api/metrics',
        predictions: '/api/predictions',
        opportunities: '/api/opportunities',
        trading: '/api/trading',
        health: '/api/health',
        stream: '/api/stream',
        credentials: '/api/credentials',
        dashboard: '/api/dashboard/*',
        keyManagement: '/api/keys/*',
        errors: '/api/errors'
      }
    });
  } catch (error) {
    errorHandler.handleError(error, { endpoint: '/' }, 'ERROR');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Health check mejorado
app.get('/api/health', (req, res) => {
  try {
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      system: {
        initialized: true,
        running: true,
        components: {
          quantumSystem: true,
          binanceConnector: true,
          tradingEngine: true,
          credentialsManager: credentials.isLoaded,
          apiKeyManager: apiKeyConfig && apiKeyConfig.apiKeyManager,
          dashboard: dashboardConfig && dashboardConfig.isConfigured,
          errorHandler: true
        }
      },
      trading: {
        enabled: true,
        positions: 3,
        balance: 10000 + Math.random() * 1000,
        testnet: credentials.isTestnet
      },
      errors: errorHandler.getErrorStats()
    });
  } catch (error) {
    errorHandler.handleError(error, { endpoint: '/api/health' }, 'ERROR');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para estadísticas de errores
app.get('/api/errors', (req, res) => {
  try {
    res.json({
      success: true,
      data: errorHandler.getErrorStats(),
      timestamp: Date.now()
    });
  } catch (error) {
    errorHandler.handleError(error, { endpoint: '/api/errors' }, 'ERROR');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Métricas
app.get('/api/metrics', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        consciousness: systemState.consciousness,
        coherence: systemState.coherence,
        decisions: systemState.decisions,
        opportunities: systemState.opportunities.length,
        quantum: systemState.quantumState,
        performance: {
          winRate: 0.68,
          profitFactor: 2.3,
          drawdown: 0.12,
          totalProfit: 1250.75
        },
        errors: errorHandler.getErrorStats()
      },
      timestamp: Date.now()
    });
  } catch (error) {
    errorHandler.handleError(error, { endpoint: '/api/metrics' }, 'ERROR');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Oportunidades
app.get('/api/opportunities', (req, res) => {
  try {
    res.json({
      success: true,
      data: systemState.opportunities,
      timestamp: Date.now()
    });
  } catch (error) {
    errorHandler.handleError(error, { endpoint: '/api/opportunities' }, 'ERROR');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Predicciones
app.get('/api/predictions', (req, res) => {
  try {
    res.json({
      success: true,
      data: systemState.opportunities.map(opp => ({
        symbol: opp.symbol,
        direction: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        confidence: opp.confidence,
        timeframe: '4h',
        prediction: {
          price: opp.price * (1 + (Math.random() * 0.1 - 0.05)),
          timestamp: Date.now() + 14400000
        }
      })),
      timestamp: Date.now()
    });
  } catch (error) {
    errorHandler.handleError(error, { endpoint: '/api/predictions' }, 'ERROR');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Exposición de riesgo
app.get('/api/risk/exposure', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        bySymbol: {
          'BTCUSDT': 0.15,
          'ETHUSDT': 0.10,
          'SOLUSDT': 0.08
        },
        byCategory: {
          'MAJORS': 0.25,
          'ALTCOINS': 0.08
        },
        limits: {
          MAX_SYMBOL_EXPOSURE_PCT: 0.15,
          MAX_CATEGORY_EXPOSURE_PCT: 0.35,
          MAX_DAILY_DRAWDOWN: 0.10
        }
      }
    });
  } catch (error) {
    errorHandler.handleError(error, { endpoint: '/api/risk/exposure' }, 'ERROR');
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Información de credenciales (CORREGIDO: Manejo de errores)
app.get('/api/credentials', (req, res) => {
  try {
    // Usar ApiKeyManager para información más detallada
    const keyStatus = apiKeyConfig && apiKeyConfig.apiKeyManager 
      ? apiKeyConfig.apiKeyManager.getKeyStatus()
      : { lastValidation: null, needsRotation: true, permissions: {} };
    
    res.json({
      success: true,
      data: {
        isLoaded: credentials.isLoaded,
        isTestnet: credentials.isTestnet,
        source: credentials.source,
        apiKeyAvailable: !!credentials.apiKey,
        secretKeyAvailable: !!credentials.secretKey,
        keyManager: {
          available: !!(apiKeyConfig && apiKeyConfig.apiKeyManager),
          lastValidation: keyStatus.lastValidation,
          needsRotation: keyStatus.needsRotation,
          permissions: keyStatus.permissions
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    errorHandler.handleError(error, { endpoint: '/api/credentials' }, 'ERROR');
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      timestamp: Date.now()
    });
  }
});

// Server-Sent Events (SSE) para streaming (CORREGIDO: Manejo de errores)
app.get('/api/stream', (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Enviar estado inicial
    res.write(`data: ${JSON.stringify(systemState)}\n\n`);

    // Actualizar cada segundo
    const intervalId = setInterval(() => {
      try {
        systemState.consciousness = 0.85 + Math.random() * 0.15;
        systemState.coherence = 0.90 + Math.random() * 0.10;
        systemState.lastUpdate = Date.now();
        systemState.errorStats = errorHandler.getErrorStats();
        
        res.write(`data: ${JSON.stringify(systemState)}\n\n`);
      } catch (error) {
        errorHandler.handleError(error, { component: 'SSE Update' }, 'WARNING');
        clearInterval(intervalId);
      }
    }, 1000);

    // Limpiar al cerrar conexión
    req.on('close', () => {
      clearInterval(intervalId);
    });
  } catch (error) {
    errorHandler.handleError(error, { endpoint: '/api/stream' }, 'ERROR');
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      timestamp: Date.now()
    });
  }
});

// Iniciar servidor (CORREGIDO: Manejo de errores mejorado)
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 QBTC-UNIFIED Enhanced Key Dashboard Server running at http://${HOST}:${PORT}`);
  console.log(`🔐 Usando credenciales de: ${credentials.source || 'valores por defecto'}`);
  console.log(`🛡️ Quantum Error Handler: ACTIVO`);
  console.log('📡 Endpoints disponibles:');
  console.log('   GET /');
  console.log('   GET /api/health');
  console.log('   GET /api/metrics');
  console.log('   GET /api/opportunities');
  console.log('   GET /api/predictions');
  console.log('   GET /api/risk/exposure');
  console.log('   GET /api/credentials');
  console.log('   GET /api/stream (SSE)');
  console.log('   GET /api/errors');
  
  if (dashboardConfig && dashboardConfig.endpoints) {
    console.log('📊 Endpoints de dashboard:');
    dashboardConfig.endpoints.forEach(endpoint => {
      console.log(`   GET ${endpoint}`);
    });
  }
  
  if (apiKeyConfig && apiKeyConfig.endpoints) {
    console.log('🔑 Endpoints de gestión de claves:');
    apiKeyConfig.endpoints.forEach(endpoint => {
      console.log(`   ${endpoint.startsWith('/api/keys/validate') ? 'POST' : 'GET'} ${endpoint}`);
    });
  }
});

// Manejo de señales de terminación (CORREGIDO: Mejorado)
process.on('SIGINT', () => {
  console.log('\n🔄 Cerrando servidor...');
  errorHandler.cleanupLogs();
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Recibida señal SIGTERM, cerrando servidor...');
  errorHandler.cleanupLogs();
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Manejo de errores no capturados (CORREGIDO: Mejorado)
process.on('uncaughtException', (error) => {
  errorHandler.handleError(error, { type: 'uncaughtException' }, 'CRITICAL');
  
  // Cerrar servidor de manera segura
  server.close(() => {
    console.log('🔄 Servidor cerrado debido a error no capturado');
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  const error = new Error(`Unhandled Rejection: ${reason}`);
  errorHandler.handleError(error, { 
    type: 'unhandledRejection',
    promise: promise.toString()
  }, 'ERROR');
});

// Manejo de errores del servidor HTTP
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    errorHandler.handleError(error, { port: PORT }, 'CRITICAL');
    console.error(`❌ Puerto ${PORT} ya está en uso`);
    process.exit(1);
  } else {
    errorHandler.handleError(error, { type: 'serverError' }, 'ERROR');
  }
});
