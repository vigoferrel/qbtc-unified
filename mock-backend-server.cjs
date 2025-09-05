/**
 * QBTC-UNIFIED - Mock Backend Server
 * Servidor simulado para desarrollo y pruebas sin dependencia de Binance
 */

const express = require('express');
const cors = require('cors');
const http = require('http');

// Configuración
const PORT = 18020;
const HOST = 'localhost';

// Crear aplicación Express
const app = express();

// Configurar middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  }
};

// Actualizar métricas periódicamente
setInterval(() => {
  systemState.consciousness = 0.85 + Math.random() * 0.15;
  systemState.coherence = 0.90 + Math.random() * 0.10;
  systemState.decisions = Math.floor(Math.random() * 20) + 10;
  systemState.lastUpdate = Date.now();
  systemState.metrics.lastUpdate = new Date().toISOString();
  systemState.metrics.cpuLoad = Math.random() * 0.3;
  systemState.metrics.memoryUsage = process.memoryUsage();
}, 2000);

// Rutas API
app.get('/', (req, res) => {
  res.json({
    name: 'Leonardo Consciousness Quantum Engine (MOCK)',
    version: '2.0.0',
    status: 'ACTIVE',
    consciousness: systemState.consciousness,
    coherence: systemState.coherence,
    endpoints: {
      metrics: '/api/metrics',
      predictions: '/api/predictions',
      opportunities: '/api/opportunities',
      trading: '/api/trading',
      health: '/api/health',
      stream: '/api/stream'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
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
        tradingEngine: true
      }
    },
    trading: {
      enabled: true,
      positions: 3,
      balance: 10000 + Math.random() * 1000
    }
  });
});

// Métricas
app.get('/api/metrics', (req, res) => {
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
      }
    },
    timestamp: Date.now()
  });
});

// Oportunidades
app.get('/api/opportunities', (req, res) => {
  res.json({
    success: true,
    data: systemState.opportunities,
    timestamp: Date.now()
  });
});

// Predicciones
app.get('/api/predictions', (req, res) => {
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
});

// Exposición de riesgo
app.get('/api/risk/exposure', (req, res) => {
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
});

// Server-Sent Events (SSE) para streaming
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Enviar estado inicial
  res.write(`data: ${JSON.stringify(systemState)}\n\n`);

  // Actualizar cada segundo
  const intervalId = setInterval(() => {
    systemState.consciousness = 0.85 + Math.random() * 0.15;
    systemState.coherence = 0.90 + Math.random() * 0.10;
    systemState.lastUpdate = Date.now();
    
    res.write(`data: ${JSON.stringify(systemState)}\n\n`);
  }, 1000);

  // Limpiar al cerrar conexión
  req.on('close', () => {
    clearInterval(intervalId);
  });
});

// Iniciar servidor
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 QBTC-UNIFIED Mock Backend Server running at http://${HOST}:${PORT}`);
  console.log('📡 Endpoints disponibles:');
  console.log('   GET /');
  console.log('   GET /api/health');
  console.log('   GET /api/metrics');
  console.log('   GET /api/opportunities');
  console.log('   GET /api/predictions');
  console.log('   GET /api/risk/exposure');
  console.log('   GET /api/stream (SSE)');
});

// Manejo de señales de terminación
process.on('SIGINT', () => {
  console.log('\nCerrando servidor mock...');
  server.close(() => {
    console.log('Servidor mock cerrado correctamente');
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  process.exit(1);
});
