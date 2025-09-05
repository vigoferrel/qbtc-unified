// validar-integracion.js
// Script para validar la integración y funcionamiento de los módulos clave


import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));



async function validarModulo(ruta) {
  try {
    let absPath = path.join(__dirname, ruta);
    if (ruta.endsWith('.cjs')) {
      // CommonJS: usar require mediante dynamic import de createRequire
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      require(absPath);
      console.log(`✅ Integración OK: ${ruta}`);
    } else {
      // ES module: usar import
      let fileUrl = absPath.replace(/\\/g, '/');
      if (!fileUrl.startsWith('/')) fileUrl = '/' + fileUrl;
      fileUrl = 'file://' + fileUrl;
      await import(fileUrl);
      console.log(`✅ Integración OK: ${ruta}`);
    }
  } catch (err) {
    console.error(`❌ Error en integración: ${ruta}\n${err.message}`);
  }
}


const modulos = [
  'core/quantum-engine/QuantumProfitMaximizer.cjs',
  'core/quantum-engine/QuantumMarketMaker.cjs',
  'core/quantum-engine/QuantumLeverageEngine.cjs',
  'quantum-core/orchestration/UnifiedWorkflowIntegrator.cjs',
  'quantum-core/services/DataService.cjs',
  'quantum-core/services/QuantumConnectionService.cjs',
  'quantum-core/monitoring/QuantumMetricsCollector.cjs',
  'quantum-core/dashboard/QuantumDashboard.cjs',
  'leonardo-unified/core/QuantumOracleLayer.cjs',
  'leonardo-unified/config/ConfigManager.cjs',
  'frontend/quantum-edge/quantum-market-cube.js',
  'quantum-core/DistributedCache.cjs',
  'quantum-core/LoadBalancer.cjs',
  'quantum-core/auto-recovery-system.cjs',
];

for (const ruta of modulos) {
  await validarModulo(ruta);
}

console.log('Validación de integración finalizada.');
