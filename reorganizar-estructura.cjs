// reorganizar-estructura.js
// Script para automatizar la reorganización de carpetas y módulos según la arquitectura óptima

const fs = require('fs');
const path = require('path');

// Utilidad para mover archivos
function moverArchivo(origen, destino) {
    if (!fs.existsSync(origen)) {
        console.log(`No existe: ${origen}`);
        return;
    }
    const dirDestino = path.dirname(destino);
    if (!fs.existsSync(dirDestino)) {
        fs.mkdirSync(dirDestino, { recursive: true });
    }
    fs.renameSync(origen, destino);
    console.log(`Movido: ${origen} -> ${destino}`);
}

// Mapeo de movimientos sugeridos
const movimientos = [
    // Núcleo cuántico y algoritmos
    ['quantum-core/QuantumMarketMaker.js', 'core/quantum-engine/QuantumMarketMaker.js'],
    ['quantum-core/QuantumLeverageEngine.js', 'core/quantum-engine/QuantumLeverageEngine.js'],
    ['quantum-core/QuantumProfitMaximizer.js', 'core/quantum-engine/QuantumProfitMaximizer.js'],

    // Orquestación y servicios
    ['quantum-core/UnifiedWorkflowIntegrator.js', 'quantum-core/orchestration/UnifiedWorkflowIntegrator.js'],
    ['quantum-core/WindowsBackgroundOrchestrator.js', 'quantum-core/orchestration/WindowsBackgroundOrchestrator.js'],
    ['quantum-core/services/DataService.js', 'quantum-core/services/DataService.js'],
    ['quantum-core/services/QuantumConnectionService.js', 'quantum-core/services/QuantumConnectionService.js'],

    // Métricas y monitoreo
    ['quantum-core/QuantumMetricsCollector.js', 'quantum-core/monitoring/QuantumMetricsCollector.js'],
    ['quantum-core/dashboard/QuantumDashboard.js', 'quantum-core/dashboard/QuantumDashboard.js'],

    // Inteligencia y configuración
    ['leonardo-unified/core/QuantumOracleLayer.js', 'leonardo-unified/core/QuantumOracleLayer.js'],
    ['leonardo-unified/config/ConfigManager.js', 'leonardo-unified/config/ConfigManager.js'],
    ['leonardo-unified/config/presets/big-bang.json', 'leonardo-unified/config/presets/big-bang.json'],

    // Procesos críticos y kernel
    ['kernel/qbtc_pure_kernel.py', 'kernel/qbtc_pure_kernel.py'],
    ['kernel/qbtc_kernel_server.py', 'kernel/qbtc_kernel_server.py'],

    // Frontend y visualización
    ['frontend/quantum-edge/quantum-market-cube.js', 'frontend/quantum-edge/quantum-market-cube.js'],
    ['frontend/quantum-edge/index.html', 'frontend/quantum-edge/index.html'],

    // Infraestructura y resiliencia
    ['quantum-core/DistributedCache.js', 'quantum-core/DistributedCache.js'],
    ['quantum-core/LoadBalancer.js', 'quantum-core/LoadBalancer.js'],
    ['auto-recovery-system.js', 'quantum-core/auto-recovery-system.js'],

    // Scripts de diagnóstico
    ['analizar-estructura.js', 'quantum-core/monitoring/analizar-estructura.js'],

    // Documentación
    ['README.md', 'README.md'],
    ['UNIFIED-ARCHITECTURE-SOLUTION.md', 'UNIFIED-ARCHITECTURE-SOLUTION.md'],
    ['integration-summary.md', 'integration-summary.md']
];

movimientos.forEach(([origen, destino]) => {
    try {
        moverArchivo(path.join(__dirname, origen), path.join(__dirname, destino));
    } catch (err) {
        console.error(`Error moviendo ${origen}:`, err.message);
    }
});

console.log('Reorganización completada. Revisa los movimientos y ajusta manualmente si es necesario.');
