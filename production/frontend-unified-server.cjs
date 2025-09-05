/*
  QBTC Frontend Unified Server
  Sirve el frontend unificado con endpoints de compatibilidad y CORS restringido
*/

const http = require('http');
const fs = require('fs');
const path = require('path');

// Cargar configuración de producción para puertos
let prodConfig = {};
try {
  prodConfig = require('./production-config.json');
} catch (e) {
  prodConfig = {};
}

// Configuración de puerto y rutas
const PORT = process.env.FRONTEND_PORT || (prodConfig?.servers?.frontend?.port) || 18021;
const FRONTEND_PATH = path.join(__dirname, '../frontend-unified');

// Allowlist CORS (preferir configuración)
const CORS_ALLOWLIST = (prodConfig?.security?.cors?.whitelist) || [
  'http://localhost:18021',
  'http://127.0.0.1:18021',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'https://qbtc-dashboard.com'
];

function setCors(res, origin) {
  if (!origin) return; // Same-origin
  if (CORS_ALLOWLIST.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

// Tipos MIME
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

// Estado del sistema (simulado/minimo)
let systemState = {
  consciousness: 0.801,
  coherence: 0.919,
  decisions: 9,
  status: 'QUANTUM_RESONANCE',
  opportunities: [
    { symbol: 'BTC/USD', edge: 2.5, confidence: 0.88, price: 45230.50, quality: 'high' },
    { symbol: 'ETH/USD', edge: 1.8, confidence: 0.75, price: 2890.25, quality: 'medium' },
    { symbol: 'XRP/USD', edge: 2.2, confidence: 0.82, price: 0.6234, quality: 'high' },
    { symbol: 'SOL/USD', edge: 1.2, confidence: 0.65, price: 98.75, quality: 'low' },
    { symbol: 'DOT/USD', edge: 1.6, confidence: 0.71, price: 6.89, quality: 'medium' }
  ],
  metrics: {
    uptime: 0,
    memoryUsage: 0,
    cpuLoad: 0,
    lastUpdate: new Date().toISOString()
  }
};

// Crear servidor
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // CORS
  const origin = req.headers['origin'];
  setCors(res, origin);

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // SSE: stream Leonardo (compatibilidad)
  if (req.url === '/api/leonardo-stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const sendLeonardoState = () => {
      const leonardoState = {
        consciousness: systemState.consciousness,
        coherence: systemState.coherence,
        decisions: systemState.decisions,
        opportunities: systemState.opportunities,
        timestamp: new Date().toISOString()
      };
      res.write(`data: ${JSON.stringify(leonardoState)}\n\n`);
    };

    sendLeonardoState();
    const interval = setInterval(() => {
      systemState.consciousness = Math.random() * 0.6 + 0.4;
      systemState.coherence = Math.random() * 0.4 + 0.6;
      systemState.decisions = Math.floor(Math.random() * 10);
      sendLeonardoState();
    }, 1000);

    req.on('close', () => clearInterval(interval));
    return;
  }

  // SSE: stream principal (compatibilidad con /quantum/stream y /api/stream)
  if (req.url === '/quantum/stream' || req.url === '/api/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const sendState = () => {
      res.write(`data: ${JSON.stringify(systemState)}\n\n`);
    };

    sendState();
    const interval = setInterval(() => {
      systemState.consciousness = Math.random() * 0.6 + 0.4;
      systemState.coherence = Math.random() * 0.4 + 0.6;
      systemState.decisions = Math.floor(Math.random() * 10);
      systemState.metrics.lastUpdate = new Date().toISOString();
      sendState();
    }, 1000);

    req.on('close', () => clearInterval(interval));
    return;
  }

  // API JSON (compatibilidad de rutas)
  if (req.url.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    switch (req.url) {
      case '/api/estado-cuantico':
        res.end(JSON.stringify({ ok: true, estado: systemState }));
        return;

      // Compatibilidad: algunos clientes esperan /api/health
      case '/api/health':
      case '/api/unified/health':
        res.end(JSON.stringify({
          status: 'healthy',
          uptime: process.uptime(),
          consciousness: systemState.consciousness,
          coherence: systemState.coherence
        }));
        return;

      // Compatibilidad: algunos clientes esperan /api/metrics
      case '/api/metrics':
      case '/api/quantum/metrics':
        res.end(JSON.stringify({
          ...systemState.metrics,
          decisions: systemState.decisions,
          consciousness: systemState.consciousness,
          coherence: systemState.coherence,
          lastUpdate: new Date().toISOString()
        }));
        return;

      case '/api/system/status':
        res.end(JSON.stringify({
          status: systemState.status,
          consciousness: systemState.consciousness,
          coherence: systemState.coherence,
          timestamp: new Date().toISOString()
        }));
        return;
    }
  }

  // Servir frontend estático
  let filePath;
  if (req.url === '/') {
    filePath = path.join(FRONTEND_PATH, 'index.html');
  } else {
    filePath = path.join(FRONTEND_PATH, req.url);
  }

  // Asegurar path dentro del directorio
  const resolvedPath = path.resolve(filePath);
  const resolvedFrontendPath = path.resolve(FRONTEND_PATH);

  if (!resolvedPath.startsWith(resolvedFrontendPath)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 QBTC Frontend Unified Server iniciado en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${FRONTEND_PATH}`);
  console.log('📡 Server-Sent Events disponibles:');
  console.log('   - /quantum/stream y /api/stream (stream principal)');
  console.log('   - /api/leonardo-stream (stream Leonardo)');
  console.log('🧠 Sistema de Consciencia Cuántica: ACTIVO');
  console.log('✅ Frontend unificado completamente funcional');
});

// Manejo de errores
process.on('uncaughtException', (err) => {
  console.error('Error no capturado:', err?.message || err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rechazo no manejado:', reason);
});
