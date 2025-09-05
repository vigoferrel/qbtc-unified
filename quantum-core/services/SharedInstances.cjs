const path = require('path');
const fs = require('fs');
const DataService = require('./DataService');

// Singleton DataService
const dataService = DataService.getInstance();

let connector = null;

function setConnector(conn) {
  connector = conn;
  try {
    dataService.attachConnector(connector);
  } catch (e) {
    // Do not throw to avoid breaking startup; log and continue
    console.warn('[SharedInstances] Failed to attach connector to DataService:', e && e.message);
  }
}

function getConnector() {
  return connector;
}

// Optional helper: attempt to resolve a BinanceRealConnector from common paths
function tryLoadDefaultConnector() {
  const candidates = [
    path.resolve(process.cwd(), 'BinanceRealConnector.js'),
    path.resolve(process.cwd(), 'quantum-core', 'BinanceRealConnector.js'),
    path.resolve(process.cwd(), 'quantum-core', 'connectors', 'BinanceRealConnector.js'),
    path.resolve(process.cwd(), 'src', 'connectors', 'BinanceRealConnector.js'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const mod = require(p);
        if (typeof mod === 'function') return new mod();
        if (mod && typeof mod === 'object' && typeof mod.default === 'function') return new mod.default();
        if (mod && typeof mod === 'object') return mod;
      } catch (e) {
        console.warn('[SharedInstances] Error requiring candidate connector at', p, e && e.message);
      }
    }
  }
  return null;
}

module.exports = {
  dataService,
  setConnector,
  getConnector,
  tryLoadDefaultConnector,
};

