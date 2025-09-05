// Test script for QuantumUnifiedSystem
const { QuantumUnifiedSystem } = require('./leonardo-consciousness/QuantumUnifiedSystem.cjs');

async function testQuantumSystem() {
  console.log('🚀 Probando QuantumUnifiedSystem...\n');

  try {
    // Crear instancia
    console.log('1. Creando instancia del sistema...');
    const system = new QuantumUnifiedSystem({
      initialBalance: 10000,
      enableRealTimeStreaming: false, // Deshabilitar para test rápido
      autoOptimizationEnabled: false  // Deshabilitar para test rápido
    });

    console.log('✅ Sistema creado exitosamente\n');

    // Verificar estado inicial
    console.log('2. Estado inicial del sistema:');
    console.log(JSON.stringify(system.getSystemState(), null, 2));
    console.log();

    // Verificar métricas iniciales
    console.log('3. Métricas iniciales:');
    console.log(JSON.stringify(system.getUnifiedMetrics(), null, 2));
    console.log();

    // Verificar salud inicial
    console.log('4. Estado de salud inicial:');
    console.log(JSON.stringify(system.getHealth(), null, 2));
    console.log();

    // Probar inicialización
    console.log('5. Inicializando componentes...');
    const initResult = await system.initialize();
    console.log('Resultado de inicialización:', initResult);
    console.log();

    // Verificar estado después de inicialización
    console.log('6. Estado después de inicialización:');
    console.log(JSON.stringify(system.getSystemState(), null, 2));
    console.log();

    // Verificar métricas después de inicialización
    console.log('7. Métricas después de inicialización:');
    console.log(JSON.stringify(system.getUnifiedMetrics(), null, 2));
    console.log();

    // Verificar salud después de inicialización
    console.log('8. Estado de salud después de inicialización:');
    console.log(JSON.stringify(system.getHealth(), null, 2));
    console.log();

    // Probar obtener símbolos activos
    console.log('9. Probando obtención de símbolos activos...');
    const symbols = await system.getActiveSymbols(5);
    console.log('Símbolos activos:', symbols);
    console.log();

    // Destruir sistema
    console.log('10. Destruyendo sistema...');
    system.destroy();
    console.log('✅ Sistema destruido exitosamente\n');

    console.log('🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!');

  } catch (error) {
    console.error('❌ ERROR EN PRUEBA:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Ejecutar pruebas
testQuantumSystem().catch(console.error);