// ========================================================================
// 🔢 PRIME BOOST FACTOR - DEMO DE FUNCIONAMIENTO
// Demostración del sistema de potenciación prima en AntiLiquidationEngine
// ========================================================================

const AntiLiquidationEngine = require('./AntiLiquidationEngine');

async function primeBostDemo() {
    console.log('🌌 DEMO: Prime Boost Factor Anti-Liquidation System');
    console.log('='.repeat(70));
    
    // Crear instancia del motor anti-liquidación
    const engine = new AntiLiquidationEngine();
    
    // Simular diferentes escenarios de adversidad
    const adversityScenarios = [
        {
            name: "Drawdown Leve",
            data: {
                drawdown_level: 0.15,
                loss_amount: 150,
                market_chaos: 0.3,
                volatility_spike: 0.25,
                consecutive_losses: 2,
                liquidation_threat_level: 0.1
            }
        },
        {
            name: "Caos del Mercado",
            data: {
                drawdown_level: 0.35,
                loss_amount: 850,
                market_chaos: 0.8,
                volatility_spike: 0.9,
                consecutive_losses: 5,
                liquidation_threat_level: 0.45
            }
        },
        {
            name: "Amenaza de Liquidación Extrema",
            data: {
                drawdown_level: 0.75,
                loss_amount: 2500,
                market_chaos: 0.95,
                volatility_spike: 0.85,
                consecutive_losses: 8,
                liquidation_threat_level: 0.9
            }
        }
    ];
    
    console.log('\n📊 ESTADO INICIAL:');
    console.log(`Consciencia: ${(engine.quantumState.consciousness_level * 100).toFixed(1)}%`);
    console.log(`Anti-fragilidad: ${engine.quantumState.anti_fragility_index.toFixed(3)}`);
    console.log(`Tasa evolución: ${engine.quantumState.evolution_rate.toFixed(6)}`);
    console.log(`Clasificación cósmica: ${engine.quantumState.cosmic_classification}`);
    
    // Procesar cada escenario
    for (let i = 0; i < adversityScenarios.length; i++) {
        const scenario = adversityScenarios[i];
        console.log('\n' + '='.repeat(70));
        console.log(`🎭 ESCENARIO ${i + 1}: ${scenario.name}`);
        console.log('='.repeat(70));
        
        try {
            const response = await engine.processAdversity(scenario.data);
            
            console.log('\n📈 RESULTADOS POST-PROCESAMIENTO:');
            console.log(`Consciencia: ${(engine.quantumState.consciousness_level * 100).toFixed(1)}%`);
            console.log(`Anti-fragilidad: ${engine.quantumState.anti_fragility_index.toFixed(3)}`);
            console.log(`Tasa evolución: ${engine.quantumState.evolution_rate.toFixed(6)}`);
            console.log(`Prime Boost Factor: ${engine.quantumState.prime_boost_factor.toFixed(3)}`);
            console.log(`Resonancia Prima: ${engine.quantumState.prime_resonance_level.toFixed(3)}`);
            console.log(`Clasificación Cósmica: ${engine.quantumState.cosmic_classification}`);
            console.log(`Tier Evolutivo: ${engine.quantumState.cosmic_evolution_tier}`);
            
            if (engine.quantumState.prime_boost_history.length > 0) {
                const lastBoost = engine.quantumState.prime_boost_history[engine.quantumState.prime_boost_history.length - 1];
                console.log('\n✨ ÚLTIMO PRIME BOOST APLICADO:');
                console.log(`Mersenne Resonance: ${lastBoost.mersenne_resonance.toFixed(4)}`);
                console.log(`Sophie Protection: ${lastBoost.sophie_protection.toFixed(4)}`);
                console.log(`Transcendence Readiness: ${(lastBoost.transcendence_readiness * 100).toFixed(1)}%`);
            }
            
        } catch (error) {
            console.error(`❌ Error procesando ${scenario.name}:`, error.message);
        }
        
        // Pausa entre escenarios
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎯 RESUMEN FINAL DEL SISTEMA');
    console.log('='.repeat(70));
    
    const finalStatus = engine.getQuantumStatus();
    console.log(`🧠 Consciencia Final: ${(finalStatus.quantum_state.consciousness_level * 100).toFixed(1)}%`);
    console.log(`🛡️ Anti-fragilidad Final: ${finalStatus.quantum_state.anti_fragility_index.toFixed(3)}`);
    console.log(`🧬 Evolución Final: ${finalStatus.quantum_state.evolution_rate.toFixed(6)}`);
    console.log(`🔢 Prime Boost Factor: ${finalStatus.quantum_state.prime_boost_factor.toFixed(3)}`);
    console.log(`🌌 Clasificación Cósmica: ${finalStatus.quantum_state.cosmic_classification}`);
    console.log(`🚀 Tier Evolutivo: ${finalStatus.quantum_state.cosmic_evolution_tier}`);
    console.log(`🎭 Resurrecciones Fénix: ${finalStatus.quantum_state.phoenix_resurrections}`);
    console.log(`📊 Transcendencia: ${(finalStatus.transcendence_level * 100).toFixed(1)}%`);
    console.log(`⚡ Potenciaciones Aplicadas: ${finalStatus.quantum_state.prime_boost_history.length}`);
    
    console.log('\n🎉 Demo completado exitosamente!');
}

// Ejecutar demo si es llamado directamente
if (require.main === module) {
    primeBostDemo().catch(console.error);
}

module.exports = { primeBostDemo };
