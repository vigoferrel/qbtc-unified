#!/usr/bin/env node

/**
 * Análisis Comparativo de Optimización Cuántica
 * Copyright © 2025 VIGOLEONROCKS QUANTUM TECHNOLOGIES
 * 
 * Analiza el impacto de las optimizaciones comparando métricas en múltiples intervalos
 */

const http = require('http');

class OptimizationAnalyzer {
    constructor() {
        this.serverUrl = 'http://localhost:18020';
        this.samples = [];
        this.analysisComplete = false;
    }
    
    async fetchMetrics() {
        return new Promise((resolve, reject) => {
            const req = http.get(`${this.serverUrl}/api/coherence-state`, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed.data);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
            
            req.on('error', reject);
            req.setTimeout(5000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
        });
    }
    
    async collectSamples(count = 20, intervalMs = 2000) {
        console.log('🔍 ANALIZADOR DE IMPACTO DE OPTIMIZACIÓN');
        console.log('========================================');
        console.log(`📊 Recolectando ${count} muestras cada ${intervalMs/1000}s`);
        console.log('⏱️  Tiempo estimado:', Math.round((count * intervalMs) / 1000), 'segundos');
        console.log('========================================\n');
        
        for (let i = 0; i < count; i++) {
            try {
                const data = await this.fetchMetrics();
                const globalState = data.globalQuantumState;
                
                const sample = {
                    index: i + 1,
                    timestamp: Date.now(),
                    consciousness: parseFloat(globalState.consciousness.toFixed(4)),
                    coherence: parseFloat(globalState.coherence.toFixed(4)),
                    entropy: parseFloat(globalState.entropy.toFixed(4)),
                    energy: parseFloat(globalState.energy.toFixed(4)),
                    resonance: parseFloat(globalState.resonance.toFixed(4)),
                    alignment: parseFloat(globalState.alignment.toFixed(4)),
                    version: globalState.version,
                    // Calcular métricas derivadas
                    dampingFactor: Math.max(0.3, globalState.alignment),
                    stabilityBoost: Math.max(0.1, globalState.coherence),
                    combinedDamping: (Math.max(0.3, globalState.alignment) + Math.max(0.1, globalState.coherence)) / 2,
                    effectiveOscillation: 0.03 * (1 - ((Math.max(0.3, globalState.alignment) + Math.max(0.1, globalState.coherence)) / 2))
                };
                
                this.samples.push(sample);
                
                // Progreso visual
                const progress = Math.round((i + 1) / count * 20);
                const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);
                process.stdout.write(`\r🔄 Progreso: [${bar}] ${i + 1}/${count} muestras`);
                
                if (i < count - 1) {
                    await new Promise(resolve => setTimeout(resolve, intervalMs));
                }
                
            } catch (error) {
                console.error(`\n❌ Error en muestra ${i + 1}:`, error.message);
            }
        }
        
        console.log('\n✅ Recolección completada\n');
    }
    
    analyzeOptimizationImpact() {
        if (this.samples.length < 2) {
            console.log('❌ Insuficientes muestras para análisis');
            return;
        }
        
        console.log('📈 ANÁLISIS DE IMPACTO DE OPTIMIZACIÓN');
        console.log('=====================================\n');
        
        // Dividir muestras en segmentos para análisis de tendencias
        const firstHalf = this.samples.slice(0, Math.floor(this.samples.length / 2));
        const secondHalf = this.samples.slice(Math.floor(this.samples.length / 2));
        
        const metrics = ['consciousness', 'coherence', 'entropy', 'energy', 'resonance', 'alignment'];
        
        console.log('🔍 COMPARACIÓN PRIMERA VS SEGUNDA MITAD:');
        console.log('-'.repeat(60));
        
        metrics.forEach(metric => {
            const firstAvg = firstHalf.reduce((sum, s) => sum + s[metric], 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, s) => sum + s[metric], 0) / secondHalf.length;
            const improvement = ((secondAvg - firstAvg) / firstAvg) * 100;
            
            const firstStd = Math.sqrt(firstHalf.reduce((sum, s) => sum + Math.pow(s[metric] - firstAvg, 2), 0) / firstHalf.length);
            const secondStd = Math.sqrt(secondHalf.reduce((sum, s) => sum + Math.pow(s[metric] - secondAvg, 2), 0) / secondHalf.length);
            const stabilityImprovement = ((firstStd - secondStd) / firstStd) * 100;
            
            const status = improvement > 0 ? '📈' : improvement < -1 ? '📉' : '➡️';
            const stabilityStatus = stabilityImprovement > 0 ? '✅' : '⚠️';
            
            console.log(`${metric.padEnd(12)}: ${firstAvg.toFixed(4)} → ${secondAvg.toFixed(4)} ${status} ${improvement.toFixed(1)}% | Estabilidad: ${stabilityStatus} ${stabilityImprovement.toFixed(1)}%`);
        });
        
        console.log('\n🎯 ANÁLISIS DE ESTABILIZACIÓN:');
        console.log('-'.repeat(60));
        
        // Análisis de oscilación efectiva
        const avgOscillation = this.samples.reduce((sum, s) => sum + s.effectiveOscillation, 0) / this.samples.length;
        const avgDamping = this.samples.reduce((sum, s) => sum + s.combinedDamping, 0) / this.samples.length;
        
        console.log(`Oscilación Efectiva Promedio: ${(avgOscillation * 100).toFixed(3)}%`);
        console.log(`Damping Combinado Promedio:   ${avgDamping.toFixed(4)}`);
        
        // Análisis de rango de variación
        console.log('\n📊 RANGOS DE VARIACIÓN:');
        console.log('-'.repeat(60));
        
        metrics.forEach(metric => {
            const values = this.samples.map(s => s[metric]);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min;
            const mean = values.reduce((a, b) => a + b) / values.length;
            const coefficientOfVariation = (Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length) / mean) * 100;
            
            let stabilityRating;
            if (coefficientOfVariation < 5) stabilityRating = '🟢 EXCELENTE';
            else if (coefficientOfVariation < 15) stabilityRating = '🟡 BUENO';
            else if (coefficientOfVariation < 25) stabilityRating = '🟠 MODERADO';
            else stabilityRating = '🔴 INESTABLE';
            
            console.log(`${metric.padEnd(12)}: Rango: ${range.toFixed(4)} | CV: ${coefficientOfVariation.toFixed(1)}% ${stabilityRating}`);
        });
        
        console.log('\n🏆 EVALUACIÓN GENERAL:');
        console.log('-'.repeat(60));
        
        // Calcular puntuación general
        const overallStability = metrics.reduce((sum, metric) => {
            const values = this.samples.map(s => s[metric]);
            const mean = values.reduce((a, b) => a + b) / values.length;
            const cv = (Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length) / mean) * 100;
            return sum + Math.max(0, 100 - cv);
        }, 0) / metrics.length;
        
        // Evaluación del sistema optimizado
        const avgAlignment = this.samples.reduce((sum, s) => sum + s.alignment, 0) / this.samples.length;
        const avgCoherence = this.samples.reduce((sum, s) => sum + s.coherence, 0) / this.samples.length;
        const avgEntropy = this.samples.reduce((sum, s) => sum + s.entropy, 0) / this.samples.length;
        
        console.log(`Estabilidad General:     ${overallStability.toFixed(1)}%`);
        console.log(`Alineación Promedio:     ${avgAlignment.toFixed(4)} (${avgAlignment >= 0.8 ? '✅' : avgAlignment >= 0.7 ? '⚠️' : '❌'})`);
        console.log(`Coherencia Promedio:     ${avgCoherence.toFixed(4)} (${avgCoherence >= 0.8 ? '✅' : avgCoherence >= 0.7 ? '⚠️' : '❌'})`);
        console.log(`Entropy Promedio:        ${avgEntropy.toFixed(4)} (${avgEntropy <= 0.25 ? '✅' : avgEntropy <= 0.35 ? '⚠️' : '❌'})`);
        console.log(`Oscilación Efectiva:     ${(avgOscillation * 100).toFixed(3)}% (${avgOscillation < 0.015 ? '✅ MUY ESTABLE' : avgOscillation < 0.025 ? '✅ ESTABLE' : '⚠️ MODERADA'})`);
        
        let finalRating;
        if (overallStability > 90 && avgAlignment > 0.8 && avgOscillation < 0.015) {
            finalRating = '🟢 OPTIMIZACIÓN EXCELENTE';
        } else if (overallStability > 80 && avgAlignment > 0.7 && avgOscillation < 0.025) {
            finalRating = '🟡 OPTIMIZACIÓN EXITOSA';
        } else if (overallStability > 70) {
            finalRating = '🟠 OPTIMIZACIÓN MODERADA';
        } else {
            finalRating = '🔴 NECESITA MEJORAS';
        }
        
        console.log(`\n${finalRating}`);
        console.log('=====================================');
        
        return {
            overallStability,
            avgAlignment,
            avgCoherence,
            avgEntropy,
            avgOscillation,
            finalRating,
            totalSamples: this.samples.length
        };
    }
    
    async run(sampleCount = 15, intervalMs = 2500) {
        await this.collectSamples(sampleCount, intervalMs);
        return this.analyzeOptimizationImpact();
    }
}

// Ejecutar análisis
async function main() {
    const analyzer = new OptimizationAnalyzer();
    
    try {
        const results = await analyzer.run(15, 2500); // 15 muestras cada 2.5 segundos = ~37 segundos
        
        console.log('\n📋 RESUMEN EJECUTIVO:');
        console.log('=====================');
        console.log(`Total de muestras analizadas: ${results.totalSamples}`);
        console.log(`Estabilidad del sistema: ${results.overallStability.toFixed(1)}%`);
        console.log(`Oscilación efectiva: ${(results.avgOscillation * 100).toFixed(3)}%`);
        console.log(`Evaluación final: ${results.finalRating}`);
        console.log('=====================\n');
        
    } catch (error) {
        console.error('❌ Error en análisis:', error.message);
    }
}

main();
