/*
  QBTC Unified Server - Sin dependencias externas
  Implementa Server-Sent Events y sirve archivos estáticos
*/

const http = require('http');
const fs = require('fs');
const path = require('path');

// Cargar configuración
const config = require('./config.json');
// Cargar configuración de producción para puertos y CORS
let prodConfig = {};
try {
  prodConfig = require('./production-config.json');
} catch (e) {
  prodConfig = {};
}
// Puerto unificado para frontend
const PORT = process.env.FRONTEND_PORT || (prodConfig?.servers?.frontend?.port) || 18021;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif'
};

// CORS allowlist
const CORS_ALLOWLIST = (prodConfig?.security?.cors?.whitelist) || ['http://localhost:8080', 'https://qbtc-dashboard.com'];
function setCors(res, origin) {
  if (origin && CORS_ALLOWLIST.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
}

// Estado del sistema
let systemState = {
  consciousness: 0.801,
  coherence: 0.919,
  decisions: 9,
  status: 'QUANTUM_RESONANCE',
  metrics: {
    uptime: 0,
    memoryUsage: 0,
    cpuLoad: 0
  }
};

// Deterministic calculation methods to replace Math.random()
function calculateDeterministicValue(timestamp) {
  const hash = hashCode(timestamp.toString());
  return (hash % 10000) / 10000; // Return value between 0 and 1
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Creación del servidor
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  // Configurar CORS (allowlist)
  const origin = req.headers['origin'];
  setCors(res, origin);

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Server-Sent Events endpoint
  if (req.url === '/quantum/stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const sendState = () => {
      res.write(`data: ${JSON.stringify(systemState)}\n\n`);
    };

    // Enviar estado inicial
    sendState();

    // Actualizar estado cada 1 segundo
    const interval = setInterval(() => {
      const timestamp = Date.now();
      systemState.consciousness = calculateDeterministicValue(timestamp) * 0.6 + 0.4;
      systemState.coherence = calculateDeterministicValue(timestamp + 1) * 0.4 + 0.6;
      systemState.decisions = Math.floor(calculateDeterministicValue(timestamp + 2) * 10);
      sendState();
    }, 1000);

    // Limpiar al cerrar conexión
    req.on('close', () => clearInterval(interval));
    return;
  }

  // API endpoints
  if (req.url.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    // Endpoint de Leonardo Stream
    if (req.url === config.endpoints.leonardo) {
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
          timestamp: new Date().toISOString()
        };
        res.write(`data: ${JSON.stringify(leonardoState)}\n\n`);
      };
      
      // Enviar estado inicial y configurar actualización periódica
      sendLeonardoState();
      const interval = setInterval(sendLeonardoState, 1000);
      req.on('close', () => clearInterval(interval));
      return;
    }

    switch (req.url) {
      case '/api/estado-cuantico':
        res.end(JSON.stringify({ ok: true, estado: systemState }));
        return;

      case config.endpoints.health:
        res.end(JSON.stringify({ 
          status: 'healthy', 
          uptime: process.uptime(),
          consciousness: systemState.consciousness,
          coherence: systemState.coherence
        }));
        return;

      case config.endpoints.metrics:
        res.end(JSON.stringify({
          ...systemState.metrics,
          decisions: systemState.decisions,
          lastUpdate: new Date().toISOString()
        }));
        return;

      case config.endpoints.status:
        res.end(JSON.stringify({ 
          status: systemState.status,
          consciousness: systemState.consciousness,
          coherence: systemState.coherence,
          timestamp: new Date().toISOString()
        }));
        return;
    }
  }

  // Servir archivos estáticos
  let filePath = req.url === '/' ? './index.html' : '.' + req.url;
  filePath = path.resolve(filePath);

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
  console.log(`🚀 QBTC Unified Server iniciado en http://localhost:${PORT}`);
  console.log('📡 Server-Sent Events activo en /quantum/stream');
  console.log('🧠 Sistema de Consciencia Cuántica: ACTIVO');
  console.log('✅ Sistema completamente funcional');
});
