/*
  SharedServices - Módulo centralizado de servicios compartidos para unificar configuración,
  puertos, singletons y utilidades de despliegue sin conflictos.
*/

const net = require('net');
let dotenvLoaded = false;

function loadEnv() {
  if (!dotenvLoaded) {
    try {
      // Carga perezosa para no fallar si dotenv no está
      require('dotenv').config();
    } catch (_) {}
    dotenvLoaded = true;
  }
}

function getBooleanEnv(name, defaultValue = false) {
  const raw = process.env[name];
  if (raw === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(raw).toLowerCase());
}

function getNumberEnv(name, defaultValue) {
  const raw = process.env[name];
  if (raw === undefined) return defaultValue;
  const parsed = parseInt(String(raw), 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function getPortsConfig() {
  // Defaults de franja anti-conflictos
  const corePort = getNumberEnv('QUANTUM_PORT', 9090);
  const metricsPort = getNumberEnv('METRICS_PORT', 9100);
  const coordinatorPort = getNumberEnv('COORDINATOR_PORT', 3000);
  const unifiedServerPort = getNumberEnv('UNIFIED_SERVER_PORT', 18020);
  // Operación por defecto en servidor único (evita colisiones en despliegue local)
  const singleServerMode = getBooleanEnv('SINGLE_SERVER_MODE', true);
  return { corePort, metricsPort, coordinatorPort, unifiedServerPort, singleServerMode };
}

function isPortFree(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port, host);
  });
}

async function resolvePort(preferredPort, rangeEnd = preferredPort) {
  for (let p = preferredPort; p <= rangeEnd; p += 1) {
    // eslint-disable-next-line no-await-in-loop
    const free = await isPortFree(p);
    if (free) return p;
  }
  return preferredPort; // fallback: devolver preferido aunque esté tomado (el caller debe manejar)
}

function getUnifiedHttpServerInstance() {
  try {
    // Resolución perezosa para evitar dependencias circulares
    // eslint-disable-next-line global-require
    const { UnifiedHttpServer } = require('../UnifiedHttpServer');
    const server = UnifiedHttpServer.getInstance();
    const { unifiedServerPort } = getPortsConfig();
    
    console.log(`[UNIFIED SERVER] Inicializando en puerto ${unifiedServerPort}`);
    
    // Inicializar de forma asíncrona
    server.initialize(unifiedServerPort).then(() => {
      console.log(`[UNIFIED SERVER] Servidor inicializado exitosamente`);
    }).catch((error) => {
      console.error(`[UNIFIED SERVER] Error inicializando servidor:`, error.message);
    });
    
    return server;
  } catch (e) {
    console.error('[UNIFIED SERVER] Error creando instancia:', e.message);
    // Si no existe, retornar null de forma segura
    return null;
  }
}

function registerProcessHandlers(serviceName = 'service') {
  process.on('SIGINT', () => {
    // eslint-disable-next-line no-console
    console.log(`\n[${serviceName.toUpperCase()}] Recibida señal SIGINT. Cerrando...`);
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    // eslint-disable-next-line no-console
    console.log(`\n[${serviceName.toUpperCase()}] Recibida señal SIGTERM. Cerrando...`);
    process.exit(0);
  });
}

// Re-export de instancias compartidas existentes
const { dataService, setConnector, getConnector, tryLoadDefaultConnector } = require('./SharedInstances');

module.exports = {
  loadEnv,
  getPortsConfig,
  isPortFree,
  resolvePort,
  getUnifiedHttpServerInstance,
  registerProcessHandlers,
  dataService,
  setConnector,
  getConnector,
  tryLoadDefaultConnector,
};


