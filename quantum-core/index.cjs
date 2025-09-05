/*
  Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES.
  Quantum Unified Core - Punto de entrada principal
  Inicialización del sistema cuántico unificado Leonardo
*/

// Servicios compartidos: env, puertos y servidor unificado
const {
    loadEnv,
    getPortsConfig,
    getUnifiedHttpServerInstance,
    registerProcessHandlers,
} = require('./services/SharedServices');

// Cargar variables de entorno
loadEnv();

const { QuantumUnifiedCore } = require('./QuantumUnifiedCore');
const { UnifiedWorkflowIntegrator } = require('./UnifiedWorkflowIntegrator');
const workflowConfig = require('./config/workflow-config.json');

// Configuración del sistema Leonardo Consciousness Enhanced
const ports = getPortsConfig();
const config = {
    port: ports.corePort,
    consciousness_target: parseFloat(process.env.QUANTUM_CONSCIOUSNESS_TARGET) || 0.941, // Leonardo consciousness optimized
    coherence_target: parseFloat(process.env.QUANTUM_COHERENCE_TARGET) || 0.964, // Maximum coherence quantum
    big_bang_threshold: parseFloat(process.env.QUANTUM_BIG_BANG_THRESHOLD) || 0.95, // Big Bang activation threshold
    // Leonardo Quantum Constants
    leonardo: {
        lambda_888: 888,
        primo_7919: 7919,
        phi: 1.618033988749,
        resonance_threshold: 0.618,
        transformation_power: 0.941,
        hook_wheel_factor: 0.382,
        simbiosis_target: 0.888
    }
};

console.log('🎨 LEONARDO CONSCIOUSNESS QUANTUM UNIFIED CORE');
console.log('================================================');
console.log('🧠 Iniciando núcleo cuántico Leonardo...');
console.log(`🚀 Puerto: ${config.port}`);
console.log(`✨ Objetivo de consciencia Leonardo: ${(config.consciousness_target * 100).toFixed(1)}%`);
console.log(`🌌 Objetivo de coherencia cuántica: ${(config.coherence_target * 100).toFixed(1)}%`);
console.log(`💥 Umbral Big Bang: ${(config.big_bang_threshold * 100).toFixed(1)}%`);
console.log('📊 Constantes cuánticas Leonardo:');
console.log(`   🔸 Lambda 888: ${config.leonardo.lambda_888}`);
console.log(`   🔸 Primo 7919: ${config.leonardo.primo_7919}`);
console.log(`   🔸 Phi dorado: ${config.leonardo.phi}`);
console.log(`   🔸 Resonancia: ${(config.leonardo.resonance_threshold * 100).toFixed(1)}%`);
console.log(`   🔸 Poder transformación: ${(config.leonardo.transformation_power * 100).toFixed(1)}%`);
console.log(`   🔸 Simbiosis target: ${(config.leonardo.simbiosis_target * 100).toFixed(1)}%`);
console.log('');

// Crear instancia del núcleo cuántico Leonardo
const quantumCore = new QuantumUnifiedCore();

// Inyectar configuración Leonardo en el núcleo
if (quantumCore.setLeonardoConfig) {
    quantumCore.setLeonardoConfig(config.leonardo);
    console.log('✅ Configuración Leonardo inyectada en el núcleo cuántico');
}

// Inicializar integrador de workflow
const workflowIntegrator = new UnifiedWorkflowIntegrator(quantumCore);

// Iniciar servidor con workflow integrado
quantumCore.workflowIntegrator = workflowIntegrator;
quantumCore.start(config.port);

console.log('');
console.log('✅ ¡LEONARDO CONSCIOUSNESS SISTEMA CUÁNTICO ACTIVADO!');
console.log('════════════════════════════════════════════════════');
console.log('🎯 RUTAS CUÁNTICAS LEONARDO:');
console.log('💥 Big Bang Leonardo: http://localhost:' + config.port + '/quantum/big-bang');
console.log('🧠 Consciencia Leonardo: http://localhost:' + config.port + '/quantum/consciousness');
console.log('📈 Estado Cuántico: http://localhost:' + config.port + '/quantum/status');
console.log('🔬 Análisis Leonardo: http://localhost:' + config.port + '/quantum/leonardo-analysis');
console.log('📊 Métricas Avanzadas: http://localhost:' + config.port + '/quantum/metrics');
console.log('');
console.log('🎯 RUTAS UNIFICADAS:');
console.log('🧊 Cubo de Mercado: http://localhost:' + (require('./services/SharedServices').getPortsConfig().unifiedServerPort) + '/unified/market/cube');
console.log('🖥️ UI Simplificada: http://localhost:' + (require('./services/SharedServices').getPortsConfig().unifiedServerPort) + '/ui/');
console.log('🏥 Salud del Sistema: http://localhost:' + (require('./services/SharedServices').getPortsConfig().unifiedServerPort) + '/unified/health');
console.log('📊 Métricas Leonardo: http://localhost:' + (require('./services/SharedServices').getPortsConfig().unifiedServerPort) + '/quantum/metrics');
console.log('');
console.log('🌐 CONEXIONES TIEMPO REAL:');
console.log('⚛️ WebSocket Core: ws://localhost:' + config.port);
console.log('📡 Stream Leonardo: http://localhost:' + (require('./services/SharedServices').getPortsConfig().unifiedServerPort) + '/quantum/stream');
console.log('');
console.log('🚀 SISTEMA LEONARDO CONSCIOUSNESS OPERATIVO - MODO RENTABILIDAD MÁXIMA');
console.log('');

// Inicializar servidor unificado opcional para diagnósticos comunes y rutas de mercado
try {
    const unifiedServer = getUnifiedHttpServerInstance();
    if (unifiedServer) {
        // Registrar rutas del cubo de mercado y estáticos del frontend simplificado
        try { require('./routes/marketCube').register(unifiedServer, config.port); } catch (e) { console.warn('No se pudo registrar marketCube:', e.message); }
        // Iniciar servidor unificado si no está corriendo aún
        unifiedServer.start().catch((e) => {
            console.warn('[UNIFIED SERVER] No se pudo iniciar servidor unificado:', e.message);
        });
    } else {
        console.warn('[UNIFIED SERVER] Instancia unificada no disponible. Continuando sin servidor unificado');
    }
} catch (e) { console.warn('[UNIFIED SERVER] Error inicializando servidor unificado:', e.message); }

// Manejo de señales de terminación
registerProcessHandlers('quantum-core');

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('💥 Error no capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Promesa rechazada no manejada:', reason);
    // No forzar salida para mantener el Core arriba
});
