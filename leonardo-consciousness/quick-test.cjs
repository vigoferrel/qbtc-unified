#!/usr/bin/env node

// Script de prueba rápida para verificar que el conteo de trades funciona correctamente

const { FundsManager } = require('./FundsManager');

async function quickTest() {
    console.log('🧪 QUICK TEST - Verificando conteo de trades');
    console.log('=' .repeat(50));

    // Crear funds manager
    const fundsManager = new FundsManager(1000);
    
    console.log('\n1. Estado inicial:');
    console.log(`Total Trades: ${fundsManager.performanceMetrics.totalTrades}`);
    console.log(`Posiciones activas: ${fundsManager.activePositions.size}`);
    
    // Simular conciencia básica
    const basicConsciousness = {
        consciousnessLevel: 0.7,
        confidence: 0.8,
        edge: 0.02,
        leverage: 20,
        bigBangReady: false,
        pillarDetails: {
            lambda888: { strength: 0.6 },
            prime7919: { strength: 0.5 },
            hookWheel: { strength: 0.7 },
            symbiosis: { strength: 0.6 }
        }
    };
    
    // Test 1: Calcular posición
    console.log('\n2. Calculando posición...');
    const positionCalc = fundsManager.calculatePositionSize({}, basicConsciousness);
    console.log(`Posición calculada: ${positionCalc.success ? 'SÍ' : 'NO'}`);
    if (positionCalc.success) {
        console.log(`Tamaño: $${positionCalc.size.toFixed(2)}`);
        console.log(`Leverage: ${positionCalc.leverage}x`);
    }
    
    // Test 2: Abrir posición
    console.log('\n3. Abriendo posición...');
    const positionData = {
        symbol: 'BTC/USDT',
        direction: 'BUY',
        size: positionCalc.success ? positionCalc.size : 100,
        leverage: 10,
        entryPrice: 50000,
        confidence: 0.8,
        edge: 0.02,
        profitTarget: 50,
        stopLoss: 20
    };
    
    const openResult = await fundsManager.openPosition(positionData);
    console.log(`Posición abierta: ${openResult.success ? 'SÍ' : 'NO'}`);
    
    if (openResult.success) {
        console.log(`ID: ${openResult.positionId}`);
        console.log(`Total Trades después de abrir: ${fundsManager.performanceMetrics.totalTrades}`);
        console.log(`Posiciones activas: ${fundsManager.activePositions.size}`);
        
        // Test 3: Cerrar posición
        console.log('\n4. Cerrando posición...');
        const closePrice = 51000; // Ganancia
        const closeResult = await fundsManager.closePosition(
            openResult.positionId, 
            closePrice, 
            'TEST_CLOSE'
        );
        
        console.log(`Posición cerrada: ${closeResult.success ? 'SÍ' : 'NO'}`);
        
        if (closeResult.success) {
            console.log(`PnL: $${closeResult.pnl.toFixed(2)}`);
            console.log(`Balance final: $${closeResult.newBalance.toFixed(2)}`);
            console.log(`Total Trades después de cerrar: ${fundsManager.performanceMetrics.totalTrades}`);
            console.log(`Winning Trades: ${fundsManager.performanceMetrics.winningTrades}`);
            console.log(`Win Rate: ${(fundsManager.performanceMetrics.winRate * 100).toFixed(1)}%`);
        }
    }
    
    // Test 4: Estado final
    console.log('\n5. Estado final del sistema:');
    const finalStatus = fundsManager.getFundsStatus();
    console.log(`Total Trades: ${finalStatus.performanceMetrics.totalTrades}`);
    console.log(`Winning Trades: ${finalStatus.performanceMetrics.winningTrades}`);
    console.log(`Losing Trades: ${finalStatus.performanceMetrics.losingTrades}`);
    console.log(`Win Rate: ${(finalStatus.performanceMetrics.winRate * 100).toFixed(1)}%`);
    console.log(`Balance Total: $${finalStatus.totalBalance.toFixed(2)}`);
    console.log(`Posiciones Activas: ${finalStatus.activePositions}`);
    
    console.log('\n✅ QUICK TEST COMPLETADO');
    
    // Verificar que el contador funciona correctamente
    if (finalStatus.performanceMetrics.totalTrades > 0) {
        console.log('🎉 ÉXITO: El contador de trades funciona correctamente!');
    } else {
        console.log('❌ ERROR: El contador de trades sigue en 0');
    }
}

// Ejecutar test
if (require.main === module) {
    quickTest().catch(console.error);
}

module.exports = { quickTest };
